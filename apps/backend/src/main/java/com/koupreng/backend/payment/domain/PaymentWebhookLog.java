package com.koupreng.backend.payment.domain;

import jakarta.persistence.*;
import lombok.Data;
import java.time.Instant;

@Data
@Entity
@Table(name = "payment_webhook_logs")
public class PaymentWebhookLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "webhook_log_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id")
    private PaymentTransaction paymentTransaction;

    @Column(length = 50)
    private String provider;

    @Column(name = "event_type", length = 100)
    private String eventType;

    @Column(name = "request_headers", columnDefinition = "TEXT")
    private String requestHeaders;

    @Column(name = "request_body", columnDefinition = "TEXT")
    private String requestBody;

    @Column(name = "received_at")
    private Instant receivedAt;

    @Column(name = "processed_status", length = 50)
    private String processedStatus;

    @Column(name = "processing_note", columnDefinition = "TEXT")
    private String processingNote;
}
