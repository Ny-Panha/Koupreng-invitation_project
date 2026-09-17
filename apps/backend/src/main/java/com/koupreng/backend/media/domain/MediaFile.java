package com.koupreng.backend.media.domain;

import com.koupreng.backend.invitation.domain.UserInvitation;
import jakarta.persistence.*;
import lombok.Data;
import java.time.Instant;

@Data
@Entity
@Table(name = "media_files")
public class MediaFile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "media_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invitation_id", nullable = false)
    private UserInvitation invitation;

    @Enumerated(EnumType.STRING)
    @Column(name = "media_type", length = 50)
    private MediaType mediaType;

    @Column(name = "file_url", length = 1000)
    private String fileUrl;

    @Column(name = "public_id")
    private String publicId;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "mime_type", length = 100)
    private String mimeType;

    @Column(name = "original_filename")
    private String originalFilename;

    @Column(name = "storage_provider", length = 50)
    private String storageProvider;

    @Column(name = "sort_order")
    private Integer sortOrder;

    @Column(name = "is_cover", nullable = false)
    private boolean isCover = false;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}
