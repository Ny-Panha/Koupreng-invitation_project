package com.koupreng.backend.admin.api.dto;

import com.koupreng.backend.template.domain.TemplateCategory;
import jakarta.validation.constraints.NotBlank;
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
}
