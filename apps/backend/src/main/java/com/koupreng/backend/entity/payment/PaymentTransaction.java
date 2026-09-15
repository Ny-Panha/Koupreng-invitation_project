package com.koupreng.backend.entity.payment;

import com.koupreng.backend.invitation.domain.UserInvitation;
import com.koupreng.backend.entity.invitation.Guest;
import jakarta.persistence.*;
import lombok.Data;
import java.time.Instant;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "payment_transactions")
public class PaymentTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invitation_id", nullable = false)
    private UserInvitation invitation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guest_id")
    private Guest guest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_config_id", nullable = false)
    private PaymentConfig paymentConfig;

    @Column(name = "payer_name")
    private String payerName;

    @Column(name = "payer_message", columnDefinition = "TEXT")
    private String payerMessage;

    @Column(name = "merchant_ref_no", unique = true)
    private String merchantRefNo;

    @Column(name = "payway_transaction_id")
    private String paywayTransactionId;

    @Column(length = 50)
    private String channel;

    @Column(precision = 12, scale = 2, nullable = false)
    private BigDecimal amount;

    @Column(length = 10, nullable = false)
    private String currency;

    @Column(name = "qr_payload", columnDefinition = "TEXT")
    private String qrPayload;

    @Column(name = "payment_link", length = 1000)
    private String paymentLink;

    @Column(length = 50)
    private String status;

    @Column(name = "requested_at")
    private Instant requestedAt;

    @Column(name = "paid_at")
    private Instant paidAt;

    @Column(name = "expired_at")
    private Instant expiredAt;

    @Column(name = "callback_received", nullable = false)
    private boolean callbackReceived = false;

    @Column(name = "raw_callback_json", columnDefinition = "JSON")
    private String rawCallbackJson;

    @Column(name = "verification_response_json", columnDefinition = "JSON")
    private String verificationResponseJson;

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
