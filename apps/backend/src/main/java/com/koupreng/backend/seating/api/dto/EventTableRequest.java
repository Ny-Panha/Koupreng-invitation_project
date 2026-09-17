package com.koupreng.backend.seating.api.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class EventTableRequest {

    @NotBlank(message = "Table name is required")
    private String tableName;

    private String tableLabel;

    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    private Integer sortOrder;

    private String notes;
}
