package com.koupreng.backend.invitation.application;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.koupreng.backend.shared.exception.ApiException;
import org.springframework.http.HttpStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.HashSet;
import java.util.Set;
import com.fasterxml.jackson.databind.JsonNode;

final class InvitationContentPolicy {
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private InvitationContentPolicy() { }

    static void validateDirections(String value) {
        if (value == null || value.isBlank() || !value.matches("^[a-zA-Z][a-zA-Z0-9+.-]*:.*")) return;
        try {
            var uri = java.net.URI.create(value);
            if (!"https".equalsIgnoreCase(uri.getScheme()) || uri.getUserInfo() != null || !Set.of("google.com", "www.google.com", "maps.google.com", "google.com.kh", "www.google.com.kh", "maps.google.com.kh", "goo.gl", "maps.app.goo.gl").contains(uri.getHost())) throw new IllegalArgumentException();
        } catch (RuntimeException malformed) { throw new ApiException(HttpStatus.BAD_REQUEST, "Use a valid HTTPS Google Maps directions link"); }
    }

    static boolean addsCustomBranding(String previous, String next) {
        if (next == null || next.isBlank()) {
            return false;
        }
        try {
            var after = OBJECT_MAPPER.readTree(next);
            String logo = after.path("brandMarkUrl").asText("");
            if (logo.isBlank()) {
                return false;
            }
            if (previous == null || previous.isBlank()) {
                return true;
            }
            try {
                var before = OBJECT_MAPPER.readTree(previous);
                return !logo.equals(before.path("brandMarkUrl").asText(""));
            } catch (JsonProcessingException | RuntimeException malformedPrevious) {
                return true;
            }
        } catch (JsonProcessingException | RuntimeException malformedNext) {
            return next.contains("\"brandMarkUrl\"") && !next.contains("\"brandMarkUrl\":\"\"") && !next.contains("\"brandMarkUrl\": \"\"");
        }
    }
    static void validate(String content) {
        if (content == null || content.isBlank()) return;
        try {
            var root = OBJECT_MAPPER.readTree(content);
            if (!root.isObject()) throw new IllegalArgumentException();
            var days = root.get("programDays");
            Set<String> dayIds = new HashSet<>();
            if (days != null) {
                if (!days.isArray() || days.size() > 30) throw new IllegalArgumentException();
                for (var day : days) {
                    if (!day.isObject() || !day.path("id").isTextual() || day.path("id").asText().isBlank()
                            || !dayIds.add(day.path("id").asText())) throw new IllegalArgumentException();
                    validateDate(day, "date");
                    text(day, 100, "id");
                    text(day, 300, "title", "titleKm", "titleEn");
                    flag(day, "enabled");
                }
            }
            text(root, 100, "eventTimezone", "calendarUid");
            flag(root, "showSchedule");
            validateDate(root, "eventDate");
            validateDate(root, "eventEndDate");
            var zone = ZoneId.of(root.path("eventTimezone").asText("Asia/Phnom_Penh"));
            var start = validateWallTime(root, "eventDate", "eventTime", zone);
            var endDate = root.path("eventEndDate").asText("");
            var endTime = root.path("eventEndTime").asText("");
            if (!endTime.isBlank()) {
                var end = localInstant(endDate.isBlank() ? root.path("eventDate").asText("") : endDate, endTime, zone);
                if (start == null || !end.isAfter(start)) throw new IllegalArgumentException();
            }
            var settings = root.get("saveTheDate");
            if (settings != null) {
                if (!settings.isObject()) throw new IllegalArgumentException();
                text(settings, 300, "heading");
                text(settings, 1000, "subtitle");
                flag(settings, "enabled", "showCountdown", "showCalendar", "showAddToCalendar", "calendarNavigation", "showTime", "showVenue");
                option(settings, "numerals", Set.of("latin", "khmer"));
                option(settings, "countdownStyle", Set.of("theme", "circles", "minimal"));
            }
            var schedule = root.get("schedule");
            if (schedule == null) return;
            if (!schedule.isArray() || schedule.size() > 200) throw new IllegalArgumentException();
            for (var row : schedule) {
                if (!row.isObject()) throw new IllegalArgumentException();
                validateDate(row, "date");
                if (row.has("day") && (!row.path("day").isIntegralNumber() || row.path("day").asInt() < 1 || row.path("day").asInt() > 30)) throw new IllegalArgumentException();
                text(row, 100, "id", "dayId", "time", "startTime", "endTime", "period");
                text(row, 500, "title", "titleKm", "titleEn", "dayTitle", "location", "locationEn");
                text(row, 5000, "description", "descriptionKm", "descriptionEn");
                flag(row, "enabled");
                option(row, "iconKey", Set.of("calendar", "gathering", "blessing", "offering", "meal", "reception", "none"));
                if (row.hasNonNull("dayId") && !dayIds.contains(row.path("dayId").asText())) throw new IllegalArgumentException();
            }
        } catch (JsonProcessingException | RuntimeException e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVITATION_CONTENT_INVALID", "Check program dates, days, text limits and event timezone before saving");
        }
    }

    private static void text(JsonNode node, int limit, String... keys) {
        for (String key : keys) if (node.hasNonNull(key) && (!node.path(key).isTextual() || node.path(key).asText().length() > limit)) throw new IllegalArgumentException();
    }
    private static void flag(JsonNode node, String... keys) {
        for (String key : keys) if (node.hasNonNull(key) && !node.path(key).isBoolean()) throw new IllegalArgumentException();
    }
    private static void option(JsonNode node, String key, Set<String> values) {
        if (node.hasNonNull(key) && !values.contains(node.path(key).asText())) throw new IllegalArgumentException();
    }
    private static void validateDate(JsonNode node, String key) {
        text(node, 10, key);
        String date = node.path(key).asText("");
        if (!date.isBlank()) {
            if (!date.matches("[1-9]\\d{3}-\\d{2}-\\d{2}")) throw new IllegalArgumentException();
            LocalDate.parse(date);
        }
    }
    private static java.time.Instant validateWallTime(JsonNode node, String dateKey, String timeKey, ZoneId zone) {
        text(node, 8, timeKey);
        String date = node.path(dateKey).asText("");
        String time = node.path(timeKey).asText("");
        if (!time.isBlank()) {
            LocalTime.parse(time);
            if (!date.isBlank()) return localInstant(date, time, zone);
        }
        return null;
    }
    private static java.time.Instant localInstant(String date, String time, ZoneId zone) {
        var local = LocalDateTime.of(LocalDate.parse(date), LocalTime.parse(time));
        var offsets = zone.getRules().getValidOffsets(local);
        if (offsets.isEmpty()) throw new IllegalArgumentException();
        return local.toInstant(offsets.getFirst());
    }
}
