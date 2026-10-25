package com.koupreng.backend.invitation.application;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.koupreng.backend.entitlement.application.EntitlementService;
import com.koupreng.backend.invitation.domain.UserInvitation;
import com.koupreng.backend.media.domain.MediaType;
import com.koupreng.backend.media.infrastructure.persistence.MediaFileRepository;
import com.koupreng.backend.shared.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

/** Additive content configuration; public playback is resolved from current owner benefits. */
@Service
public class PreWeddingVideoPolicy {
    private final EntitlementService entitlements;
    private final MediaFileRepository media;
    private final ObjectMapper json = new ObjectMapper();

    public record Playback(boolean enabled, Long videoMediaId, String posterUrl) { }

    public PreWeddingVideoPolicy(EntitlementService entitlements, MediaFileRepository media) {
        this.entitlements = entitlements;
        this.media = media;
    }

    public void validate(UserInvitation event, String content) {
        JsonNode settings = settings(content);
        if (settings.isMissingNode() || settings.isNull()) return;
        if (!settings.isObject()) throw invalid();
        settings.fieldNames().forEachRemaining(key -> {
            if (!java.util.Set.of("enabled", "videoMediaId", "posterMediaId").contains(key)) throw invalid();
        });
        if (settings.has("enabled") && !settings.path("enabled").isBoolean()) throw invalid();
        for (String key : java.util.List.of("videoMediaId", "posterMediaId")) {
            JsonNode value = settings.get(key);
            if (value != null && !value.isNull() && (!value.isIntegralNumber() || !value.canConvertToLong() || value.asLong() < 1)) throw invalid();
        }
        boolean enabled = settings.path("enabled").asBoolean(false);
        if (enabled) entitlements.requireFeature(event.getUser(), EntitlementService.Feature.PRE_WEDDING_VIDEO);
        Long videoId = id(settings, "videoMediaId");
        if (enabled && videoId == null) throw invalid();
        if (videoId != null) requireVideo(event, videoId);
        Long posterId = id(settings, "posterMediaId");
        if (posterId != null) requirePoster(event, posterId);
    }

    public void validateChange(UserInvitation event, String previous, String next) {
        JsonNode before = settings(previous), after = settings(next);
        // Expired users can disable/remove a saved configuration without buying again.
        if (!after.equals(before) && !after.isMissingNode() && !after.isNull()) {
            boolean associatesMedia = java.util.List.of("videoMediaId", "posterMediaId").stream()
                    .anyMatch(key -> id(after, key) != null && !java.util.Objects.equals(id(after, key), id(before, key)));
            if (associatesMedia)
                entitlements.requireFeature(event.getUser(), EntitlementService.Feature.PRE_WEDDING_VIDEO);
        }
        validate(event, next);
    }

    public Playback playback(UserInvitation event) {
        try {
            JsonNode settings = settings(event.getContentJson());
            if (!settings.path("enabled").asBoolean(false)) return null;
            entitlements.requireFeature(event.getUser(), EntitlementService.Feature.PRE_WEDDING_VIDEO);
            Long videoId = id(settings, "videoMediaId");
            requireVideo(event, videoId);
            Long posterId = id(settings, "posterMediaId");
            return new Playback(true, videoId, posterId == null ? null : requirePoster(event, posterId).getFileUrl());
        } catch (ApiException unavailable) {
            // Entitlement, deleted media or policy failures must never trap a guest at the cover.
            return null;
        }
    }

    private com.koupreng.backend.media.domain.MediaFile requireVideo(UserInvitation event, Long id) {
        if (id == null || event.getId() == null) throw invalid();
        return media.findByIdAndInvitationId(id, event.getId()).filter(file -> file.getMediaType() == MediaType.PRE_WEDDING_VIDEO)
                .orElseThrow(PreWeddingVideoPolicy::invalid);
    }

    private com.koupreng.backend.media.domain.MediaFile requirePoster(UserInvitation event, Long id) {
        if (event.getId() == null) throw invalid();
        return media.findByIdAndInvitationId(id, event.getId())
                .filter(file -> file.getMediaType() == MediaType.COVER_IMAGE || file.getMediaType() == MediaType.GALLERY_IMAGE)
                .filter(file -> file.getMimeType() != null && file.getMimeType().matches("image/(jpeg|png|webp)"))
                .orElseThrow(PreWeddingVideoPolicy::invalid);
    }

    private static Long id(JsonNode settings, String key) {
        return settings.path(key).isIntegralNumber() ? settings.path(key).asLong() : null;
    }

    private JsonNode settings(String content) {
        try { return content == null || content.isBlank() ? json.missingNode() : json.readTree(content).path("preWeddingVideo"); }
        catch (Exception malformed) { throw invalid(); }
    }

    private static ApiException invalid() {
        return new ApiException(HttpStatus.BAD_REQUEST, "Choose valid cinematic media belonging to this event");
    }
}
