package com.koupreng.backend.guest.api.dto;
import jakarta.validation.constraints.*;
import java.util.List;

public record GuestSelectionExportRequest(@NotEmpty @Size(max=100) List<@NotNull @Positive Long> guestIds) { }
