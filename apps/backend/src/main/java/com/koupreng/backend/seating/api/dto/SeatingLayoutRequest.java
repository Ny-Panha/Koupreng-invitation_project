package com.koupreng.backend.seating.api.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.Map;

public record SeatingLayoutRequest(@Min(0) long version, @NotNull @Valid LayoutData data) {
    public record Point(@NotNull @DecimalMin("0") @DecimalMax("100") Double x,
                        @NotNull @DecimalMin("0") @DecimalMax("100") Double y) {}
    public record Walkway(@NotNull @DecimalMin("0") @DecimalMax("100") Double x,
                          @NotNull @DecimalMin("0") @DecimalMax("100") Double y,
                          @NotNull @Pattern(regexp = "vertical|horizontal") String orientation, boolean enabled) {}
    public record Venue(@NotNull @Valid Point stage, @NotNull @Valid Point entrance, @NotNull @Valid Walkway walkway) {}
    public record LayoutData(@Min(1) @Max(1) int schemaVersion, @NotNull @Size(max = 500) Map<@NotNull Long, @NotNull @Valid Point> positions,
                             @NotNull @Valid Venue venue) {}
}
