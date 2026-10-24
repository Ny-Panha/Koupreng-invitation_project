package com.koupreng.backend.guest.application;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.koupreng.backend.guest.api.dto.*;
import com.koupreng.backend.guest.api.dto.GuestBatchResponse.RowResult;
import com.koupreng.backend.guest.domain.Guest;
import com.koupreng.backend.guest.domain.GuestImportBatch;
import com.koupreng.backend.guest.infrastructure.persistence.GuestImportBatchRepository;
import com.koupreng.backend.guest.infrastructure.persistence.GuestRepository;
import com.koupreng.backend.invitation.application.InvitationService;
import com.koupreng.backend.invitation.infrastructure.persistence.UserInvitationRepository;
import com.koupreng.backend.shared.exception.ApiException;
import jakarta.validation.Validator;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service @RequiredArgsConstructor
public class GuestBatchService {
    private final InvitationService invitations;
    private final UserInvitationRepository eventRepository;
    private final GuestRepository guests;
    private final GuestImportBatchRepository batches;
    private final GuestService guestService;
    private final GuestImportFileReader reader;
    private final Validator validator;
    private final ObjectMapper json;

    @Transactional(readOnly = true)
    public GuestImportSourceResponse inspect(Authentication auth, Long eventId, MultipartFile file) {
        invitations.requireOwnedInvitationEntity(auth, eventId);
        return reader.read(file);
    }

    @Transactional(readOnly = true)
    public GuestBatchResponse preview(Authentication auth, Long eventId, GuestBatchRequest request) {
        invitations.requireOwnedInvitationEntity(auth, eventId);
        return review(eventId, request);
    }

    @Transactional(isolation = org.springframework.transaction.annotation.Isolation.READ_COMMITTED)
    public GuestBatchResponse commit(Authentication auth, Long eventId, GuestBatchRequest request) {
        var event = invitations.requireOwnedInvitationEntity(auth, eventId);
        // One event lock makes receipt lookup, validation, capacity and guest creation one transaction.
        eventRepository.findForUpdateByIdAndUserId(eventId, event.getUser().getId())
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Event not found"));
        String hash = hash(request);
        var prior = batches.findById(request.batchId().toString());
        if (prior.isPresent()) {
            var receipt = prior.get();
            if (!eventId.equals(receipt.getInvitationId()) || !hash.equals(receipt.getRequestHash())) {
                throw new ApiException(HttpStatus.CONFLICT, "Import batch ID has already been used for a different request");
            }
            try { return json.readValue(receipt.getResultJson(), GuestBatchResponse.class); }
            catch (Exception failure) { throw new IllegalStateException("Import receipt could not be read", failure); }
        }
        guestService.requireImportFeature(event);
        var preview = review(eventId, request);
        if (preview.rows().stream().anyMatch(row -> !Set.of("READY", "SKIPPED").contains(row.status()))) {
            throw new ApiException(HttpStatus.CONFLICT, "Import has unresolved rows. Review the preview again; no rows were imported.");
        }
        List<RowResult> results = new ArrayList<>();
        int imported = 0;
        for (int i = 0; i < request.rows().size(); i++) {
            var row = request.rows().get(i);
            if (row.skip()) { results.add(preview.rows().get(i)); continue; }
            guestService.create(auth, eventId, row.guest().toGuestRequest());
            imported++;
            results.add(new RowResult(row.rowNumber(), "IMPORTED", List.of()));
        }
        var result = new GuestBatchResponse(request.batchId(), imported, 0, request.rows().size() - imported, 0, true, results);
        var receipt = new GuestImportBatch();
        receipt.setBatchId(request.batchId().toString()); receipt.setInvitationId(eventId); receipt.setRequestHash(hash);
        receipt.setCreatedAt(Instant.now());
        try { receipt.setResultJson(json.writeValueAsString(result)); }
        catch (Exception failure) { throw new IllegalStateException("Import receipt could not be created", failure); }
        batches.save(receipt);
        return result;
    }

    private GuestBatchResponse review(Long eventId, GuestBatchRequest request) {
        if (!validator.validate(request).isEmpty()) throw new ApiException(HttpStatus.BAD_REQUEST, "Import request exceeds allowed field or row limits");
        if (request.rows() == null || request.rows().isEmpty() || request.rows().size() > 1000) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Import must contain 1–1000 rows");
        }
        List<Guest> existing = guests.findByInvitationIdOrderByCreatedAtDesc(eventId);
        Set<Integer> numbers = new HashSet<>();
        Set<String> phones = new HashSet<>(), emails = new HashSet<>(), names = new HashSet<>();
        List<RowResult> results = new ArrayList<>();
        for (var row : request.rows()) {
            if (!numbers.add(row.rowNumber())) throw new ApiException(HttpStatus.BAD_REQUEST, "Source row numbers must be unique");
            if (row.skip()) { results.add(new RowResult(row.rowNumber(), "SKIPPED", List.of("Skipped by host"))); continue; }
            List<String> issues = new ArrayList<>();
            validator.validate(row.guest()).stream().map(v -> v.getPropertyPath() + ": " + v.getMessage()).sorted().distinct().forEach(issues::add);
            GuestRequest guest = null;
            try { guest = row.guest().toGuestRequest(); }
            catch (NumberFormatException failure) { issues.add("Party size must be a whole number from 1 to 1000"); }
            if (guest != null) {
                validator.validate(guest).stream().map(v -> v.getMessage()).sorted().distinct().forEach(issues::add);
                if (guest.getSeatCount() < 1 || guest.getSeatCount() > 1000) issues.add("Party size must be from 1 to 1000");
                if (guest.getPhone() != null && !guest.getPhone().matches("(?:0|\\+)[0-9 ()-]{6,24}")) {
                    issues.add("Phone must start with 0 or +country code. Correct numeric spreadsheet cells; missing zeroes are never guessed.");
                }
            }
            if (!issues.isEmpty()) { results.add(new RowResult(row.rowNumber(), "INVALID", issues)); continue; }
            String phone = normalized(guest.getPhone()), email = normalized(guest.getEmail()), name = normalized(guest.getGuestName());
            boolean contactMatch = (!phone.isEmpty() && phones.contains(phone)) || (!email.isEmpty() && emails.contains(email))
                || existing.stream().anyMatch(g -> (!phone.isEmpty() && phone.equals(normalized(g.getPhone()))) || (!email.isEmpty() && email.equals(normalized(g.getEmail()))));
            boolean nameMatch = names.contains(name) || existing.stream().anyMatch(g -> name.equals(normalized(g.getGuestName())));
            if (contactMatch) results.add(new RowResult(row.rowNumber(), "DUPLICATE", List.of("An existing or selected row shares this phone/email. Review in Guests or skip; no automatic merge.")));
            else if (nameMatch && !row.allowNameMatch()) results.add(new RowResult(row.rowNumber(), "NAME_MATCH", List.of("The name matches another guest. Skip or explicitly create a separate guest.")));
            else {
                results.add(new RowResult(row.rowNumber(), "READY", List.of()));
                if (!phone.isEmpty()) phones.add(phone);
                if (!email.isEmpty()) emails.add(email);
                names.add(name);
            }
        }
        return new GuestBatchResponse(request.batchId(), 0, 0,
            (int) results.stream().filter(r -> r.status().equals("SKIPPED")).count(),
            (int) results.stream().filter(r -> r.status().equals("INVALID")).count(), false, results);
    }

    private static String normalized(String value) { return value == null ? "" : value.trim().toLowerCase(Locale.ROOT); }
    private String hash(GuestBatchRequest request) {
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(json.writeValueAsString(request).getBytes(StandardCharsets.UTF_8))); }
        catch (Exception failure) { throw new IllegalStateException("Import request could not be fingerprinted", failure); }
    }
}
