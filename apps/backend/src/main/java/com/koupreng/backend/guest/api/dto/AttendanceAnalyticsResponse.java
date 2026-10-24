package com.koupreng.backend.guest.api.dto;

import java.time.LocalDate;
import java.util.List;

public record AttendanceAnalyticsResponse(LocalDate from, LocalDate to, String timezone,
        GuestOverviewResponse current, List<Day> days) {
    public record Day(LocalDate date, long guestRecordsCreated, long latestRsvpRecords,
            long attendingRecords, long declinedRecords, long maybeRecords, long activeCheckInRecords) { }
}
