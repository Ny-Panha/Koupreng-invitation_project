package com.koupreng.backend.template.api.dto;

import com.koupreng.backend.template.domain.InvitationTemplate;
import com.koupreng.backend.template.domain.TemplateCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicTemplateResponse {

    private Long id;
    private String code;
    private String slug;
    private String name;
    private TemplateCategory category;
    private String description;
    private String thumbnailUrl;
    private String previewUrl;
    private boolean premium;
    private BigDecimal price;
    private String currency;
    private String status;

    public static PublicTemplateResponse from(InvitationTemplate template) {
        return PublicTemplateResponse.builder()
                .id(template.getId())
                .code(template.getCode())
                .slug(template.getCode())
                .name(template.getName())
                .category(template.getCategory())
                .description(template.getDescription())
                .thumbnailUrl(template.getThumbnailUrl())
                .previewUrl(template.getPreviewUrl())
                .premium(template.isPremium())
                .price(template.getPrice())
                .currency(template.getCurrency())
                .status(template.getStatus())
                .build();
    }
}
