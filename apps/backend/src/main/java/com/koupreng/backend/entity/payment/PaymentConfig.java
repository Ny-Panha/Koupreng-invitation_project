package com.koupreng.backend.entity.payment;

import com.koupreng.backend.invitation.domain.UserInvitation;
import jakarta.persistence.*;
import lombok.Data;
import java.time.Instant;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "payment_configs")
public class PaymentConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_config_id")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invitation_id", unique = true, nullable = false)
    private UserInvitation invitation;

    @Column(length = 50)
    private String provider;

    @Column(name = "payment_mode", length = 50)
    private String paymentMode;

    @Column(name = "is_enabled", nullable = false)
    private boolean isEnabled = true;

    @Column(name = "is_fixed_amount", nullable = false)
    private boolean isFixedAmount = false;

    @Column(name = "fixed_amount", precision = 12, scale = 2)
    private BigDecimal fixedAmount;

    @Column(name = "min_amount", precision = 12, scale = 2)
    private BigDecimal minAmount;

    @Column(name = "max_amount", precision = 12, scale = 2)
    private BigDecimal maxAmount;

    @Column(length = 10)
    private String currency;

    @Column(name = "allow_anonymous", nullable = false)
    private boolean allowAnonymous = true;

    @Column(name = "organizer_label")
    private String organizerLabel;

    @Column(name = "success_message", columnDefinition = "TEXT")
    private String successMessage;

    @Column(name = "telegram_notify_enabled", nullable = false)
    private boolean telegramNotifyEnabled = false;

    @Column(name = "telegram_chat_id")
    private String telegramChatId;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}
