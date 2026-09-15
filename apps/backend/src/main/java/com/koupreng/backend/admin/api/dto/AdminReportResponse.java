package com.koupreng.backend.admin.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminReportResponse {

    private String report;
    private Instant generatedAt;
    private Map<String, Object> summary;
    private List<?> rows;
}
