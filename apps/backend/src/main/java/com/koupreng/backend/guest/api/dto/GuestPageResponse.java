package com.koupreng.backend.guest.api.dto;
import java.time.Instant;
import java.util.List;

public record GuestPageResponse(List<Row> items, int page, int size, long totalElements, int totalPages) {
    public record Row(GuestResponse guest, String rsvpStatus, Integer attendeeCount, Instant respondedAt,
                      boolean checkedIn, Instant checkedInAt) { }
}
