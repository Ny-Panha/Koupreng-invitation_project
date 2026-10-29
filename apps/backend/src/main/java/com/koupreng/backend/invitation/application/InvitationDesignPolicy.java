package com.koupreng.backend.invitation.application;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.koupreng.backend.entitlement.application.EntitlementService;
import com.koupreng.backend.invitation.api.dto.InvitationRequest;
import com.koupreng.backend.invitation.domain.UserInvitation;
import com.koupreng.backend.shared.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Set;

/** Text/vector designs have no remote resources or uploaded executable SVG. */
@Service
public class InvitationDesignPolicy {
    private final EntitlementService entitlements;
    private final ObjectMapper json = new ObjectMapper();
    public InvitationDesignPolicy(EntitlementService entitlements) { this.entitlements = entitlements; }

    public String prepare(UserInvitation event, InvitationRequest request) {
        var before = parse(event.getContentJson());
        var next = parse(request.getContentJson());
        for (var key : List.of("coupleMonogram", "illustratedMap")) {
            var original = before.get(key);
            if ((original != null || next.has(key)) && event.getId() != null && request.getExpectedUpdatedAt() == null)
                throw new ApiException(HttpStatus.CONFLICT, "Reopen this designed invitation before saving with a revision");
            if (!next.has(key) && original != null) next.set(key, original);
            var value = next.get(key);
            if (value == null || value.isNull()) continue;
            if (key.equals("coupleMonogram")) validateMonogram(value); else validateMap(value);
            if (!value.equals(original) && !onlyDisabled(original, value)) entitlements.requireFeature(event.getUser(), feature(key));
        }
        if (next.hasNonNull("coupleLayout") && !Set.of("template-default", "groom-left", "bride-left", "stacked", "centered").contains(next.path("coupleLayout").asText())) throw invalid();
        var families = next.get("familyGroupsV1");
        if (families != null) {
            if (!families.isArray() || families.size() > 2) throw invalid();
            Set<String> sides = new java.util.HashSet<>();
            Set<String> ids = new java.util.HashSet<>();
            for (var group : families) {
                if (!group.isObject() || !Set.of("groom", "bride").contains(group.path("side").asText()) || !sides.add(group.path("side").asText())) throw invalid();
                if (!group.path("members").isArray() || group.path("members").size() > 8) throw invalid();
                for (var member : group.path("members")) {
                    string(member, "id", 100); if (member.path("id").asText().isBlank() || !ids.add(member.path("id").asText())) throw invalid();
                    for (var key : List.of("name", "honorific", "relationship")) localizedText(member.path(key), 300);
                }
                localizedText(group.path("label"), 300);
            }
        }
        String result = next.toString(); if (result.length() > 50000) throw invalid();
        return !before.has("coupleMonogram") && !before.has("illustratedMap") && !next.has("coupleMonogram") && !next.has("illustratedMap") ? request.getContentJson() : result;
    }

    public void validatePublish(UserInvitation event) {
        var content = parse(event.getContentJson());
        for (var key : List.of("coupleMonogram", "illustratedMap")) if (content.path(key).path("enabled").asBoolean(false))
            entitlements.requireFeature(event.getUser(), feature(key));
    }

    public String publicContent(UserInvitation event, String content) {
        var root = parse(content);
        if (!root.has("coupleMonogram") && !root.has("illustratedMap")) return content;
        for (var key : List.of("coupleMonogram", "illustratedMap")) if (root.has(key)) {
            if (!root.path(key).path("enabled").asBoolean(false)) { root.remove(key); continue; }
            try { entitlements.requireFeature(event.getUser(), feature(key)); }
            catch (ApiException denied) { if (denied.getStatus() != HttpStatus.FORBIDDEN) throw denied; root.remove(key); }
        }
        return root.toString();
    }
    private EntitlementService.Feature feature(String key) {
        return key.equals("coupleMonogram") ? EntitlementService.Feature.COUPLE_MONOGRAM : EntitlementService.Feature.ILLUSTRATED_VENUE_MAP;
    }
    private boolean onlyDisabled(JsonNode before, JsonNode after) {
        if (before == null || !before.isObject() || !after.isObject() || after.path("enabled").asBoolean(true)) return false;
        var copy = ((ObjectNode) before).deepCopy(); copy.put("enabled", false); return copy.equals(after);
    }
    private void validateMonogram(JsonNode node) {
        version(node); string(node, "text", 60); color(node, "color");
        if (node.has("font")) option(node, "font", Set.of("MOUL", "KANTUMRUY", "SERIF"));
        if (node.has("position")) option(node, "position", Set.of("above", "below"));
        option(node, "motif", Set.of("none", "diamond", "petals")); option(node, "layout", Set.of("round", "oval", "plain"));
        number(node, "size", 60, 180);
    }
    private void validateMap(JsonNode node) {
        if (!node.isObject() || !node.path("version").isIntegralNumber()
                || !Set.of(1, 2).contains(node.path("version").asInt()) || !node.path("enabled").isBoolean()) throw invalid();
        boolean v2 = node.path("version").asInt() == 2;
        option(node, "aspectRatio", Set.of("landscape", "portrait", "square"));
        option(node, "theme", v2 ? Set.of("ivory", "ink", "rose", "royal-gold", "botanical", "royal-blue") : Set.of("ivory", "ink", "rose"));
        localizedText(node.path("description"), 1500);
        if (v2 && node.has("settings")) {
            var settings = node.path("settings");
            if (!settings.isObject()) throw invalid();
            settings.fieldNames().forEachRemaining(key -> {
                if (!Set.of("showLegend", "showDirectionsButton").contains(key) || !settings.path(key).isBoolean()) throw invalid();
            });
        }
        var nodes = node.path("nodes"); if (!nodes.isArray() || nodes.size() > 80) throw invalid();
        Set<String> ids = new java.util.HashSet<>();
        for (var item : nodes) {
            if (!item.isObject()) throw invalid(); string(item, "id", 100);
            if (item.path("id").asText().isBlank() || !ids.add(item.path("id").asText())) throw invalid();
            var legacyTypes = Set.of("destination", "road", "arrow", "label", "building", "intersection", "market", "school", "pagoda", "parking");
            if (!legacyTypes.contains(item.path("type").asText()) && (!v2 || !Set.of("curve", "t-junction", "roundabout", "venue", "house", "hotel", "restaurant", "hospital", "gas", "bank", "bridge", "landmark", "info", "decoration").contains(item.path("type").asText()))) throw invalid();
            number(item, "x", .05, .95); number(item, "y", .05, .95); number(item, "width", .02, .8); number(item, "height", .02, .8); number(item, "rotation", -180, 180);
            localizedText(item.path("label"), 150);
            if (v2) {
                if (item.has("color")) color(item, "color");
                if (item.has("textColor")) color(item, "textColor");
                if (item.has("labelBackground")) color(item, "labelBackground");
                if (item.has("fontSize")) number(item, "fontSize", 12, 60);
                if (item.has("labelX")) number(item, "labelX", -.3, .3);
                if (item.has("labelY")) number(item, "labelY", -.3, .3);
                if (item.has("labelRotation")) number(item, "labelRotation", -180, 180);
                if (item.has("font")) option(item, "font", Set.of("KANTUMRUY", "MOUL", "SERIF"));
                if (item.has("textAlign")) option(item, "textAlign", Set.of("start", "middle", "end"));
                if (item.has("roadStyle")) option(item, "roadStyle", Set.of("lanes", "solid", "boundary"));
                if (item.has("curvature")) number(item, "curvature", -1, 1);
            }
        }
    }
    private void version(JsonNode node) {
        if (!node.isObject() || !node.path("version").isIntegralNumber() || node.path("version").asInt() != 1 || !node.path("enabled").isBoolean()) throw invalid();
    }
    private void localizedText(JsonNode node, int max) {
        if (!node.isObject()) throw invalid();
        for (var locale : List.of("km", "en")) string(node, locale, max);
    }
    private void string(JsonNode node, String key, int max) { if (!node.path(key).isTextual() || node.path(key).asText().length() > max) throw invalid(); }
    private void color(JsonNode node, String key) { if (!node.path(key).asText().matches("#[0-9a-fA-F]{6}")) throw invalid(); }
    private void option(JsonNode node, String key, Set<String> options) { if (!node.path(key).isTextual() || !options.contains(node.path(key).asText())) throw invalid(); }
    private void number(JsonNode node, String key, double min, double max) {
        var value = node.path(key); if (!value.isNumber() || !Double.isFinite(value.asDouble()) || value.asDouble() < min || value.asDouble() > max) throw invalid();
    }
    private ObjectNode parse(String value) {
        if (value == null || value.isBlank()) return json.createObjectNode();
        try { var node = json.readTree(value); if (node.isObject()) return (ObjectNode) node; } catch (Exception malformed) { throw invalid(); }
        throw invalid();
    }
    private static ApiException invalid() { return new ApiException(HttpStatus.BAD_REQUEST, "INVITATION_DESIGN_INVALID", "Use valid bounded invitation design settings"); }
}
