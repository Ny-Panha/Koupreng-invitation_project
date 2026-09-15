package com.koupreng.backend.entity.subscription;

import com.koupreng.backend.user.domain.AppUser;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.Instant;

@Data
@Entity
@Table(name = "subscriptions")
public class Subscription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "subscription_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "package_id", nullable = false)
    private SubscriptionPackage subscriptionPackage;

    @Column(name = "start_date")
    private Instant startDate;

    @Column(name = "end_date")
    private Instant endDate;

    @Column(name = "order_code", unique = true, length = 50)
    private String orderCode;

    @Column(precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 10)
    private String currency = "USD";

    @Column(length = 80)
    private String provider;

    @Column(name = "payment_link", columnDefinition = "TEXT")
    private String paymentLink;

    @Column(name = "payment_note", length = 120)
    private String paymentNote;

    @Column(name = "payment_status", length = 50)
    private String paymentStatus;

    @Column(length = 50, nullable = false)
    private String status = "PENDING_PAYMENT";

    @Column(name = "is_active", nullable = false)
    private boolean isActive = false;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        if (currency == null || currency.isBlank()) {
            currency = "USD";
        }
        if (status == null || status.isBlank()) {
            status = isActive ? "ACTIVE" : "PENDING_PAYMENT";
        }
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}
