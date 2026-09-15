package com.koupreng.backend.payment.domain;

public enum PaymentStatus {
    PENDING,
    PAID_PENDING_REVIEW,
    QR_CREATED,
    /**
     * Legacy status from the old hosted checkout flow. New dynamic QR orders use QR_CREATED.
     */
    CHECKOUT_CREATED,
    PAID,
    FAILED,
    CANCELLED,
    EXPIRED,
    REJECTED,
}
