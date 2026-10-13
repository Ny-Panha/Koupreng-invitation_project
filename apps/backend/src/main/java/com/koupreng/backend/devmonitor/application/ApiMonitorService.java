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
import com.koupreng.backend.devmonitor.api.dto.ClientTelemetryRequest;
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

    /**
     * Default loopback address fallback when client remote address cannot be resolved from the request.
     */
    @SuppressWarnings("PMD.AvoidUsingHardCodedIP")
    private static final String DEFAULT_LOOPBACK_IP = "127.0.0.1";

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
        return subscribe(null);
    }

    public SseEmitter subscribe(Long lastEventId) {
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
            List<ApiMonitorEventDto> initialEvents;
            boolean replayed = false;

            if (lastEventId != null && lastEventId > 0) {
                initialEvents = eventStore.getEventsAfter(lastEventId, 200);
                replayed = true;
            } else {
                initialEvents = eventStore.getRecent(50, null, null, null, null);
            }

            ApiMonitorStatsDto initialStats = eventStore.computeStats();
            emitter.send(SseEmitter.event()
                    .name("init")
                    .data(Map.of(
                            "connected", true,
                            "events", initialEvents,
                            "stats", initialStats,
                            "replayed", replayed,
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
            String actionId,
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
            long clientDurationMs,
            int sqlQueryCount,
            long sqlDurationMs,
            boolean nPlusOneDetected,
            String source,
            String contractStatus,
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
        String outcome = determineOutcome(status);

        ApiMonitorEventDto event = new ApiMonitorEventDto(
                sequence.getAndIncrement(),
                requestId,
                actionId != null ? actionId : "",
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
                clientDurationMs,
                slow,
                sqlQueryCount,
                sqlDurationMs,
                nPlusOneDetected,
                source != null ? source : "BACKEND_OBSERVED",
                contractStatus != null ? contractStatus : "UNMATCHED",
                clientIp != null ? clientIp : DEFAULT_LOOPBACK_IP,
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
                emitter.send(SseEmitter.event()
                        .id(String.valueOf(event.id()))
                        .name("request")
                        .data(event));
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
        recordEvent(
                requestId,
                "",
                clientApp,
                frontendRoute,
                clientAction,
                method,
                path,
                target,
                matchedPattern,
                controller,
                status,
                durationMs,
                0L,
                0,
                0L,
                false,
                "BACKEND_OBSERVED",
                resolveContractStatus(path),
                clientIp,
                userPrincipal,
                userRole,
                authenticated,
                errorCode
        );
    }

    private static String determineOutcome(int status) {
        if (status < 400) {
            return "SUCCESS";
        }
        if (status < 500) {
            return "CLIENT_ERROR";
        }
        return "SERVER_ERROR";
    }

    private static String resolveContractStatus(String path) {
        if (path == null) {
            return "UNMATCHED";
        }
        if (path.startsWith("/api/v1")) {
            return "MATCHED";
        }
        if (path.startsWith("/api")) {
            return "COMPATIBILITY_ALIAS";
        }
        return "UNMATCHED";
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

    public void recordClientTelemetry(ClientTelemetryRequest req, String remoteAddr) {
        if (!properties.isEnabled()) {
            return;
        }
        recordEvent(
                req.requestId(),
                req.actionId() != null ? req.actionId() : "",
                req.clientApp() != null ? req.clientApp() : "frontend-user",
                req.frontendRoute() != null ? req.frontendRoute() : "",
                req.clientAction() != null ? req.clientAction() : "",
                req.method() != null ? req.method() : "GET",
                req.path() != null ? req.path() : "",
                req.path() != null ? req.path() : "",
                "",
                "ClientTelemetry",
                req.status(),
                req.clientDurationMs(),
                req.clientDurationMs(),
                0,
                0L,
                false,
                "CLIENT_OBSERVED",
                resolveContractStatus(req.path()),
                remoteAddr != null && !remoteAddr.isBlank() ? remoteAddr : DEFAULT_LOOPBACK_IP,
                "anonymous",
                "ANONYMOUS",
                false,
                req.errorCode() != null && !req.errorCode().isBlank() ? req.errorCode() : "CLIENT_NETWORK_ERROR"
        );
    }

    public int getActiveSubscribersCount() {
        return emitters.size();
    }
}
