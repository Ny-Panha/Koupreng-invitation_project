package com.koupreng.backend.ticket.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;

@Entity
@Table(name = "invitation_ticket_designs")
@Getter @Setter
public class InvitationTicketDesign {
    @Id @Column(name = "invitation_id")
    private Long invitationId;
    @Column(name = "design_json", nullable = false, columnDefinition = "TEXT")
    private String designJson;
    @Version @Column(nullable = false)
    private Long version;
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
    @PrePersist void create() { createdAt = Instant.now(); updatedAt = createdAt; }
    @PreUpdate void update() { updatedAt = Instant.now(); }
}
