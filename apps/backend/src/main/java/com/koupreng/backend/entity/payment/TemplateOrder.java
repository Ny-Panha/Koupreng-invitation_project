package com.koupreng.backend.entity.payment;

import com.koupreng.backend.user.domain.AppUser;
import com.koupreng.backend.enums.PaymentStatus;
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
@Table(name = "template_orders")
public class TemplateOrder {

    public static final String PROVIDER_ABA_PAYWAY_STATIC = "ABA_PAYWAY_STATIC";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_code", nullable = false, unique = true, length = 50)
    private String orderCode;

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

    @Column(name = "payment_link", nullable = false, columnDefinition = "TEXT")
    private String paymentLink;

    @Column(name = "payment_note", nullable = false, length = 100)
    private String paymentNote;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private PaymentStatus status = PaymentStatus.PENDING;

    @Column(name = "payment_provider", nullable = false, length = 50)
    private String paymentProvider = PROVIDER_ABA_PAYWAY_STATIC;

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
        if (paymentProvider == null || paymentProvider.isBlank()) {
            paymentProvider = PROVIDER_ABA_PAYWAY_STATIC;
        }
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}
