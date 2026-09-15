package com.koupreng.backend.notification.api.dto;

import com.koupreng.backend.notification.domain.Notification;
import com.koupreng.backend.enums.NotificationChannel;
import com.koupreng.backend.enums.NotificationStatus;
import com.koupreng.backend.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {

    private Long id;
    private Long userId;
    private Long invitationId;
    private Long guestId;
    private Long rsvpId;
    private Long paymentOrderId;
    private NotificationType type;
    private NotificationChannel channel;
    private NotificationStatus status;
    private String title;
    private String message;
    private String recipientName;
    private String recipientEmail;
    private String recipientPhone;
    private String recipientTelegramId;
    private String providerMessageId;
    private String errorMessage;
    private Instant sentAt;
    private Instant deliveredAt;
    private Instant readAt;
    private Instant createdAt;
    private Instant updatedAt;

    public static NotificationResponse from(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .userId(notification.getUser() == null ? null : notification.getUser().getId())
                .invitationId(notification.getInvitation() == null ? null : notification.getInvitation().getId())
                .guestId(notification.getGuest() == null ? null : notification.getGuest().getId())
                .rsvpId(notification.getRsvp() == null ? null : notification.getRsvp().getId())
                .paymentOrderId(notification.getPaymentOrder() == null ? null : notification.getPaymentOrder().getId())
                .type(notification.getType())
                .channel(notification.getChannel())
                .status(notification.getStatus())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .recipientName(notification.getRecipientName())
                .recipientEmail(notification.getRecipientEmail())
                .recipientPhone(notification.getRecipientPhone())
                .recipientTelegramId(notification.getRecipientTelegramId())
                .providerMessageId(notification.getProviderMessageId())
                .errorMessage(notification.getErrorMessage())
                .sentAt(notification.getSentAt())
                .deliveredAt(notification.getDeliveredAt())
                .readAt(notification.getReadAt())
                .createdAt(notification.getCreatedAt())
                .updatedAt(notification.getUpdatedAt())
                .build();
    }
}
