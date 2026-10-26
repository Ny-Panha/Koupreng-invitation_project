package com.koupreng.backend.invitation.application;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.koupreng.backend.invitation.api.dto.InvitationRequest;
import com.koupreng.backend.shared.exception.ApiException;
import org.springframework.http.HttpStatus;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/** Authored content is additive; old replacement clients must send a revision once locales exist. */
final class LocalizedInvitationPolicy {
    private static final ObjectMapper JSON = new ObjectMapper();
    private static final String KEY = "localizedContentV1";
    static final List<String> FIELDS = List.of("title", "subtitle", "messageTitle", "messageText", "thankYouTitle", "thankYouText", "apologyTitle", "apologyText", "groomName", "brideName", "hostName", "partnerName", "groomHonorific", "brideHonorific", "groomFather", "groomMother", "brideFather", "brideMother", "venueName", "venueAddress", "eventDateText");
    private LocalizedInvitationPolicy() { }

    static String merge(String previous, InvitationRequest request) {
        var before = object(previous);
        var incomingRoot = object(request.getContentJson());
        if (!before.has(KEY) && !incomingRoot.has(KEY)) return request.getContentJson();
        var next = before.deepCopy(); next.setAll(incomingRoot);
        if (before.has(KEY) && request.getExpectedUpdatedAt() == null)
            throw new ApiException(HttpStatus.CONFLICT, "INVITATION_VERSION_REQUIRED", "Reopen this bilingual invitation before saving with a version timestamp");
        var merged = before.path(KEY).isObject() ? ((ObjectNode) before.path(KEY)).deepCopy() : JSON.createObjectNode();
        var incoming = incomingRoot.get(KEY);
        if (incoming != null && !incoming.isObject()) throw invalid();
        if (incoming != null) {
            incoming.properties().forEach(entry -> {
                if (Set.of("km", "en").contains(entry.getKey()) && entry.getValue().isObject()) {
                    var locale = merged.path(entry.getKey()).isObject() ? ((ObjectNode) merged.path(entry.getKey())).deepCopy() : JSON.createObjectNode();
                    mergeObjects(locale, (ObjectNode) entry.getValue(), 0); merged.set(entry.getKey(), locale);
                } else merged.set(entry.getKey(), entry.getValue());
            });
        } else {
            // A legacy writer may update Khmer; preserve the complete other-locale/unknown data.
            var km = merged.path("km").isObject() ? ((ObjectNode) merged.path("km")).deepCopy() : JSON.createObjectNode();
            for (var key : FIELDS) if (incomingRoot.has(key)) km.set(key, incomingRoot.get(key));
            putText(km, "title", request.getTitle()); putText(km, "venueName", request.getVenueName()); putText(km, "venueAddress", request.getVenueAddress());
            putText(km, "groomName", request.getGroomName()); putText(km, "brideName", request.getBrideName());
            putText(km, "hostName", request.getHostName()); putText(km, "partnerName", request.getPartnerName());
            putText(km, "messageText", request.getStoryText());
            merged.set("km", km);
        }
        next.set(KEY, merged);
        validate(next, request);
        var km = merged.path("km");
        // Khmer owns the legacy mirrors and canonical API text columns. English never writes them.
        for (var key : FIELDS) if (km.has(key)) next.set(key, km.get(key));
        if (km.has("title") && !km.path("title").asText().isBlank()) request.setTitle(km.path("title").asText());
        if (km.has("venueName")) request.setVenueName(km.path("venueName").asText());
        if (km.has("venueAddress")) request.setVenueAddress(km.path("venueAddress").asText());
        if (km.has("messageText")) request.setStoryText(km.path("messageText").asText());
        if (km.has("groomName")) request.setGroomName(km.path("groomName").asText());
        if (km.has("brideName")) request.setBrideName(km.path("brideName").asText());
        if (request.getEventType() != null && Set.of("WEDDING", "ENGAGEMENT").contains(request.getEventType().name())) {
            if (km.has("groomName")) request.setHostName(km.path("groomName").asText());
            if (km.has("brideName")) request.setPartnerName(km.path("brideName").asText());
        } else {
            if (km.has("hostName")) request.setHostName(km.path("hostName").asText());
            if (km.has("partnerName")) request.setPartnerName(km.path("partnerName").asText());
        }
        String serialized = next.toString();
        if (serialized.length() > 50000) throw invalid();
        return serialized;
    }

    private static void putText(ObjectNode node, String key, String value) { if (value != null) node.put(key, value); }

    private static void mergeObjects(ObjectNode target, ObjectNode patch, int depth) {
        if (depth > 8) throw invalid();
        patch.properties().forEach(entry -> {
            if (entry.getValue().isObject() && target.path(entry.getKey()).isObject()) mergeObjects((ObjectNode) target.path(entry.getKey()), (ObjectNode) entry.getValue(), depth + 1);
            else target.set(entry.getKey(), entry.getValue());
        });
    }

    private static void validate(ObjectNode root, InvitationRequest request) {
        var content = root.path(KEY);
        var enabledSections = object(request.getEnabledSections());
        if (!content.path("version").isIntegralNumber() || content.path("version").asInt() != 1
                || !content.path("km").isObject() || !content.path("en").isObject()) throw invalid();
        for (var locale : List.of("km", "en")) for (var key : FIELDS) {
            var value = content.path(locale).get(key);
            int max = Set.of("title", "groomName", "brideName", "hostName", "partnerName", "venueName").contains(key) ? 255 : key.equals("venueAddress") ? 1000 : 5000;
            if (value != null && (!value.isTextual() || value.asText().length() > max)) throw invalid();
        }
        for (var locale : List.of("km", "en")) {
            var collections = content.path(locale).get("collections");
            if (collections != null) {
                if (!collections.isObject() || collections.size() > 10) throw invalid();
                for (var group : collections) {
                    if (!group.isObject() || group.size() > 200) throw invalid();
                    for (var row : group) {
                        if (!row.isObject() || row.size() > 20) throw invalid();
                        for (var value : row) if (!value.isTextual() || value.asText().length() > 5000) throw invalid();
                    }
                }
            }
        }
        var enabled = content.path("enabledLocales");
        if (!enabled.isArray() || enabled.size() < 1 || enabled.size() > 2) throw invalid();
        Set<String> locales = new LinkedHashSet<>();
        for (var locale : enabled) if (!locale.isTextual() || !Set.of("km", "en").contains(locale.asText()) || !locales.add(locale.asText())) throw invalid();
        if (!locales.contains("km") || !locales.contains(content.path("defaultLocale").asText())) throw invalid();
        if (!locales.contains("en")) return;
        boolean wedding = request.getEventType() == null || Set.of("WEDDING", "ENGAGEMENT").contains(request.getEventType().name());
        Set<String> required = new LinkedHashSet<>(List.of("title", "venueName", "venueAddress"));
        if (wedding || !content.path("km").path("messageText").asText("").isBlank()) required.add("messageText");
        required.addAll(wedding ? List.of("groomName", "brideName") : List.of("hostName"));
        for (var key : FIELDS) if (!Set.of("eventDateText", wedding ? "hostName" : "groomName", wedding ? "partnerName" : "brideName").contains(key) && !content.path("km").path(key).asText("").isBlank()) required.add(key);
        for (var key : required) for (var locale : List.of("km", "en")) {
            String value = content.path(locale).path(key).asText("").trim();
            if (value.isBlank() || value.matches("(?i)todo|tbd|placeholder|translation pending")) throw invalid();
        }
        for (var group : java.util.Map.of("photos", List.of("alt", "caption"), "saveTheDate", List.of("heading", "subtitle"), "storyChapters", List.of("kicker", "title", "date", "text"), "party", List.of("name", "role"), "faq", List.of("q", "a", "question", "answer"), "dressCode", List.of("name", "description")).entrySet()) {
            String key = group.getKey();
            String flag = key.equals("storyChapters") ? "showStory" : "show" + Character.toUpperCase(key.charAt(0)) + key.substring(1);
            String section = key.equals("storyChapters") ? "story" : key.equals("saveTheDate") ? "countdown" : key.equals("photos") ? "gallery" : key;
            if (!root.path(flag).asBoolean(true) || !enabledSections.path(section).asBoolean(true) || (key.equals("saveTheDate") && !root.path("saveTheDate").path("enabled").asBoolean(true))) continue;
            var rows = (key.equals("dressCode") || key.equals("saveTheDate")) ? List.of(root.path(key)) : root.path(key);
            int index = 0;
            for (var row : rows) {
                String id = row.path("id").asText("row-" + index++);
                for (var field : group.getValue()) if (!row.path(field).asText("").isBlank()
                        && content.path("en").path("collections").path(key).path(id).path(field).asText("").isBlank()) throw invalid();
            }
        }
        for (var group : root.path("familyGroupsV1")) {
            requirePairTranslation(group.path("label"));
            for (var member : group.path("members")) for (var key : List.of("name", "honorific", "relationship")) requirePairTranslation(member.path(key));
        }
        if (root.path("illustratedMap").path("enabled").asBoolean()) {
            requirePairTranslation(root.path("illustratedMap").path("description"));
            for (var node : root.path("illustratedMap").path("nodes")) requirePairTranslation(node.path("label"));
        }
        if (enabledSections.path("schedule").asBoolean(true) && (!root.path("showSchedule").isBoolean() || root.path("showSchedule").asBoolean())) {
            for (var row : root.path("schedule")) if ((!row.path("enabled").isBoolean() || row.path("enabled").asBoolean())
                    && ((!row.path("location").asText("").isBlank() && row.path("locationEn").asText("").isBlank()) || row.path("titleEn").asText("").isBlank() || (!row.path("description").asText("").isBlank() && row.path("descriptionEn").asText("").isBlank()))) throw invalid();
            for (var day : root.path("programDays")) if (day.path("enabled").asBoolean(true) && !day.path("title").asText(day.path("titleKm").asText("")).isBlank() && day.path("titleEn").asText("").isBlank()) throw invalid();
        }
    }

    static void validatePublished(com.koupreng.backend.invitation.domain.UserInvitation event) {
        var root = object(event.getContentJson()); if (!root.has(KEY)) return;
        var km = root.path(KEY).path("km");
        var required = new java.util.ArrayList<>(List.of("title", "venueName", "venueAddress"));
        if (event.getEventType() == null || Set.of("WEDDING", "ENGAGEMENT").contains(event.getEventType().name())) required.addAll(List.of("groomName", "brideName", "messageText"));
        else required.add("hostName");
        for (var key : required) if (km.path(key).asText("").isBlank()) throw new ApiException(HttpStatus.BAD_REQUEST, "INVITATION_KHMER_INCOMPLETE", "Complete the required Khmer invitation fields before publishing");
    }

    private static void requirePairTranslation(JsonNode pair) {
        if (!pair.path("km").asText("").isBlank() && pair.path("en").asText("").isBlank()) throw invalid();
    }

    private static void hideEnglishPair(JsonNode pair) { if (pair.isObject()) ((ObjectNode) pair).remove("en"); }

    static boolean changesPublication(String before, String after) {
        var previous = object(before).path(KEY);
        var next = object(after).path(KEY);
        return next.isObject() && ((next.has("enabledLocales") && !previous.path("enabledLocales").equals(next.path("enabledLocales")))
                || (next.has("defaultLocale") && !previous.path("defaultLocale").equals(next.path("defaultLocale"))));
    }

    static boolean hasLocales(String value) { return object(value).has(KEY); }

    static String publicContent(String content) {
        var root = object(content);
        if (!root.has(KEY)) return content;
        var localized = (ObjectNode) root.path(KEY);
        boolean english = false;
        for (var locale : localized.path("enabledLocales")) if (locale.asText().equals("en")) english = true;
        if (!english) {
            localized.remove("en");
            for (var key : List.of("schedule", "programDays")) for (var row : root.path(key)) if (row.isObject()) ((ObjectNode) row).remove(List.of("titleEn", "descriptionEn", "locationEn"));
            for (var group : root.path("familyGroupsV1")) {
                hideEnglishPair(group.path("label"));
                for (var member : group.path("members")) for (var key : List.of("name", "honorific", "relationship")) hideEnglishPair(member.path(key));
            }
            hideEnglishPair(root.path("illustratedMap").path("description"));
            for (var node : root.path("illustratedMap").path("nodes")) hideEnglishPair(node.path("label"));
        }
        return root.toString();
    }

    private static ObjectNode object(String content) {
        if (content == null || content.isBlank()) return JSON.createObjectNode();
        try { JsonNode root = JSON.readTree(content); if (root.isObject()) return (ObjectNode) root; }
        catch (Exception malformed) { throw invalid(); }
        throw invalid();
    }
    private static ApiException invalid() {
        return new ApiException(HttpStatus.BAD_REQUEST, "INVITATION_LOCALE_INVALID", "Check the locale schema and complete both reviewed language versions before enabling English");
    }
}
