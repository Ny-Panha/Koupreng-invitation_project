package com.koupreng.backend.checkin.api;

import com.koupreng.backend.checkin.application.CheckInService;
import com.koupreng.backend.rsvp.application.RsvpService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {"app.waf.max-requests-per-minute=1000"})
@AutoConfigureMockMvc
@ActiveProfiles("test")
class GuestMutationEndpointTests {
    @Autowired private MockMvc mvc;
    @MockitoBean private CheckInService checkIns;
    @MockitoBean private RsvpService rsvps;

    @Test
    void guestMutationsRejectAnonymousRequests() throws Exception {
        mvc.perform(delete("/api/v1/invitations/10/guests/20/check-in")).andExpect(status().isUnauthorized());
        mvc.perform(delete("/api/v1/invitations/10/wishes/88")).andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "1")
    void undoUsesGuestIdAndReturnsMessageContract() throws Exception {
        mvc.perform(delete("/api/v1/invitations/10/guests/20/check-in")).andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Guest check-in reverted"));
        verify(checkIns).undo(any(), eq(10L), eq(20L));
    }

    @Test
    @WithMockUser(username = "1")
    void wishModerationUsesRsvpIdAndReturnsMessageContract() throws Exception {
        mvc.perform(delete("/api/v1/invitations/10/wishes/88")).andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Wish removed"));
        verify(rsvps).moderateWish(any(), eq(10L), eq(88L));
    }
}
