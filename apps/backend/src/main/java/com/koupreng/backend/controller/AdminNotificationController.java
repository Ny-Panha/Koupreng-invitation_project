package com.koupreng.backend.controller;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.koupreng.backend.dto.ApiResponse;
import com.koupreng.backend.dto.notification.CreateNotificationRequest;
import com.koupreng.backend.dto.notification.NotificationResponse;
import com.koupreng.backend.dto.notification.NotificationStatusUpdateRequest;
import com.koupreng.backend.enums.NotificationChannel;
import com.koupreng.backend.enums.NotificationStatus;
import com.koupreng.backend.enums.NotificationType;
import com.koupreng.backend.service.AuditLogService;
import com.koupreng.backend.service.NotificationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@Validated
@PreAuthorize("hasRole('ADMIN')")
@RequestMapping("/api/v1/admin/notifications")
@Tag(name = "Administration", description = "ADMIN-only notification creation, delivery status, and audit operations.")
@SecurityRequirement(name = "bearerAuth")
public class AdminNotificationController {

    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    public AdminNotificationController(
            NotificationService notificationService,
            AuditLogService auditLogService
    ) {
        this.notificationService = notificationService;
        this.auditLogService = auditLogService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<NotificationResponse>> create(
            Authentication authentication,
            @Valid @RequestBody CreateNotificationRequest request,
            HttpServletRequest httpRequest
    ) {
        NotificationResponse response = notificationService.createNotification(authentication, request);
        auditLogService.logAdminAction(authentication, "NOTIFICATION_CREATED", "NOTIFICATION", response.getId(),
                "Created admin notification", httpRequest, Map.of("type", response.getType(), "channel", response.getChannel()));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Notification created successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> list(
            @RequestParam(required = false) NotificationStatus status,
            @RequestParam(required = false) NotificationType type,
            @RequestParam(required = false) NotificationChannel channel
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Notifications fetched successfully",
                notificationService.listAllForAdmin(status, type, channel)
        ));
    }

    @PatchMapping("/{notificationId}/status")
    public ResponseEntity<ApiResponse<NotificationResponse>> updateStatus(
            Authentication authentication,
            @PathVariable Long notificationId,
            @Valid @RequestBody NotificationStatusUpdateRequest request,
            HttpServletRequest httpRequest
    ) {
        NotificationResponse response = notificationService.recordDeliveryStatus(authentication, notificationId, request);
        auditLogService.logAdminAction(authentication, "NOTIFICATION_STATUS_CHANGED", "NOTIFICATION", notificationId,
                "Changed notification status", httpRequest, Map.of("status", response.getStatus()));
        return ResponseEntity.ok(ApiResponse.success("Notification status updated successfully", response));
    }
}
