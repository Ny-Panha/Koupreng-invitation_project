package com.koupreng.backend.invitation.application;

import com.koupreng.backend.invitation.api.dto.InvitationRequest;
import com.koupreng.backend.invitation.domain.EventType;
import com.koupreng.backend.invitation.infrastructure.persistence.UserInvitationRepository;
import com.koupreng.backend.user.domain.AppUser;
import com.koupreng.backend.user.infrastructure.persistence.AppUserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.MediaType;
import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:event-drafts;MODE=MySQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa", "spring.datasource.password=",
        "app.auth.first-user-admin-enabled=false",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "spring.jpa.properties.hibernate.boot.allow_jdbc_metadata_access=true"
})
@ActiveProfiles("test")
@Transactional
@AutoConfigureMockMvc
class EventDraftPersistenceTests {
    @Autowired InvitationService service;
    @Autowired AppUserRepository users;
    @Autowired UserInvitationRepository invitations;
    @Autowired MockMvc http;
    @Autowired EntityManager entityManager;
    @Autowired com.koupreng.backend.template.infrastructure.persistence.InvitationTemplateRepository templates;
    private final ObjectMapper json = new ObjectMapper();

    @ParameterizedTest
    @ValueSource(strings = {"khmer-celestial", "silk-heritage"})
    void addressRoundTripsThroughHttpDtoAndDatabaseBeforePublishing(String code) throws Exception {
        String token = register(code + "-address@example.test");
        var template = new com.koupreng.backend.template.domain.InvitationTemplate();
        template.setName(code); template.setCode(code); template.setStatus("ACTIVE");
        template.setPrice(java.math.BigDecimal.ZERO);
        template.setSupportedEventTypes(java.util.Set.of(EventType.WEDDING));
        templates.saveAndFlush(template);
        var body = publishableWedding();
        body.put("templateId", template.getId());
        body.put("venueAddress", "  Street 2004, Phnom Penh  ");
        body.put("designJson", "{\"accent\":\"#123456\"}");
        var created = http.perform(post("/api/v1/invitations").header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON).content(body.toString()))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.data.venueAddress").value("Street 2004, Phnom Penh"))
                .andReturn();
        long id = json.readTree(created.getResponse().getContentAsString()).path("data").path("id").asLong();
        String path = "/api/v1/invitations/" + id;
        body.put("venueAddress", "  Riverside Road, Phnom Penh  ");
        http.perform(put(path).header("Authorization", "Bearer " + token).contentType(MediaType.APPLICATION_JSON).content(body.toString()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.venueAddress").value("Riverside Road, Phnom Penh"));
        entityManager.flush(); entityManager.clear();
        assertEquals("Riverside Road, Phnom Penh", entityManager.createNativeQuery(
                "select venue_address from invitations where invitation_id = :id", String.class).setParameter("id", id).getSingleResult());
        http.perform(get(path).header("Authorization", "Bearer " + token))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.venueAddress").value("Riverside Road, Phnom Penh"))
                .andExpect(jsonPath("$.data.designJson").value("{\"accent\":\"#123456\"}"));
        http.perform(patch(path + "/publish").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.status").value("PUBLISHED"))
                .andExpect(jsonPath("$.data.venueAddress").value("Riverside Road, Phnom Penh"));
        entityManager.flush(); entityManager.clear();
        assertEquals("Riverside Road, Phnom Penh", invitations.findById(id).orElseThrow().getVenueAddress());
    }

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {" \t\n "})
    void emptyCanonicalAddressCannotBePublishedEvenWhenTemplateContentHasAnAddress(String address) throws Exception {
        String token = register("blank-address@example.test");
        var body = publishableWedding();
        body.put("venueAddress", address);
        body.put("contentJson", "{\"venue\":{\"address\":\"Address only in template content\"}}");
        var created = http.perform(post("/api/v1/invitations").header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON).content(body.toString())).andExpect(status().isCreated()).andReturn();
        long id = json.readTree(created.getResponse().getContentAsString()).path("data").path("id").asLong();
        entityManager.flush(); entityManager.clear();
        assertNull(invitations.findById(id).orElseThrow().getVenueAddress());
        http.perform(patch("/api/v1/invitations/" + id + "/publish").header("Authorization", "Bearer " + token))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("venueAddress")));
    }

    private com.fasterxml.jackson.databind.node.ObjectNode publishableWedding() {
        return json.createObjectNode().put("title", "Address persistence wedding").put("eventType", "WEDDING")
                .put("eventDate", "2027-01-12").put("eventTime", "17:30")
                .put("venueName", "Celebration Hall").put("groomName", "Dara").put("brideName", "Sophea");
    }

    @Test
    void realCatalogFiltersCompatibilityAndDoesNotGrantPremiumAccess() throws Exception {
        var template = new com.koupreng.backend.template.domain.InvitationTemplate();
        template.setName("Birthday catalog test"); template.setCode("birthday-catalog-test");
        template.setPrice(java.math.BigDecimal.ZERO);
        template.setSupportedEventTypes(java.util.Set.of(EventType.BIRTHDAY));
        template.setSupportedLanguages(java.util.Set.of("KH"));
        templates.saveAndFlush(template);
        http.perform(get("/api/v1/templates/recommendations").param("eventType", "BIRTHDAY"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data[0].template.code").value(template.getCode()));
        http.perform(get("/api/v1/templates/recommendations").param("eventType", "CORPORATE"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.length()").value(0));
        http.perform(get("/api/v1/templates/recommendations").param("eventType", "invalid"))
                .andExpect(status().isBadRequest());
        String token = register("catalog-owner@example.test");
        http.perform(post("/api/v1/invitations").header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON).content("{\"title\":\"Incompatible\",\"eventType\":\"WEDDING\",\"templateId\":" + template.getId() + "}"))
                .andExpect(status().isBadRequest());
        template.setPremium(true); template.setPrice(java.math.BigDecimal.TEN);
        templates.saveAndFlush(template);
        http.perform(post("/api/v1/invitations").header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON).content("{\"title\":\"Premium\",\"eventType\":\"BIRTHDAY\",\"templateId\":" + template.getId() + "}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void realRegistrationLoginAndTwoEventsEnforceObjectAndChildIsolation() throws Exception {
        String token = register("journey-owner@example.test");
        String otherToken = register("journey-other@example.test");
        http.perform(get("/api/v1/invitations/my").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.length()").value(0));
        http.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"identifier\":\"journey-owner@example.test\",\"password\":\"Wrongpass123\"}"))
                .andExpect(status().isUnauthorized());
        http.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"identifier\":\"journey-owner@example.test\",\"password\":\"JourneyPass123\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.user.role").value("USER"));
        long first = createOverHttp(token, "Wedding A", "WEDDING");
        long second = createOverHttp(token, "Birthday B", "BIRTHDAY");
        String firstPath = "/api/v1/invitations/" + first;
        String secondPath = "/api/v1/invitations/" + second;
        var guest = http.perform(post(firstPath + "/guests").header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON).content("{\"guestName\":\"Only A\",\"seatCount\":1}"))
                .andExpect(status().isCreated()).andReturn();
        long guestId = json.readTree(guest.getResponse().getContentAsString()).path("data").path("id").asLong();
        http.perform(get(secondPath + "/guests").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.length()").value(0));
        http.perform(post(secondPath + "/gifts").header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"Cross-event\",\"amount\":10,\"currency\":\"USD\",\"guestId\":" + guestId + "}"))
                .andExpect(status().isNotFound());
        http.perform(post(firstPath + "/gifts").header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"Only A\",\"amount\":10,\"currency\":\"USD\",\"guestId\":" + guestId + "}"))
                .andExpect(status().isCreated());
        http.perform(get(secondPath + "/gifts").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.length()").value(0));
        for (String suffix : new String[]{"", "/guests", "/gifts", "/rsvps", "/budget", "/media", "/dashboard",
                "/check-in/summary", "/seating", "/delivery/events", "/wishes"}) {
            http.perform(get(firstPath + suffix).header("Authorization", "Bearer " + otherToken))
                    .andExpect(status().isForbidden());
            http.perform(get(firstPath + suffix)).andExpect(status().isUnauthorized());
        }
        http.perform(get(firstPath + "/guests").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data[0].guestName").value("Only A"));
        http.perform(post("/api/v1/auth/logout").header("Authorization", "Bearer " + token)).andExpect(status().isOk());
        http.perform(get(firstPath).header("Authorization", "Bearer " + token)).andExpect(status().isUnauthorized());
    }

    @Test
    void partialDraftNeedsOnlyTitleAndReusesItsRequestIdentity() throws Exception {
        String token = register("partial-draft@example.test");
        String payload = "{\"title\":\"Details later\",\"eventType\":\"BIRTHDAY\",\"visibility\":\"PRIVATE\",\"clientRequestId\":\"" + UUID.randomUUID() + "\"}";
        var first = http.perform(post("/api/v1/invitations").header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON).content(payload))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.data.title").value("Details later"))
                .andExpect(jsonPath("$.data.status").value("DRAFT"))
                .andExpect(jsonPath("$.data.eventDate").doesNotExist()).andReturn();
        long id = json.readTree(first.getResponse().getContentAsString()).path("data").path("id").asLong();
        http.perform(post("/api/v1/invitations").header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON).content(payload))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.data.id").value(id));
        http.perform(post("/api/v1/invitations").header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON).content("{\"eventType\":\"BIRTHDAY\"}"))
                .andExpect(status().isBadRequest());
    }

    private String register(String email) throws Exception {
        var result = http.perform(post("/api/v1/auth/register")
                .with(request -> { request.setRemoteAddr("127.0.1." + (Math.floorMod(email.hashCode(), 200) + 1)); return request; })
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"fullName\":\"Journey owner\",\"email\":\"" + email + "\",\"password\":\"JourneyPass123\"}"))
                .andExpect(status().isOk()).andReturn();
        return json.readTree(result.getResponse().getContentAsString()).path("accessToken").asText();
    }

    @Test
    void guestFieldsRoundTripThroughHttpAndJpaWithoutLosingIdentityOrOptionalData() throws Exception {
        String token = register("phase4-guest@example.test");
        long eventId = createOverHttp(token, "Phase 4 guest contract", "WEDDING");
        long otherEvent = createOverHttp(token, "Isolated event", "BIRTHDAY");
        String base = "/api/v1/invitations/" + eventId + "/guests";
        var body = json.createObjectNode().put("guestName", "Contract Guest").put("phone", "012345678")
                .put("email", "guest@example.test").put("companionName", "Companion")
                .put("guestGroup", "Bride Side").put("sideType", "Family").put("seatCount", 3)
                .put("note", "Preserve note").put("sendStatus", "PENDING").put("contributionStatus", "NONE")
                .put("totalContributed", 0);
        var created = http.perform(post(base).header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content(body.toString()))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.data.phone").value("012345678")).andReturn();
        var guest = json.readTree(created.getResponse().getContentAsString()).path("data");
        long guestId = guest.path("id").asLong();
        String inviteToken = guest.path("inviteToken").asText();
        entityManager.flush(); entityManager.clear();
        http.perform(get(base + "/" + guestId).header("Authorization", "Bearer " + token))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.email").value("guest@example.test"))
                .andExpect(jsonPath("$.data.seatCount").value(3)).andExpect(jsonPath("$.data.guestGroup").value("Bride Side"));
        body.put("phone", "+855 98 765 432").put("guestGroup", "Groom Side").put("seatCount", 4);
        http.perform(put(base + "/" + guestId).header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content(body.toString()))
                .andExpect(status().isOk());
        entityManager.flush(); entityManager.clear();
        http.perform(get(base + "/" + guestId).header("Authorization", "Bearer " + token))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.phone").value("+855 98 765 432"))
                .andExpect(jsonPath("$.data.seatCount").value(4)).andExpect(jsonPath("$.data.guestGroup").value("Groom Side"))
                .andExpect(jsonPath("$.data.sideType").value("Family")).andExpect(jsonPath("$.data.email").value("guest@example.test"))
                .andExpect(jsonPath("$.data.note").value("Preserve note")).andExpect(jsonPath("$.data.companionName").value("Companion"))
                .andExpect(jsonPath("$.data.inviteToken").value(inviteToken));
        http.perform(put("/api/v1/invitations/" + otherEvent + "/guests/" + guestId)
                        .header("Authorization", "Bearer " + token).contentType(MediaType.APPLICATION_JSON).content(body.toString()))
                .andExpect(status().isNotFound());
    }

    @Test
    void seatingCapacityMovesDeletionAndCrossEventIsolationUseRealPersistence() throws Exception {
        String token = register("phase4-seating@example.test");
        long eventId = createOverHttp(token, "Seating persistence", "WEDDING");
        long otherEvent = createOverHttp(token, "Other seating event", "WEDDING");
        String base = "/api/v1/invitations/" + eventId;
        var guestResult = http.perform(post(base + "/guests").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"guestName\":\"Seating party\",\"seatCount\":3}"))
                .andExpect(status().isCreated()).andReturn();
        long guestId = json.readTree(guestResult.getResponse().getContentAsString()).path("data").path("id").asLong();
        long[] tables = new long[2];
        for (int index = 0; index < tables.length; index++) {
            var result = http.perform(post(base + "/seating/tables").header("Authorization", "Bearer " + token)
                            .contentType(MediaType.APPLICATION_JSON).content("{\"tableName\":\"Table " + index + "\",\"capacity\":3}"))
                    .andExpect(status().isOk()).andReturn();
            tables[index] = json.readTree(result.getResponse().getContentAsString()).path("data").path("id").asLong();
        }
        var assignment = json.createObjectNode().put("guestId", guestId).put("tableId", tables[0]).put("seatCount", 3);
        var assigned = http.perform(post(base + "/seating/assignments").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content(assignment.toString()))
                .andExpect(status().isOk()).andReturn();
        long assignmentId = json.readTree(assigned.getResponse().getContentAsString()).path("data").path("id").asLong();
        entityManager.flush(); entityManager.clear();
        http.perform(get(base + "/seating/summary").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.assignedSeats").value(3));
        assignment.put("seatCount", 4);
        http.perform(post(base + "/seating/assignments").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content(assignment.toString()))
                .andExpect(status().isConflict());
        assignment.put("seatCount", 3).put("tableId", tables[1]);
        http.perform(post(base + "/seating/assignments").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content(assignment.toString()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.id").value(assignmentId));
        entityManager.flush(); entityManager.clear();
        http.perform(get(base + "/seating").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.assignments.length()").value(1))
                .andExpect(jsonPath("$.data.assignments[0].tableId").value(tables[1]));
        http.perform(delete(base + "/seating/tables/" + tables[1]).header("Authorization", "Bearer " + token))
                .andExpect(status().isConflict());
        http.perform(post("/api/v1/invitations/" + otherEvent + "/seating/assignments").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content(assignment.toString()))
                .andExpect(status().isNotFound());
        http.perform(delete(base + "/seating/assignments/" + assignmentId).header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
        http.perform(delete(base + "/seating/tables/" + tables[1]).header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
        entityManager.flush(); entityManager.clear();
        http.perform(get(base + "/seating").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.unassignedGuests[0].id").value(guestId))
                .andExpect(jsonPath("$.data.assignments.length()").value(0));
    }

    private long createOverHttp(String token, String title, String type) throws Exception {
        var result = http.perform(post("/api/v1/invitations").header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON).content("{\"title\":\"" + title + "\",\"eventType\":\"" + type + "\"}"))
                .andExpect(status().isCreated()).andReturn();
        return json.readTree(result.getResponse().getContentAsString()).path("data").path("id").asLong();
    }

    @Test
    void retryReturnsSameRealDraftAndAnotherOwnerCannotReadIt() {
        var owner = user("draft-owner@example.test");
        var other = user("draft-other@example.test");
        var authentication = new UsernamePasswordAuthenticationToken(owner.getId().toString(), null, List.of());
        var request = new InvitationRequest();
        request.setTitle("Birthday event");
        request.setEventType(EventType.BIRTHDAY);
        request.setClientRequestId(UUID.randomUUID().toString());
        var first = service.create(authentication, request);
        var retry = service.create(authentication, request);
        assertEquals(first.getId(), retry.getId());
        assertEquals(1, invitations.countByUserIdAndDeletedFalse(owner.getId()));
        assertThrows(com.koupreng.backend.shared.exception.ApiException.class,
                () -> service.get(new UsernamePasswordAuthenticationToken(other.getId().toString(), null, List.of()), first.getId()));
        request.setClientRequestId(UUID.randomUUID().toString());
        assertNotEquals(first.getId(), service.create(authentication, request).getId());
        assertEquals(2, invitations.countByUserIdAndDeletedFalse(owner.getId()));
    }

    private AppUser user(String email) {
        var user = new AppUser();
        user.setEmail(email);
        user.setFullName("Draft owner");
        user.setPasswordHash("unused-test-hash");
        return users.saveAndFlush(user);
    }
}
