package com.koupreng.backend.template.api;

import com.koupreng.backend.shared.response.ApiResponse;
import com.koupreng.backend.template.api.dto.TemplateRecommendationResponse;
import com.koupreng.backend.template.application.TemplateRecommendationService;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/v1/templates/recommendations")
@Tag(name = "Templates")
public class TemplateRecommendationController {
    private final TemplateRecommendationService service;
    public TemplateRecommendationController(TemplateRecommendationService service) { this.service = service; }

    @GetMapping
    public ApiResponse<List<TemplateRecommendationResponse>> recommendations(
            @Parameter(schema = @Schema(allowableValues = {"WEDDING", "ENGAGEMENT", "BIRTHDAY", "ANNIVERSARY", "CORPORATE", "OTHER"}))
            @RequestParam String eventType,
            @Parameter(schema = @Schema(allowableValues = {"TRADITIONAL", "MODERN", "MINIMALIST", "FLORAL", "LUXURY", "OTHER"}))
            @RequestParam(required = false) String style,
            @Parameter(example = "KH", schema = @Schema(allowableValues = {"KH", "EN", "BOTH"}))
            @RequestParam(defaultValue = "KH") String language,
            @Parameter(schema = @Schema(allowableValues = {"ALL", "FREE", "PREMIUM"}))
            @RequestParam(defaultValue = "ALL") String pricePreference) {
        return ApiResponse.success("Compatible templates", service.recommend(eventType, style, language, pricePreference));
    }
}
