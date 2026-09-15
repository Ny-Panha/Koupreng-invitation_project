package com.koupreng.backend.entity.delivery;

import com.koupreng.backend.guest.domain.Guest;
import com.koupreng.backend.invitation.domain.UserInvitation;
import jakarta.persistence.*;
import lombok.Data;

import java.time.Instant;

@Data
@Entity
@Table(name = "invitation_delivery_events")
public class InvitationDeliveryEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "delivery_event_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invitation_id", nullable = false)
    private UserInvitation invitation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guest_id")
    private Guest guest;

    @Column(name = "event_type", nullable = false, length = 50)
    private String eventType;

    @Column(length = 50)
    private String channel;

    @Column(length = 50)
    private String status;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(name = "error_message", length = 1000)
    private String errorMessage;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }
}
