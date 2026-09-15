package com.koupreng.backend.entity.organization;

import com.koupreng.backend.user.domain.AppUser;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "organization_members")
public class OrganizationMember {

    public static final String ROLE_OWNER = "OWNER";
    public static final String ROLE_ADMIN = "ADMIN";
    public static final String ROLE_MEMBER = "MEMBER";
    public static final String ROLE_CHECK_IN_STAFF = "CHECK_IN_STAFF";
    public static final String STATUS_ACTIVE = "ACTIVE";
    public static final String STATUS_INVITED = "INVITED";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "member_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private AppUser user;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false, length = 50)
    private String role = ROLE_MEMBER;

    @Column(nullable = false, length = 50)
    private String status = STATUS_INVITED;

    @Column(name = "invited_at")
    private Instant invitedAt;

    @Column(name = "joined_at")
    private Instant joinedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        if (role == null || role.isBlank()) {
            role = ROLE_MEMBER;
        }
        if (status == null || status.isBlank()) {
            status = STATUS_INVITED;
        }
        if (STATUS_INVITED.equals(status) && invitedAt == null) {
            invitedAt = now;
        }
        if (STATUS_ACTIVE.equals(status) && joinedAt == null) {
            joinedAt = now;
        }
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}
