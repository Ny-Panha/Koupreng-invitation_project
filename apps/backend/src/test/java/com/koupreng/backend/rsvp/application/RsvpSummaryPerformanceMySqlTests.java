package com.koupreng.backend.rsvp.application;

import com.koupreng.backend.invitation.domain.InvitationStatus;
import com.koupreng.backend.invitation.application.InvitationService;
import com.koupreng.backend.invitation.domain.UserInvitation;
import com.koupreng.backend.invitation.infrastructure.persistence.UserInvitationRepository;
import com.koupreng.backend.rsvp.api.dto.RsvpSummaryResponse;
import com.koupreng.backend.rsvp.domain.RsvpStatus;
import com.koupreng.backend.rsvp.infrastructure.persistence.RsvpRepository;
import com.koupreng.backend.guest.infrastructure.persistence.GuestRepository;
import com.koupreng.backend.user.domain.AppUser;
import com.koupreng.backend.user.domain.Role;
import com.koupreng.backend.user.infrastructure.persistence.AppUserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.UUID;
import org.hibernate.SessionFactory;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.assertEquals;

/** Opt-in local experiment. All generated rows roll back; use a disposable database. */
@SpringBootTest(properties = {
        "debug=false", "trace=false", "logging.level.root=WARN",
        "logging.level.org.springframework=WARN", "logging.level.org.hibernate.SQL=OFF"
})
@ActiveProfiles("test")
@Transactional
@EnabledIfEnvironmentVariable(named = "RUN_RSVP_PERFORMANCE", matches = "true")
class RsvpSummaryPerformanceMySqlTests {
    @Autowired RsvpService service;
    @Autowired InvitationService invitationService;
    @Autowired GuestRepository guestRepository;
    @Autowired RsvpRepository rsvpRepository;
    @Autowired AppUserRepository users;
    @Autowired UserInvitationRepository invitations;
    @Autowired JdbcTemplate jdbc;
    @Autowired EntityManager entityManager;
    @Autowired EntityManagerFactory entityManagerFactory;

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", () -> required("FLYWAY_TEST_DB_URL"));
        registry.add("spring.datasource.username", () -> required("FLYWAY_TEST_DB_USERNAME"));
        registry.add("spring.datasource.password", () -> required("FLYWAY_TEST_DB_PASSWORD"));
        registry.add("spring.datasource.driver-class-name", () -> "com.mysql.cj.jdbc.Driver");
        registry.add("spring.flyway.enabled", () -> true);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "validate");
        registry.add("spring.jpa.database-platform", () -> "org.hibernate.dialect.MySQLDialect");
        registry.add("spring.jpa.properties.hibernate.boot.allow_jdbc_metadata_access", () -> true);
        registry.add("spring.jpa.properties.hibernate.generate_statistics", () -> true);
        registry.add("app.dev-monitor.enabled", () -> false);
        registry.add("app.dev-sample-data.enabled", () -> false);
        registry.add("debug", () -> false);
        registry.add("trace", () -> false);
        registry.add("logging.level.org.hibernate.stat", () -> "OFF");
        registry.add("logging.level.root", () -> "WARN");
        registry.add("logging.level.org.hibernate.SQL", () -> "OFF");
        registry.add("logging.level.org.springframework.jdbc", () -> "OFF");
        registry.add("logging.level.org.springframework", () -> "WARN");
        registry.add("logging.level.org.hibernate.engine.internal.StatisticalLoggingSessionEventListener", () -> "OFF");
    }

    @Test
    void benchmarkSummaryAndVerifyCounts() throws Exception {
        var owner = new AppUser();
        owner.setEmail("perf-" + UUID.randomUUID() + "@example.test");
        owner.setFullName("Performance fixture");
        owner.setRole(Role.USER);
        owner = users.saveAndFlush(owner);
        var output = new StringBuilder("{\"engine\":\"MySQL\",\"warmup\":10,\"iterations\":30,\"rounds\":3,\"concurrency\":1,\"scenarios\":[");
        boolean first = true;
        for (int size : new int[] {0, 100, 1000, 10000, 100000}) {
            var invitation = new UserInvitation();
            invitation.setUser(owner);
            invitation.setTitle("Performance fixture");
            invitation.setSlug("perf-" + UUID.randomUUID());
            invitation.setStatus(InvitationStatus.PUBLISHED);
            invitation = invitations.saveAndFlush(invitation);
            final long invitationId = invitation.getId();
            for (int offset = 0; offset < size; offset += 1000) {
                var rows = new ArrayList<Object[]>();
                for (int i = offset; i < Math.min(size, offset + 1000); i++) {
                    rows.add(new Object[] {invitationId, "Fixture guest " + i, "perf-" + invitationId + "-" + i});
                }
                jdbc.batchUpdate("insert into guests (invitation_id, guest_name, invite_token) values (?, ?, ?)", rows);
            }
            jdbc.update("insert into rsvps (invitation_id, guest_id, response_status, attendee_count) "
                    + "select invitation_id, guest_id, case mod(guest_id, 4) when 0 then 'ATTENDING' "
                    + "when 1 then 'NOT_ATTENDING' else 'MAYBE' end, "
                    + "case mod(guest_id, 4) when 0 then 2 else 0 end "
                    + "from guests where invitation_id = ? and mod(guest_id, 4) <> 3", invitationId);
            // Anonymous/null legacy data must retain the old independent aggregate semantics.
            jdbc.update("insert into rsvps (invitation_id, response_status, attendee_count) values (?, 'ATTENDING', null), (?, null, 9)", invitationId, invitationId);
            entityManager.clear();
            var expected = jdbc.queryForMap("select "
                    + "coalesce(sum(response_status = 'ATTENDING'), 0) as attending, "
                    + "coalesce(sum(response_status = 'NOT_ATTENDING'), 0) as declined, "
                    + "coalesce(sum(response_status = 'MAYBE'), 0) as maybe, "
                    + "coalesce(sum(case when response_status = 'ATTENDING' then attendee_count else 0 end), 0) as attendees "
                    + "from rsvps where invitation_id = ?", invitationId);
            long pending = jdbc.queryForObject("select count(*) from guests g where invitation_id = ? "
                    + "and not exists (select 1 from rsvps r where r.guest_id = g.guest_id)", Long.class, invitationId);
            String slug = invitation.getSlug();
            RsvpSummaryResponse result = service.publicSummary(slug);
            assertEquals(size, result.getTotalGuests());
            assertEquals(((Number) expected.get("attending")).longValue(), result.getAttending());
            assertEquals(((Number) expected.get("declined")).longValue(), result.getNotAttending());
            assertEquals(((Number) expected.get("maybe")).longValue(), result.getMaybe());
            assertEquals(((Number) expected.get("attendees")).longValue(), result.getTotalAttendeeCount());
            assertEquals(pending, result.getPending());
            for (int warmup = 0; warmup < 10; warmup++) {
                legacySummary(slug);
                service.publicSummary(slug);
            }
            var statistics = entityManagerFactory.unwrap(SessionFactory.class).getStatistics();
            var roundResults = new ArrayList<String>();
            for (int round = 0; round < 3; round++) {
                double[][] timings = {new double[30], new double[30]};
                long[] queries = new long[2];
                for (int i = 0; i < 30; i++) {
                    // Alternate order to reduce bias from JIT, cache warmth and local background work.
                    for (int step = 0; step < 2; step++) {
                        int variant = (i + round + step) % 2;
                        statistics.clear();
                        long start = System.nanoTime();
                        RsvpSummaryResponse measured = variant == 0 ? legacySummary(slug) : service.publicSummary(slug);
                        timings[variant][i] = (System.nanoTime() - start) / 1_000_000.0;
                        queries[variant] += statistics.getPrepareStatementCount();
                        assertEquals(result, measured);
                    }
                }
                assertEquals(210, queries[0]);
                assertEquals(120, queries[1]);
                roundResults.add("{\"before\":" + metrics(timings[0], queries[0])
                        + ",\"after\":" + metrics(timings[1], queries[1]) + "}");
            }
            if (!first) output.append(',');
            first = false;
            output.append("{\"guests\":").append(size).append(",\"measurements\":[")
                    .append(String.join(",", roundResults)).append("]}");
            if (size == 100000) {
                var plans = new LinkedHashMap<String, Object>();
                plans.put("oldStatusCount", jdbc.queryForList("explain analyze select count(*) from rsvps where invitation_id = ? and response_status = 'ATTENDING'", invitationId));
                plans.put("oldAttendeeSum", jdbc.queryForList("explain analyze select coalesce(sum(attendee_count), 0) from rsvps where invitation_id = ? and response_status = 'ATTENDING'", invitationId));
                plans.put("combinedCounts", jdbc.queryForList("explain analyze select coalesce(sum(case when response_status = 'ATTENDING' then 1 else 0 end), 0), coalesce(sum(case when response_status = 'NOT_ATTENDING' then 1 else 0 end), 0), coalesce(sum(case when response_status = 'MAYBE' then 1 else 0 end), 0), coalesce(sum(case when response_status = 'ATTENDING' then attendee_count else 0 end), 0) from rsvps where invitation_id = ?", invitationId));
                plans.put("pendingGuests", jdbc.queryForList("explain analyze select count(*) from guests g where invitation_id = ? and not exists (select 1 from rsvps r where r.guest_id = g.guest_id)", invitationId));
                Path planPath = Path.of(System.getenv().getOrDefault("RSVP_PERFORMANCE_OUTPUT", "target/rsvp-performance.json") + ".plans.json");
                Files.createDirectories(planPath.toAbsolutePath().getParent());
                Files.writeString(planPath, new com.fasterxml.jackson.databind.ObjectMapper().writerWithDefaultPrettyPrinter().writeValueAsString(plans));
            }
        }
        output.append("]}");
        Path destination = Path.of(System.getenv().getOrDefault("RSVP_PERFORMANCE_OUTPUT", "target/rsvp-performance.json"));
        Files.createDirectories(destination.toAbsolutePath().getParent());
        Files.writeString(destination, output.toString());
        System.out.println("RSVP_PERFORMANCE saved " + destination);
    }

    // Exact pre-optimization summary algorithm, retained only as an experiment reference.
    private RsvpSummaryResponse legacySummary(String slug) {
        long id = invitationService.requirePublishedInvitationForRsvp(slug, false).getId();
        long guests = guestRepository.countByInvitationId(id);
        long attending = rsvpRepository.countByInvitationIdAndResponseStatus(id, RsvpStatus.ATTENDING);
        long declined = rsvpRepository.countByInvitationIdAndResponseStatus(id, RsvpStatus.NOT_ATTENDING);
        long maybe = rsvpRepository.countByInvitationIdAndResponseStatus(id, RsvpStatus.MAYBE);
        long pending = rsvpRepository.countPendingGuests(id);
        long attendees = rsvpRepository.sumAttendeeCountByInvitationIdAndStatus(id, RsvpStatus.ATTENDING);
        return new RsvpSummaryResponse(guests, attending, declined, maybe, pending, attendees);
    }

    private static String metrics(double[] values, long queries) {
        Arrays.sort(values);
        return "{\"p50Ms\":" + values[14] + ",\"p95Ms\":" + values[28]
                + ",\"p99Ms\":" + values[29] + ",\"statementsPerCall\":" + (queries / 30.0) + "}";
    }

    private static String required(String key) {
        String value = System.getenv(key);
        if (value == null) throw new IllegalStateException("Missing isolated test configuration: " + key);
        return value;
    }
}
