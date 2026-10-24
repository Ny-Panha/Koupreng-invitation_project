package com.koupreng.backend.invitation.api.dto;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.Instant;

public record EventTeamLinkRequest(@Positive Long organizationId, @NotNull Instant expectedUpdatedAt) { }
