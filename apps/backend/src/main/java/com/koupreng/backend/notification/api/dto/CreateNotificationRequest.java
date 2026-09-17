package com.koupreng.backend.notification.api.dto;

import com.koupreng.backend.notification.domain.NotificationChannel;
import com.koupreng.backend.notification.domain.NotificationStatus;
import com.koupreng.backend.notification.domain.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateNotificationRequest {

    private Long userId;
    private Long invitationId;
    private Long guestId;
    private Long rsvpId;
    private Long paymentOrderId;

    @NotNull(message = "Notification type is required")
    private NotificationType type;

    @NotNull(message = "Notification channel is required")
    private NotificationChannel channel;

    private NotificationStatus status;

    @NotBlank(message = "Notification title is required")
    private String title;

    private String message;
    private String recipientName;
    private String recipientEmail;
    private String recipientPhone;
    private String recipientTelegramId;
}
