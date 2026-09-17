package com.koupreng.backend.audit.api.dto;

import com.koupreng.backend.audit.domain.SystemAuditLog;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemAuditLogResponse {

    private Long id;
    private Long actorUserId;
    private String actorEmail;
    private String action;
    private String resourceType;
    private Long resourceId;
    private String description;
    private String ipAddress;
    private String userAgent;
    private String metadataJson;
    private Instant createdAt;

    public static SystemAuditLogResponse from(SystemAuditLog log) {
        return SystemAuditLogResponse.builder()
                .id(log.getId())
                .actorUserId(log.getActorUserId())
                .actorEmail(log.getActorEmail())
                .action(log.getAction())
                .resourceType(log.getResourceType())
                .resourceId(log.getResourceId())
                .description(log.getDescription())
                .ipAddress(log.getIpAddress())
                .userAgent(log.getUserAgent())
                .metadataJson(log.getMetadataJson())
                .createdAt(log.getCreatedAt())
                .build();
    }
}
