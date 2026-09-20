package com.koupreng.backend.audit.api;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.koupreng.backend.audit.api.dto.AuditLogResponse;
import com.koupreng.backend.audit.domain.AuditLog;
import com.koupreng.backend.audit.infrastructure.persistence.AuditLogRepository;
import com.koupreng.backend.shared.response.ApiResponse;
import com.koupreng.backend.user.domain.AppUser;
import com.koupreng.backend.user.infrastructure.persistence.AppUserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Audit Logs", description = "Activity tracking for admin changes and deletions.")
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "bearerAuth")
public class AuditLogController {

    private final AuditLogRepository auditLogRepository;
    private final AppUserRepository appUserRepository;

    public AuditLogController(AuditLogRepository auditLogRepository, AppUserRepository appUserRepository) {
        this.auditLogRepository = auditLogRepository;
        this.appUserRepository = appUserRepository;
    }

    @Operation(summary = "List recent admin activity logs")
    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<List<AuditLogResponse>>> listLogs(Authentication authentication) {
        List<AuditLog> logs = auditLogRepository.findAllByOrderByCreatedAtDesc();
        Map<Long, AppUser> usersById = appUserRepository.findAllById(logs.stream()
                        .map(AuditLog::getAdminId)
                        .filter(java.util.Objects::nonNull)
                        .distinct()
                        .toList())
                .stream()
                .collect(Collectors.toMap(AppUser::getId, user -> user));

        List<AuditLogResponse> body = logs.stream()
                .map(log -> AuditLogResponse.from(
                        log,
                        usersById.getOrDefault(log.getAdminId(), null),
                        usersById.getOrDefault(log.getAdminId(), null) != null
                                ? usersById.get(log.getAdminId()).getEmail()
                                : null
                ))
                .toList();

        return ResponseEntity.ok(ApiResponse.success("Audit logs fetched successfully", body));
    }
}
