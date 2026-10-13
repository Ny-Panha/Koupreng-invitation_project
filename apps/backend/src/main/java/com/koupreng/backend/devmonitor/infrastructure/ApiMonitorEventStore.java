package com.koupreng.backend.devmonitor.infrastructure;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentLinkedDeque;
import java.util.concurrent.atomic.AtomicInteger;

import com.koupreng.backend.devmonitor.api.dto.ApiMonitorEventDto;
import com.koupreng.backend.devmonitor.api.dto.ApiMonitorStatsDto;
import com.koupreng.backend.devmonitor.api.dto.EndpointStatDto;
import com.koupreng.backend.devmonitor.application.ApiMonitorProperties;

import org.springframework.stereotype.Component;

@Component
public class ApiMonitorEventStore {

    private final ApiMonitorProperties properties;
    private final ConcurrentLinkedDeque<ApiMonitorEventDto> events = new ConcurrentLinkedDeque<>();
    private final AtomicInteger currentSize = new AtomicInteger(0);

    public ApiMonitorEventStore(ApiMonitorProperties properties) {
        this.properties = properties;
    }

    public void add(ApiMonitorEventDto event) {
        if (event == null) {
            return;
        }

        events.addLast(event);
        int size = currentSize.incrementAndGet();
        int max = properties.getMaxEvents();

        while (size > max && !events.isEmpty()) {
            if (events.pollFirst() != null) {
                size = currentSize.decrementAndGet();
            }
        }
    }

    public List<ApiMonitorEventDto> getRecent(
            int limit,
            String search,
            String clientApp,
            Integer status,
            Boolean slow
    ) {
        int safeLimit = Math.max(1, Math.min(1000, limit > 0 ? limit : 100));
        String normalizedSearch = search != null ? search.trim().toLowerCase(Locale.ROOT) : "";
        String normalizedApp = clientApp != null ? clientApp.trim().toLowerCase(Locale.ROOT) : "";

        List<ApiMonitorEventDto> snapshot = new ArrayList<>(events);
        Collections.reverse(snapshot);

        return snapshot.stream()
                .filter(event -> {
                    if (!normalizedSearch.isEmpty()) {
                        boolean match = contains(event.path(), normalizedSearch)
                                || contains(event.requestId(), normalizedSearch)
                                || contains(event.actionId(), normalizedSearch)
                                || contains(event.clientAction(), normalizedSearch)
                                || contains(event.userPrincipal(), normalizedSearch)
                                || contains(event.errorCode(), normalizedSearch)
                                || contains(event.controller(), normalizedSearch);
                        if (!match) return false;
                    }
                    if (!normalizedApp.isEmpty() && (event.clientApp() == null || !event.clientApp().toLowerCase(Locale.ROOT).contains(normalizedApp))) {
                        return false;
                    }
                    if (status != null && event.status() != status) {
                        return false;
                    }
                    if (slow != null && event.slow() != slow) {
                        return false;
                    }
                    return true;
                })
                .limit(safeLimit)
                .toList();
    }

    public List<ApiMonitorEventDto> getEventsAfter(long lastEventId, int limit) {
        int safeLimit = Math.max(1, Math.min(1000, limit > 0 ? limit : 100));
        return events.stream()
                .filter(event -> event.id() > lastEventId)
                .limit(safeLimit)
                .toList();
    }

    public ApiMonitorStatsDto computeStats() {
        List<ApiMonitorEventDto> snapshot = new ArrayList<>(events);
        long total = snapshot.size();

        if (total == 0) {
            return new ApiMonitorStatsDto(
                    0, 0, 0, 0, 0, 0.0, 0.0, 0, 0, 0,
                    0, 0,
                    Map.of(), List.of(), Instant.now()
            );
        }

        long successCount = 0;
        long clientErrorCount = 0;
        long serverErrorCount = 0;
        long slowCount = 0;
        long userAppCount = 0;
        long adminAppCount = 0;
        long otherAppCount = 0;
        long durationSum = 0;
        long totalSqlQueries = 0;
        long nPlusOneCount = 0;

        Map<Integer, Long> statusMap = new LinkedHashMap<>();
        List<Long> durations = new ArrayList<>((int) total);

        Map<String, List<ApiMonitorEventDto>> endpointGroups = new LinkedHashMap<>();

        for (ApiMonitorEventDto event : snapshot) {
            int st = event.status();
            statusMap.put(st, statusMap.getOrDefault(st, 0L) + 1L);

            if (st >= 200 && st < 400) {
                successCount++;
            } else if (st >= 400 && st < 500) {
                clientErrorCount++;
            } else if (st >= 500) {
                serverErrorCount++;
            }

            if (event.slow()) {
                slowCount++;
            }

            if (event.nPlusOneDetected()) {
                nPlusOneCount++;
            }
            totalSqlQueries += event.sqlQueryCount();

            String app = event.clientApp() != null ? event.clientApp().toLowerCase(Locale.ROOT) : "";
            if (app.contains("user")) {
                userAppCount++;
            } else if (app.contains("admin")) {
                adminAppCount++;
            } else {
                otherAppCount++;
            }

            durationSum += event.durationMs();
            durations.add(event.durationMs());

            String routeKey = event.method() + " " + (event.matchedPattern() != null && !event.matchedPattern().isBlank()
                    ? event.matchedPattern()
                    : event.path());
            endpointGroups.computeIfAbsent(routeKey, k -> new ArrayList<>()).add(event);
        }

        double avgDurationMs = Math.round((double) durationSum / total * 100.0) / 100.0;

        durations.sort(Long::compare);
        int p95Index = (int) Math.ceil(0.95 * durations.size()) - 1;
        p95Index = Math.max(0, Math.min(durations.size() - 1, p95Index));
        double p95DurationMs = durations.get(p95Index).doubleValue();

        List<EndpointStatDto> topEndpoints = endpointGroups.entrySet().stream()
                .map(entry -> {
                    String[] parts = entry.getKey().split(" ", 2);
                    String method = parts[0];
                    String pattern = parts.length > 1 ? parts[1] : "";
                    List<ApiMonitorEventDto> list = entry.getValue();
                    long count = list.size();
                    double avg = Math.round(list.stream().mapToLong(ApiMonitorEventDto::durationMs).average().orElse(0.0) * 100.0) / 100.0;
                    long errs = list.stream().filter(e -> e.status() >= 400).count();
                    return new EndpointStatDto(method, pattern, count, avg, errs);
                })
                .sorted(Comparator.comparingLong(EndpointStatDto::count).reversed())
                .limit(10)
                .toList();

        return new ApiMonitorStatsDto(
                total,
                successCount,
                clientErrorCount,
                serverErrorCount,
                slowCount,
                avgDurationMs,
                p95DurationMs,
                userAppCount,
                adminAppCount,
                otherAppCount,
                totalSqlQueries,
                nPlusOneCount,
                statusMap,
                topEndpoints,
                Instant.now()
        );
    }

    public void clear() {
        events.clear();
        currentSize.set(0);
    }

    public int size() {
        return currentSize.get();
    }

    private static boolean contains(String target, String query) {
        return target != null && target.toLowerCase(Locale.ROOT).contains(query);
    }
}
