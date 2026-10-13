package com.koupreng.backend.devmonitor.application;

import com.koupreng.backend.devmonitor.api.dto.ApiMonitorEventDto;
import com.koupreng.backend.devmonitor.infrastructure.ApiMonitorEventStore;
import com.koupreng.backend.shared.exception.ApiException;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ApiMonitorServiceTest {

    private ApiMonitorProperties properties;
    private ApiMonitorEventStore eventStore;
    private ApiMonitorService service;

    @BeforeEach
    void setUp() {
        properties = new ApiMonitorProperties();
        properties.setEnabled(true);
        properties.setMaxEvents(50);
        properties.setMaxSubscribers(2);
        properties.setSlowThresholdMs(500);

        eventStore = new ApiMonitorEventStore(properties);
        service = new ApiMonitorService(properties, eventStore);
    }

    @Test
    void allowsSubscriptionsUpToMaxLimit() {
        SseEmitter emitter1 = service.subscribe();
        assertNotNull(emitter1);
        assertEquals(1, service.getActiveSubscribersCount());

        SseEmitter emitter2 = service.subscribe();
        assertNotNull(emitter2);
        assertEquals(2, service.getActiveSubscribersCount());

        // Exceeding max limit should throw ApiException with TOO_MANY_REQUESTS
        ApiException ex = assertThrows(ApiException.class, () -> service.subscribe());
        assertEquals(HttpStatus.TOO_MANY_REQUESTS, ex.getStatus());
        assertEquals("DEV_MONITOR_MAX_SUBSCRIBERS", ex.getCode());
    }

    @Test
    void subscriptionThrowsWhenDisabled() {
        properties.setEnabled(false);

        ApiException ex = assertThrows(ApiException.class, () -> service.subscribe());
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatus());
        assertEquals("DEV_MONITOR_DISABLED", ex.getCode());
    }

    @Test
    void recordEventAppendsToStoreAndBroadcasts() {
        service.subscribe();

        service.recordEvent(
                "req-test-1",
                "frontend-user",
                "/login",
                "LOGIN_SUBMIT",
                "POST",
                "/api/v1/auth/login",
                "/api/v1/auth/login",
                "/api/v1/auth/login",
                "AuthController.login()",
                200,
                35,
                "127.0.0.1",
                "test@koupreng.com",
                "ROLE_USER",
                true,
                ""
        );

        assertEquals(1, service.getEvents(10, null, null, null, null).size());
        ApiMonitorEventDto event = service.getEvents(10, null, null, null, null).get(0);
        assertEquals("req-test-1", event.requestId());
        assertEquals("frontend-user", event.clientApp());
        assertEquals("LOGIN_SUBMIT", event.clientAction());
        assertEquals(200, event.status());
        assertEquals(35, event.durationMs());
        assertTrue(event.authenticated());
    }

    @Test
    void clearEmptiesEventsAndNotifiesSubscribers() {
        service.recordEvent(
                "req-test-2",
                "frontend-admin",
                "/dashboard",
                "LOAD_DASHBOARD",
                "GET",
                "/api/v1/admin/dashboard",
                "/api/v1/admin/dashboard",
                "/api/v1/admin/dashboard",
                "DashboardController.get()",
                200,
                20,
                "127.0.0.1",
                "admin",
                "ROLE_ADMIN",
                true,
                ""
        );
        assertEquals(1, service.getEvents(10, null, null, null, null).size());

        service.clear();
        assertEquals(0, service.getEvents(10, null, null, null, null).size());
    }
}

