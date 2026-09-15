package com.koupreng.backend.checkin.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CheckInScanRequest {

    @NotBlank(message = "Check-in token is required")
    @Size(max = 1200)
    private String token;

    @Size(max = 1000)
    private String note;
}
