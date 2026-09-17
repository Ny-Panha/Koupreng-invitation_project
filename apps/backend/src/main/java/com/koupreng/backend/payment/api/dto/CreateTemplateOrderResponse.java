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
public class CreateTemplateOrderResponse {

    private String orderCode;
    private Long templateId;
    private String templateName;
    private String packageName;
    private BigDecimal amount;
    private String currency;
    private String paymentNote;
    private String paymentLink;
    private PaymentStatus status;
    private Instant expiresAt;
    private String message;

    public static CreateTemplateOrderResponse from(TemplateOrder order, String message) {
        return CreateTemplateOrderResponse.builder()
                .orderCode(order.getOrderCode())
                .templateId(order.getTemplateId())
                .templateName(order.getTemplateName())
                .packageName(order.getPackageName())
                .amount(order.getAmount())
                .currency(order.getCurrency())
                .paymentNote(order.getPaymentNote())
                .paymentLink(order.getPaymentLink())
                .status(order.getStatus())
                .expiresAt(order.getExpiresAt())
                .message(message)
                .build();
    }
}
