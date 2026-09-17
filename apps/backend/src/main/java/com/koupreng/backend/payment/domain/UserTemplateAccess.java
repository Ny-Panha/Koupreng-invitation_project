package com.koupreng.backend.payment.domain;

import com.koupreng.backend.user.domain.AppUser;
import jakarta.persistence.Column;
import jakarta.persistence.ConstraintMode;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
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
@Table(name = "user_template_access")
public class UserTemplateAccess {

    public static final String ACCESS_TYPE_PURCHASED = "PURCHASED";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @Column(name = "template_id", nullable = false)
    private Long templateId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_payment_order_id", foreignKey = @ForeignKey(ConstraintMode.NO_CONSTRAINT))
    private TemplatePaymentOrder order;

    @Column(name = "access_type", nullable = false, length = 50)
    private String accessType = ACCESS_TYPE_PURCHASED;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        if (accessType == null || accessType.isBlank()) {
            accessType = ACCESS_TYPE_PURCHASED;
        }
        if (active == null) {
            active = true;
        }
        createdAt = Instant.now();
    }
}
