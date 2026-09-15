package com.koupreng.backend.invitation.domain;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "invitation_sections")
public class InvitationSection {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "section_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invitation_id", nullable = false)
    private UserInvitation invitation;

    @Column(name = "section_key", nullable = false, length = 50)
    private String sectionKey;

    @Column(name = "section_title")
    private String sectionTitle;

    @Column(name = "content_json", columnDefinition = "JSON")
    private String contentJson;

    @Column(name = "sort_order")
    private Integer sortOrder;

    @Column(name = "is_enabled", nullable = false)
    private boolean isEnabled = true;
}
