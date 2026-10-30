package com.koupreng.backend.phase7;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.koupreng.backend.organization.infrastructure.persistence.OrganizationMemberRepository;
import com.koupreng.backend.subscription.application.PackageSnapshot;
import com.koupreng.backend.subscription.domain.Subscription;
import com.koupreng.backend.subscription.domain.SubscriptionPackage;
import com.koupreng.backend.subscription.infrastructure.persistence.SubscriptionPackageRepository;
import com.koupreng.backend.subscription.infrastructure.persistence.SubscriptionRepository;
import com.koupreng.backend.user.infrastructure.persistence.AppUserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import java.math.BigDecimal;
import java.net.URI;
import java.net.http.*;
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import static org.junit.jupiter.api.Assertions.*;

/** Real HTTP/JWT/JPA/MySQL tests, deliberately restricted to the owned Phase 7 database. */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "app.dev-sample-data.enabled=false", "app.auth.first-user-admin-enabled=false",
        "app.auth.max-register-attempts-per-minute=1000", "app.waf.max-requests-per-minute=10000",
        "app.security.logging.enabled=false"
})
@ActiveProfiles("test")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@EnabledIfEnvironmentVariable(named = "RUN_PHASE7_MYSQL", matches = "true")
class Phase7CollaborationMySqlTests {
    @LocalServerPort int port;
    @Autowired ObjectMapper json;
    @Autowired AppUserRepository users;
    @Autowired SubscriptionPackageRepository packages;
    @Autowired SubscriptionRepository subscriptions;
    @Autowired OrganizationMemberRepository members;
    @Autowired org.springframework.jdbc.core.JdbcTemplate jdbc;
    @Autowired com.koupreng.backend.template.infrastructure.persistence.InvitationTemplateRepository templates;
    @Autowired com.koupreng.backend.payment.infrastructure.persistence.UserTemplateAccessRepository purchases;
    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();

    @DynamicPropertySource static void database(DynamicPropertyRegistry registry) {
        String url = required("FLYWAY_TEST_DB_URL");
        boolean ownedStudio = url.matches("jdbc:mysql://127\\.0\\.0\\.1:3306/koupreng_studio_[a-f0-9]{32}\\?.*");
        if (!url.startsWith("jdbc:mysql://127.0.0.1:3416/phase7_disposable?") && !url.startsWith("jdbc:mysql://127.0.0.1:3420/phase12_disposable?") && !ownedStudio) throw new IllegalStateException("Requires an owned loopback disposable database");
        registry.add("spring.datasource.url", () -> url);
        registry.add("spring.datasource.username", () -> required("FLYWAY_TEST_DB_USERNAME"));
        registry.add("spring.datasource.password", () -> required("FLYWAY_TEST_DB_PASSWORD"));
        registry.add("spring.datasource.driver-class-name", () -> "com.mysql.cj.jdbc.Driver");
        registry.add("spring.flyway.enabled", () -> true);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "validate");
        registry.add("spring.jpa.database-platform", () -> "org.hibernate.dialect.MySQLDialect");
        registry.add("spring.jpa.properties.hibernate.dialect", () -> "org.hibernate.dialect.MySQLDialect");
        registry.add("spring.jpa.properties.hibernate.boot.allow_jdbc_metadata_access", () -> true);
    }

    @BeforeAll void reviewedProductPolicy() throws Exception {
        String file = System.getenv("STUDIO_PACKAGE_CONFIG");
        if (file == null || file.isBlank()) return;
        for (JsonNode node : json.readTree(java.nio.file.Path.of(file).toFile())) {
            String code = node.path("code").asText();
            if (!Set.of("FREE", "BASIC", "PRO", "PREMIUM").contains(code)) throw new IllegalStateException("Unexpected reviewed policy code");
            var plan = packages.findAll().stream().filter(p -> code.equals(p.getCode())).findFirst().orElseGet(SubscriptionPackage::new);
            json.readerForUpdating(plan).readValue(node.toString());
            packages.saveAndFlush(plan);
        }
    }

    @Test void registrationGetsTheConfiguredFreePlanWithoutCheckout() throws Exception {
        Auth user = register();
        Reply response = call("GET", "/api/v1/me/entitlements", user, null);
        assertEquals(200, response.status);
        assertEquals("CONFIGURED_FREE_PACKAGE", response.data().path("source").asText());
        assertEquals("FREE", response.data().path("packagePlan").path("code").asText());
    }

    @Test void publicPackagePolicyMatchesCurrentCatalogWithoutGrantingAdminAuthority() throws Exception {
        Reply catalog = call("GET", "/api/v1/public/packages", null, null);
        assertEquals(200, catalog.status);
        assertTrue(catalog.data().isArray());
        var observed = json.createArrayNode();
        for (String code : List.of("FREE", "BASIC", "PRO", "PREMIUM")) {
            var plan = packages.findAll().stream().filter(value -> code.equals(value.getCode())).findFirst().orElseThrow();
            JsonNode offer = null;
            for (JsonNode candidate : catalog.data()) if (code.equals(candidate.path("code").asText())) offer = candidate;
            assertNotNull(offer, "Public catalog is missing " + code);
            for (String field : List.of("price", "currency", "maxInvitations", "maxGuests", "maxGuestsPerInvitation", "qrInvitationsEnabled", "qrCheckInEnabled")) {
                assertTrue(offer.hasNonNull(field), code + " is missing " + field);
            }
            assertTrue(offer.path("price").isNumber(), "Price must be an explicit numeric server value");
            assertEquals(0, plan.getPrice().compareTo(offer.path("price").decimalValue()));
            assertEquals(plan.getCurrency(), offer.path("currency").asText());
            assertEquals(plan.getMaxInvitations().intValue(), offer.path("maxInvitations").asInt());
            assertEquals(plan.getMaxGuests().intValue(), offer.path("maxGuests").asInt());
            assertEquals(plan.getMaxGuestsPerInvitation().intValue(), offer.path("maxGuestsPerInvitation").asInt());
            assertEquals(plan.isQrInvitationsEnabled(), offer.path("qrInvitationsEnabled").asBoolean());
            assertEquals(plan.isQrCheckInEnabled(), offer.path("qrCheckInEnabled").asBoolean());
            observed.add(offer);
        }
        Auth user = register();
        assertEquals("USER", users.findById(user.id).orElseThrow().getRole().name());
        assertEquals(403, call("GET", "/api/v1/admin/packages", user, null).status);
        assertEquals(200, call("GET", "/api/v1/me/entitlements", user, null).status);
        java.nio.file.Files.writeString(java.nio.file.Path.of("target/package-policy.json"), json.writerWithDefaultPrettyPrinter().writeValueAsString(observed));
    }

    @Test void acceptanceIsExplicitRecipientBoundOneTimeAndRemovalRevokesAccess() throws Exception {
        Fixture f = fixture(3);
        assertEquals(403, call("GET", eventPath(f), f.member, null).status);
        Reply invite = invite(f, f.member.email, "DESIGNER"); assertEquals(201, invite.status);
        long memberId = invite.data().path("id").asLong(); String token = invite.data().path("invitationToken").asText();
        assertEquals("INVITED", invite.data().path("status").asText());
        assertNotNull(members.findById(memberId).orElseThrow().getInviteTokenHash());
        assertFalse(token.equals(members.findById(memberId).orElseThrow().getInviteTokenHash()));
        assertEquals(403, call("GET", eventPath(f), f.member, null).status);
        assertEquals(404, accept(f.stranger, token).status);
        assertEquals(200, accept(f.member, token).status);
        assertEquals(404, accept(f.member, token).status);
        assertEquals(200, call("GET", eventPath(f), f.member, null).status);
        assertTrue(containsEvent(call("GET", "/api/v1/invitations/my", f.member, null).data(), f.eventId));
        assertEquals(403, call("POST", eventPath(f) + "/guests", f.member, Map.of("guestName", "Forbidden guest")).status);
        assertEquals(403, call("PATCH", eventPath(f) + "/publish", f.member, null).status);
        Reply listing = call("GET", "/api/v1/organizations/" + f.orgId, f.owner, null);
        for (JsonNode member : listing.data().path("members")) {
            assertTrue(member.path("invitationToken").isMissingNode() || member.path("invitationToken").isNull());
            assertFalse(member.has("inviteTokenHash"));
        }
        assertEquals(200, call("DELETE", "/api/v1/organizations/" + f.orgId + "/members/" + memberId, f.owner, null).status);
        assertEquals(403, call("GET", eventPath(f), f.member, null).status);
        assertFalse(containsEvent(call("GET", "/api/v1/invitations/my", f.member, null).data(), f.eventId));
        assertEquals(200, call("GET", eventPath(f), f.owner, null).status);
    }

    @Test void concurrentCollaborativeSavesHaveOneWinnerAndPreserveTheTeam() throws Exception {
        Fixture f = fixture(3); Reply invited = invite(f, f.member.email, "DESIGNER");
        assertEquals(200, accept(f.member, invited.data().path("invitationToken").asText()).status);
        var saved = call("GET", eventPath(f), f.member, null).data();
        Map<String,Object> first = eventBody("Concurrent A", saved.path("updatedAt").asText());
        Map<String,Object> second = eventBody("Concurrent B", saved.path("updatedAt").asText());
        var results = race(() -> call("PUT", eventPath(f), f.member, first), () -> call("PUT", eventPath(f), f.member, second));
        assertEquals(List.of(200, 409), results.stream().map(Reply::status).sorted().toList(),
                () -> "Expected revision " + saved.path("updatedAt").asText() + "; returned revisions " + results.stream().map(reply -> reply.data().path("updatedAt").asText()).toList());
        Reply latest = call("GET", eventPath(f), f.owner, null);
        assertEquals(f.orgId, latest.data().path("organizationId").asLong());
        assertEquals(409, call("PUT", eventPath(f), f.member, first).status);
        var changeAccess = eventBody("Untrusted access change", latest.data().path("updatedAt").asText());
        changeAccess.put("visibility", "PUBLIC");
        assertEquals(403, call("PUT", eventPath(f), f.member, changeAccess).status);
    }

    @Test void concurrentInvitationsCannotExceedOwnerCapacity() throws Exception {
        Fixture f = fixture(2); // Owner consumes one place; exactly one invitation fits.
        var results = race(() -> invite(f, f.member.email, "VIEWER"), () -> invite(f, f.stranger.email, "VIEWER"));
        assertEquals(List.of(201, 403), results.stream().map(Reply::status).sorted().toList());
        assertEquals(2, members.countByOrganizationOwnerIdAndStatusIn(f.owner.id, List.of("ACTIVE", "INVITED")));
    }

    @Test void guestWritesUseOwnerQuotaAndRoleChangesTakeEffectOnTheNextRequest() throws Exception {
        Fixture f = fixture(3); Reply invited = invite(f, f.member.email, "MANAGER");
        assertEquals(200, accept(f.member, invited.data().path("invitationToken").asText()).status);
        assertEquals(200, call("GET", "/api/v1/me/entitlements", f.member, null).status);
        assertEquals(201, call("POST", eventPath(f) + "/guests", f.member, Map.of("guestName", "Owner quota guest")).status);
        assertEquals(403, call("POST", eventPath(f) + "/guests", f.member, Map.of("guestName", "Over owner quota")).status);
        assertEquals(200, call("PATCH", "/api/v1/organizations/" + f.orgId + "/members/" + invited.data().path("id").asLong() + "/role", f.owner, Map.of("role", "VIEWER")).status);
        assertEquals(403, call("GET", eventPath(f) + "/guests", f.member, null).status);
        assertEquals(200, call("GET", eventPath(f), f.member, null).status);
    }

    @Test void expiredInvitationAndExpiredOwnerGrantCannotBeUsed() throws Exception {
        Fixture f = fixture(3); Reply invited = invite(f, f.member.email, "VIEWER");
        var member = members.findById(invited.data().path("id").asLong()).orElseThrow();
        member.setInviteExpiresAt(Instant.now().minusSeconds(10)); members.saveAndFlush(member);
        assertEquals(404, accept(f.member, invited.data().path("invitationToken").asText()).status);
        Reply reissued = invite(f, f.member.email, "VIEWER");
        assertEquals(200, accept(f.member, reissued.data().path("invitationToken").asText()).status);
        var grant = subscriptions.findById(f.grantId).orElseThrow(); grant.setEndDate(Instant.now().minusSeconds(10)); subscriptions.saveAndFlush(grant);
        assertEquals(403, call("GET", eventPath(f), f.member, null).status);
        assertEquals(200, call("GET", eventPath(f), f.owner, null).status);
        assertEquals(200, call("DELETE", "/api/v1/organizations/" + f.orgId + "/members/" + member.getId(), f.owner, null).status);
    }

    @Test void checkInStaffUseBoundedRosterWithoutGuestContactsOrSecrets() throws Exception {
        Fixture f = fixture(3);
        var guest = call("POST", eventPath(f) + "/guests", f.owner, Map.of("guestName", "Roster guest", "email", "private-contact@example.test", "phone", "012345678"));
        assertEquals(201, guest.status);
        Reply invitation = invite(f, f.member.email, "CHECK_IN_STAFF");
        assertEquals(200, accept(f.member, invitation.data().path("invitationToken").asText()).status);
        assertEquals(403, call("GET", eventPath(f) + "/guests", f.member, null).status);
        Reply roster = call("GET", eventPath(f) + "/check-in/roster?size=1&search=Roster&status=PENDING", f.member, null);
        assertEquals(200, roster.status);
        assertEquals(1, roster.data().path("items").size());
        JsonNode row = roster.data().path("items").get(0);
        for (String secret : List.of("email", "phone", "inviteToken", "qrCodeUrl", "note")) assertFalse(row.has(secret));
        assertEquals(400, call("GET", eventPath(f) + "/check-in/roster?size=101", f.member, null).status);
        assertEquals(200, call("POST", eventPath(f) + "/guests/" + guest.data().path("id").asLong() + "/check-in", f.member, Map.of()).status);
        Reply pending = call("GET", eventPath(f) + "/check-in/roster?status=PENDING", f.member, null);
        assertEquals(200, pending.status);
        assertEquals(0, pending.data().path("totalElements").asLong());
    }

    @Test void legacyActiveMembershipNeedsNewConsentBeforeGainingEventTools() throws Exception {
        Fixture f = fixture(3);
        Reply invitation = invite(f, f.member.email, "MANAGER");
        assertEquals(200, accept(f.member, invitation.data().path("invitationToken").asText()).status);
        var member = members.findById(invitation.data().path("id").asLong()).orElseThrow();
        member.setInviteAcceptedAt(null); members.saveAndFlush(member);
        assertEquals(200, call("GET", "/api/v1/organizations/" + f.orgId, f.member, null).status);
        assertEquals(403, call("GET", eventPath(f), f.member, null).status);
        Reply reissued = invite(f, f.member.email, "MANAGER"); assertEquals(201, reissued.status);
        assertEquals(200, accept(f.member, reissued.data().path("invitationToken").asText()).status);
        assertEquals(200, call("GET", eventPath(f), f.member, null).status);
    }

    @Test void managerGuestEditsCannotReadClearOrSetOwnerContributionFields() throws Exception {
        Fixture f = fixture(3);
        Reply guest = call("POST", eventPath(f) + "/guests", f.owner, Map.of("guestName", "Contribution fixture", "totalContributed", 25, "contributionStatus", "RECORDED"));
        assertEquals(201, guest.status);
        Reply invitation = invite(f, f.member.email, "MANAGER");
        assertEquals(200, accept(f.member, invitation.data().path("invitationToken").asText()).status);
        String path = eventPath(f) + "/guests/" + guest.data().path("id").asLong();
        Reply read = call("GET", path, f.member, null); assertEquals(200, read.status);
        assertTrue(read.data().path("totalContributed").isNull());
        assertTrue(read.data().path("contributionStatus").isNull());
        assertEquals(200, call("PUT", path, f.member, Map.of("guestName", "Edited operational name")).status);
        Reply ownerView = call("GET", path, f.owner, null); assertEquals(200, ownerView.status);
        assertEquals(25, ownerView.data().path("totalContributed").decimalValue().intValueExact());
        assertEquals(403, call("PUT", path, f.member, Map.of("guestName", "Forged contribution", "totalContributed", 99)).status);
    }

    @Test void guestOverviewPagesAndSelectionExportReconcileWithoutContactLeaks() throws Exception {
        Fixture f = fixture(3,10);
        List<Reply> records = new ArrayList<>();
        for (int i=0;i<4;i++) {
            Reply guest = call("POST", eventPath(f)+"/guests", f.owner, Map.of("guestName", i==0?"=1+1":"Fixture guest "+i,
                    "seatCount", List.of(2,3,1,4).get(i), "phone", "01234000"+i, "email", "private"+i+"@example.test", "guestGroup", "Family"));
            assertEquals(201, guest.status); records.add(guest);
        }
        Reply published=call("PATCH",eventPath(f)+"/publish",f.owner,null); assertEquals(200,published.status);
        String slug=published.data().path("slug").asText();
        for (int i=0;i<3;i++) {
            Reply rsvp=call("POST","/api/v1/public/invitations/"+slug+"/guests/"+records.get(i).data().path("inviteToken").asText()+"/rsvp",null,
                    Map.of("responseStatus",List.of("ATTENDING","NOT_ATTENDING","MAYBE").get(i),"attendeeCount",List.of(2,0,1).get(i)));
            assertEquals(201,rsvp.status);
        }
        assertEquals(200,call("POST",eventPath(f)+"/guests/"+records.getFirst().data().path("id").asLong()+"/check-in",f.owner,Map.of()).status);
        Reply overview=call("GET",eventPath(f)+"/guests/overview",f.owner,null); assertEquals(200,overview.status);
        for(var expected:Map.of("guestRecords",4,"reservedSeats",10,"attendingRecords",1,"declinedRecords",1,"maybeRecords",1,"unansweredRecords",1,"respondedRecords",3,"checkedInRecords",1,"confirmedAttendees",2).entrySet()) {
            assertEquals(expected.getValue().intValue(),overview.data().path(expected.getKey()).asInt(),expected.getKey());
        }
        Reply page=call("GET",eventPath(f)+"/guests/page?size=2&page=0",f.owner,null); assertEquals(200,page.status);
        assertEquals(2,page.data().path("items").size()); assertEquals(4,page.data().path("totalElements").asInt());
        assertEquals(records.getLast().data().path("id").asLong(),page.data().path("items").get(0).path("guest").path("id").asLong());
        assertEquals(3,jdbc.queryForObject("SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema=DATABASE() AND table_name='guests' AND index_name='idx_guests_invitation_created_id'",Integer.class));
        Reply declined=call("GET",eventPath(f)+"/guests/page?status=declined",f.owner,null); assertEquals(200,declined.status);
        assertEquals(1,declined.data().path("totalElements").asInt());
        assertEquals("NOT_ATTENDING",declined.data().path("items").get(0).path("rsvpStatus").asText());
        assertEquals(400,call("GET",eventPath(f)+"/guests/page?size=101",f.owner,null).status);
        assertEquals(403,call("GET",eventPath(f)+"/guests/overview",f.stranger,null).status);
        List<Long> ids=records.subList(0,2).stream().map(row->row.data().path("id").asLong()).toList();
        Reply csv=call("POST",eventPath(f)+"/guests/export-selection",f.owner,Map.of("guestIds",ids)); assertEquals(200,csv.status);
        assertTrue(csv.body.contains("'=1+1")); assertFalse(csv.body.contains("private0@example.test")); assertFalse(csv.body.contains("012340000"));
        assertFalse(csv.body.contains(records.getFirst().data().path("inviteToken").asText()));
        assertEquals(404,call("POST",eventPath(f)+"/guests/export-selection",f.owner,Map.of("guestIds",List.of(ids.getFirst(),Long.MAX_VALUE))).status);
        assertEquals(400,call("POST",eventPath(f)+"/guests/export-selection",f.owner,Map.of("guestIds",List.of(ids.getFirst(),ids.getFirst()))).status);
    }

    @Test void analyticsUseOwnerEntitlementAndBoundedCambodianDatesWithCurrentRecordFacts() throws Exception {
        Fixture f=fixture(3,10);
        List<Long> ids=new ArrayList<>(); List<String> tokens=new ArrayList<>();
        for(int i=0;i<4;i++) {
            Reply guest=call("POST",eventPath(f)+"/guests",f.owner,Map.of("guestName","Analytics fixture "+i,"seatCount",2));
            assertEquals(201,guest.status); ids.add(guest.data().path("id").asLong()); tokens.add(guest.data().path("inviteToken").asText());
        }
        Reply published=call("PATCH",eventPath(f)+"/publish",f.owner,null); assertEquals(200,published.status);
        for(int i=0;i<3;i++) {
            assertEquals(201,call("POST","/api/v1/public/invitations/"+published.data().path("slug").asText()+"/guests/"+tokens.get(i)+"/rsvp",null,
                    Map.of("responseStatus",List.of("ATTENDING","NOT_ATTENDING","MAYBE").get(i),"attendeeCount",i==0?2:0)).status);
        }
        for(int i=0;i<2;i++) assertEquals(200,call("POST",eventPath(f)+"/guests/"+ids.get(i)+"/check-in",f.owner,Map.of()).status);
        // UTC+07 midnight is 17:00Z on the preceding day. Test both inclusive start and exclusive end.
        List<String> times=List.of("2026-10-22 16:59:59","2026-10-22 17:00:00","2026-10-23 16:59:59","2026-10-23 17:00:00");
        for(int i=0;i<4;i++) jdbc.update("UPDATE guests SET created_at=? WHERE guest_id=?",times.get(i),ids.get(i));
        for(int i=0;i<3;i++) jdbc.update("UPDATE rsvps SET responded_at=? WHERE guest_id=?",times.get(i+1),ids.get(i));
        jdbc.update("UPDATE guest_check_ins SET checked_in_at=? WHERE guest_id=?",times.get(1),ids.get(0));
        jdbc.update("UPDATE guest_check_ins SET checked_in_at=? WHERE guest_id=?",times.get(3),ids.get(1));
        String path=eventPath(f)+"/analytics?from=2026-10-23&to=2026-10-23";
        Reply report=call("GET",path,f.owner,null); assertEquals(200,report.status);
        assertEquals("Asia/Phnom_Penh",report.data().path("timezone").asText());
        assertEquals(4,report.data().path("current").path("guestRecords").asInt());
        assertEquals(8,report.data().path("current").path("reservedSeats").asInt());
        var day=report.data().path("days").get(0);
        assertEquals(2,day.path("guestRecordsCreated").asInt()); assertEquals(2,day.path("latestRsvpRecords").asInt());
        assertEquals(1,day.path("attendingRecords").asInt()); assertEquals(1,day.path("declinedRecords").asInt());
        assertEquals(0,day.path("maybeRecords").asInt()); assertEquals(1,day.path("activeCheckInRecords").asInt());
        assertEquals(403,call("GET",path,f.stranger,null).status);
        assertEquals(400,call("GET",eventPath(f)+"/analytics?from=2025-01-01&to=2026-10-23",f.owner,null).status);
        assertEquals(400,call("GET",eventPath(f)+"/analytics?from=2026-10-24&to=2026-10-23",f.owner,null).status);
        Reply invitation=invite(f,f.member.email,"VIEWER"); assertEquals(200,accept(f.member,invitation.data().path("invitationToken").asText()).status);
        assertEquals(200,call("GET",path,f.member,null).status); // Personal Free plan does not replace the owner's eligible plan.
        assertEquals(403,call("GET",eventPath(f)+"/guests/page",f.member,null).status);
        assertEquals(200,call("DELETE","/api/v1/organizations/"+f.orgId+"/members/"+invitation.data().path("id").asLong(),f.owner,null).status);
        assertEquals(403,call("GET",path,f.member,null).status);
        var grant=subscriptions.findById(f.grantId).orElseThrow(); grant.setEndDate(Instant.now().minusSeconds(1)); subscriptions.saveAndFlush(grant);
        assertEquals(403,call("GET",path,f.owner,null).status);
    }

    @Test void phase8ProgramRoundTripsThroughHttpMySqlAndPublicationWithConflictAndIdorProtection() throws Exception {
        Fixture f = fixture(3);
        var content = json.readTree("""
            {"programDays":[{"id":"d1","date":"2028-02-29","title":"ពិធីដំបូង"},{"id":"d2"},{"id":"d3"}],
             "schedule":[{"id":"one","dayId":"d1","day":1,"time":"07:00","title":"ពិធីមង្គលការ","extension":"preserved"},
                         {"id":"two","dayId":"d3","day":3,"time":"17:00","titleEn":"Reception","enabled":false}],
             "eventDate":"2027-01-10","eventTime":"17:30","eventTimezone":"America/New_York",
             "calendarUid":"public-event-id","saveTheDate":{"enabled":true,"showCalendar":true,"showAddToCalendar":true}}
            """);
        var current = call("GET", eventPath(f), f.owner, null);
        var body = eventBody("Phase 8 persistence fixture", current.data().path("updatedAt").asText());
        body.put("contentJson", json.writeValueAsString(content));
        body.put("visibility", "PUBLIC");
        assertEquals(200, call("PUT", eventPath(f), f.owner, body).status);
        assertEquals(409, call("PUT", eventPath(f), f.owner, body).status);
        assertEquals(403, call("PUT", eventPath(f), f.stranger, body).status);
        var loaded = call("GET", eventPath(f), f.owner, null);
        assertEquals(content, json.readTree(loaded.data().path("contentJson").asText()));
        assertEquals(200, call("PATCH", eventPath(f) + "/publish", f.owner, null).status);
        var published = call("GET", "/api/v1/public/invitations/" + loaded.data().path("slug").asText(), null, null);
        assertEquals(200, published.status);
        assertEquals(content, json.readTree(published.data().path("contentJson").asText()));
        assertEquals(1, jdbc.queryForObject("SELECT COUNT(*) FROM invitations WHERE invitation_id=? AND content_json LIKE '%preserved%'", Integer.class, f.eventId));
        Reply invited = invite(f, f.member.email, "VIEWER");
        assertEquals(200, accept(f.member, invited.data().path("invitationToken").asText()).status);
        var latest = call("GET", eventPath(f), f.owner, null);
        body.put("expectedUpdatedAt", latest.data().path("updatedAt").asText());
        assertEquals(403, call("PUT", eventPath(f), f.member, body).status);
    }

    @Test void phase11IndependentLocalesPreserveIdentityAndRejectStaleLegacyWrites() throws Exception {
        Fixture f = fixture(3);
        var values = Map.of("title", "Fictional event", "messageText", "Authored invitation", "groomName", "Host A", "brideName", "Host B", "venueName", "Venue", "venueAddress", "Address");
        var localized = new HashMap<String,Object>(); localized.put("version", 1); localized.put("km", values); localized.put("en", values); localized.put("enabledLocales", List.of("km")); localized.put("defaultLocale", "km");
        var content = new HashMap<String,Object>(values); content.put("localizedContentV1", localized);
        var initial = call("GET", eventPath(f), f.owner, null);
        var body = eventBody("Fictional event", initial.data().path("updatedAt").asText()); body.put("visibility", "PUBLIC"); body.put("contentJson", json.writeValueAsString(content));
        var saved = call("PUT", eventPath(f), f.owner, body); assertEquals(200, saved.status, saved.body);
        String slug = saved.data().path("slug").asText();
        assertEquals(200, call("PATCH", eventPath(f) + "/publish", f.owner, null).status);
        var published = call("GET", "/api/v1/public/invitations/" + slug, null, null);
        assertFalse(json.readTree(published.data().path("contentJson").asText()).path("localizedContentV1").has("en"));
        var latest = call("GET", eventPath(f), f.owner, null);
        body.put("expectedUpdatedAt", latest.data().path("updatedAt").asText()); localized.put("enabledLocales", List.of("km", "en")); body.put("contentJson", json.writeValueAsString(content));
        var enabled = call("PUT", eventPath(f), f.owner, body); assertEquals(200, enabled.status, enabled.body);
        assertEquals(409, call("PUT", eventPath(f), f.owner, body).status);
        body.remove("expectedUpdatedAt"); body.put("contentJson", "{}");
        assertEquals(409, call("PUT", eventPath(f), f.owner, body).status);
        body.put("expectedUpdatedAt", enabled.data().path("updatedAt").asText());
        assertEquals(200, call("PUT", eventPath(f), f.owner, body).status);
        assertEquals(403, call("PUT", eventPath(f), f.stranger, body).status);
        var publicEnabled = call("GET", "/api/v1/public/invitations/" + slug, null, null);
        assertEquals(1, jdbc.queryForObject("SELECT COUNT(*) FROM invitations WHERE invitation_id=? AND slug=?", Integer.class, f.eventId, slug));
        assertEquals(slug, publicEnabled.data().path("slug").asText());
        assertEquals("Authored invitation", json.readTree(publicEnabled.data().path("contentJson").asText()).path("localizedContentV1").path("en").path("messageText").asText());
        var invitation = invite(f, f.member.email, "DESIGNER");
        assertEquals(200, accept(f.member, invitation.data().path("invitationToken").asText()).status);
        var current = call("GET", eventPath(f), f.owner, null).data();
        var khChange = eventBody("Fictional event", current.path("updatedAt").asText()); khChange.put("visibility", "PUBLIC");
        var enChange = eventBody("Fictional event", current.path("updatedAt").asText()); enChange.put("visibility", "PUBLIC");
        khChange.put("contentJson", json.writeValueAsString(Map.of("localizedContentV1", Map.of("km", Map.of("messageText", "New Khmer wording")))));
        enChange.put("contentJson", json.writeValueAsString(Map.of("localizedContentV1", Map.of("en", Map.of("messageText", "New English wording")))));
        var raceResults = race(() -> call("PUT", eventPath(f), f.owner, khChange), () -> call("PUT", eventPath(f), f.member, enChange));
        assertEquals(List.of(200, 409), raceResults.stream().map(Reply::status).sorted().toList());
        current = call("GET", eventPath(f), f.owner, null).data();
        enChange.put("expectedUpdatedAt", current.path("updatedAt").asText());
        enChange.put("contentJson", json.writeValueAsString(Map.of("localizedContentV1", Map.of("enabledLocales", List.of("km")))));
        assertEquals(403, call("PUT", eventPath(f), f.member, enChange).status);
        assertEquals(200, call("DELETE", "/api/v1/organizations/" + f.orgId + "/members/" + invitation.data().path("id").asLong(), f.owner, null).status);
        assertEquals(403, call("PUT", eventPath(f), f.member, enChange).status);
        String privateToken = jdbc.queryForObject("SELECT access_token FROM invitations WHERE invitation_id=?", String.class, f.eventId);
        var privatize = eventBody("Fictional event", current.path("updatedAt").asText());
        assertEquals(200, call("PUT", eventPath(f), f.owner, privatize).status);
        assertEquals(404, call("GET", "/api/v1/public/invitations/" + slug + "?lang=en", null, null).status);
        assertEquals(200, call("GET", "/api/v1/public/invitations/" + slug + "?accessToken=" + privateToken + "&lang=en", null, null).status);
        assertEquals(privateToken, jdbc.queryForObject("SELECT access_token FROM invitations WHERE invitation_id=?", String.class, f.eventId));

    }

    @Test void phase11PremiumDesignsEnforceCurrentOwnerSnapshotAndExpiryOverHttp() throws Exception {
        Fixture f = fixture(3);
        var logo = Map.of("version", 1, "enabled", true, "text", "A & B", "color", "#996633", "motif", "diamond", "layout", "round", "size", 100);
        var map = Map.of("version", 1, "enabled", true, "aspectRatio", "landscape", "theme", "ivory", "description", Map.of("km", "", "en", ""), "nodes", List.of());
        var initial = call("GET", eventPath(f), f.owner, null);
        var body = eventBody("Premium design fixture", initial.data().path("updatedAt").asText()); body.put("visibility", "PUBLIC");
        body.put("contentJson", json.writeValueAsString(Map.of("coupleMonogram", logo)));
        assertEquals(403, call("PUT", eventPath(f), f.owner, body).status);
        body.put("contentJson", json.writeValueAsString(Map.of("illustratedMap", map)));
        assertEquals(403, call("PUT", eventPath(f), f.owner, body).status);
        var grant = subscriptions.findById(f.grantId).orElseThrow();
        var basic = packages.findByCodeAndActiveTrue("BASIC").orElseThrow(); grant.setBenefitsSnapshot(PackageSnapshot.capture(basic)); subscriptions.saveAndFlush(grant);
        assertEquals(403, call("PUT", eventPath(f), f.owner, body).status);
        var premium = packages.findByCodeAndActiveTrue("PREMIUM").orElseThrow(); grant.setBenefitsSnapshot(PackageSnapshot.capture(premium)); subscriptions.saveAndFlush(grant);
        body.put("contentJson", json.writeValueAsString(Map.of("coupleMonogram", logo, "illustratedMap", map)));
        var saved = call("PUT", eventPath(f), f.owner, body); assertEquals(200, saved.status, saved.body);
        assertEquals(403, call("PUT", eventPath(f), f.stranger, body).status);
        assertEquals(200, call("PATCH", eventPath(f) + "/publish", f.owner, null).status);
        String path = "/api/v1/public/invitations/" + saved.data().path("slug").asText();
        assertTrue(call("GET", path, null, null).data().path("contentJson").asText().contains("coupleMonogram"));
        grant.setEndDate(Instant.now().minusSeconds(1)); subscriptions.saveAndFlush(grant);
        String publicContent = call("GET", path, null, null).data().path("contentJson").asText();
        assertFalse(publicContent.contains("coupleMonogram")); assertFalse(publicContent.contains("illustratedMap"));
        var latest = call("GET", eventPath(f), f.owner, null);
        assertTrue(latest.data().path("contentJson").asText().contains("A & B"));
        body.put("expectedUpdatedAt", latest.data().path("updatedAt").asText());
        assertEquals(403, call("PUT", eventPath(f), f.owner, body).status);
        var badMap = json.createObjectNode(); badMap.put("version", 1); badMap.put("enabled", true); badMap.put("aspectRatio", "landscape"); badMap.put("theme", "ivory"); badMap.set("description", json.valueToTree(Map.of("km", "", "en", ""))); badMap.set("nodes", json.valueToTree(List.of(Map.of("id", "bad", "type", "script", "x", 99999))));
        body.put("contentJson", json.writeValueAsString(Map.of("illustratedMap", badMap)));
        assertEquals(400, call("PUT", eventPath(f), f.owner, body).status);
    }

    @Test void phase12RichProgramFamilyAndRoutePersistWithIndependentWordingAndOwnerBenefits() throws Exception {
        Fixture f = fixture(3);
        var grant = subscriptions.findById(f.grantId).orElseThrow();
        grant.setBenefitsSnapshot(PackageSnapshot.capture(packages.findByCodeAndActiveTrue("PREMIUM").orElseThrow()));
        subscriptions.saveAndFlush(grant);
        var km = Map.of("title", "ពិធីសាកល្បង", "messageText", "សូមអញ្ជើញ", "groomName", "ដៃគូទីមួយ", "brideName", "ដៃគូទីពីរ", "venueName", "ទីតាំងសាកល្បង", "venueAddress", "អាសយដ្ឋានសាកល្បង", "apologyText", "");
        var en = Map.of("title", "Fictional celebration", "messageText", "Please join our celebration", "groomName", "First partner", "brideName", "Second partner", "venueName", "Fictional venue", "venueAddress", "Fictional address", "apologyText", "");
        var rich = json.createObjectNode();
        rich.set("localizedContentV1", json.valueToTree(Map.of("version", 1, "km", km, "en", en, "enabledLocales", List.of("km", "en"), "defaultLocale", "km")));
        rich.set("programDays", json.readTree("""
            [{"id":"day-a","date":"2027-01-10","title":"ថ្ងៃដំបូង","titleEn":"First day"},
             {"id":"day-b","date":"2027-01-11","title":"ថ្ងៃទីពីរ","titleEn":"Second day"}]
            """));
        rich.set("schedule", json.readTree("""
            [{"id":"gathering-stable","dayId":"day-a","time":"07:00","title":"ជួបជុំ","titleEn":"Gathering","iconKey":"gathering"},
             {"id":"reception-stable","dayId":"day-b","time":"","title":"ទទួលភ្ញៀវ","titleEn":"Reception","iconKey":"none"}]
            """));
        rich.set("coupleMonogram", json.readTree("""
            {"version":1,"enabled":true,"text":"A & B","color":"#996633","motif":"petals","layout":"oval","size":120,"font":"KANTUMRUY","position":"below"}
            """));
        rich.set("illustratedMap", json.readTree("""
            {"version":1,"enabled":true,"aspectRatio":"landscape","theme":"ivory","description":{"km":"គំនូរផ្លូវ","en":"Host route schematic"},"nodes":[
             {"id":"road-stable","type":"road","x":0.45,"y":0.7,"width":0.6,"height":0.035,"rotation":0,"label":{"km":"","en":""}},
             {"id":"venue-stable","type":"destination","x":0.76,"y":0.3,"width":0.1,"height":0.12,"rotation":0,"label":{"km":"ទីតាំង","en":"Venue"}}]}
            """));
        rich.set("familyGroupsV1", json.readTree("""
            [{"side":"groom","label":{"km":"គ្រួសារ","en":"Family"},"members":[{"id":"guardian-stable","name":{"km":"ម្ចាស់កម្មវិធី","en":"Fictional guardian"},"honorific":{"km":"","en":""},"relationship":{"km":"","en":""}}]}]
            """));
        rich.put("coupleLayout", "bride-left"); rich.put("eventTimezone", "Asia/Phnom_Penh");
        rich.set("saveTheDate", json.valueToTree(Map.of("enabled", false)));
        var initial = call("GET", eventPath(f), f.owner, null);
        String identity = jdbc.queryForObject("SELECT access_token FROM invitations WHERE invitation_id=?", String.class, f.eventId);
        var body = eventBody("Phase 12 fixture", initial.data().path("updatedAt").asText());
        body.put("visibility", "PUBLIC"); body.put("googleMapUrl", "https://maps.google.com/?q=Fictional+venue");
        body.put("contentJson", rich.toString());
        var saved = call("PUT", eventPath(f), f.owner, body); assertEquals(200, saved.status, saved.body);
        assertEquals(409, call("PUT", eventPath(f), f.owner, body).status);
        var loaded = call("GET", eventPath(f), f.owner, null);
        var reopened = json.readTree(loaded.data().path("contentJson").asText());
        for (String key : List.of("schedule", "programDays", "coupleMonogram", "illustratedMap", "familyGroupsV1")) assertEquals(rich.path(key), reopened.path(key));
        assertEquals("", reopened.path("localizedContentV1").path("km").path("apologyText").asText());
        assertEquals(200, call("PATCH", eventPath(f) + "/publish", f.owner, null).status);
        String path = "/api/v1/public/invitations/" + loaded.data().path("slug").asText();
        var published = call("GET", path + "?lang=en", null, null);
        var publicContent = json.readTree(published.data().path("contentJson").asText());
        assertEquals(en.get("messageText"), publicContent.path("localizedContentV1").path("en").path("messageText").asText());
        assertEquals("none", publicContent.path("schedule").get(1).path("iconKey").asText());
        assertEquals(1, jdbc.queryForObject("SELECT COUNT(*) FROM invitations WHERE invitation_id=? AND access_token=?", Integer.class, f.eventId, identity));
        var invitation = invite(f, f.member.email, "DESIGNER");
        assertEquals(200, accept(f.member, invitation.data().path("invitationToken").asText()).status);
        grant.setBenefitsSnapshot(PackageSnapshot.capture(packages.findByCodeAndActiveTrue("BASIC").orElseThrow())); subscriptions.saveAndFlush(grant);
        loaded = call("GET", eventPath(f), f.owner, null);
        body.put("expectedUpdatedAt", loaded.data().path("updatedAt").asText());
        ((com.fasterxml.jackson.databind.node.ObjectNode) rich.path("coupleMonogram")).put("text", "Changed"); body.put("contentJson", rich.toString());
        assertEquals(403, call("PUT", eventPath(f), f.member, body).status);
        assertEquals(403, call("PUT", eventPath(f), f.stranger, body).status);
        publicContent = json.readTree(call("GET", path, null, null).data().path("contentJson").asText());
        assertFalse(publicContent.has("illustratedMap")); assertFalse(publicContent.has("coupleMonogram"));
        assertTrue(call("GET", eventPath(f), f.owner, null).data().path("contentJson").asText().contains("venue-stable"));
    }

    @Test
    @EnabledIfEnvironmentVariable(named = "STUDIO_PACKAGE_CONFIG", matches = ".+")
    void phase14ActualConfiguredPoliciesProjectOnlyVerifiedPurchasableBenefits() throws Exception {
        var observed = json.readTree(java.nio.file.Path.of(required("STUDIO_PACKAGE_CONFIG")).toFile());
        for (JsonNode node : observed) {
            String code = node.path("code").asText();
            Auth actor = register();
            var plan = packages.findByCodeAndActiveTrue(code).orElseThrow();
            if (!"FREE".equals(code)) paidFixture(actor, plan);
            Reply response = call("GET", "/api/v1/me/entitlements", actor, null);
            assertEquals(200, response.status);
            assertEquals(code, response.data().path("packagePlan").path("code").asText());
            Set<String> features = new HashSet<>(); response.data().path("features").forEach(value -> features.add(value.asText()));
            assertEquals(plan.isQrInvitationsEnabled(), features.contains("QR_INVITATIONS"));
            assertEquals(plan.isQrCheckInEnabled(), features.contains("QR_CHECK_IN"));
            assertEquals(plan.isPremiumTemplatesEnabled(), features.contains("PREMIUM_TEMPLATES"));
            for (String premium : List.of("PRE_WEDDING_VIDEO", "COUPLE_MONOGRAM", "ILLUSTRATED_VENUE_MAP")) assertEquals("PREMIUM".equals(code), features.contains(premium));
            assertEquals(plan.getMaxGuests().longValue(), response.data().path("quotas").path("guests").path("limit").asLong());
            if ("FREE".equals(code)) {
                var admin = users.findById(actor.id).orElseThrow(); admin.setRole(com.koupreng.backend.user.domain.Role.ADMIN); users.saveAndFlush(admin);
                var policy = new HashSet<String>(); call("GET", "/api/v1/me/entitlements", actor, null).data().path("features").forEach(value -> policy.add(value.asText()));
                assertEquals(features, policy, "A platform role change must not grant a subscriber tier");
            }
        }
        Reply catalog = call("GET", "/api/v1/public/packages", null, null); assertEquals(200, catalog.status);
        for (JsonNode row : catalog.data()) {
            var plan = packages.findByCodeAndActiveTrue(row.path("code").asText()).orElseThrow();
            assertEquals(0, plan.getPrice().compareTo(row.path("price").decimalValue()));
            Set<String> features = new HashSet<>(); row.path("eligibleFeatures").forEach(value -> features.add(value.asText()));
            assertEquals(plan.isQrInvitationsEnabled(), features.contains("QR_INVITATIONS"));
            assertEquals(plan.isQrCheckInEnabled(), features.contains("QR_CHECK_IN"));
            assertEquals("PREMIUM".equals(plan.getCode()) && row.path("purchasable").asBoolean(), features.contains("PRE_WEDDING_VIDEO"));
        }
    }

    @Test void phase14TemplateAccessUsesOwnerPurchasesAfterPermissionAndNeverTheCollaboratorsTier() throws Exception {
        Fixture f = fixture(3);
        Reply invitation = invite(f, f.member.email, "DESIGNER"); assertEquals(201, invitation.status);
        String token = invitation.data().path("invitationToken").asText();
        var template = new com.koupreng.backend.template.domain.InvitationTemplate();
        template.setCode("phase14-template-" + UUID.randomUUID()); template.setName("Fictional Premium design");
        template.setCategory(com.koupreng.backend.template.domain.TemplateCategory.TRADITIONAL); template.setPremium(true);
        template.setPrice(BigDecimal.ZERO); template.setCurrency("USD"); template.setStatus("ACTIVE"); template = templates.saveAndFlush(template);
        String path = eventPath(f) + "/templates/" + template.getId() + "/access";
        assertEquals(403, call("GET", path, f.member, null).status, "Unaccepted membership cannot inspect owner access");
        assertEquals(200, accept(f.member, token).status);
        Reply denied = call("GET", path, f.member, null); assertEquals(200, denied.status); assertFalse(denied.data().path("hasAccess").asBoolean());
        var purchase = new com.koupreng.backend.payment.domain.UserTemplateAccess();
        purchase.setUser(users.findById(f.owner.id).orElseThrow()); purchase.setTemplateId(template.getId()); purchase.setActive(true); purchases.saveAndFlush(purchase);
        assertTrue(call("GET", path, f.member, null).data().path("hasAccess").asBoolean(), "The owner's individual purchase is distinct from the editor's account");
        assertFalse(call("GET", "/api/v1/me/templates/" + template.getId() + "/access", f.member, null).data().path("hasAccess").asBoolean());
        paidFixture(f.stranger, packages.findByCodeAndActiveTrue("PREMIUM").orElseThrow());
        assertEquals(403, call("GET", path, f.stranger, null).status, "An outsider's paid package cannot grant event permission");
        assertEquals(403, call("GET", eventPath(f) + "/templates/999999999/access", f.stranger, null).status, "Permission is checked before template existence");
        var member = members.findById(invitation.data().path("id").asLong()).orElseThrow(); member.setRole("VIEWER"); members.saveAndFlush(member);
        assertEquals(403, call("GET", path, f.member, null).status);
        member.setRole("DESIGNER"); members.saveAndFlush(member);
        var grant = subscriptions.findById(f.grantId).orElseThrow(); grant.setEndDate(Instant.now().minusSeconds(1)); subscriptions.saveAndFlush(grant);
        assertEquals(403, call("GET", path, f.member, null).status, "Expired owner benefits revoke team access on the next request");
        assertTrue(call("GET", path, f.owner, null).data().path("hasAccess").asBoolean(), "Expiry must not delete an individual template purchase");
        template.setStatus("INACTIVE"); templates.saveAndFlush(template);
        assertEquals(404, call("GET", path, f.owner, null).status);
    }

    @Test void phase14GuestQuotaDetailsAreEventScopedAndOnlyFollowAuthorization() throws Exception {
        Fixture f = fixture(3, 10);
        var grant = subscriptions.findById(f.grantId).orElseThrow();
        var plan = packages.findById(grant.getSubscriptionPackage().getId()).orElseThrow(); plan.setMaxGuestsPerInvitation(1); packages.saveAndFlush(plan);
        grant.setBenefitsSnapshot(PackageSnapshot.capture(plan)); subscriptions.saveAndFlush(grant);
        assertEquals(201, call("POST", eventPath(f) + "/guests", f.owner, Map.of("guestName", "Fictional quota guest")).status);
        Reply failure = call("POST", eventPath(f) + "/guests", f.owner, Map.of("guestName", "Must remain unsaved"));
        assertEquals(403, failure.status); assertEquals("PACKAGE_LIMIT_REACHED", failure.root.path("code").asText());
        var detail = failure.root.path("details"); assertEquals("guestsPerInvitation", detail.path("resource").asText());
        assertEquals("EVENT", detail.path("scope").asText()); assertEquals(1, detail.path("limit").asInt()); assertEquals(1, detail.path("used").asInt());
        Reply access = call("GET", eventPath(f) + "/access", f.owner, null);
        assertEquals(1, access.data().path("quotas").path("guestsPerInvitation").path("used").asInt());
        assertFalse(access.data().path("quotas").has("guests"), "Event access must not expose account-wide guest usage");
        Reply forbidden = call("POST", eventPath(f) + "/guests", f.stranger, Map.of("guestName", "Forbidden guest"));
        assertEquals(403, forbidden.status); assertTrue(forbidden.root.path("details").isMissingNode());
    }

    private void paidFixture(Auth actor, SubscriptionPackage plan) {
        var subscription = new Subscription(); subscription.setUser(users.findById(actor.id).orElseThrow()); subscription.setSubscriptionPackage(plan);
        subscription.setBenefitsSnapshot(PackageSnapshot.capture(plan)); subscription.setStatus("ACTIVE"); subscription.setActive(true);
        subscription.setPaymentStatus("PAID"); subscription.setConfirmSource("INTEGRATION_FIXTURE");
        subscription.setAmount(plan.getPrice()); subscription.setCurrency(plan.getCurrency());
        subscription.setOrderCode("P14-" + UUID.randomUUID()); subscription.setStartDate(Instant.now().minusSeconds(60)); subscription.setEndDate(Instant.now().plusSeconds(3600));
        subscriptions.saveAndFlush(subscription);
    }

    private Fixture fixture(int teamLimit) throws Exception {
        return fixture(teamLimit,1);
    }
    private Fixture fixture(int teamLimit,int guestLimit) throws Exception {
        Auth owner = register(), member = register(), stranger = register();
        var plan = new SubscriptionPackage(); plan.setCode("P7-" + UUID.randomUUID()); plan.setPackageName("Phase 7 disposable team fixture");
        plan.setPublicVisible(false);
        plan.setPrice(BigDecimal.ZERO); plan.setMaxInvitations(3); plan.setMaxGuests(guestLimit); plan.setMaxGuestsPerInvitation(guestLimit);
        plan.setTeamMembersEnabled(true); plan.setMaxTeamMembers(teamLimit); plan.setAdvancedAnalyticsEnabled(true); plan.setQrCheckInEnabled(true); plan.setSeatingEnabled(true);
        plan = packages.saveAndFlush(plan);
        var grant = new Subscription(); grant.setUser(users.findById(owner.id).orElseThrow()); grant.setSubscriptionPackage(plan);
        grant.setBenefitsSnapshot(PackageSnapshot.capture(plan)); grant.setConfirmSource("DEMO_ADMIN_GRANT"); grant.setPaymentStatus("NOT_REQUIRED");
        grant.setStatus("ACTIVE"); grant.setActive(true); grant.setAmount(BigDecimal.ZERO); grant.setOrderCode("P7-" + UUID.randomUUID());
        grant.setStartDate(Instant.now().minusSeconds(60)); grant.setEndDate(Instant.now().plusSeconds(3600)); grant = subscriptions.saveAndFlush(grant);
        Reply org = call("POST", "/api/v1/organizations", owner, Map.of("name", "Phase 7 team " + UUID.randomUUID())); assertEquals(201, org.status);
        var body = eventBody("Phase 7 shared event", null); body.put("organizationId", org.data().path("id").asLong());
        Reply event = call("POST", "/api/v1/invitations", owner, body); assertEquals(201, event.status);
        return new Fixture(owner, member, stranger, org.data().path("id").asLong(), event.data().path("id").asLong(), grant.getId());
    }
    private Map<String,Object> eventBody(String title, String version) {
        var body = new HashMap<String,Object>(); body.put("title", title); body.put("eventType", "WEDDING"); body.put("groomName", "Fictional host"); body.put("brideName", "Fictional partner");
        body.put("hostName", "Fictional host"); body.put("eventDate", "2027-01-10"); body.put("eventTime", "17:30"); body.put("venueName", "Fixture venue"); body.put("venueAddress", "Fixture address");
        body.put("visibility", "PRIVATE"); body.put("contentJson", "{}"); if (version != null) body.put("expectedUpdatedAt", version); return body;
    }
    private Auth register() throws Exception {
        String email = "p7-" + UUID.randomUUID() + "@example.test";
        Reply reply = call("POST", "/api/auth/register", null, Map.of("fullName", "Phase 7 fictional account", "email", email, "password", "Phase7!aA7" + UUID.randomUUID()));
        assertEquals(200, reply.status); return new Auth(reply.root.path("user").path("id").asLong(), email, reply.root.path("accessToken").asText());
    }
    private Reply invite(Fixture f, String email, String role) throws Exception { return call("POST", "/api/v1/organizations/" + f.orgId + "/members", f.owner, Map.of("email", email, "role", role)); }
    private Reply accept(Auth user, String token) throws Exception { return call("POST", "/api/v1/organizations/invitations/accept", user, Map.of("token", token)); }
    private String eventPath(Fixture f) { return "/api/v1/invitations/" + f.eventId; }
    private boolean containsEvent(JsonNode rows, long id) { for (var row : rows) if (row.path("id").asLong() == id) return true; return false; }
    private Reply call(String method, String path, Auth user, Object body) throws Exception {
        var request = HttpRequest.newBuilder(URI.create("http://127.0.0.1:" + port + path)).timeout(Duration.ofSeconds(15)).header("Content-Type", "application/json");
        if (user != null) request.header("Authorization", "Bearer " + user.token);
        request.method(method, body == null ? HttpRequest.BodyPublishers.noBody() : HttpRequest.BodyPublishers.ofString(json.writeValueAsString(body)));
        var response = http.send(request.build(), HttpResponse.BodyHandlers.ofString());
        boolean csv=response.headers().firstValue("Content-Type").orElse("").startsWith("text/csv");
        return new Reply(response.statusCode(), csv || response.body().isBlank() ? json.createObjectNode() : json.readTree(response.body()),response.body());
    }
    private List<Reply> race(Callable<Reply> left, Callable<Reply> right) throws Exception {
        var start = new CountDownLatch(1);
        try (var executor = Executors.newFixedThreadPool(2)) {
            var a = executor.submit(() -> { start.await(); return left.call(); });
            var b = executor.submit(() -> { start.await(); return right.call(); });
            start.countDown(); return List.of(a.get(20, TimeUnit.SECONDS), b.get(20, TimeUnit.SECONDS));
        }
    }
    private static String required(String key) { String value = System.getenv(key); if (value == null || value.isBlank()) throw new IllegalStateException("Missing disposable configuration: " + key); return value; }
    private record Auth(long id, String email, String token) { }
    private record Fixture(Auth owner, Auth member, Auth stranger, long orgId, long eventId, long grantId) { }
    private record Reply(int status, JsonNode root,String body) { JsonNode data() { return root.path("data"); } }
}
