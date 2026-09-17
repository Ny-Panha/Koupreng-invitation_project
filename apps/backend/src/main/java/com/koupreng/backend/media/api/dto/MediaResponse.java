package com.koupreng.backend.media.api.dto;

import com.koupreng.backend.media.domain.MediaFile;
import com.koupreng.backend.media.domain.MediaType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MediaResponse {

    private Long id;
    private Long invitationId;
    private MediaType mediaType;
    private String fileUrl;
    private Integer sortOrder;
    private boolean cover;
    private Long fileSize;
    private String mimeType;
    private String originalFilename;
    private Instant createdAt;
    private Instant updatedAt;

    public static MediaResponse from(MediaFile mediaFile) {
        return MediaResponse.builder()
                .id(mediaFile.getId())
                .invitationId(mediaFile.getInvitation() == null ? null : mediaFile.getInvitation().getId())
                .mediaType(mediaFile.getMediaType())
                .fileUrl(mediaFile.getFileUrl())
                .sortOrder(mediaFile.getSortOrder())
                .cover(mediaFile.isCover())
                .fileSize(mediaFile.getFileSize())
                .mimeType(mediaFile.getMimeType())
                .originalFilename(mediaFile.getOriginalFilename())
                .createdAt(mediaFile.getCreatedAt())
                .updatedAt(mediaFile.getUpdatedAt())
                .build();
    }
}
