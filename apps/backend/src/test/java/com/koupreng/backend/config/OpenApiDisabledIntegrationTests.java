package com.koupreng.backend.config;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(properties = {
        "app.payment.admin-secret=openapi-disabled-test-secret",
        "app.waf.max-requests-per-minute=1000",
        "springdoc.api-docs.enabled=false",
        "springdoc.swagger-ui.enabled=false",
        "scalar.enabled=false",
        "scalar.path=/docs"
})
@AutoConfigureMockMvc
@ActiveProfiles("test")
class OpenApiDisabledIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void disabledSwitchesDoNotExposeOpenApiOrScalar() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/docs"))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/docs/scalar.js"))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/swagger-ui/index.html"))
                .andExpect(status().isNotFound());
    }
}
