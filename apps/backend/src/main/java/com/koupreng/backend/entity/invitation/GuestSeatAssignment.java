package com.koupreng.backend.entity.invitation;

import com.koupreng.backend.guest.domain.Guest;
import com.koupreng.backend.invitation.domain.UserInvitation;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Data;

import java.time.Instant;

@Data
@Entity
@Table(name = "guest_seat_assignments")
public class GuestSeatAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "assignment_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invitation_id", nullable = false)
    private UserInvitation invitation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "table_id", nullable = false)
    private EventTable table;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guest_id", nullable = false)
    private Guest guest;

    @Column(name = "seat_label", length = 80)
    private String seatLabel;

    @Column(name = "seat_count", nullable = false)
    private Integer seatCount = 1;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "assigned_at", nullable = false)
    private Instant assignedAt;

    @PrePersist
    protected void onCreate() {
        if (seatCount == null || seatCount < 1) {
            seatCount = 1;
        }
        if (assignedAt == null) {
            assignedAt = Instant.now();
        }
    }
}
