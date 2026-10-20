package com.koupreng.backend.ticket.api.dto;

import java.time.LocalDate;
import java.time.LocalTime;

/** Minimal display projection. Guest contacts and internal credentials are never included. */
public record TicketResponse(String kind, String title, String hostName, String partnerName,
        LocalDate eventDate, LocalTime eventTime, String venueName, String guestName,
        String group, String tableName, String seatNumber, Integer seatCount,
        String invitationUrl, String qrPayload, String qrCodeDataUri, TicketDesignResponse appearance) {}
