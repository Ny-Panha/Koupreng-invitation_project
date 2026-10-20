package com.koupreng.backend.ticket.api.dto;

public record TicketDesignResponse(int schemaVersion, TicketDesignRequest design, String backgroundUrl, String coverUrl) {}
