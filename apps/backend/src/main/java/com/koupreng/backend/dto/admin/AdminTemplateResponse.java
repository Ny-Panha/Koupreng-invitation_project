package com.koupreng.backend.dto.admin;

import com.koupreng.backend.template.domain.InvitationTemplate;
import com.koupreng.backend.template.domain.TemplateCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminTemplateResponse {

    private Long id;
    private String name;
    private String code;
    private TemplateCategory category;
    private String description;
    private String thumbnailUrl;
    private String previewUrl;
    private BigDecimal price;
    private String currency;
    private boolean premium;
    private String status;
    private Integer sortOrder;
    private Instant createdAt;
    private Instant updatedAt;

    public static AdminTemplateResponse from(InvitationTemplate template) {
        return AdminTemplateResponse.builder()
                .id(template.getId())
                .name(template.getName())
                .code(template.getCode())
                .category(template.getCategory())
                .description(template.getDescription())
                .thumbnailUrl(template.getThumbnailUrl())
                .previewUrl(template.getPreviewUrl())
                .price(template.getPrice())
                .currency(template.getCurrency())
                .premium(template.isPremium())
                .status(template.getStatus())
                .sortOrder(template.getSortOrder())
                .createdAt(template.getCreatedAt())
                .updatedAt(template.getUpdatedAt())
                .build();
    }
}
