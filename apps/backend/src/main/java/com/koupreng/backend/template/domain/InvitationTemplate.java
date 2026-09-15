package com.koupreng.backend.template.domain;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Locale;

@Data
@Entity
@Table(name = "templates")
public class InvitationTemplate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "template_id")
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true, length = 120)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private TemplateCategory category;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "thumbnail_url", length = 1000)
    private String thumbnailUrl;

    @Column(name = "preview_url", length = 1000)
    private String previewUrl;

    @Column(precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false, length = 10)
    private String currency = "USD";

    @Column(name = "is_premium", nullable = false)
    private boolean isPremium = false;

    @Column(nullable = false, length = 20)
    private String status = "ACTIVE";

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        normalizeDefaults();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        normalizeDefaults();
        updatedAt = Instant.now();
    }

    private void normalizeDefaults() {
        if (status == null || status.isBlank()) {
            status = "ACTIVE";
        } else {
            status = status.trim().toUpperCase(Locale.ROOT);
        }
        if (currency == null || currency.isBlank()) {
            currency = "USD";
        } else {
            currency = currency.trim().toUpperCase(Locale.ROOT);
        }
        if (sortOrder == null) {
            sortOrder = 0;
        }
        if (code == null || code.isBlank()) {
            code = toCode(name);
        }
    }

    private String toCode(String value) {
        String source = value == null ? "template" : value;
        String normalized = source.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
        return normalized.isBlank() ? "template" : normalized;
    }
}
