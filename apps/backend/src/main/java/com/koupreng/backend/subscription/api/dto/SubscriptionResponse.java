package com.koupreng.backend.subscription.api.dto;

import com.koupreng.backend.subscription.domain.Subscription;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionResponse {

    private Long id;
    private SubscriptionPackageResponse packagePlan;
    private Instant startDate;
    private Instant endDate;
    private String orderCode;
    private BigDecimal amount;
    private String currency;
    private String provider;
    private String paymentStatus;
    private String status;
    private boolean active;
    private String paymentLink;
    private String paymentNote;
    private String message;
    private Instant createdAt;

    public static SubscriptionResponse from(Subscription subscription, String message) {
        return SubscriptionResponse.builder()
                .id(subscription.getId())
                .packagePlan(subscription.getSubscriptionPackage() == null
                        ? null
                        : SubscriptionPackageResponse.from(subscription.getSubscriptionPackage()))
                .startDate(subscription.getStartDate())
                .endDate(subscription.getEndDate())
                .orderCode(subscription.getOrderCode())
                .amount(subscription.getAmount())
                .currency(subscription.getCurrency())
                .provider(subscription.getProvider())
                .paymentStatus(subscription.getPaymentStatus())
                .status(subscription.getStatus())
                .active(subscription.isActive())
                .paymentLink(subscription.getPaymentLink())
                .paymentNote(subscription.getPaymentNote())
                .message(message)
                .createdAt(subscription.getCreatedAt())
                .build();
    }
}
