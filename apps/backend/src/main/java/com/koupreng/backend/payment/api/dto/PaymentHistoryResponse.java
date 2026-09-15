package com.koupreng.backend.payment.api.dto;

import com.koupreng.backend.payment.domain.TemplatePaymentOrder;
import com.koupreng.backend.enums.PaymentStatus;
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
public class PaymentHistoryResponse {

    private String orderCode;
    private Long templateId;
    private String templateName;
    private String packageName;
    private BigDecimal amount;
    private BigDecimal paidAmount;
    private String currency;
    private PaymentStatus status;
    private String provider;
    private String paymentLink;
    private String paymentNote;
    private String itemType;
    private Instant paidAt;
    private Instant expiresAt;
    private Instant createdAt;

    public static PaymentHistoryResponse from(TemplatePaymentOrder order) {
        return PaymentHistoryResponse.builder()
                .orderCode(order.getOrderCode())
                .templateId(order.getTemplateId())
                .templateName(order.getTemplateName())
                .packageName(order.getPackageName())
                .amount(order.getAmount())
                .paidAmount(order.getPaidAmount())
                .currency(order.getCurrency())
                .status(order.getStatus())
                .provider(order.getProvider())
                .paymentLink(order.getPaymentLink())
                .paymentNote(order.getPaymentNote())
                .paidAt(order.getPaidAt())
                .expiresAt(order.getExpiresAt())
                .createdAt(order.getCreatedAt())
                .itemType("TEMPLATE")
                .build();
    }

    public static PaymentHistoryResponse from(com.koupreng.backend.subscription.domain.Subscription sub) {
        PaymentStatus status = PaymentStatus.PENDING;
        if ("ACTIVE".equalsIgnoreCase(sub.getStatus()) || "COMPLETED".equalsIgnoreCase(sub.getStatus()) || "PAID".equalsIgnoreCase(sub.getStatus()) || sub.isActive()) {
            status = PaymentStatus.PAID;
        } else if ("FAILED".equalsIgnoreCase(sub.getStatus())) {
            status = PaymentStatus.FAILED;
        } else if ("CANCELLED".equalsIgnoreCase(sub.getStatus())) {
            status = PaymentStatus.CANCELLED;
        }

        return PaymentHistoryResponse.builder()
                .orderCode(sub.getOrderCode())
                .templateId(null)
                .templateName(null)
                .packageName(sub.getSubscriptionPackage() != null ? sub.getSubscriptionPackage().getPackageName() : "Subscription Package")
                .amount(sub.getAmount())
                .paidAmount(sub.getPaidAmount() == null ? BigDecimal.ZERO : sub.getPaidAmount())
                .currency(sub.getCurrency())
                .status(status)
                .provider(sub.getProvider())
                .paymentLink(sub.getPaymentLink())
                .paymentNote(sub.getPaymentNote())
                .paidAt(sub.getPaidAt())
                .expiresAt(sub.getEndDate())
                .createdAt(sub.getCreatedAt())
                .itemType("SUBSCRIPTION")
                .build();
    }
}
