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
public class TemplatePaymentStatusResponse {

    private String orderCode;
    private String transactionId;
    private Long templateId;
    private String templateName;
    private String packageName;
    private BigDecimal amount;
    private BigDecimal paidAmount;
    private String currency;
    private PaymentStatus status;
    private String qrString;
    private String qrImageUrl;
    private String checkoutUrl;
    private String paymentLink;
    private String paymentNote;
    private String provider;
    private Instant paidAt;
    private Instant expiresAt;
    private String message;

    public static TemplatePaymentStatusResponse from(TemplatePaymentOrder order, String message) {
        return TemplatePaymentStatusResponse.builder()
                .orderCode(order.getOrderCode())
                .transactionId(order.getTransactionId())
                .templateId(order.getTemplateId())
                .templateName(order.getTemplateName())
                .packageName(order.getPackageName())
                .amount(order.getAmount())
                .paidAmount(order.getPaidAmount())
                .currency(order.getCurrency())
                .status(order.getStatus())
                .qrString(order.getQrString())
                .qrImageUrl(order.getQrImageUrl())
                .checkoutUrl(order.getCheckoutUrl())
                .paymentLink(order.getPaymentLink())
                .paymentNote(order.getPaymentNote())
                .provider(order.getProvider())
                .paidAt(order.getPaidAt())
                .expiresAt(order.getExpiresAt())
                .message(message)
                .build();
    }
}
