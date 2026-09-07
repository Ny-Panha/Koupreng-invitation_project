package com.koupreng.backend.controller;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.koupreng.backend.dto.ApiResponse;
import com.koupreng.backend.dto.notification.NotificationResponse;
import com.koupreng.backend.dto.notification.NotificationSummaryResponse;
import com.koupreng.backend.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@Validated
@RequestMapping("/api/v1")
@Tag(name = "Notifications", description = "Current-user and invitation-owner notification views and read state.")
@SecurityRequirement(name = "bearerAuth")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/notifications")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> listMyNotifications(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(
                "Notifications fetched successfully",
                notificationService.listMyNotifications(authentication)
        ));
    }

    @GetMapping("/notifications/summary")
    public ResponseEntity<ApiResponse<NotificationSummaryResponse>> summary(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(
                "Notification summary fetched successfully",
                notificationService.getNotificationSummary(authentication)
        ));
    }

    @PatchMapping("/notifications/{notificationId}/read")
    public ResponseEntity<ApiResponse<NotificationResponse>> markRead(
            Authentication authentication,
            @PathVariable Long notificationId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Notification marked as read",
                notificationService.markAsRead(authentication, notificationId)
        ));
    }

    @PatchMapping("/notifications/read-all")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> markAllRead(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(
                "Notifications marked as read",
                notificationService.markAllAsRead(authentication)
        ));
    }

    @GetMapping("/invitations/{invitationId}/notifications")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> listInvitationNotifications(
            Authentication authentication,
            @PathVariable Long invitationId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Invitation notifications fetched successfully",
                notificationService.listInvitationNotifications(authentication, invitationId)
        ));
    }
}
