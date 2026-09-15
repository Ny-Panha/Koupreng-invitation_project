package com.koupreng.backend.security;

import com.koupreng.backend.payment.api.dto.ConfirmTemplatePaymentRequest;
import com.koupreng.backend.payment.api.dto.PaymentConfirmResponse;
import com.koupreng.backend.payment.api.dto.TelegramDetectPaymentRequest;
import com.koupreng.backend.payment.domain.PaymentStatus;
import com.koupreng.backend.payment.application.TemplatePaymentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "app.payment.admin-secret=chain-secret",
        "app.waf.max-requests-per-minute=1000"
})
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminPaymentSecretFilterChainTests {

    private static final String INTERNAL_CONFIRM_PATH = "/api/v1/internal/template-payments/confirm";
    private static final String INTERNAL_TELEGRAM_DETECT_PATH = "/api/v1/internal/template-payments/telegram-detect";
    private static final String ADMIN_CONFIRM_PATH = "/api/v1/admin/template-payments/confirm";
    private static final String ADMIN_TELEGRAM_DETECT_PATH = "/api/v1/admin/template-payments/telegram-detect";
    private static final String CONFIRM_REQUEST_BODY = """
            {
              "orderCode": "EVT260529001",
              "amount": 0.01,
              "confirmedBy": "telegram-bot"
            }
            """;
    private static final String TELEGRAM_DETECT_REQUEST_BODY = """
            {
              "rawMessage": "ABA payment received USD 0.01 Note: EVT260529001",
              "detectedBy": "telegram-payway-bot:PayWayByABA_bot",
              "detectedOrderCode": "EVT260529001",
              "detectedAmount": 0.01,
              "detectedCurrency": "USD"
            }
            """;

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private TemplatePaymentService templatePaymentService;

    @BeforeEach
    public void setUp() {
        when(templatePaymentService.confirmManualPayment(any(ConfirmTemplatePaymentRequest.class)))
                .thenReturn(PaymentConfirmResponse.builder()
                        .message("Payment confirmed")
                        .orderCode("EVT260529001")
                        .status(PaymentStatus.PAID)
                        .build());
        when(templatePaymentService.detectPaymentFromTelegram(any(TelegramDetectPaymentRequest.class)))
                .thenReturn(PaymentConfirmResponse.builder()
                        .message("Telegram payment confirmed")
                        .orderCode("EVT260529001")
                        .status(PaymentStatus.PAID)
                        .build());
    }

    @Test
    void internalPaymentEndpointRejectsMissingSecretInSecurityChain() throws Exception {
        mockMvc.perform(post(INTERNAL_CONFIRM_PATH)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(CONFIRM_REQUEST_BODY))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));

        verifyNoInteractions(templatePaymentService);
    }

    @Test
    void internalPaymentEndpointRejectsWrongSecretInSecurityChain() throws Exception {
        mockMvc.perform(post(INTERNAL_CONFIRM_PATH)
                        .header(AdminPaymentSecretFilter.ADMIN_PAYMENT_SECRET_HEADER, "wrong-secret")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(CONFIRM_REQUEST_BODY))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));

        verifyNoInteractions(templatePaymentService);
    }

    @Test
    void internalPaymentEndpointAllowsValidSecretWithoutAdminJwt() throws Exception {
        mockMvc.perform(post(INTERNAL_CONFIRM_PATH)
                        .header(AdminPaymentSecretFilter.ADMIN_PAYMENT_SECRET_HEADER, "chain-secret")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(CONFIRM_REQUEST_BODY))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.orderCode").value("EVT260529001"))
                .andExpect(jsonPath("$.data.status").value("PAID"));

        verify(templatePaymentService).confirmManualPayment(any(ConfirmTemplatePaymentRequest.class));
    }

    @Test
    void internalTelegramDetectEndpointRejectsMissingSecretInSecurityChain() throws Exception {
        mockMvc.perform(post(INTERNAL_TELEGRAM_DETECT_PATH)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(TELEGRAM_DETECT_REQUEST_BODY))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));

        verifyNoInteractions(templatePaymentService);
    }

    @Test
    void internalTelegramDetectEndpointRejectsWrongSecretInSecurityChain() throws Exception {
        mockMvc.perform(post(INTERNAL_TELEGRAM_DETECT_PATH)
                        .header(AdminPaymentSecretFilter.ADMIN_PAYMENT_SECRET_HEADER, "wrong-secret")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(TELEGRAM_DETECT_REQUEST_BODY))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));

        verifyNoInteractions(templatePaymentService);
    }

    @Test
    void internalTelegramDetectEndpointAllowsValidSecretWithoutAdminJwt() throws Exception {
        mockMvc.perform(post(INTERNAL_TELEGRAM_DETECT_PATH)
                        .header(AdminPaymentSecretFilter.ADMIN_PAYMENT_SECRET_HEADER, "chain-secret")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(TELEGRAM_DETECT_REQUEST_BODY))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.orderCode").value("EVT260529001"))
                .andExpect(jsonPath("$.data.status").value("PAID"));

        verify(templatePaymentService).detectPaymentFromTelegram(any(TelegramDetectPaymentRequest.class));
    }

    @Test
    @WithMockUser(roles = "USER")
    void normalUserCannotAccessAdminConfirmEndpoint() throws Exception {
        mockMvc.perform(post(ADMIN_CONFIRM_PATH)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(CONFIRM_REQUEST_BODY))
                .andExpect(status().isForbidden());

        verifyNoInteractions(templatePaymentService);
    }

    @Test
    @WithMockUser(roles = "USER")
    void normalUserCannotAccessAdminTelegramDetectEndpoint() throws Exception {
        mockMvc.perform(post(ADMIN_TELEGRAM_DETECT_PATH)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(TELEGRAM_DETECT_REQUEST_BODY))
                .andExpect(status().isForbidden());

        verifyNoInteractions(templatePaymentService);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void adminCanAccessAdminConfirmEndpoint() throws Exception {
        mockMvc.perform(post(ADMIN_CONFIRM_PATH)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(CONFIRM_REQUEST_BODY))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.orderCode").value("EVT260529001"))
                .andExpect(jsonPath("$.data.status").value("PAID"));

        verify(templatePaymentService).confirmManualPayment(any(ConfirmTemplatePaymentRequest.class));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void adminCanAccessAdminTelegramDetectEndpoint() throws Exception {
        mockMvc.perform(post(ADMIN_TELEGRAM_DETECT_PATH)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(TELEGRAM_DETECT_REQUEST_BODY))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.orderCode").value("EVT260529001"))
                .andExpect(jsonPath("$.data.status").value("PAID"));

        verify(templatePaymentService).detectPaymentFromTelegram(any(TelegramDetectPaymentRequest.class));
    }
}
