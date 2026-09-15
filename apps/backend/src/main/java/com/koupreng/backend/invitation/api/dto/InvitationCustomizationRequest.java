package com.koupreng.backend.invitation.api.dto;

import jakarta.validation.constraints.Size;

public class InvitationCustomizationRequest {

    private Long templateId;

    @Size(max = 20)
    private String languageMode;

    @Size(max = 20000)
    private String designJson;

    @Size(max = 50000)
    private String contentJson;

    @Size(max = 10000)
    private String customColors;

    @Size(max = 10000)
    private String customFonts;

    @Size(max = 10000)
    private String enabledSections;

    @Size(max = 10000)
    private String layoutSettings;

    public Long getTemplateId() {
        return templateId;
    }

    public void setTemplateId(Long templateId) {
        this.templateId = templateId;
    }

    public String getLanguageMode() {
        return languageMode;
    }

    public void setLanguageMode(String languageMode) {
        this.languageMode = languageMode;
    }

    public String getDesignJson() {
        return designJson;
    }

    public void setDesignJson(String designJson) {
        this.designJson = designJson;
    }

    public String getContentJson() {
        return contentJson;
    }

    public void setContentJson(String contentJson) {
        this.contentJson = contentJson;
    }

    public String getCustomColors() {
        return customColors;
    }

    public void setCustomColors(String customColors) {
        this.customColors = customColors;
    }

    public String getCustomFonts() {
        return customFonts;
    }

    public void setCustomFonts(String customFonts) {
        this.customFonts = customFonts;
    }

    public String getEnabledSections() {
        return enabledSections;
    }

    public void setEnabledSections(String enabledSections) {
        this.enabledSections = enabledSections;
    }

    public String getLayoutSettings() {
        return layoutSettings;
    }

    public void setLayoutSettings(String layoutSettings) {
        this.layoutSettings = layoutSettings;
    }
}
