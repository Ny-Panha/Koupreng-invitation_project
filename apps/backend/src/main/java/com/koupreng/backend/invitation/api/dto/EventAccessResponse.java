package com.koupreng.backend.invitation.api.dto;
import java.util.Set;

public record EventAccessResponse(boolean owner, Set<String> permissions, Set<String> ownerFeatures, Long organizationId) { }
