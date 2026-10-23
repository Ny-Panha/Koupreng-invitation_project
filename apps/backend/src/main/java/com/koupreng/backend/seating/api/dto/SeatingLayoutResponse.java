package com.koupreng.backend.seating.api.dto;

import java.time.Instant;

public record SeatingLayoutResponse(Long eventId, long version, SeatingLayoutRequest.LayoutData data, Instant updatedAt) {}
