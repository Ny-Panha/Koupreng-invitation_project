package com.koupreng.backend.invitation.application;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/** Projects only the saved Studio cover URL, without exposing the full invitation content in summaries. */
@Component @RequiredArgsConstructor
public class InvitationCoverReader {
    private final ObjectMapper json;
    public String read(String contentJson) {
        if (contentJson == null || contentJson.isBlank()) return null;
        try {
            String cover = json.readTree(contentJson).path("coverImage").asText("").trim();
            return cover.length() <= 2048 && cover.matches("(?i)^(https?://|/(?!/)).+") ? cover : null;
        } catch (Exception legacyInvalidJson) { return null; }
    }
}
