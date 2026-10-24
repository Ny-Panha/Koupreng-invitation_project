package com.koupreng.backend.guest.api.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;
import java.util.UUID;

public record GuestBatchRequest(@NotNull UUID batchId, @NotEmpty @Size(max = 1000) List<@NotNull @Valid ImportRow> rows) {
    public record ImportRow(@Min(2) @Max(1001) int rowNumber, @NotNull Fields guest, boolean skip, boolean allowNameMatch) {}
    // The import boundary intentionally excludes RSVP, delivery, contribution, seating IDs and bearer credentials.
    public record Fields(
        @Size(max = 255) String guestName, @Size(max = 50) String phone,
        @Size(max = 255) String email, @Size(max = 255) String guestGroup,
        @Size(max = 255) String sideType, @Size(max = 255) String companionName,
        @Size(max = 255) String tableNumber, @Size(max = 2000) String note,
        @Size(max = 10) String seatCount
    ) {
        public GuestRequest toGuestRequest() {
            var result = new GuestRequest();
            result.setGuestName(clean(guestName)); result.setPhone(clean(phone)); result.setEmail(clean(email));
            result.setGuestGroup(clean(guestGroup)); result.setSideType(clean(sideType));
            result.setCompanionName(clean(companionName)); result.setTableNumber(clean(tableNumber)); result.setNote(clean(note));
            result.setSeatCount(clean(seatCount) == null ? 1 : Integer.valueOf(seatCount.trim()));
            return result;
        }
        private static String clean(String value) { return value == null || value.isBlank() ? null : value.trim(); }
    }
}
