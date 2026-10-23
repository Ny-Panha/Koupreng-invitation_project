package com.koupreng.backend.invitation.api;

import com.koupreng.backend.invitation.api.dto.InvitationSummaryResponse;
import com.koupreng.backend.invitation.domain.UserInvitation;
import com.koupreng.backend.template.domain.InvitationTemplate;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class InvitationCoverSummaryTests {
    @Test
    void distinguishesOwnerMediaFromTheExactSelectedTemplate() {
        var template = new InvitationTemplate();
        template.setCode("selected-design");
        template.setThumbnailUrl("/chosen-artwork.jpg");
        var event = new UserInvitation();
        event.setId(42L);
        event.setTemplate(template);
        var draft = InvitationSummaryResponse.from(event);
        assertEquals("template", draft.getCoverSource());
        assertEquals("/chosen-artwork.jpg", draft.getCoverUrl());
        var owner = InvitationSummaryResponse.from(event, "/saved-owner.jpg");
        assertEquals("owner", owner.getCoverSource());
        assertEquals("/saved-owner.jpg", owner.getCoverUrl());
        assertEquals("/chosen-artwork.jpg", owner.getTemplateThumbnailUrl());
        assertEquals("/chosen-artwork.jpg", InvitationSummaryResponse.from(event, "").getCoverUrl());
    }
}
