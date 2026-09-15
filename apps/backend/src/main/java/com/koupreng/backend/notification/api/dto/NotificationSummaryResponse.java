package com.koupreng.backend.notification.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationSummaryResponse {

    private long total;
    private long unread;
    private long pending;
    private long sent;
    private long delivered;
    private long failed;
    private long cancelled;
}
