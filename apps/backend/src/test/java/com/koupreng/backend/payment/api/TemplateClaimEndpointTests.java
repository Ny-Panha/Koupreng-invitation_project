package com.koupreng.backend.payment.api;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import com.koupreng.backend.payment.api.dto.PaymentConfirmResponse;
import com.koupreng.backend.payment.application.TemplatePaymentService;
import com.koupreng.backend.payment.domain.PaymentStatus;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TemplateClaimEndpointTests {
    @Autowired MockMvc mvc;
    @MockitoBean TemplatePaymentService payments;

    @Test void bothBuyerClaimAliasesNeverAnnounceUnlockedWhilePendingReview() throws Exception {
        when(payments.claimOrderByUser(any(), eq("EVT-test"), isNull())).thenReturn(
                PaymentConfirmResponse.builder().orderCode("EVT-test").status(PaymentStatus.PAID_PENDING_REVIEW).message("Review requested").build());
        for (String path : new String[]{"/api/v1/template-payments/EVT-test/claim", "/api/v1/template-payments/orders/EVT-test/claim"}) {
            mvc.perform(post(path).with(user("owner").roles("USER")))
                    .andExpect(status().isOk()).andExpect(jsonPath("$.data.status").value("PAID_PENDING_REVIEW"))
                    .andExpect(jsonPath("$.message", not(containsString("unlocked"))))
                    .andExpect(jsonPath("$.message", containsString("review")));
        }
    }
}
