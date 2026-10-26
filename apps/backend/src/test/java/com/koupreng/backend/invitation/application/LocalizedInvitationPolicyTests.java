package com.koupreng.backend.invitation.application;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.koupreng.backend.invitation.api.dto.InvitationRequest;
import com.koupreng.backend.invitation.domain.EventType;
import com.koupreng.backend.shared.exception.ApiException;
import org.junit.jupiter.api.Test;
import java.time.Instant;
import static org.junit.jupiter.api.Assertions.*;

class LocalizedInvitationPolicyTests {
    private final ObjectMapper json = new ObjectMapper();
    private static final String DRAFT = """
        {"messageText":"Khmer preserved","localizedContentV1":{"version":1,"km":{"messageText":"Khmer preserved"},"en":{"messageText":"Private draft"},"enabledLocales":["km"],"defaultLocale":"km","futureField":"preserved"}}
        """;
    private InvitationRequest request(String content) {
        var request = new InvitationRequest(); request.setContentJson(content); request.setEventType(EventType.WEDDING); return request;
    }
    @Test void legacyWritersNeedRevisionOnceLocalesExist() {
        assertThrows(ApiException.class, () -> LocalizedInvitationPolicy.merge(DRAFT, request("{}")));
    }
    @Test void revisionedLegacyReplacementPreservesOtherLocaleAndUnknownFields() throws Exception {
        var request = request("{\"messageText\":\"Updated Khmer\"}"); request.setExpectedUpdatedAt(Instant.now());
        var result = json.readTree(LocalizedInvitationPolicy.merge(DRAFT, request));
        assertEquals("Private draft", result.path("localizedContentV1").path("en").path("messageText").asText());
        assertEquals("Updated Khmer", result.path("localizedContentV1").path("km").path("messageText").asText());
        assertEquals("preserved", result.path("localizedContentV1").path("futureField").asText());
    }
    @Test void partialLocalePatchesPreserveUnmentionedFields() throws Exception {
        var request = request("{\"localizedContentV1\":{\"en\":{\"messageTitle\":\"Welcome\"}}}"); request.setExpectedUpdatedAt(Instant.now());
        assertEquals("Private draft", json.readTree(LocalizedInvitationPolicy.merge(DRAFT, request)).path("localizedContentV1").path("en").path("messageText").asText());
    }
    @Test void incompleteEnglishCannotBePublished() {
        assertThrows(ApiException.class, () -> LocalizedInvitationPolicy.merge(null, request(DRAFT.replace("[\"km\"]", "[\"km\",\"en\"]"))));
    }
    @Test void unpublishedEnglishIsRemovedFromPublicJson() throws Exception {
        var result = json.readTree(LocalizedInvitationPolicy.publicContent(DRAFT));
        assertFalse(result.path("localizedContentV1").has("en"));
        assertEquals("Khmer preserved", result.path("messageText").asText());
    }
    @Test void oldRowsRemainByteCompatible() {
        var old = "{\"messageText\":\"Legacy\",\"future\":3}";
        assertEquals(old, LocalizedInvitationPolicy.merge(null, request(old)));
        assertEquals(old, LocalizedInvitationPolicy.publicContent(old));
    }
    @Test void kmTextOwnsCanonicalColumnsAndEnglishNeverReplacesThem() throws Exception {
        var request = request(DRAFT); request.setTitle("Canonical title");
        String merged = LocalizedInvitationPolicy.merge(null, request);
        assertEquals("Khmer preserved", request.getStoryText());
        assertEquals("Khmer preserved", json.readTree(merged).path("messageText").asText());
        assertFalse(LocalizedInvitationPolicy.changesPublication(DRAFT, "{\"localizedContentV1\":{\"en\":{\"messageText\":\"New English\"}}}"));
    }
    @Test void malformedLocalesFailClosed() {
        for (String content : new String[]{"{\"localizedContentV1\":null}", DRAFT.replace("\"version\":1", "\"version\":2"), DRAFT.replace("[\"km\"]", "[\"fr\"]")})
            assertThrows(ApiException.class, () -> LocalizedInvitationPolicy.merge(null, request(content)));
    }
}
