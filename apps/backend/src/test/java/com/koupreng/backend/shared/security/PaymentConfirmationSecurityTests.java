package com.koupreng.backend.shared.security;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.koupreng.backend.payment.application.PaymentConfirmationService;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(properties = {
        "app.payment.admin-secret=payment-confirmation-test-secret",
        "app.waf.max-requests-per-minute=1000"
})
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PaymentConfirmationSecurityTests {

    private static final String REQUEST_BODY = """
            {
              "orderCode": "SUB2609151234",
              "amount": 19.00,
              "confirmedBy": "admin",
              "itemType": "SUBSCRIPTION"
            }
            """;

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private PaymentConfirmationService paymentConfirmationService;

    @Test
    void anonymousUserCannotConfirmPayment() throws Exception {
        mockMvc.perform(post("/api/v1/admin/payments/confirm")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(REQUEST_BODY))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "USER")
    void normalUserCannotConfirmPayment() throws Exception {
        mockMvc.perform(post("/api/v1/admin/payments/confirm")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(REQUEST_BODY))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void administratorCanReachConfirmationUseCase() throws Exception {
        mockMvc.perform(post("/api/v1/admin/payments/confirm")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(REQUEST_BODY))
                .andExpect(status().isOk());
    }
}
