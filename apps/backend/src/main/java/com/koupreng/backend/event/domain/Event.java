package com.koupreng.backend.event.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Entity
@Table(name = "events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Event basic info
    @Column(name = "event_name", nullable = false)
    private String eventName;

    @Enumerated(EnumType.STRING)
    @Column(name = "template_type", nullable = false)
    private TemplateType templateType;

    // Couple info (Wedding specific — expandable for other types)
    @Column(name = "groom")
    private String groom;

    @Column(name = "bride")
    private String bride;

    // Date & Time
    @Column(name = "event_date", nullable = false)
    private LocalDate eventDate;

    @Column(name = "eating_time")
    private LocalTime eatingTime;

    // Location & Description
    @Column(name = "location", columnDefinition = "TEXT")
    private String location;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    // Cover image URL (stored after upload)
    @Column(name = "cover_image_url")
    private String coverImageUrl;

    // Status: DRAFT / PUBLISHED / UNPUBLISHED
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private EventStatus status = EventStatus.DRAFT;

    // Soft delete flag
    @Column(name = "deleted", nullable = false)
    @Builder.Default
    private boolean deleted = false;

    // Audit timestamps
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;
}
