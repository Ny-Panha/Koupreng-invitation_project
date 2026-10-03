package com.koupreng.backend.guest.application;

import com.koupreng.backend.entitlement.application.EntitlementService;
import com.koupreng.backend.guest.domain.Guest;
import com.koupreng.backend.guest.infrastructure.persistence.GuestRepository;
import com.koupreng.backend.invitation.application.InvitationService;
import com.koupreng.backend.invitation.domain.UserInvitation;
import com.koupreng.backend.shared.exception.ApiException;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.core.Authentication;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.multipart.MultipartFile;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class GuestImportPreviewTests {
    private static final String CSV = """
            guestName,email,phone,category,seatCount,note
            "ភ្ញៀវ, One",first@example.test,0123,Family,2,"First note"
            Duplicate,FIRST@example.test,0222,Friends,2,Repeated email
            Existing,existing@example.test,0333,Friends,1,Existing email
            ,empty-name@example.test,0444,Friends,1,Missing name
            Repeated phone,other@example.test,0123,Friends,1,Repeated phone
            """;

    @Test
    void csvPreviewPreservesFieldsAndReportsExistingAndFileDuplicatesWithoutMutation() {
        Fixture fixture = fixture();
        var preview = fixture.service.previewGuestsFile(fixture.auth, 10L, csv(CSV));
        assertEquals(1, preview.acceptedCount());
        assertEquals(4, preview.skippedCount());
        assertEquals(List.of(3, 4, 5, 6), preview.errorRows().stream().map(error -> error.getRowNumber()).toList());
        assertEquals("Guest name is required", preview.errorRows().get(2).getReason());
        var row = preview.validRows().getFirst();
        assertEquals(2, row.rowNumber());
        assertEquals("ភ្ញៀវ, One", row.guest().getGuestName());
        assertEquals("0123", row.guest().getPhone());
        assertEquals("Family", row.guest().getGuestGroup());
        assertEquals(2, row.guest().getSeatCount());
        assertEquals("First note", row.guest().getNote());
        verify(fixture.guests, never()).save(any());
        verify(fixture.guests, never()).saveAll(any());
        verify(fixture.guests, never()).delete(any());
        verify(fixture.guests, never()).existsByInviteToken(anyString());
        verifyNoInteractions(fixture.entitlements);
    }

    @Test
    void previewAndExistingImportProduceTheSameAcceptedAndSkippedRows() {
        Fixture fixture = fixture();
        var preview = fixture.service.previewGuestsFile(fixture.auth, 10L, csv(CSV));
        var committed = fixture.service.importGuestsFile(fixture.auth, 10L, csv(CSV));
        assertEquals(preview.acceptedCount(), committed.getImportedCount());
        assertEquals(preview.skippedCount(), committed.getSkippedCount());
        assertEquals(preview.validRows().getFirst().guest().getGuestName(), committed.getGuests().getFirst().getGuestName());
        assertNotNull(committed.getGuests().getFirst().getInviteToken());
        verify(fixture.entitlements).requireGuestCreation(any(), eq(1));
    }

    @Test
    void xlsxPreviewUsesExistingHeaderAliasesAndPreservesTextPhone() throws Exception {
        Fixture fixture = fixture();
        byte[] bytes;
        try (var workbook = new XSSFWorkbook(); var output = new ByteArrayOutputStream()) {
            var sheet = workbook.createSheet();
            var header = sheet.createRow(0);
            for (int index = 0; index < 5; index++) {
                header.createCell(index).setCellValue(List.of("name", "tel", "group", "seats", "notes").get(index));
            }
            var guest = sheet.createRow(1);
            guest.createCell(0).setCellValue("សុភា");
            guest.createCell(1).setCellValue("00123");
            guest.createCell(2).setCellValue("Family");
            guest.createCell(3).setCellValue(3);
            guest.createCell(4).setCellValue("Keep original note");
            sheet.createRow(2).createCell(1).setCellValue("09999");
            workbook.write(output);
            bytes = output.toByteArray();
        }
        var preview = fixture.service.previewGuestsFile(fixture.auth, 10L,
                new MockMultipartFile("file", "guests.xlsx",
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", bytes));
        assertEquals(1, preview.acceptedCount());
        assertEquals(1, preview.skippedCount());
        assertEquals(3, preview.errorRows().getFirst().getRowNumber());
        var guest = preview.validRows().getFirst().guest();
        assertEquals("សុភា", guest.getGuestName());
        assertEquals("00123", guest.getPhone());
        assertEquals(3, guest.getSeatCount());
        verify(fixture.guests, never()).save(any());
        verifyNoInteractions(fixture.entitlements);
    }

    @Test
    void nonOwnerIsRejectedBeforeReadingTheFileOrGuestData() {
        Fixture fixture = fixture();
        MultipartFile file = mock(MultipartFile.class);
        when(fixture.invitations.requireOwnedInvitationEntity(fixture.auth, 10L))
                .thenThrow(new ApiException(HttpStatus.FORBIDDEN, "Invitation access denied"));
        assertEquals(HttpStatus.FORBIDDEN, assertThrows(ApiException.class,
                () -> fixture.service.previewGuestsFile(fixture.auth, 10L, file)).getStatus());
        verifyNoInteractions(file, fixture.guests, fixture.entitlements);
    }

    @Test
    void previewRetainsFileTypeSignatureNameSizeAndHeaderValidation() {
        List<MultipartFile> invalid = List.of(
                new MockMultipartFile("file", "guests.csv", "text/csv", new byte[0]),
                new MockMultipartFile("file", "../guests.csv", "text/csv", "name\nHost".getBytes(StandardCharsets.UTF_8)),
                new MockMultipartFile("file", "guests.svg", "image/svg+xml", "name\nHost".getBytes(StandardCharsets.UTF_8)),
                new MockMultipartFile("file", "guests.xlsx", "application/octet-stream", "not an XLSX archive".getBytes(StandardCharsets.UTF_8)),
                csv("phone,email\n0123,guest@example.test")
        );
        for (MultipartFile file : invalid) {
            Fixture fixture = fixture();
            assertEquals(HttpStatus.BAD_REQUEST, assertThrows(ApiException.class,
                    () -> fixture.service.previewGuestsFile(fixture.auth, 10L, file)).getStatus());
            verifyNoInteractions(fixture.guests, fixture.entitlements);
        }
        Fixture fixture = fixture();
        assertEquals(HttpStatus.CONTENT_TOO_LARGE, assertThrows(ApiException.class,
                () -> fixture.service.previewGuestsFile(fixture.auth, 10L,
                        new MockMultipartFile("file", "guests.csv", "text/csv", new byte[5 * 1024 * 1024 + 1]))).getStatus());
        verifyNoInteractions(fixture.guests, fixture.entitlements);
    }

    @Test
    void csvPreviewAndImportRejectBeanConstraintViolationsByRow() {
        String contents = "guestName,email,phone,seatCount\n"
                + "Valid,valid@example.test,0123,2\n"
                + "Bad email,invalid-email,0222,1\n"
                + "N".repeat(256) + ",long-name@example.test,0333,1\n"
                + "Long phone,long-phone@example.test," + "1".repeat(51) + ",1\n"
                + "Long email," + "x".repeat(250) + "@example.test,0444,1\n";
        Fixture fixture = fixture();
        var preview = fixture.service.previewGuestsFile(fixture.auth, 10L, csv(contents));
        assertEquals(1, preview.acceptedCount());
        assertEquals(4, preview.skippedCount());
        assertEquals(List.of(3, 4, 5, 6), preview.errorRows().stream().map(error -> error.getRowNumber()).toList());
        assertTrue(preview.errorRows().getFirst().getReason().contains("Guest email is invalid"));
        verify(fixture.guests, never()).save(any());
        var committed = fixture.service.importGuestsFile(fixture.auth, 10L, csv(contents));
        assertEquals(1, committed.getImportedCount());
        assertEquals(4, committed.getSkippedCount());
        assertEquals(preview.errorRows().stream().map(error -> error.getReason()).toList(),
                committed.getErrorRows().stream().map(error -> error.getReason()).toList());
        verify(fixture.entitlements).requireGuestCreation(any(), eq(1));
    }

    @Test
    void malformedAndNonpositiveSeatsAreErrorsRatherThanSilentlyDefaulting() {
        String contents = "guestName,seatCount\nBlank seats,\nValid seats,3\n"
                + "Zero,0\nNegative,-1\nText,three\nFraction,1.5\nOverflow,2147483648\n";
        Fixture fixture = fixture();
        var preview = fixture.service.previewGuestsFile(fixture.auth, 10L, csv(contents));
        assertEquals(2, preview.acceptedCount());
        assertEquals(5, preview.skippedCount());
        assertNull(preview.validRows().getFirst().guest().getSeatCount());
        assertEquals(3, preview.validRows().get(1).guest().getSeatCount());
        assertEquals(List.of(4, 5, 6, 7, 8), preview.errorRows().stream().map(error -> error.getRowNumber()).toList());
        assertTrue(preview.errorRows().stream().allMatch(error -> error.getReason().startsWith("Seat count")));
        var committed = fixture.service.importGuestsFile(fixture.auth, 10L, csv(contents));
        assertEquals(2, committed.getImportedCount());
        assertEquals(5, committed.getSkippedCount());
        verify(fixture.guests, times(2)).save(any());
    }

    @Test
    void xlsxRejectsMalformedNumericAndInvalidEmailRowsWithTheSameRules() throws Exception {
        byte[] bytes;
        try (var workbook = new XSSFWorkbook(); var output = new ByteArrayOutputStream()) {
            var sheet = workbook.createSheet();
            var header = sheet.createRow(0);
            header.createCell(0).setCellValue("name");
            header.createCell(1).setCellValue("email");
            header.createCell(2).setCellValue("seats");
            var valid = sheet.createRow(1);
            valid.createCell(0).setCellValue("សុភា"); valid.createCell(1).setCellValue("guest@example.test"); valid.createCell(2).setCellValue(2);
            var invalidEmail = sheet.createRow(2);
            invalidEmail.createCell(0).setCellValue("Bad email"); invalidEmail.createCell(1).setCellValue("invalid-email");
            var invalidSeats = sheet.createRow(3);
            invalidSeats.createCell(0).setCellValue("Fraction"); invalidSeats.createCell(2).setCellValue(2.5);
            workbook.write(output); bytes = output.toByteArray();
        }
        Fixture fixture = fixture();
        var file = new MockMultipartFile("file", "guests.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", bytes);
        var preview = fixture.service.previewGuestsFile(fixture.auth, 10L, file);
        assertEquals(1, preview.acceptedCount());
        assertEquals(2, preview.skippedCount());
        assertEquals(List.of(3, 4), preview.errorRows().stream().map(error -> error.getRowNumber()).toList());
        var committed = fixture.service.importGuestsFile(fixture.auth, 10L, file);
        assertEquals(1, committed.getImportedCount());
        assertEquals(2, committed.getSkippedCount());
    }

    @Test
    void unmatchedCsvQuoteIsAnErrorRowAndValidEscapedQuotesArePreserved() {
        String contents = "guestName,note\n\"Valid, Guest\",\"Quoted \"\"note\"\"\"\n\"Unclosed guest,broken\nNext guest,Valid\n";
        Fixture fixture = fixture();
        var preview = fixture.service.previewGuestsFile(fixture.auth, 10L, csv(contents));
        assertEquals(2, preview.acceptedCount());
        assertEquals(1, preview.skippedCount());
        assertEquals(3, preview.errorRows().getFirst().getRowNumber());
        assertEquals("CSV row has an unmatched quote", preview.errorRows().getFirst().getReason());
        assertEquals("Valid, Guest", preview.validRows().getFirst().guest().getGuestName());
        assertEquals("Quoted \"note\"", preview.validRows().getFirst().guest().getNote());
        var committed = fixture.service.importGuestsFile(fixture.auth, 10L, csv(contents));
        assertEquals(2, committed.getImportedCount());
        assertEquals(1, committed.getSkippedCount());
    }

    private MockMultipartFile csv(String text) {
        return new MockMultipartFile("file", "ភ្ញៀវ.csv", "text/csv", text.getBytes(StandardCharsets.UTF_8));
    }

    private Fixture fixture() {
        GuestRepository guests = mock(GuestRepository.class);
        InvitationService invitations = mock(InvitationService.class);
        EntitlementService entitlements = mock(EntitlementService.class);
        Authentication auth = mock(Authentication.class);
        UserInvitation invitation = new UserInvitation();
        invitation.setId(10L);
        invitation.setSlug("import-preview");
        when(invitations.requireOwnedInvitationEntity(auth, 10L)).thenReturn(invitation);
        List<Guest> stored = new ArrayList<>();
        Guest existing = new Guest(); existing.setId(99L); existing.setEmail("existing@example.test"); stored.add(existing);
        when(guests.findByInvitationIdAndEmailIgnoreCase(eq(10L), anyString())).thenAnswer(call -> {
            String email = call.getArgument(1);
            return stored.stream().filter(guest -> email.equalsIgnoreCase(guest.getEmail())).findFirst();
        });
        when(guests.findByInvitationIdAndPhone(eq(10L), anyString())).thenAnswer(call -> {
            String phone = call.getArgument(1);
            return stored.stream().filter(guest -> phone.equals(guest.getPhone())).findFirst();
        });
        AtomicLong nextId = new AtomicLong(100);
        when(guests.save(any())).thenAnswer(call -> {
            Guest guest = call.getArgument(0); guest.setId(nextId.getAndIncrement()); stored.add(guest); return guest;
        });
        GuestService service = new GuestService(guests, invitations);
        ReflectionTestUtils.setField(service, "entitlementService", entitlements);
        return new Fixture(service, guests, invitations, entitlements, auth);
    }

    private record Fixture(GuestService service, GuestRepository guests, InvitationService invitations,
                           EntitlementService entitlements, Authentication auth) { }
}
