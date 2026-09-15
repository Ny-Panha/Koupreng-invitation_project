package com.koupreng.backend.guest.application;

import com.koupreng.backend.invitation.application.InvitationService;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.guest.api.dto.GuestGroupResponse;
import com.koupreng.backend.guest.api.dto.GuestImportErrorResponse;
import com.koupreng.backend.guest.api.dto.GuestImportFileResultResponse;
import com.koupreng.backend.guest.api.dto.GuestImportRequest;
import com.koupreng.backend.guest.api.dto.GuestRequest;
import com.koupreng.backend.guest.api.dto.GuestResponse;
import com.koupreng.backend.guest.api.dto.GuestSendListItemResponse;
import com.koupreng.backend.guest.api.dto.GuestSendListResponse;
import com.koupreng.backend.guest.domain.Guest;
import com.koupreng.backend.rsvp.domain.Rsvp;
import com.koupreng.backend.invitation.domain.UserInvitation;
import com.koupreng.backend.guest.infrastructure.persistence.GuestRepository;
import com.koupreng.backend.rsvp.infrastructure.persistence.RsvpRepository;
import com.koupreng.backend.util.CsvExportUtils;

@Service
public class GuestService {

    private static final long MAX_IMPORT_FILE_SIZE = 5L * 1024L * 1024L;
    private static final Set<String> IMPORT_EXTENSIONS = Set.of(".csv", ".xlsx");
    private static final Set<String> IMPORT_CONTENT_TYPES = Set.of(
            "text/csv",
            "application/csv",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/octet-stream"
    );

    private final GuestRepository guestRepository;
    private final RsvpRepository rsvpRepository;
    private final InvitationService invitationService;

    @Autowired
    public GuestService(
            GuestRepository guestRepository,
            RsvpRepository rsvpRepository,
            InvitationService invitationService
    ) {
        this.guestRepository = guestRepository;
        this.rsvpRepository = rsvpRepository;
        this.invitationService = invitationService;
    }

    public GuestService(GuestRepository guestRepository, InvitationService invitationService) {
        this(guestRepository, null, invitationService);
    }

    @Transactional
    public GuestResponse create(Authentication authentication, Long invitationId, GuestRequest request) {
        UserInvitation invitation = invitationService.requireOwnedInvitationEntity(authentication, invitationId);
        ensureUniqueGuest(invitationId, null, request);
        Guest guest = new Guest();
        guest.setInvitation(invitation);
        guest.setInviteToken(uniqueInviteToken());
        applyRequest(guest, request);
        guest.setQrCodeUrl(tokenUrl(invitation, guest.getInviteToken()));
        return GuestResponse.from(guestRepository.save(guest));
    }

    @Transactional
    public List<GuestResponse> list(Authentication authentication, Long invitationId) {
        UserInvitation invitation = invitationService.requireOwnedInvitationEntity(authentication, invitationId);
        return guestRepository.findByInvitationIdOrderByCreatedAtDesc(invitationId).stream()
                .map(guest -> {
                    ensureInvitationLink(invitation, guest);
                    return GuestResponse.from(guest);
                })
                .toList();
    }

    @Transactional
    public List<GuestGroupResponse> groupedByCategory(Authentication authentication, Long invitationId) {
        UserInvitation invitation = invitationService.requireOwnedInvitationEntity(authentication, invitationId);
        List<Guest> guests = guestRepository.findByInvitationIdOrderByGuestGroupAscTableNumberAscGuestNameAsc(invitationId);
        Map<String, List<GuestResponse>> grouped = new LinkedHashMap<>();
        for (Guest guest : guests) {
            ensureInvitationLink(invitation, guest);
            grouped.computeIfAbsent(category(guest), ignored -> new ArrayList<>())
                    .add(GuestResponse.from(guest));
        }
        return grouped.entrySet().stream()
                .map(entry -> GuestGroupResponse.builder()
                        .category(entry.getKey())
                        .totalGuests(entry.getValue().size())
                        .guests(entry.getValue())
                        .build())
                .toList();
    }

    @Transactional
    public GuestSendListResponse sendList(Authentication authentication, Long invitationId) {
        UserInvitation invitation = invitationService.requireOwnedInvitationEntity(authentication, invitationId);
        List<Guest> guests = guestRepository.findByInvitationIdOrderByGuestGroupAscTableNumberAscGuestNameAsc(invitationId);
        List<GuestSendListItemResponse> items = guests.stream()
                .map(guest -> {
                    ensureInvitationLink(invitation, guest);
                    return GuestSendListItemResponse.from(guest, guest.getQrCodeUrl());
                })
                .toList();
        return GuestSendListResponse.builder()
                .invitationId(invitation.getId())
                .invitationSlug(invitation.getSlug())
                .totalGuests(items.size())
                .sendableGuests((int) items.stream().filter(GuestSendListItemResponse::isSendable).count())
                .guests(items)
                .build();
    }

    @Transactional(readOnly = true)
    public GuestResponse get(Authentication authentication, Long invitationId, Long guestId) {
        invitationService.requireOwnedInvitationEntity(authentication, invitationId);
        return GuestResponse.from(requireGuest(invitationId, guestId));
    }

    @Transactional
    public GuestResponse update(Authentication authentication, Long invitationId, Long guestId, GuestRequest request) {
        invitationService.requireOwnedInvitationEntity(authentication, invitationId);
        Guest guest = requireGuest(invitationId, guestId);
        ensureUniqueGuest(invitationId, guestId, request);
        applyRequest(guest, request);
        if (guest.getQrCodeUrl() == null || guest.getQrCodeUrl().isBlank()) {
            guest.setQrCodeUrl(tokenUrl(guest.getInvitation(), guest.getInviteToken()));
        }
        return GuestResponse.from(guestRepository.save(guest));
    }

    @Transactional
    public void delete(Authentication authentication, Long invitationId, Long guestId) {
        invitationService.requireOwnedInvitationEntity(authentication, invitationId);
        guestRepository.delete(requireGuest(invitationId, guestId));
    }

    @Transactional(readOnly = true)
    public List<GuestResponse> search(Authentication authentication, Long invitationId, String keyword) {
        invitationService.requireOwnedInvitationEntity(authentication, invitationId);
        if (keyword == null || keyword.isBlank()) {
            return list(authentication, invitationId);
        }
        return guestRepository.search(invitationId, keyword.trim()).stream()
                .map(GuestResponse::from)
                .toList();
    }

    @Transactional
    public List<GuestResponse> importGuests(Authentication authentication, Long invitationId, GuestImportRequest request) {
        UserInvitation invitation = invitationService.requireOwnedInvitationEntity(authentication, invitationId);
        return request.getGuests().stream()
                .filter(guest -> guest.getGuestName() != null && !guest.getGuestName().isBlank())
                .map(guestRequest -> {
                    ensureUniqueGuest(invitationId, null, guestRequest);
                    Guest guest = new Guest();
                    guest.setInvitation(invitation);
                    guest.setInviteToken(uniqueInviteToken());
                    applyRequest(guest, guestRequest);
                    guest.setQrCodeUrl(tokenUrl(invitation, guest.getInviteToken()));
                    return GuestResponse.from(guestRepository.save(guest));
                })
                .toList();
    }

    @Transactional
    public GuestImportFileResultResponse importGuestsFile(
            Authentication authentication,
            Long invitationId,
            MultipartFile file
    ) {
        UserInvitation invitation = invitationService.requireOwnedInvitationEntity(authentication, invitationId);
        validateImportFile(file);

        List<ImportRow> rows = parseImportRows(file);
        List<GuestResponse> imported = new ArrayList<>();
        List<GuestImportErrorResponse> errors = new ArrayList<>();
        int skipped = 0;

        for (ImportRow row : rows) {
            GuestRequest guestRequest = row.request();
            String guestName = trimToNull(guestRequest.getGuestName());
            if (guestName == null) {
                skipped++;
                errors.add(errorRow(row.rowNumber(), "Guest name is required"));
                continue;
            }
            if (isDuplicateGuest(invitation.getId(), guestRequest)) {
                skipped++;
                errors.add(errorRow(row.rowNumber(), "Guest with the same email or phone already exists"));
                continue;
            }

            Guest guest = new Guest();
            guest.setInvitation(invitation);
            guest.setInviteToken(uniqueInviteToken());
            applyRequest(guest, guestRequest);
            guest.setQrCodeUrl(tokenUrl(invitation, guest.getInviteToken()));
            imported.add(GuestResponse.from(guestRepository.save(guest)));
        }

        return GuestImportFileResultResponse.builder()
                .importedCount(imported.size())
                .skippedCount(skipped)
                .errorRows(errors)
                .guests(imported)
                .build();
    }

    @Transactional(readOnly = true)
    public String exportGuestCsv(Authentication authentication, Long invitationId) {
        invitationService.requireOwnedInvitationEntity(authentication, invitationId);
        List<Guest> guests = guestRepository.findByInvitationIdOrderByGuestGroupAscTableNumberAscGuestNameAsc(invitationId);
        Map<Long, Rsvp> rsvpsByGuestId = rsvpRepository.findByInvitationIdOrderByRespondedAtDesc(invitationId).stream()
                .filter(rsvp -> rsvp.getGuest() != null && rsvp.getGuest().getId() != null)
                .collect(Collectors.toMap(rsvp -> rsvp.getGuest().getId(), rsvp -> rsvp, (left, right) -> left));

        StringBuilder csv = new StringBuilder();
        csv.append("guestName,phone,email,category,seatCount,note,sendStatus,rsvpStatus,attendeeCount,lastSentAt\n");
        for (Guest guest : guests) {
            Rsvp rsvp = rsvpsByGuestId.get(guest.getId());
            csv.append(CsvExportUtils.row(
                    guest.getGuestName(), guest.getPhone(), guest.getEmail(),
                    guest.getGuestGroup(), guest.getSeatCount(), guest.getNote(),
                    guest.getSendStatus(), rsvp == null ? null : rsvp.getResponseStatus(),
                    rsvp == null ? null : rsvp.getAttendeeCount(), guest.getLastSentAt()
            )).append('\n');
        }
        return csv.toString();
    }

    private Guest requireGuest(Long invitationId, Long guestId) {
        return guestRepository.findByIdAndInvitationId(guestId, invitationId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Guest not found"));
    }

    private void ensureInvitationLink(UserInvitation invitation, Guest guest) {
        boolean changed = false;
        if (guest.getInviteToken() == null || guest.getInviteToken().isBlank()) {
            guest.setInviteToken(uniqueInviteToken());
            changed = true;
        }
        if (guest.getQrCodeUrl() == null || guest.getQrCodeUrl().isBlank()) {
            guest.setQrCodeUrl(tokenUrl(invitation, guest.getInviteToken()));
            changed = true;
        }
        if (changed) {
            guestRepository.save(guest);
        }
    }

    private void applyRequest(Guest guest, GuestRequest request) {
        guest.setGuestName(trimToNull(request.getGuestName()));
        guest.setPhone(trimToNull(request.getPhone()));
        guest.setEmail(trimToNull(request.getEmail()));
        guest.setGuestGroup(trimToNull(request.getGuestGroup()));
        guest.setSideType(trimToNull(request.getSideType()));
        guest.setTableNumber(trimToNull(request.getTableNumber()));
        guest.setSendStatus(trimToNull(request.getSendStatus()));
        guest.setSeatCount(request.getSeatCount());
        guest.setNote(trimToNull(request.getNote()));
        guest.setContributionStatus(trimToNull(request.getContributionStatus()));
        guest.setTotalContributed(request.getTotalContributed());
    }

    private void validateImportFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Import file is required");
        }
        if (file.getSize() > MAX_IMPORT_FILE_SIZE) {
            throw new ApiException(HttpStatus.CONTENT_TOO_LARGE, "Guest import file must be 5MB or smaller");
        }

        String filename = safeFilename(file.getOriginalFilename());
        String extension = extension(filename);
        if (!IMPORT_EXTENSIONS.contains(extension)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Guest import file must be CSV or XLSX");
        }

        String contentType = file.getContentType() == null ? "" : file.getContentType().trim().toLowerCase(Locale.ROOT);
        if (!contentType.isBlank() && !IMPORT_CONTENT_TYPES.contains(contentType)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Guest import file type is not allowed");
        }

        if (".xlsx".equals(extension)) {
            try {
                byte[] header = file.getInputStream().readNBytes(4);
                if (header.length < 2 || header[0] != 0x50 || header[1] != 0x4B) {
                    throw new ApiException(HttpStatus.BAD_REQUEST, "XLSX file signature is invalid");
                }
            } catch (IOException exception) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Import file could not be read");
            }
        }
    }

    private List<ImportRow> parseImportRows(MultipartFile file) {
        String filename = safeFilename(file.getOriginalFilename());
        String extension = extension(filename);
        try {
            return ".xlsx".equals(extension) ? parseXlsxRows(file) : parseCsvRows(file);
        } catch (IOException exception) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Import file could not be parsed");
        }
    }

    private List<ImportRow> parseCsvRows(MultipartFile file) throws IOException {
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8)
        )) {
            String headerLine = reader.readLine();
            if (headerLine == null || headerLine.isBlank()) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Import file has no header row");
            }
            Map<String, Integer> headers = headers(parseCsvLine(headerLine));
            List<ImportRow> rows = new ArrayList<>();
            String line;
            int rowNumber = 1;
            while ((line = reader.readLine()) != null) {
                rowNumber++;
                if (line.isBlank()) {
                    continue;
                }
                rows.add(new ImportRow(rowNumber, requestFromColumns(headers, parseCsvLine(line))));
            }
            return rows;
        }
    }

    private List<ImportRow> parseXlsxRows(MultipartFile file) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getNumberOfSheets() == 0 ? null : workbook.getSheetAt(0);
            if (sheet == null || sheet.getPhysicalNumberOfRows() == 0) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Import file has no rows");
            }

            DataFormatter formatter = new DataFormatter();
            Row headerRow = sheet.getRow(sheet.getFirstRowNum());
            Map<String, Integer> headers = headers(cells(headerRow, formatter));
            List<ImportRow> rows = new ArrayList<>();
            for (int index = sheet.getFirstRowNum() + 1; index <= sheet.getLastRowNum(); index++) {
                Row row = sheet.getRow(index);
                if (row == null) {
                    continue;
                }
                List<String> values = cells(row, formatter);
                if (values.stream().allMatch(value -> value == null || value.isBlank())) {
                    continue;
                }
                rows.add(new ImportRow(index + 1, requestFromColumns(headers, values)));
            }
            return rows;
        }
    }

    private List<String> cells(Row row, DataFormatter formatter) {
        List<String> values = new ArrayList<>();
        if (row == null) {
            return values;
        }
        int last = Math.max(row.getLastCellNum(), (short) 0);
        for (int index = 0; index < last; index++) {
            values.add(trimToNull(formatter.formatCellValue(row.getCell(index))));
        }
        return values;
    }

    private Map<String, Integer> headers(List<String> rawHeaders) {
        Map<String, Integer> headers = new HashMap<>();
        for (int index = 0; index < rawHeaders.size(); index++) {
            String normalized = normalizeHeader(rawHeaders.get(index));
            if (normalized != null) {
                headers.put(normalized, index);
            }
        }
        if (!headers.containsKey("guestname") && !headers.containsKey("name")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Import file must include guestName column");
        }
        return headers;
    }

    private GuestRequest requestFromColumns(Map<String, Integer> headers, List<String> values) {
        GuestRequest request = new GuestRequest();
        request.setGuestName(firstColumn(headers, values, "guestname", "name"));
        request.setPhone(firstColumn(headers, values, "phone", "tel", "telephone"));
        request.setEmail(firstColumn(headers, values, "email"));
        request.setGuestGroup(firstColumn(headers, values, "category", "group", "guestgroup"));
        request.setTableNumber(firstColumn(headers, values, "table", "tablenumber"));
        request.setSideType(firstColumn(headers, values, "side", "sidetype"));
        request.setNote(firstColumn(headers, values, "note", "notes"));
        request.setSeatCount(parseInteger(firstColumn(headers, values, "seatcount", "seats")));
        return request;
    }

    private List<String> parseCsvLine(String line) {
        List<String> values = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean quoted = false;
        for (int index = 0; index < line.length(); index++) {
            char ch = line.charAt(index);
            if (ch == '"') {
                if (quoted && index + 1 < line.length() && line.charAt(index + 1) == '"') {
                    current.append('"');
                    index++;
                } else {
                    quoted = !quoted;
                }
            } else if (ch == ',' && !quoted) {
                values.add(trimToNull(current.toString()));
                current.setLength(0);
            } else {
                current.append(ch);
            }
        }
        values.add(trimToNull(current.toString()));
        return values;
    }

    private String firstColumn(Map<String, Integer> headers, List<String> values, String... names) {
        for (String name : names) {
            Integer index = headers.get(name);
            if (index != null && index >= 0 && index < values.size()) {
                String value = trimToNull(values.get(index));
                if (value != null) {
                    return value;
                }
            }
        }
        return null;
    }

    private String normalizeHeader(String value) {
        String trimmed = trimToNull(value);
        if (trimmed == null) {
            return null;
        }
        return trimmed.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]", "");
    }

    private Integer parseInteger(String value) {
        String trimmed = trimToNull(value);
        if (trimmed == null) {
            return null;
        }
        try {
            int parsed = Integer.parseInt(trimmed);
            return parsed < 0 ? null : parsed;
        } catch (NumberFormatException exception) {
            return null;
        }
    }

    private boolean isDuplicateGuest(Long invitationId, GuestRequest request) {
        return duplicateGuest(invitationId, null, request);
    }

    private void ensureUniqueGuest(Long invitationId, Long currentGuestId, GuestRequest request) {
        if (duplicateGuest(invitationId, currentGuestId, request)) {
            throw new ApiException(
                    HttpStatus.CONFLICT,
                    "GUEST_DUPLICATE",
                    "Guest with the same email or phone already exists"
            );
        }
    }

    private boolean duplicateGuest(Long invitationId, Long currentGuestId, GuestRequest request) {
        String email = trimToNull(request.getEmail());
        if (email != null && guestRepository.findByInvitationIdAndEmailIgnoreCase(invitationId, email)
                .filter(existing -> !Objects.equals(existing.getId(), currentGuestId))
                .isPresent()) {
            return true;
        }
        String phone = trimToNull(request.getPhone());
        return phone != null && guestRepository.findByInvitationIdAndPhone(invitationId, phone)
                .filter(existing -> !Objects.equals(existing.getId(), currentGuestId))
                .isPresent();
    }

    private GuestImportErrorResponse errorRow(int rowNumber, String reason) {
        return GuestImportErrorResponse.builder()
                .rowNumber(rowNumber)
                .reason(reason)
                .build();
    }


    private String safeFilename(String originalFilename) {
        if (originalFilename == null || originalFilename.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Import file name is required");
        }
        String filename = originalFilename.trim();
        if (filename.contains("/") || filename.contains("\\") || filename.contains("..")
                || filename.chars().anyMatch(Character::isISOControl)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Import file name is invalid");
        }
        return filename;
    }

    private String extension(String filename) {
        int index = filename.lastIndexOf('.');
        if (index < 0 || index == filename.length() - 1) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Import file extension is required");
        }
        return filename.substring(index).toLowerCase(Locale.ROOT);
    }

    private String uniqueInviteToken() {
        String token;
        do {
            token = UUID.randomUUID().toString().replace("-", "");
        } while (guestRepository.existsByInviteToken(token));
        return token;
    }

    private String tokenUrl(UserInvitation invitation, String inviteToken) {
        String slug = invitation.getSlug() == null || invitation.getSlug().isBlank()
                ? "invitation-" + invitation.getId()
                : invitation.getSlug();
        return "/i/" + slug + "?token=" + inviteToken;
    }

    private String category(Guest guest) {
        String group = trimToNull(guest.getGuestGroup());
        return group == null ? "Uncategorized" : group;
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private record ImportRow(int rowNumber, GuestRequest request) {
    }
}
