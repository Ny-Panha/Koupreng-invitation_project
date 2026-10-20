package com.koupreng.backend.template.api.dto;

public record TemplateRecommendationResponse(PublicTemplateResponse template, int score, boolean styleMatch) { }
