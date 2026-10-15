package com.koupreng.backend.admin.api.dto;

import java.time.LocalDate;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

/** Calendar dates are Phnom Penh dates; `to` is exclusive. Null bounds mean all time. */
@Data
public class AdminReportQuery {
    @io.swagger.v3.oas.annotations.media.Schema(description="Inclusive Phnom Penh calendar date; supply both bounds or neither",example="2026-10-01")
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) private LocalDate from;
    @io.swagger.v3.oas.annotations.media.Schema(description="Exclusive Phnom Penh calendar date",example="2026-11-01")
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) private LocalDate to;
    private String dateDimension;
    private String eventType;
    private String status;
    private String moderationStatus;
    private String paymentType;
    private String paymentStatus;
    private String provider;
    private String currency;
    private Long packageId;
    private String search;
    private String sort;
    @io.swagger.v3.oas.annotations.media.Schema(allowableValues={"ASC","DESC"},defaultValue="DESC") private String direction;
    @io.swagger.v3.oas.annotations.media.Schema(minimum="0",maximum="1000000",defaultValue="0") private Integer page;
    @io.swagger.v3.oas.annotations.media.Schema(minimum="1",maximum="200",defaultValue="20") private Integer size;
}
