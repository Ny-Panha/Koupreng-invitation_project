package com.koupreng.backend.payment.api.dto;

import com.koupreng.backend.payment.domain.TemplateOrder;
import com.koupreng.backend.payment.domain.PaymentStatus;
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
public class TemplateOrderResponse {

    private String orderCode;
    private Long userId;
    private Long templateId;
    private String templateName;
    private String packageName;
    private BigDecimal amount;
    private BigDecimal paidAmount;
    private String currency;
    private String paymentNote;
    private String paymentLink;
    private PaymentStatus status;
    private Instant paidAt;
    private Instant expiresAt;
    private Instant createdAt;

    public static TemplateOrderResponse from(TemplateOrder order) {
        return TemplateOrderResponse.builder()
                .orderCode(order.getOrderCode())
                .userId(order.getUser() == null ? null : order.getUser().getId())
                .templateId(order.getTemplateId())
                .templateName(order.getTemplateName())
                .packageName(order.getPackageName())
                .amount(order.getAmount())
                .paidAmount(order.getPaidAmount())
                .currency(order.getCurrency())
                .paymentNote(order.getPaymentNote())
                .paymentLink(order.getPaymentLink())
                .status(order.getStatus())
                .paidAt(order.getPaidAt())
                .expiresAt(order.getExpiresAt())
                .createdAt(order.getCreatedAt())
                .build();
    }
}
