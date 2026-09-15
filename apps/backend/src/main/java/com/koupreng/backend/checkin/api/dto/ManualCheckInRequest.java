package com.koupreng.backend.checkin.api.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ManualCheckInRequest {

    @Size(max = 1000)
    private String note;
}
