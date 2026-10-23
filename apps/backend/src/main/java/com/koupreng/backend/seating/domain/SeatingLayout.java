package com.koupreng.backend.seating.domain;

import jakarta.persistence.*;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter @Entity @Table(name = "event_seating_layouts")
public class SeatingLayout {
    @Id @Column(name = "invitation_id") private Long invitationId;
    @Column(name = "layout_json", nullable = false, columnDefinition = "TEXT") private String layoutJson;
    @Column(nullable = false) private long version;
    @Column(name = "updated_at", nullable = false) private Instant updatedAt;
}
