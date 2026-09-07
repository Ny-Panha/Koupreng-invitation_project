package com.koupreng.backend.dto.invitation;

import com.koupreng.backend.entity.invitation.EventType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalTime;

public class InvitationRequest {

    private Long templateId;
    private Long organizationId;

    @NotBlank(message = "Invitation title is required")
    private String title;

    private EventType eventType;
    private LocalDate eventDate;
    private LocalTime eventTime;
    private String venueName;
    private String venueAddress;
    private String googleMapUrl;
    private String hostName;
    private String partnerName;
    private String groomName;
    private String brideName;
    private String storyText;
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
    private String visibility;
    @Schema(format = "password", accessMode = Schema.AccessMode.WRITE_ONLY,
            description = "Optional passcode for password-protected public invitations.",
            example = "invitation-passcode-placeholder")
    private String accessPassword;
    private LocalDate rsvpDeadline;

    public Long getTemplateId() {
        return templateId;
    }

    public void setTemplateId(Long templateId) {
        this.templateId = templateId;
    }

    public Long getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(Long organizationId) {
        this.organizationId = organizationId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public EventType getEventType() {
        return eventType;
    }

    public void setEventType(EventType eventType) {
        this.eventType = eventType;
    }

    public LocalDate getEventDate() {
        return eventDate;
    }

    public void setEventDate(LocalDate eventDate) {
        this.eventDate = eventDate;
    }

    public LocalTime getEventTime() {
        return eventTime;
    }

    public void setEventTime(LocalTime eventTime) {
        this.eventTime = eventTime;
    }

    public String getVenueName() {
        return venueName;
    }

    public void setVenueName(String venueName) {
        this.venueName = venueName;
    }

    public String getVenueAddress() {
        return venueAddress;
    }

    public void setVenueAddress(String venueAddress) {
        this.venueAddress = venueAddress;
    }

    public String getGoogleMapUrl() {
        return googleMapUrl;
    }

    public void setGoogleMapUrl(String googleMapUrl) {
        this.googleMapUrl = googleMapUrl;
    }

    public String getHostName() {
        return hostName;
    }

    public void setHostName(String hostName) {
        this.hostName = hostName;
    }

    public String getPartnerName() {
        return partnerName;
    }

    public void setPartnerName(String partnerName) {
        this.partnerName = partnerName;
    }

    public String getGroomName() {
        return groomName;
    }

    public void setGroomName(String groomName) {
        this.groomName = groomName;
    }

    public String getBrideName() {
        return brideName;
    }

    public void setBrideName(String brideName) {
        this.brideName = brideName;
    }

    public String getStoryText() {
        return storyText;
    }

    public void setStoryText(String storyText) {
        this.storyText = storyText;
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

    public String getVisibility() {
        return visibility;
    }

    public void setVisibility(String visibility) {
        this.visibility = visibility;
    }

    public String getAccessPassword() {
        return accessPassword;
    }

    public void setAccessPassword(String accessPassword) {
        this.accessPassword = accessPassword;
    }

    public LocalDate getRsvpDeadline() {
        return rsvpDeadline;
    }

    public void setRsvpDeadline(LocalDate rsvpDeadline) {
        this.rsvpDeadline = rsvpDeadline;
    }
}
