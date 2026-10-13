package com.koupreng.backend.devmonitor.infrastructure;

import java.time.Instant;
import java.util.List;

import com.koupreng.backend.devmonitor.api.dto.ApiMonitorEventDto;
import com.koupreng.backend.devmonitor.api.dto.ApiMonitorStatsDto;
import com.koupreng.backend.devmonitor.application.ApiMonitorProperties;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ApiMonitorEventStoreTest {

    private ApiMonitorProperties properties;
    private ApiMonitorEventStore store;

    @BeforeEach
    void setUp() {
        properties = new ApiMonitorProperties();
        properties.setMaxEvents(5);
        properties.setSlowThresholdMs(500);
        store = new ApiMonitorEventStore(properties);
    }

    private ApiMonitorEventDto createEvent(long id, String path, int status, long durationMs, String clientApp) {
        return new ApiMonitorEventDto(
                id,
                "req-" + id,
                Instant.now(),
                clientApp,
                "/route",
                "ACTION_" + id,
                "GET",
                path,
                path,
                path,
                "TestController.test()",
                status,
                durationMs,
                durationMs >= properties.getSlowThresholdMs(),
                "127.0.0.1",
                "user" + id,
                "ROLE_USER",
                true,
                status < 400 ? "SUCCESS" : "ERROR",
                status >= 400 ? "ERR_" + status : ""
        );
    }

    @Test
    void boundsBufferSizeToMaxConfiguredEvents() {
        for (int i = 1; i <= 8; i++) {
            store.add(createEvent(i, "/api/v1/resource/" + i, 200, 50, "frontend-user"));
        }

        assertEquals(5, store.size());
        List<ApiMonitorEventDto> recent = store.getRecent(10, null, null, null, null);
        assertEquals(5, recent.size());
        // Newest should be first (id=8 down to id=4)
        assertEquals(8, recent.get(0).id());
        assertEquals(4, recent.get(4).id());
    }

    @Test
    void filtersRecentEventsBySearchAppStatusAndSlow() {
        store.add(createEvent(1, "/api/v1/auth/login", 200, 30, "frontend-user"));
        store.add(createEvent(2, "/api/v1/auth/register", 201, 80, "frontend-user"));
        store.add(createEvent(3, "/api/v1/admin/templates", 400, 150, "frontend-admin"));
        store.add(createEvent(4, "/api/v1/admin/reports", 500, 750, "frontend-admin"));

        // Search filter
        List<ApiMonitorEventDto> searchResult = store.getRecent(10, "register", null, null, null);
        assertEquals(1, searchResult.size());
        assertEquals(2, searchResult.get(0).id());

        // App filter
        List<ApiMonitorEventDto> adminAppResult = store.getRecent(10, null, "admin", null, null);
        assertEquals(2, adminAppResult.size());

        // Status filter
        List<ApiMonitorEventDto> status400Result = store.getRecent(10, null, null, 400, null);
        assertEquals(1, status400Result.size());
        assertEquals(3, status400Result.get(0).id());

        // Slow filter
        List<ApiMonitorEventDto> slowResult = store.getRecent(10, null, null, null, true);
        assertEquals(1, slowResult.size());
        assertEquals(4, slowResult.get(0).id());
    }

    @Test
    void computesAccurateAggregatedStatistics() {
        store.add(createEvent(1, "/api/v1/templates", 200, 100, "frontend-user"));
        store.add(createEvent(2, "/api/v1/templates", 200, 200, "frontend-user"));
        store.add(createEvent(3, "/api/v1/templates", 404, 300, "frontend-admin"));
        store.add(createEvent(4, "/api/v1/payments", 500, 600, "frontend-user"));

        ApiMonitorStatsDto stats = store.computeStats();

        assertEquals(4, stats.totalRequests());
        assertEquals(2, stats.successCount());
        assertEquals(1, stats.clientErrorCount());
        assertEquals(1, stats.serverErrorCount());
        assertEquals(1, stats.slowRequestsCount());
        assertEquals(3, stats.userAppCount());
        assertEquals(1, stats.adminAppCount());
        assertEquals(300.0, stats.avgDurationMs());
        assertEquals(600.0, stats.p95DurationMs());

        assertNotNull(stats.topEndpoints());
        assertFalse(stats.topEndpoints().isEmpty());
        assertEquals("GET /api/v1/templates", stats.topEndpoints().get(0).method() + " " + stats.topEndpoints().get(0).pattern());
        assertEquals(3, stats.topEndpoints().get(0).count());
    }

    @Test
    void clearEmptiesBuffer() {
        store.add(createEvent(1, "/api/v1/test", 200, 20, "frontend-user"));
        assertEquals(1, store.size());

        store.clear();
        assertEquals(0, store.size());
        assertEquals(0, store.getRecent(10, null, null, null, null).size());
    }
}

