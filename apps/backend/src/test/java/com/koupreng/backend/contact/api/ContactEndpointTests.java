package com.koupreng.backend.contact.api;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import com.koupreng.backend.contact.application.ContactService;
import com.koupreng.backend.shared.exception.ApiException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(properties = {"app.auth.cookie.enabled=true", "app.waf.max-requests-per-minute=1000"})
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ContactEndpointTests {
    @Autowired private MockMvc mvc;
    @MockitoBean private ContactService contactService;
    private static final String BODY = """
            {"name":"Host","email":"host@example.test","message":"Please contact me."}
            """;

    @Test void anonymousValidatedContactReturnsOnlyConfirmedTransportResult() throws Exception {
        when(contactService.submit(any(), any())).thenReturn(new ContactService.ContactDelivery(true, "SMTP_ACCEPTED"));
        mvc.perform(post("/api/v1/contact").header("Origin", "http://localhost:5173")
                        .contentType(MediaType.APPLICATION_JSON).content(BODY))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.accepted").value(true))
                .andExpect(jsonPath("$.data.delivery").value("SMTP_ACCEPTED"));
    }

    @Test void malformedInputNeverReachesMailAndHostileOriginIsRejected() throws Exception {
        mvc.perform(post("/api/v1/contact").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Host\",\"email\":\"invalid\\r\\nBcc:other\",\"message\":\"\"}"))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/v1/contact").header("Origin", "https://attacker.example")
                        .contentType(MediaType.APPLICATION_JSON).content(BODY)).andExpect(status().isForbidden());
        verifyNoInteractions(contactService);
    }

    @Test void missingDeliveryAndAbuseReturnFailureStatus() throws Exception {
        when(contactService.submit(any(), any())).thenThrow(new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Unavailable"));
        mvc.perform(post("/api/v1/contact").contentType(MediaType.APPLICATION_JSON).content(BODY))
                .andExpect(status().isServiceUnavailable());
        doThrow(new ApiException(HttpStatus.TOO_MANY_REQUESTS, "Slow down")).when(contactService).submit(any(), any());
        mvc.perform(post("/api/v1/contact").contentType(MediaType.APPLICATION_JSON).content(BODY))
                .andExpect(status().isTooManyRequests());
    }
}
