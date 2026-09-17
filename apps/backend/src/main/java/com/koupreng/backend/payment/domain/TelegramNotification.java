package com.koupreng.backend.payment.domain;

import jakarta.persistence.*;
import lombok.Data;
import java.time.Instant;

@Data
@Entity
@Table(name = "telegram_notifications")
public class TelegramNotification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "telegram_notification_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id", nullable = false)
    private PaymentTransaction paymentTransaction;

    @Column(name = "chat_id", nullable = false)
    private String chatId;

    @Column(name = "message_text", columnDefinition = "TEXT", nullable = false)
    private String messageText;

    @Column(length = 50)
    private String status;

    @Column(name = "sent_at")
    private Instant sentAt;

    @Column(name = "response_json", columnDefinition = "JSON")
    private String responseJson;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }
}
