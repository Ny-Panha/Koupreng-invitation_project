package com.koupreng.backend.payment.domain;

import com.koupreng.backend.user.domain.AppUser;
import com.koupreng.backend.payment.domain.PaymentStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Entity
@Table(name = "template_payment_orders")
public class TemplatePaymentOrder {

    public static final String PROVIDER_ABA_PAYWAY_DYNAMIC_QR_SANDBOX = "ABA_PAYWAY_DYNAMIC_QR_SANDBOX";
    public static final String PROVIDER_ABA_PAYWAY_STATIC_TELEGRAM = "ABA_PAYWAY_STATIC_TELEGRAM";
    public static final String CONFIRM_SOURCE_PAYWAY_CALLBACK = "ABA_PAYWAY_CALLBACK";
    public static final String CONFIRM_SOURCE_TELEGRAM_ABA_ALERT = "TELEGRAM_ABA_ALERT";
    public static final String CONFIRM_SOURCE_MANUAL_ADMIN = "MANUAL_ADMIN";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_code", nullable = false, unique = true, length = 50)
    private String orderCode;

    @Column(name = "transaction_id", nullable = false, unique = true, length = 100)
    private String transactionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @Column(name = "template_id", nullable = false)
    private Long templateId;

    @Column(name = "template_name", nullable = false)
    private String templateName;

    @Column(name = "package_name", nullable = false, length = 100)
    private String packageName;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "paid_amount", precision = 10, scale = 2)
    private BigDecimal paidAmount;

    @Column(nullable = false, length = 10)
    private String currency = "USD";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private PaymentStatus status = PaymentStatus.PENDING;

    @Column(nullable = false, length = 50)
    private String provider = PROVIDER_ABA_PAYWAY_DYNAMIC_QR_SANDBOX;

    @Column(name = "qr_string", columnDefinition = "TEXT")
    private String qrString;

    @Column(name = "qr_image_url", columnDefinition = "TEXT")
    private String qrImageUrl;

    @Column(name = "payway_request_json", columnDefinition = "TEXT")
    private String paywayRequestJson;

    @Column(name = "payway_response_json", columnDefinition = "TEXT")
    private String paywayResponseJson;

    @Column(name = "callback_raw_json", columnDefinition = "TEXT")
    private String callbackRawJson;

    @Column(name = "payway_status", length = 100)
    private String paywayStatus;

    @Column(name = "payway_transaction_id")
    private String paywayTransactionId;

    @Column(name = "checkout_url", columnDefinition = "TEXT")
    private String checkoutUrl;

    @Column(name = "payment_link", columnDefinition = "TEXT")
    private String paymentLink;

    @Column(name = "payment_note", length = 100)
    private String paymentNote;

    @Column(name = "confirm_source", length = 100)
    private String confirmSource;

    @Column(name = "confirmed_by", length = 100)
    private String confirmedBy;

    @Column(name = "confirmed_at")
    private Instant confirmedAt;

    @Column(name = "paid_at")
    private Instant paidAt;

    @Column(name = "expires_at")
    private Instant expiresAt;

    @Column(name = "raw_telegram_message", columnDefinition = "TEXT")
    private String rawTelegramMessage;

    @Column(name = "telegram_chat_id", length = 100)
    private String telegramChatId;

    @Column(name = "telegram_message_id", length = 100)
    private String telegramMessageId;

    @Column(name = "telegram_sender_username", length = 100)
    private String telegramSenderUsername;

    @Column(name = "telegram_sender_id", length = 100)
    private String telegramSenderId;

    @Column(name = "payway_approval_code", length = 100)
    private String paywayApprovalCode;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        if (status == null) {
            status = PaymentStatus.PENDING;
        }
        if (currency == null || currency.isBlank()) {
            currency = "USD";
        }
        if (provider == null || provider.isBlank()) {
            provider = PROVIDER_ABA_PAYWAY_DYNAMIC_QR_SANDBOX;
        }
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}
