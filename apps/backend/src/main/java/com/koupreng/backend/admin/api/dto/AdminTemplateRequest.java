package com.koupreng.backend.admin.api.dto;

import com.koupreng.backend.template.domain.TemplateCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import com.koupreng.backend.invitation.domain.EventType;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class AdminTemplateRequest {

    @NotBlank(message = "Template name is required")
    private String name;

    private String code;
    private TemplateCategory category;
    private String description;
    private String thumbnailUrl;
    private String previewUrl;
    private BigDecimal price;
    private String currency;
    private Boolean premium;
    private String status;
    private Integer sortOrder;
    private String primaryColor;
    private String secondaryColor;
    private String backgroundColor;
    @Size(max = 6)
    private java.util.Set<EventType> supportedEventTypes;
    @Size(max = 3)
    private java.util.Set<@Pattern(regexp = "KH|EN|BOTH") String> supportedLanguages;
}
