package com.koupreng.backend.audit.api;

import java.util.List;

import com.koupreng.backend.audit.api.dto.AuditLogResponse;
import com.koupreng.backend.audit.application.AuditActivityService;
import com.koupreng.backend.shared.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Audit Logs", description = "Activity tracking for admin changes and deletions.")
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "bearerAuth")
public class AuditLogController {

    private final AuditActivityService auditActivityService;

    public AuditLogController(AuditActivityService auditActivityService) {
        this.auditActivityService = auditActivityService;
    }

    @Operation(summary = "List recent admin activity logs")
    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<List<AuditLogResponse>>> listLogs() {
        return ResponseEntity.ok(ApiResponse.success(
                "Audit logs fetched successfully",
                auditActivityService.listLogs()
        ));
    }
}
