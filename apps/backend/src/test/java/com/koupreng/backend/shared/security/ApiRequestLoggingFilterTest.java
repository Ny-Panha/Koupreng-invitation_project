package com.koupreng.backend.shared.security;

import com.koupreng.backend.devmonitor.api.dto.ApiMonitorEventDto;
import com.koupreng.backend.devmonitor.application.ApiMonitorProperties;
import com.koupreng.backend.devmonitor.application.ApiMonitorService;
import com.koupreng.backend.devmonitor.infrastructure.ApiMonitorEventStore;
import com.koupreng.backend.devmonitor.infrastructure.DevSqlStatementTracker;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.slf4j.MDC;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ApiRequestLoggingFilterTest {

    private ApiSecurityProperties.ApiLogging loggingProperties;
    private ApiMonitorService apiMonitorService;
    private ApiRequestLoggingFilter filter;

    @BeforeEach
    void setUp() {
        loggingProperties = new ApiSecurityProperties.ApiLogging();
        loggingProperties.setEnabled(true);
        loggingProperties.setIncludeHealthChecks(false);

        ApiMonitorProperties monitorProperties = new ApiMonitorProperties();
        monitorProperties.setEnabled(true);
        ApiMonitorEventStore store = new ApiMonitorEventStore(monitorProperties);
        apiMonitorService = new ApiMonitorService(monitorProperties, store);

        filter = new ApiRequestLoggingFilter(loggingProperties, apiMonitorService);
    }

    @Test
    void preservesValidFrontendRequestIdHeader() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/invitations");
        request.addHeader("X-Request-Id", "client-trace-12345678");

        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, (req, res) -> {
            assertEquals("client-trace-12345678", MDC.get("requestId"));
            ((jakarta.servlet.http.HttpServletResponse) res).setStatus(200);
        });

        assertEquals("client-trace-12345678", response.getHeader("X-Request-Id"));
        assertNull(MDC.get("requestId"), "MDC should be cleared in finally");
    }

    @Test
    void generatesNewRequestIdWhenHeaderIsMissingOrInvalid() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/invitations");
        request.addHeader("X-Request-Id", "<script>alert(1)</script>"); // Invalid characters

        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, (req, res) -> {
            assertNotNull(MDC.get("requestId"));
            assertNotEquals("<script>alert(1)</script>", MDC.get("requestId"));
            ((jakarta.servlet.http.HttpServletResponse) res).setStatus(200);
        });

        String returnedId = response.getHeader("X-Request-Id");
        assertNotNull(returnedId);
        assertNotEquals("<script>alert(1)</script>", returnedId);
    }

    @Test
    void capturesDiagnosticHeadersAndRecordsToMonitorService() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/auth/login");
        request.addHeader("X-Request-Id", "req-login-12345678");
        request.addHeader("X-Action-Id", "act-journey-login");
        request.addHeader("X-Client-App", "frontend-user");
        request.addHeader("X-Frontend-Route", "/login");
        request.addHeader("X-Client-Action", "LOGIN_SUBMIT");
        request.addHeader("X-Client-Duration-Ms", "48");

        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, (req, res) -> {
            DevSqlStatementTracker.recordQuery("select count(*) from users");
            ((jakarta.servlet.http.HttpServletResponse) res).setStatus(200);
        });

        assertEquals("act-journey-login", response.getHeader("X-Action-Id"));

        List<ApiMonitorEventDto> events = apiMonitorService.getEvents(10, null, null, null, null);
        assertEquals(1, events.size());

        ApiMonitorEventDto event = events.get(0);
        assertEquals("req-login-12345678", event.requestId());
        assertEquals("act-journey-login", event.actionId());
        assertEquals("frontend-user", event.clientApp());
        assertEquals("/login", event.frontendRoute());
        assertEquals("LOGIN_SUBMIT", event.clientAction());
        assertEquals("POST", event.method());
        assertEquals("/api/v1/auth/login", event.path());
        assertEquals(200, event.status());
        assertEquals(48, event.clientDurationMs());
        assertEquals(1, event.sqlQueryCount());
        assertEquals("MATCHED", event.contractStatus());
        assertEquals("SUCCESS", event.outcome());
    }

    @Test
    void redactsSensitiveQueryParametersInRequestTarget() throws Exception {
        loggingProperties.setIncludeQueryString(true);
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/auth/verify");
        request.setQueryString("token=superSecret123&code=482910&email=test@koupreng.com");

        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, (req, res) -> {
            ((jakarta.servlet.http.HttpServletResponse) res).setStatus(200);
        });

        List<ApiMonitorEventDto> events = apiMonitorService.getEvents(10, null, null, null, null);
        assertEquals(1, events.size());
        ApiMonitorEventDto event = events.get(0);
        assertTrue(event.target().contains("token=[REDACTED]"), "Secret token query parameter must be redacted");
        assertTrue(event.target().contains("code=[REDACTED]"), "Code query parameter must be redacted");
        assertTrue(event.target().contains("email=test@koupreng.com"), "Non-secret parameter preserved");
    }

    @Test
    void ignoresMonitorStreamAndHealthCheckFromMonitorRecording() throws Exception {
        MockHttpServletRequest monitorRequest = new MockHttpServletRequest("GET", "/api/v1/admin/dev-monitor/stream");
        MockHttpServletResponse monitorResponse = new MockHttpServletResponse();

        filter.doFilter(monitorRequest, monitorResponse, (req, res) -> {
            ((jakarta.servlet.http.HttpServletResponse) res).setStatus(200);
        });

        List<ApiMonitorEventDto> events = apiMonitorService.getEvents(10, null, null, null, null);
        assertTrue(events.isEmpty(), "Internal dev-monitor endpoint must not record itself to prevent feedback loop");
    }
}
