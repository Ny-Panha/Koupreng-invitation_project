package com.koupreng.backend.audit.api.dto;

import java.time.Instant;

import com.koupreng.backend.audit.domain.AuditLog;
import com.koupreng.backend.user.domain.AppUser;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogResponse {

    private Long id;
    private Long adminId;
    private String adminName;
    private String adminEmail;
    private String action;
    private String targetEntity;
    private Long targetId;
    private String oldValues;
    private String newValues;
    private String ipAddress;
    private Instant createdAt;

    public static AuditLogResponse from(AuditLog log, AppUser adminUser, String adminEmail) {
        String adminName = adminUser != null && adminUser.getFullName() != null
                ? adminUser.getFullName()
                : (adminUser != null ? adminUser.getEmail() : "Admin #" + log.getAdminId());

        return AuditLogResponse.builder()
                .id(log.getId())
                .adminId(log.getAdminId())
                .adminName(adminName)
                .adminEmail(adminEmail)
                .action(log.getAction())
                .targetEntity(log.getTargetEntity())
                .targetId(log.getTargetId())
                .oldValues(log.getOldValues())
                .newValues(log.getNewValues())
                .ipAddress(log.getIpAddress())
                .createdAt(log.getCreatedAt())
                .build();
    }
}
