package com.koupreng.backend.payment.api.dto;

import com.koupreng.backend.payment.domain.TemplatePaymentOrder;
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
public class CreateTemplatePaymentResponse {

    private String orderCode;
    private String transactionId;
    private Long templateId;
    private String templateName;
    private String packageName;
    private BigDecimal amount;
    private String currency;
    private PaymentStatus status;
    private String qrString;
    private String qrImageUrl;
    private String checkoutUrl;
    private String paymentLink;
    private String paymentNote;
    private String provider;
    private Instant expiresAt;
    private String message;

    public static CreateTemplatePaymentResponse from(
            TemplatePaymentOrder order,
            String message
    ) {
        return CreateTemplatePaymentResponse.builder()
                .orderCode(order.getOrderCode())
                .transactionId(order.getTransactionId())
                .templateId(order.getTemplateId())
                .templateName(order.getTemplateName())
                .packageName(order.getPackageName())
                .amount(order.getAmount())
                .currency(order.getCurrency())
                .status(order.getStatus())
                .qrString(order.getQrString())
                .qrImageUrl(order.getQrImageUrl())
                .checkoutUrl(order.getCheckoutUrl())
                .paymentLink(order.getPaymentLink())
                .paymentNote(order.getPaymentNote())
                .provider(order.getProvider())
                .expiresAt(order.getExpiresAt())
                .message(message)
                .build();
    }
}
