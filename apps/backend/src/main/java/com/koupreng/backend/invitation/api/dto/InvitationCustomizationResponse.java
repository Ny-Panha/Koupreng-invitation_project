package com.koupreng.backend.invitation.api.dto;

import com.koupreng.backend.template.domain.InvitationTemplate;
import com.koupreng.backend.invitation.domain.UserInvitation;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InvitationCustomizationResponse {

    private Long invitationId;
    private Long templateId;
    private String templateName;
    private String languageMode;
    private String designJson;
    private String contentJson;
    private String customColors;
    private String customFonts;
    private String enabledSections;
    private String layoutSettings;

    public static InvitationCustomizationResponse from(UserInvitation invitation) {
        InvitationTemplate template = invitation.getTemplate();
        return InvitationCustomizationResponse.builder()
                .invitationId(invitation.getId())
                .templateId(template == null ? null : template.getId())
                .templateName(template == null ? null : template.getName())
                .languageMode(invitation.getLanguageMode())
                .designJson(invitation.getDesignJson())
                .contentJson(invitation.getContentJson())
                .customColors(invitation.getCustomColors())
                .customFonts(invitation.getCustomFonts())
                .enabledSections(invitation.getEnabledSections())
                .layoutSettings(invitation.getLayoutSettings())
                .build();
    }
}
