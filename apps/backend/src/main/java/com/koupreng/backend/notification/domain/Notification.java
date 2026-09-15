package com.koupreng.backend.notification.domain;

import com.koupreng.backend.guest.domain.Guest;
import com.koupreng.backend.rsvp.domain.Rsvp;
import com.koupreng.backend.invitation.domain.UserInvitation;
import com.koupreng.backend.payment.domain.TemplatePaymentOrder;
import com.koupreng.backend.user.domain.AppUser;
import com.koupreng.backend.enums.NotificationChannel;
import com.koupreng.backend.enums.NotificationStatus;
import com.koupreng.backend.enums.NotificationType;
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

import java.time.Instant;

@Data
@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notification_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private AppUser user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invitation_id")
    private UserInvitation invitation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guest_id")
    private Guest guest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rsvp_id")
    private Rsvp rsvp;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_order_id")
    private TemplatePaymentOrder paymentOrder;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private NotificationType type = NotificationType.SYSTEM_ALERT;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private NotificationChannel channel = NotificationChannel.SYSTEM;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private NotificationStatus status = NotificationStatus.PENDING;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(name = "recipient_name", length = 255)
    private String recipientName;

    @Column(name = "recipient_email", length = 255)
    private String recipientEmail;

    @Column(name = "recipient_phone", length = 50)
    private String recipientPhone;

    @Column(name = "recipient_telegram_id", length = 100)
    private String recipientTelegramId;

    @Column(name = "provider_message_id", length = 255)
    private String providerMessageId;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "sent_at")
    private Instant sentAt;

    @Column(name = "delivered_at")
    private Instant deliveredAt;

    @Column(name = "read_at")
    private Instant readAt;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        if (type == null) {
            type = NotificationType.SYSTEM_ALERT;
        }
        if (channel == null) {
            channel = NotificationChannel.SYSTEM;
        }
        if (status == null) {
            status = NotificationStatus.PENDING;
        }
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}
