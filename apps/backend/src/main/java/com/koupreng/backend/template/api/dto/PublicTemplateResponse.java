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
    private String primaryColor;
    private String secondaryColor;
    private String backgroundColor;
    private boolean checkoutEligible;
    private BigDecimal checkoutAmount;
    private String checkoutCurrency;
    private String checkoutPolicy;

    public static PublicTemplateResponse from(InvitationTemplate template) {
        var offer = com.koupreng.backend.payment.application.TemplateCheckoutPolicy.offer(template);
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
                .primaryColor(template.getPrimaryColor())
                .secondaryColor(template.getSecondaryColor())
                .backgroundColor(template.getBackgroundColor())
                .checkoutEligible(offer.eligible())
                .checkoutAmount(offer.amount())
                .checkoutCurrency(offer.currency())
                .checkoutPolicy(offer.policy())
                .build();
    }
}
