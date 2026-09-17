package com.koupreng.backend.template.api.dto;

import com.koupreng.backend.template.domain.InvitationTemplate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TemplateResponse {

    private Long id;
    private String name;
    private String category;
    private String thumbnailUrl;
    private String previewUrl;
    private boolean premium;
    private String status;
    private Instant createdAt;

    public static TemplateResponse from(InvitationTemplate template) {
        return TemplateResponse.builder()
                .id(template.getId())
                .name(template.getName())
                .category(template.getCategory() == null ? null : template.getCategory().name())
                .thumbnailUrl(template.getThumbnailUrl())
                .previewUrl(template.getPreviewUrl())
                .premium(template.isPremium())
                .status(template.getStatus())
                .createdAt(template.getCreatedAt())
                .build();
    }
}
