package com.koupreng.backend.notification.api.dto;

import lombok.Data;

@Data
public class MarkNotificationReadRequest {

    private Boolean read = true;
}
