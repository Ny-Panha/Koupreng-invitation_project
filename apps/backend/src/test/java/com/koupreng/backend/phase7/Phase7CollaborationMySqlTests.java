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
@EnabledIfEnvironmentVariable(named = "RUN_PHASE7_MYSQL", matches = "true")
class Phase7CollaborationMySqlTests {
    @LocalServerPort int port;
    @Autowired ObjectMapper json;
    @Autowired AppUserRepository users;
    @Autowired SubscriptionPackageRepository packages;
    @Autowired SubscriptionRepository subscriptions;
    @Autowired OrganizationMemberRepository members;
    @Autowired org.springframework.jdbc.core.JdbcTemplate jdbc;
    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();

    @DynamicPropertySource static void database(DynamicPropertyRegistry registry) {
        String url = required("FLYWAY_TEST_DB_URL");
        if (!url.startsWith("jdbc:mysql://127.0.0.1:3416/phase7_disposable?")) throw new IllegalStateException("Requires the owned loopback Phase 7 disposable database");
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

    @Test void registrationGetsTheConfiguredFreePlanWithoutCheckout() throws Exception {
        Auth user = register();
        Reply response = call("GET", "/api/v1/me/entitlements", user, null);
        assertEquals(200, response.status);
        assertEquals("CONFIGURED_FREE_PACKAGE", response.data().path("source").asText());
        assertEquals("FREE", response.data().path("packagePlan").path("code").asText());
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
