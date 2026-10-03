package com.koupreng.backend.integration.ai.api;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import com.koupreng.backend.integration.ai.application.AiInvitationAssistantService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(properties = "app.waf.max-requests-per-minute=1000")
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AiInvitationEndpointTests {
    @Autowired private MockMvc mvc;
    @MockitoBean private AiInvitationAssistantService assistant;
    private static final String[] PATHS = {"/invitation-copy", "/invitation/story", "/invitation/formal-text", "/invitation/translate", "/invitation/timeline-suggestion"};

    @Test void allExistingOperationsRejectAnonymousAccessBeforeProviderWork() throws Exception {
        for (String path : PATHS) {
            mvc.perform(post("/api/v1/ai" + path).contentType(MediaType.APPLICATION_JSON).content("{}"))
                    .andExpect(status().isUnauthorized());
        }
        verifyNoInteractions(assistant);
    }

    @Test void excessiveInputRejectedBeforeAdapterAndDisabledResponseIsExplicit() throws Exception {
        for (String path : PATHS) {
            mvc.perform(post("/api/v1/ai" + path).with(user("owner").roles("USER"))
                            .contentType(MediaType.APPLICATION_JSON).content("{\"notes\":\"" + "a".repeat(5001) + "\"}"))
                    .andExpect(status().isBadRequest());
        }
        verifyNoInteractions(assistant);
        when(assistant.draft(any())).thenReturn(new AiInvitationAssistantService(false, "").draft(null));
        mvc.perform(post("/api/v1/ai/invitation-copy").with(user("owner").roles("USER"))
                        .contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.enabled").value(false))
                .andExpect(jsonPath("$.data.source").value("LOCAL_TEMPLATE"))
                .andExpect(jsonPath("$.data.generatedText").value(""));
    }
}
