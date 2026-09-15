package com.koupreng.backend.guest.api.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class GuestImportRequest {

    @Valid
    @NotEmpty(message = "At least one guest is required")
    @Size(max = 1000, message = "A single import can contain at most 1000 guests")
    private List<GuestRequest> guests = new ArrayList<>();
}
