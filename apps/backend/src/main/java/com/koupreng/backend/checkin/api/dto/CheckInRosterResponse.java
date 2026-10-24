package com.koupreng.backend.checkin.api.dto;
import java.util.List;

public record CheckInRosterResponse(List<Row> items, int page, int size, long totalElements, int totalPages) {
    public record Row(Long id, String guestName, String guestGroup, String tableNumber, Integer seatCount) { }
}
