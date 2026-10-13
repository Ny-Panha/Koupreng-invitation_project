package com.koupreng.backend.devmonitor.api;

import java.util.List;
import java.util.Map;

import com.koupreng.backend.devmonitor.api.dto.ApiMonitorEventDto;
import com.koupreng.backend.devmonitor.api.dto.ApiMonitorStatsDto;
import com.koupreng.backend.devmonitor.application.ApiMonitorService;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import io.swagger.v3.oas.annotations.Hidden;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Hidden
@RestController
@RequestMapping("/api/v1/admin/dev-monitor")
@PreAuthorize("hasRole('ADMIN')")
public class ApiMonitorController {

    private final ApiMonitorService apiMonitorService;

    public ApiMonitorController(ApiMonitorService apiMonitorService) {
        this.apiMonitorService = apiMonitorService;
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(
            @org.springframework.web.bind.annotation.RequestHeader(value = "Last-Event-ID", required = false) String lastEventIdHeader,
            @RequestParam(value = "lastEventId", required = false) Long lastEventIdParam
    ) {
        Long lastEventId = null;
        if (lastEventIdParam != null && lastEventIdParam > 0) {
            lastEventId = lastEventIdParam;
        } else if (lastEventIdHeader != null && !lastEventIdHeader.isBlank()) {
            try {
                lastEventId = Long.parseLong(lastEventIdHeader.trim());
            } catch (NumberFormatException ignored) {
            }
        }
        return apiMonitorService.subscribe(lastEventId);
    }

    @GetMapping("/events")
    public ResponseEntity<Map<String, Object>> getEvents(
            @RequestParam(defaultValue = "100") int limit,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String clientApp,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) Boolean slow
    ) {
        List<ApiMonitorEventDto> events = apiMonitorService.getEvents(limit, search, clientApp, status, slow);
        return ResponseEntity.ok(Map.of(
                "events", events,
                "count", events.size(),
                "activeSubscribers", apiMonitorService.getActiveSubscribersCount()
        ));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiMonitorStatsDto> getStats() {
        return ResponseEntity.ok(apiMonitorService.getStats());
    }

    @PostMapping("/clear")
    public ResponseEntity<Map<String, Object>> clearEvents() {
        apiMonitorService.clear();
        return ResponseEntity.ok(Map.of("cleared", true));
    }
}

