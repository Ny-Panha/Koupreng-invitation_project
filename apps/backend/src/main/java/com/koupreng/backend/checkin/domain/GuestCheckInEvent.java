package com.koupreng.backend.checkin.domain;

import com.koupreng.backend.user.domain.AppUser;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Immutable;
import java.time.Instant;

@Entity
@Immutable
@Table(name = "guest_check_in_events")
@Getter
@Setter
public class GuestCheckInEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "event_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "check_in_id", nullable = false)
    private GuestCheckIn checkIn;

    @Column(nullable = false, length = 20)
    private String action;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_user_id")
    private AppUser actor;

    @Column(name = "occurred_at", nullable = false)
    private Instant occurredAt;

    @Column(length = 50)
    private String source;

    @Column(columnDefinition = "TEXT")
    private String note;
}
