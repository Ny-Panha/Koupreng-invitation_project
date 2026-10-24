package com.koupreng.backend.guest.api.dto;

public record GuestOverviewResponse(long guestRecords, long reservedSeats, long attendingRecords, long declinedRecords,
        long maybeRecords, long unansweredRecords, long respondedRecords, long toInviteRecords, long checkedInRecords,
        long confirmedAttendees, long markedSentRecords) { }
