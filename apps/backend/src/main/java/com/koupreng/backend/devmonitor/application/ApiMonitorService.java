package com.koupreng.backend.devmonitor.application;

import java.io.IOException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicLong;

import com.koupreng.backend.devmonitor.api.dto.ApiMonitorEventDto;
import com.koupreng.backend.devmonitor.api.dto.ApiMonitorStatsDto;
import com.koupreng.backend.devmonitor.infrastructure.ApiMonitorEventStore;
import com.koupreng.backend.shared.exception.ApiException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Service
public class ApiMonitorService {

    private static final Logger log = LoggerFactory.getLogger(ApiMonitorService.class);
    private static final long SSE_TIMEOUT_MS = 30 * 60 * 1000L;

    private final ApiMonitorProperties properties;
    private final ApiMonitorEventStore eventStore;
    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();
    private final AtomicLong sequence = new AtomicLong(1);

    public ApiMonitorService(ApiMonitorProperties properties, ApiMonitorEventStore eventStore) {
        this.properties = properties;
        this.eventStore = eventStore;
    }

    public boolean isEnabled() {
        return properties.isEnabled();
    }

    public SseEmitter subscribe() {
        if (!properties.isEnabled()) {
            throw new ApiException(
                    HttpStatus.FORBIDDEN,
                    "DEV_MONITOR_DISABLED",
                    "Developer API Monitor is currently disabled"
            );
        }

        if (emitters.size() >= properties.getMaxSubscribers()) {
            throw new ApiException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "DEV_MONITOR_MAX_SUBSCRIBERS",
                    "Maximum active API monitor subscribers reached (" + properties.getMaxSubscribers() + ")"
            );
        }

        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT_MS);

        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> {
            emitters.remove(emitter);
            try {
                emitter.complete();
            } catch (Exception ignored) {
            }
        });
        emitter.onError(e -> {
            emitters.remove(emitter);
            try {
                emitter.completeWithError(e);
            } catch (Exception ignored) {
            }
        });

        emitters.add(emitter);

        try {
            List<ApiMonitorEventDto> initialEvents = eventStore.getRecent(50, null, null, null, null);
            ApiMonitorStatsDto initialStats = eventStore.computeStats();
            emitter.send(SseEmitter.event()
                    .name("init")
                    .data(Map.of(
                            "connected", true,
                            "events", initialEvents,
                            "stats", initialStats,
                            "timestamp", Instant.now().toString()
                    )));
        } catch (IOException ex) {
            emitters.remove(emitter);
            log.debug("Initial SSE handshake failed: {}", ex.getMessage());
        }

        return emitter;
    }

    @Scheduled(fixedRate = 15000)
    public void sendHeartbeat() {
        if (emitters.isEmpty()) {
            return;
        }

        List<SseEmitter> deadEmitters = new ArrayList<>();
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name("ping")
                        .data(Map.of("timestamp", Instant.now().toString())));
            } catch (Exception e) {
                deadEmitters.add(emitter);
            }
        }

        if (!deadEmitters.isEmpty()) {
            emitters.removeAll(deadEmitters);
        }
    }

    public void recordEvent(
            String requestId,
            String clientApp,
            String frontendRoute,
            String clientAction,
            String method,
            String path,
            String target,
            String matchedPattern,
            String controller,
            int status,
            long durationMs,
            String clientIp,
            String userPrincipal,
            String userRole,
            boolean authenticated,
            String errorCode
    ) {
        if (!properties.isEnabled()) {
            return;
        }

        boolean slow = durationMs >= properties.getSlowThresholdMs();
        String outcome = status < 400 ? "SUCCESS" : (status < 500 ? "CLIENT_ERROR" : "SERVER_ERROR");

        ApiMonitorEventDto event = new ApiMonitorEventDto(
                sequence.getAndIncrement(),
                requestId,
                Instant.now(),
                clientApp != null ? clientApp : "external",
                frontendRoute != null ? frontendRoute : "",
                clientAction != null ? clientAction : "",
                method != null ? method : "UNKNOWN",
                path != null ? path : "",
                target != null ? target : path,
                matchedPattern != null ? matchedPattern : "",
                controller != null ? controller : "",
                status,
                durationMs,
                slow,
                clientIp != null ? clientIp : "127.0.0.1",
                userPrincipal != null ? userPrincipal : "anonymous",
                userRole != null ? userRole : "ANONYMOUS",
                authenticated,
                outcome,
                errorCode != null ? errorCode : ""
        );

        eventStore.add(event);

        if (emitters.isEmpty()) {
            return;
        }

        List<SseEmitter> deadEmitters = new ArrayList<>();
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name("request").data(event));
            } catch (Exception e) {
                deadEmitters.add(emitter);
            }
        }

        if (!deadEmitters.isEmpty()) {
            emitters.removeAll(deadEmitters);
        }
    }

    public List<ApiMonitorEventDto> getEvents(
            int limit,
            String search,
            String clientApp,
            Integer status,
            Boolean slow
    ) {
        return eventStore.getRecent(limit, search, clientApp, status, slow);
    }

    public ApiMonitorStatsDto getStats() {
        return eventStore.computeStats();
    }

    public void clear() {
        eventStore.clear();

        if (emitters.isEmpty()) {
            return;
        }

        List<SseEmitter> deadEmitters = new ArrayList<>();
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name("clear")
                        .data(Map.of("timestamp", Instant.now().toString())));
            } catch (Exception e) {
                deadEmitters.add(emitter);
            }
        }

        if (!deadEmitters.isEmpty()) {
            emitters.removeAll(deadEmitters);
        }
    }

    public int getActiveSubscribersCount() {
        return emitters.size();
    }
}

