package com.koupreng.backend.payment.api.dto;

import com.koupreng.backend.payment.domain.TemplatePaymentOrder;
import com.koupreng.backend.user.domain.AppUser;
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
public class PaymentReceiptResponse {

    private String receiptNumber;
    private String orderCode;
    private String customerName;
    private String customerEmail;
    private String itemName;
    private String packageName;
    private BigDecimal amount;
    private BigDecimal paidAmount;
    private String currency;
    private PaymentStatus status;
    private String provider;
    private String confirmedBy;
    private String itemType;
    private Instant paidAt;
    private Instant issuedAt;

    public static PaymentReceiptResponse from(TemplatePaymentOrder order) {
        AppUser user = order.getUser();
        return PaymentReceiptResponse.builder()
                .receiptNumber("RCPT-" + order.getOrderCode())
                .orderCode(order.getOrderCode())
                .customerName(user == null ? null : user.getFullName())
                .customerEmail(user == null ? null : user.getEmail())
                .itemName(order.getTemplateName())
                .packageName(order.getPackageName())
                .amount(order.getAmount())
                .paidAmount(order.getPaidAmount() == null ? order.getAmount() : order.getPaidAmount())
                .currency(order.getCurrency())
                .status(order.getStatus())
                .provider(order.getProvider())
                .confirmedBy(order.getConfirmedBy())
                .paidAt(order.getPaidAt())
                .issuedAt(Instant.now())
                .itemType("TEMPLATE")
                .build();
    }

    public static PaymentReceiptResponse from(com.koupreng.backend.subscription.domain.Subscription sub) {
        AppUser user = sub.getUser();
        PaymentStatus status = PaymentStatus.PENDING;
        if ("ACTIVE".equalsIgnoreCase(sub.getStatus()) || "COMPLETED".equalsIgnoreCase(sub.getStatus()) || "PAID".equalsIgnoreCase(sub.getStatus()) || sub.isActive()) {
            status = PaymentStatus.PAID;
        } else if ("FAILED".equalsIgnoreCase(sub.getStatus())) {
            status = PaymentStatus.FAILED;
        } else if ("CANCELLED".equalsIgnoreCase(sub.getStatus())) {
            status = PaymentStatus.CANCELLED;
        }

        return PaymentReceiptResponse.builder()
                .receiptNumber("RCPT-" + sub.getOrderCode())
                .orderCode(sub.getOrderCode())
                .customerName(user == null ? null : user.getFullName())
                .customerEmail(user == null ? null : user.getEmail())
                .itemName(sub.getSubscriptionPackage() != null ? sub.getSubscriptionPackage().getPackageName() : "Subscription Package")
                .packageName(sub.getSubscriptionPackage() != null ? sub.getSubscriptionPackage().getPackageName() : null)
                .amount(sub.getAmount())
                .paidAmount(sub.getPaidAmount() == null ? BigDecimal.ZERO : sub.getPaidAmount())
                .currency(sub.getCurrency())
                .status(status)
                .provider(sub.getProvider())
                .confirmedBy(sub.getConfirmedBy())
                .paidAt(sub.getPaidAt())
                .issuedAt(Instant.now())
                .itemType("SUBSCRIPTION")
                .build();
    }
}
