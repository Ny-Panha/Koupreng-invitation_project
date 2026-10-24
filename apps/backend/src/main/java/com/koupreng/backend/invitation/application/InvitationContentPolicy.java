package com.koupreng.backend.invitation.application;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.koupreng.backend.shared.exception.ApiException;
import org.springframework.http.HttpStatus;
import java.time.LocalDate;

final class InvitationContentPolicy {
    private InvitationContentPolicy() { }
    static boolean addsCustomBranding(String previous, String next) {
        try {
            var json = new ObjectMapper();
            var before = previous == null || previous.isBlank() ? json.createObjectNode() : json.readTree(previous);
            var after = next == null || next.isBlank() ? json.createObjectNode() : json.readTree(next);
            String logo = after.path("brandMarkUrl").asText("");
            return !logo.isBlank() && !logo.equals(before.path("brandMarkUrl").asText(""));
        } catch (Exception malformedLegacy) {
            return next != null && next.contains("brandMarkUrl");
        }
    }
    static void validate(String content) {
        if (content == null || content.isBlank()) return;
        try {
            var root = new ObjectMapper().readTree(content);
            if (!root.isObject()) throw new IllegalArgumentException();
            var schedule = root.get("schedule");
            if (schedule == null) return;
            if (!schedule.isArray() || schedule.size() > 200) throw new IllegalArgumentException();
            for (var row : schedule) {
                if (!row.isObject()) throw new IllegalArgumentException();
                String date = row.path("date").asText("");
                if (!date.isBlank()) {
                    if (!date.matches("\\d{4}-\\d{2}-\\d{2}")) throw new IllegalArgumentException();
                    LocalDate.parse(date);
                }
                if (row.has("day") && row.path("day").asInt() != 1 && row.path("day").asInt() != 2) throw new IllegalArgumentException();
            }
        } catch (Exception e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVITATION_CONTENT_INVALID", "Check program dates and days before saving");
        }
    }
}
