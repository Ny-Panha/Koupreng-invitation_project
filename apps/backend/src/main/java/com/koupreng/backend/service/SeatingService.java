package com.koupreng.backend.service;

import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.dto.guest.GuestResponse;
import com.koupreng.backend.dto.seating.EventTableRequest;
import com.koupreng.backend.dto.seating.EventTableResponse;
import com.koupreng.backend.dto.seating.SeatAssignmentRequest;
import com.koupreng.backend.dto.seating.SeatAssignmentResponse;
import com.koupreng.backend.dto.seating.SeatingPlanResponse;
import com.koupreng.backend.dto.seating.SeatingSummaryResponse;
import com.koupreng.backend.entity.invitation.EventTable;
import com.koupreng.backend.entity.invitation.Guest;
import com.koupreng.backend.entity.invitation.GuestSeatAssignment;
import com.koupreng.backend.entity.invitation.UserInvitation;
import com.koupreng.backend.entity.user.AppUser;
import com.koupreng.backend.repository.EventTableRepository;
import com.koupreng.backend.repository.GuestRepository;
import com.koupreng.backend.repository.GuestSeatAssignmentRepository;
import com.koupreng.backend.repository.UserInvitationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class SeatingService {

    private final UserInvitationRepository invitationRepository;
    private final GuestRepository guestRepository;
    private final EventTableRepository tableRepository;
    private final GuestSeatAssignmentRepository assignmentRepository;
    private final CurrentUserService currentUserService;

    public SeatingService(
            UserInvitationRepository invitationRepository,
            GuestRepository guestRepository,
            EventTableRepository tableRepository,
            GuestSeatAssignmentRepository assignmentRepository,
            CurrentUserService currentUserService
    ) {
        this.invitationRepository = invitationRepository;
        this.guestRepository = guestRepository;
        this.tableRepository = tableRepository;
        this.assignmentRepository = assignmentRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
    public SeatingPlanResponse plan(Authentication authentication, Long invitationId) {
        requireInvitationAccess(authentication, invitationId);
        List<EventTable> tables = tableRepository.findByInvitationIdOrderBySortOrderAscTableNameAsc(invitationId);
        List<GuestSeatAssignment> assignments = assignmentRepository.findByInvitationIdOrderByAssignedAtDesc(invitationId);
        Map<Long, Integer> assignedSeatsByTable = assignedSeatsByTable(assignments);
        Set<Long> assignedGuestIds = assignments.stream()
                .map(GuestSeatAssignment::getGuest)
                .filter(Objects::nonNull)
                .map(Guest::getId)
                .collect(Collectors.toSet());

        return SeatingPlanResponse.builder()
                .invitationId(invitationId)
                .tables(tables.stream()
                        .map(table -> EventTableResponse.from(table, assignedSeatsByTable.getOrDefault(table.getId(), 0)))
                        .toList())
                .assignments(assignments.stream()
                        .sorted(assignmentComparator())
                        .map(SeatAssignmentResponse::from)
                        .toList())
                .unassignedGuests(guestRepository.findByInvitationIdOrderByGuestGroupAscTableNumberAscGuestNameAsc(invitationId).stream()
                        .filter(guest -> !assignedGuestIds.contains(guest.getId()))
                        .map(guest -> GuestResponse.from(guest))
                        .toList())
                .build();
    }

    @Transactional(readOnly = true)
    public List<EventTableResponse> listTables(Authentication authentication, Long invitationId) {
        requireInvitationAccess(authentication, invitationId);
        List<EventTable> tables = tableRepository.findByInvitationIdOrderBySortOrderAscTableNameAsc(invitationId);
        List<GuestSeatAssignment> assignments = assignmentRepository.findByInvitationIdOrderByAssignedAtDesc(invitationId);
        Map<Long, Integer> assignedSeatsByTable = assignedSeatsByTable(assignments);
        return tables.stream()
                .map(table -> EventTableResponse.from(table, assignedSeatsByTable.getOrDefault(table.getId(), 0)))
                .toList();
    }

    @Transactional(readOnly = true)
    public SeatingSummaryResponse summary(Authentication authentication, Long invitationId) {
        requireInvitationAccess(authentication, invitationId);
        List<EventTable> tables = tableRepository.findByInvitationIdOrderBySortOrderAscTableNameAsc(invitationId);
        List<GuestSeatAssignment> assignments = assignmentRepository.findByInvitationIdOrderByAssignedAtDesc(invitationId);

        long totalTables = tables.size();
        long totalCapacity = tables.stream().mapToLong(EventTable::getCapacity).sum();
        long assignedSeats = assignments.stream().mapToLong(a -> { Integer sc = a.getSeatCount(); return sc == null ? 1 : sc; }).sum();
        long remainingSeats = Math.max(0, totalCapacity - assignedSeats);

        return SeatingSummaryResponse.builder()
                .invitationId(invitationId)
                .totalTables(totalTables)
                .totalCapacity(totalCapacity)
                .assignedSeats(assignedSeats)
                .remainingSeats(remainingSeats)
                .build();
    }

    @Transactional
    public EventTableResponse createTable(
            Authentication authentication,
            Long invitationId,
            EventTableRequest request
    ) {
        UserInvitation invitation = requireInvitationAccess(authentication, invitationId);
        String tableName = requireText(request.getTableName(), "Table name is required");
        if (tableRepository.existsByInvitationIdAndTableNameIgnoreCase(invitationId, tableName)) {
            throw new ApiException(HttpStatus.CONFLICT, "Table name already exists");
        }

        EventTable table = new EventTable();
        table.setInvitation(invitation);
        table.setTableName(tableName);
        applyTableRequest(table, request);
        return EventTableResponse.from(tableRepository.save(table), 0);
    }

    @Transactional
    public EventTableResponse updateTable(
            Authentication authentication,
            Long invitationId,
            Long tableId,
            EventTableRequest request
    ) {
        requireInvitationAccess(authentication, invitationId);
        EventTable table = requireTableForUpdate(invitationId, tableId);
        String tableName = requireText(request.getTableName(), "Table name is required");
        boolean nameUsedByOther = tableRepository.findByInvitationIdOrderBySortOrderAscTableNameAsc(invitationId).stream()
                .anyMatch(candidate -> !Objects.equals(candidate.getId(), tableId)
                        && candidate.getTableName() != null
                        && candidate.getTableName().equalsIgnoreCase(tableName));
        if (nameUsedByOther) {
            throw new ApiException(HttpStatus.CONFLICT, "Table name already exists");
        }

        table.setTableName(tableName);
        applyTableRequest(table, request);
        int assignedSeats = assignedSeatsByTable(assignmentRepository.findByTableId(tableId))
                .getOrDefault(tableId, 0);
        if (assignedSeats > table.getCapacity()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Capacity is lower than assigned seats");
        }
        return EventTableResponse.from(table, assignedSeats);
    }

    @Transactional
    public void deleteTable(Authentication authentication, Long invitationId, Long tableId) {
        requireInvitationAccess(authentication, invitationId);
        EventTable table = requireTableForUpdate(invitationId, tableId);
        if (assignmentRepository.existsByTableId(tableId)) {
            throw new ApiException(HttpStatus.CONFLICT, "Table has assigned guests");
        }
        tableRepository.delete(table);
    }

    @Transactional
    public SeatAssignmentResponse assign(Authentication authentication, Long invitationId, SeatAssignmentRequest request) {
        UserInvitation invitation = requireInvitationAccess(authentication, invitationId);
        EventTable table = requireTableForUpdate(invitationId, request.getTableId());
        Guest guest = guestRepository.findForUpdateByIdAndInvitationId(request.getGuestId(), invitationId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Guest not found"));
        int seatCount = resolveSeatCount(request.getSeatCount(), guest.getSeatCount());

        GuestSeatAssignment assignment = assignmentRepository.findByInvitationIdAndGuestId(invitationId, guest.getId())
                .orElseGet(GuestSeatAssignment::new);
        int currentlyAssignedSeats = assignmentRepository.findByTableId(table.getId()).stream()
                .filter(existing -> assignment.getId() == null || !Objects.equals(existing.getId(), assignment.getId()))
                .mapToInt(existing -> { Integer sc = existing.getSeatCount(); return sc == null ? 1 : sc; })
                .sum();
        if (currentlyAssignedSeats + seatCount > table.getCapacity()) {
            throw new ApiException(
                    HttpStatus.CONFLICT,
                    "SEATING_CAPACITY_EXCEEDED",
                    "Table capacity exceeded"
            );
        }

        assignment.setInvitation(invitation);
        assignment.setTable(table);
        assignment.setGuest(guest);
        assignment.setSeatLabel(trimToNull(request.getSeatLabel()));
        assignment.setSeatCount(seatCount);
        assignment.setNotes(trimToNull(request.getNotes()));
        assignment.setAssignedAt(Instant.now());

        guest.setTableNumber(table.getTableName());
        guest.setSeatCount(seatCount);
        return SeatAssignmentResponse.from(assignmentRepository.save(assignment));
    }

    @Transactional
    public void unassign(Authentication authentication, Long invitationId, Long assignmentId) {
        requireInvitationAccess(authentication, invitationId);
        GuestSeatAssignment assignment = assignmentRepository.findByIdAndInvitationId(assignmentId, invitationId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Seat assignment not found"));
        Guest guest = assignment.getGuest();
        assignmentRepository.delete(assignment);
        if (guest != null) {
            guest.setTableNumber(null);
        }
    }

    @Transactional
    public void unassignGuest(Authentication authentication, Long invitationId, Long guestId) {
        requireInvitationAccess(authentication, invitationId);
        GuestSeatAssignment assignment = assignmentRepository.findByInvitationIdAndGuestId(invitationId, guestId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Guest seat assignment not found"));
        Guest guest = assignment.getGuest();
        assignmentRepository.delete(assignment);
        if (guest != null) {
            guest.setTableNumber(null);
        }
    }

    @Transactional(readOnly = true)
    public String exportCsv(Authentication authentication, Long invitationId) {
        SeatingPlanResponse plan = plan(authentication, invitationId);
        StringBuilder csv = new StringBuilder("tableName,tableLabel,capacity,assignedSeats,guestId,guestName,guestGroup,seatLabel,seatCount,notes\n");
        for (SeatAssignmentResponse assignment : plan.getAssignments()) {
            EventTableResponse table = plan.getTables().stream()
                    .filter(candidate -> Objects.equals(candidate.getId(), assignment.getTableId()))
                    .findFirst()
                    .orElse(null);
            csv.append(csvValue(assignment.getTableName()))
                    .append(',').append(csvValue(table == null ? null : table.getTableLabel()))
                    .append(',').append(csvValue(table == null ? null : table.getCapacity()))
                    .append(',').append(csvValue(table == null ? null : table.getAssignedSeats()))
                    .append(',').append(csvValue(assignment.getGuestId()))
                    .append(',').append(csvValue(assignment.getGuestName()))
                    .append(',').append(csvValue(assignment.getGuestGroup()))
                    .append(',').append(csvValue(assignment.getSeatLabel()))
                    .append(',').append(csvValue(assignment.getSeatCount()))
                    .append(',').append(csvValue(assignment.getNotes()))
                    .append('\n');
        }
        return csv.toString();
    }

    private void applyTableRequest(EventTable table, EventTableRequest request) {
        table.setTableLabel(trimToNull(request.getTableLabel()));
        Integer capacity = request.getCapacity();
        table.setCapacity(capacity == null ? 10 : capacity);
        Integer sortOrder = request.getSortOrder();
        table.setSortOrder(sortOrder == null ? 0 : sortOrder);
        table.setNotes(trimToNull(request.getNotes()));
    }

    private EventTable requireTableForUpdate(Long invitationId, Long tableId) {
        return tableRepository.findForUpdateByIdAndInvitationId(tableId, invitationId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Table not found"));
    }

    private UserInvitation requireInvitationAccess(Authentication authentication, Long invitationId) {
        AppUser user = currentUserService.currentUser(authentication);
        UserInvitation invitation = invitationRepository.findByIdAndDeletedFalse(invitationId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Invitation not found"));
        if (!isAdmin(authentication)
                && (invitation.getUser() == null || !Objects.equals(invitation.getUser().getId(), user.getId()))) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You do not have access to this invitation");
        }
        return invitation;
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication != null
                && authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ROLE_ADMIN"::equals);
    }

    private int resolveSeatCount(Integer requestSeatCount, Integer guestSeatCount) {
        Integer count = requestSeatCount == null ? guestSeatCount : requestSeatCount;
        if (count == null || count < 1) {
            return 1;
        }
        return count;
    }

    private Map<Long, Integer> assignedSeatsByTable(List<GuestSeatAssignment> assignments) {
        return assignments.stream()
                .filter(assignment -> assignment.getTable() != null && assignment.getTable().getId() != null)
                .collect(Collectors.groupingBy(
                        assignment -> assignment.getTable().getId(),
                        Collectors.summingInt(assignment -> { Integer sc = assignment.getSeatCount(); return sc == null ? 1 : sc; })
                ));
    }

    private Comparator<GuestSeatAssignment> assignmentComparator() {
        return Comparator
                .comparing((GuestSeatAssignment assignment) -> assignment.getTable() == null ? 0 : nullSafe(assignment.getTable().getSortOrder()))
                .thenComparing(assignment -> assignment.getTable() == null ? "" : nullSafeText(assignment.getTable().getTableName()))
                .thenComparing(assignment -> nullSafeText(assignment.getSeatLabel()))
                .thenComparing(assignment -> assignment.getGuest() == null ? "" : nullSafeText(assignment.getGuest().getGuestName()));
    }

    private int nullSafe(Integer value) {
        return value == null ? 0 : value;
    }

    private String nullSafeText(String value) {
        return value == null ? "" : value;
    }

    private String requireText(String value, String message) {
        String trimmed = trimToNull(value);
        if (trimmed == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, message);
        }
        return trimmed;
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private String csvValue(Object value) {
        if (value == null) {
            return "";
        }
        String text = String.valueOf(value);
        if (text.contains(",") || text.contains("\"") || text.contains("\n")) {
            return "\"" + text.replace("\"", "\"\"") + "\"";
        }
        return text;
    }
}
