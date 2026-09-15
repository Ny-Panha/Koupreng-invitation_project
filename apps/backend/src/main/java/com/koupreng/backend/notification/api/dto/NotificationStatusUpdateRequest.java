package com.koupreng.backend.notification.api.dto;

import com.koupreng.backend.notification.domain.NotificationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class NotificationStatusUpdateRequest {

    @NotNull(message = "Notification status is required")
    private NotificationStatus status;

    private String providerMessageId;
    private String errorMessage;
}
