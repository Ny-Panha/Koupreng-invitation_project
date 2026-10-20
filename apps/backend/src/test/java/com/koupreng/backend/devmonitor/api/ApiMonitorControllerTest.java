package com.koupreng.backend.devmonitor.api;

import com.koupreng.backend.devmonitor.application.ApiMonitorProperties;
import com.koupreng.backend.devmonitor.application.ApiMonitorService;
import com.koupreng.backend.devmonitor.infrastructure.ApiMonitorEventStore;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ApiMonitorControllerTest {

    private MockMvc mockMvc;
    private ApiMonitorService apiMonitorService;

    @BeforeEach
    void setUp() {
        ApiMonitorProperties properties = new ApiMonitorProperties();
        properties.setEnabled(true);
        properties.setMaxEvents(100);
        ApiMonitorEventStore store = new ApiMonitorEventStore(properties);
        apiMonitorService = new ApiMonitorService(properties, store);

        mockMvc = MockMvcBuilders.standaloneSetup(new ApiMonitorController(apiMonitorService)).build();
    }

    @Test
    void getEventsReturnsEmptyInitially() throws Exception {
        mockMvc.perform(get("/api/v1/admin/dev-monitor/events"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count", is(0)))
                .andExpect(jsonPath("$.events", hasSize(0)));
    }

    @Test
    void getEventsReturnsRecordedEvents() throws Exception {
        apiMonitorService.recordEvent(
                "req-ctrl-1",
                "frontend-user",
                "/templates",
                "VIEW_TEMPLATES",
                "GET",
                "/api/v1/templates",
                "/api/v1/templates",
                "/api/v1/templates",
                "TemplateController.list()",
                200,
                55,
                "127.0.0.1",
                "anonymous",
                "ANONYMOUS",
                false,
                ""
        );

        mockMvc.perform(get("/api/v1/admin/dev-monitor/events"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count", is(1)))
                .andExpect(jsonPath("$.events[0].requestId", is("req-ctrl-1")))
                .andExpect(jsonPath("$.events[0].clientApp", is("frontend-user")))
                .andExpect(jsonPath("$.events[0].clientAction", is("VIEW_TEMPLATES")));
    }

    @Test
    void getStatsReturnsAggregatedTelemetry() throws Exception {
        mockMvc.perform(get("/api/v1/admin/dev-monitor/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalRequests", is(0)))
                .andExpect(jsonPath("$.successCount", is(0)));
    }

    @Test
    void clearEventsResetsTelemetry() throws Exception {
        apiMonitorService.recordEvent(
                "req-ctrl-2",
                "frontend-admin",
                "/payments",
                "CONFIRM_PAYMENT",
                "POST",
                "/api/v1/admin/payments/confirm",
                "/api/v1/admin/payments/confirm",
                "/api/v1/admin/payments/confirm",
                "PaymentController.confirm()",
                200,
                120,
                "127.0.0.1",
                "admin",
                "ROLE_ADMIN",
                true,
                ""
        );

        mockMvc.perform(post("/api/v1/admin/dev-monitor/clear"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cleared", is(true)));

        mockMvc.perform(get("/api/v1/admin/dev-monitor/events"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count", is(0)));
    }

    @Test
    void streamReturnsSseEmitter() throws Exception {
        mockMvc.perform(get("/api/v1/admin/dev-monitor/stream").accept(MediaType.TEXT_EVENT_STREAM_VALUE))
                .andExpect(status().isOk());
    }
}

