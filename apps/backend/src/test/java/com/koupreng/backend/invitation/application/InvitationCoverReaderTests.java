package com.koupreng.backend.invitation.application;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class InvitationCoverReaderTests {
    private final InvitationCoverReader reader = new InvitationCoverReader(new ObjectMapper());
    @Test void projectsOnlySavedStudioUrlAndHandlesReplacementAndRemoval() {
        assertEquals("/saved.jpg",reader.read("{\"coverImage\":\"/saved.jpg\",\"note\":\"not exposed\"}"));
        assertEquals("https://example.test/replaced.jpg",reader.read("{\"coverImage\":\"https://example.test/replaced.jpg\"}"));
        assertNull(reader.read("{\"coverImage\":\"\"}"));
    }
    @Test void invalidLegacyJsonAndUnsavedOrUnsafeAssetsFallBack() {
        for (var value : new String[]{"{","{}","null","{\"coverImage\":\"blob:unsaved\"}","{\"coverImage\":\"data:image/png;base64,example\"}","{\"coverImage\":\"//other.test/image\"}"}) assertNull(reader.read(value));
    }
}
