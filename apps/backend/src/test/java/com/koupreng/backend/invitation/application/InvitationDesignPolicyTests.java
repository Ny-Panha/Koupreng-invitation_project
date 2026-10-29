package com.koupreng.backend.invitation.application;

import com.koupreng.backend.entitlement.application.EntitlementService;
import com.koupreng.backend.invitation.api.dto.InvitationRequest;
import com.koupreng.backend.invitation.domain.UserInvitation;
import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.user.domain.AppUser;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import java.time.Instant;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class InvitationDesignPolicyTests {
    @Test void v2ExtendsRoadsAndStylingWithoutReinterpretingV1() {
        String v2 = MAP.replace("\"version\":1", "\"version\":2").replace("\"theme\":\"ivory\"", "\"theme\":\"royal-blue\"")
                .replace("\"type\":\"destination\"", "\"type\":\"curve\",\"curvature\":0.5,\"fontSize\":32,\"color\":\"#c7984d\",\"font\":\"KANTUMRUY\",\"labelRotation\":45,\"labelX\":0.1,\"labelY\":0,\"textAlign\":\"middle\",\"roadStyle\":\"lanes\"");
        assertDoesNotThrow(() -> policy.prepare(event(), request("illustratedMap", v2)));
        assertDoesNotThrow(() -> policy.prepare(event(), request("illustratedMap", MAP)));
        assertThrows(ApiException.class, () -> policy.prepare(event(), request("illustratedMap", v2.replace("\"version\":2", "\"version\":1"))));
        for (String invalid : new String[]{v2.replace("0.5,\"fontSize", "2,\"fontSize"), v2.replace("\"fontSize\":32", "\"fontSize\":999"), v2.replace("#c7984d", "url(javascript:alert(1))"), v2.replace("\"labelX\":0.1", "\"labelX\":1"), v2.replace("KANTUMRUY", "https://example.test/font"), v2.replace("\"roadStyle\":\"lanes\"", "\"roadStyle\":\"script\"")})
            assertEquals(HttpStatus.BAD_REQUEST, assertThrows(ApiException.class, () -> policy.prepare(event(), request("illustratedMap", invalid))).getStatus());
    }

    @Test void existingV2RequiresRevisionAndExpiryOnlyAllowsUnchangedOrDisableOnly() {
        var event = event(); event.setId(69L);
        String map = MAP.replace("\"version\":1", "\"version\":2");
        event.setContentJson(request("illustratedMap", map).getContentJson());
        assertEquals(HttpStatus.CONFLICT, assertThrows(ApiException.class, () -> policy.prepare(event, request("illustratedMap", map))).getStatus());
        doThrow(new ApiException(HttpStatus.FORBIDDEN, "Expired")).when(entitlements).requireFeature(any(), any());
        var unchanged = request("illustratedMap", map); unchanged.setExpectedUpdatedAt(Instant.now());
        assertDoesNotThrow(() -> policy.prepare(event, unchanged));
        var disabled = request("illustratedMap", map.replace("true", "false")); disabled.setExpectedUpdatedAt(Instant.now());
        assertDoesNotThrow(() -> policy.prepare(event, disabled));
        var forged = request("illustratedMap", map.replace("true", "false").replace("Venue", "Changed")); forged.setExpectedUpdatedAt(Instant.now());
        assertEquals(HttpStatus.FORBIDDEN, assertThrows(ApiException.class, () -> policy.prepare(event, forged)).getStatus());
    }
    private static final String LOGO = "{\"version\":1,\"enabled\":true,\"text\":\"A & B\",\"color\":\"#996633\",\"motif\":\"diamond\",\"layout\":\"round\",\"size\":100}";
    private static final String MAP = "{\"version\":1,\"enabled\":true,\"aspectRatio\":\"landscape\",\"theme\":\"ivory\",\"description\":{\"km\":\"\",\"en\":\"\"},\"nodes\":[{\"id\":\"one\",\"type\":\"destination\",\"x\":0.5,\"y\":0.5,\"width\":0.1,\"height\":0.1,\"rotation\":0,\"label\":{\"km\":\"\",\"en\":\"Venue\"}}]}";
    private final EntitlementService entitlements = mock(EntitlementService.class);
    private final InvitationDesignPolicy policy = new InvitationDesignPolicy(entitlements);
    private UserInvitation event() { var event = new UserInvitation(); var owner = new AppUser(); owner.setId(42L); event.setUser(owner); return event; }
    private InvitationRequest request(String key, String value) { var request = new InvitationRequest(); request.setContentJson("{\"" + key + "\":" + value + "}"); return request; }
    @Test void forgedFreeMonogramAndMapAreForbiddenEvenWhenDisabled() {
        doThrow(new ApiException(HttpStatus.FORBIDDEN, "Premium required")).when(entitlements).requireFeature(any(), any());
        for (boolean enabled : new boolean[]{true, false}) {
            assertEquals(HttpStatus.FORBIDDEN, assertThrows(ApiException.class, () -> policy.prepare(event(), request("coupleMonogram", LOGO.replace("true", String.valueOf(enabled))))).getStatus());
            assertEquals(HttpStatus.FORBIDDEN, assertThrows(ApiException.class, () -> policy.prepare(event(), request("illustratedMap", MAP.replace("true", String.valueOf(enabled))))).getStatus());
        }
    }
    @Test void premiumDesignRequiresTheOwnersDistinctFeature() {
        var event = event(); policy.prepare(event, request("coupleMonogram", LOGO)); policy.prepare(event, request("illustratedMap", MAP));
        verify(entitlements).requireFeature(event.getUser(), EntitlementService.Feature.COUPLE_MONOGRAM);
        verify(entitlements).requireFeature(event.getUser(), EntitlementService.Feature.ILLUSTRATED_VENUE_MAP);
    }
    @Test void invalidGeometryUnknownTypesAndOversizedTextFailClosed() {
        for (String invalid : new String[]{MAP.replace("0.5", "99999"), MAP.replace("destination", "script"), MAP.replace("\"Venue\"", "\"" + "x".repeat(151) + "\""), MAP.replace("0.5", "null"), MAP.replace("0.5", "\"NaN\"")})
            assertEquals(HttpStatus.BAD_REQUEST, assertThrows(ApiException.class, () -> policy.prepare(event(), request("illustratedMap", invalid))).getStatus());
        assertThrows(ApiException.class, () -> policy.prepare(event(), request("coupleMonogram", LOGO.replace("#996633", "url(javascript:alert(1))"))));
    }
    @Test void expiredOwnersKeepPrivateDesignButPublicAndPublishAreDenied() {
        var event = event(); event.setId(1L); event.setContentJson(request("coupleMonogram", LOGO).getContentJson());
        doThrow(new ApiException(HttpStatus.FORBIDDEN, "Expired")).when(entitlements).requireFeature(any(), any());
        assertFalse(policy.publicContent(event, event.getContentJson()).contains("coupleMonogram"));
        assertThrows(ApiException.class, () -> policy.validatePublish(event));
        var legacy = new InvitationRequest(); legacy.setContentJson("{}"); legacy.setExpectedUpdatedAt(Instant.now());
        assertTrue(policy.prepare(event, legacy).contains("A & B"));
        var disabled = request("coupleMonogram", LOGO.replace("true", "false")); disabled.setExpectedUpdatedAt(Instant.now());
        assertDoesNotThrow(() -> policy.prepare(event, disabled));
        assertTrue(event.getContentJson().contains("A & B"));
    }
}
