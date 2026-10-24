package com.koupreng.backend.guest.infrastructure.persistence;

import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;
import java.time.*;
import java.util.*;

/** Calendar buckets from stored facts, never inferred delivery or activity events. */
@Repository
public class AttendanceAnalyticsRepository {
    private final NamedParameterJdbcTemplate jdbc;
    public AttendanceAnalyticsRepository(NamedParameterJdbcTemplate jdbc) { this.jdbc = jdbc; }
    public record Bucket(LocalDate date, long total, long attending, long declined, long maybe) { }

    public List<Bucket> created(Long eventId, Instant start, Instant end) {
        return counts("guests", "created_at", "", eventId, start, end);
    }
    public List<Bucket> checkIns(Long eventId, Instant start, Instant end) {
        return counts("guest_check_ins", "checked_in_at", " AND is_active=true", eventId, start, end);
    }
    private List<Bucket> counts(String table, String timestamp, String predicate, Long eventId, Instant start, Instant end) {
        // Table and column names are internal constants, never request data. Khmer calendar zone is UTC+07 year-round.
        return jdbc.query("SELECT DATE(DATE_ADD(" + timestamp + ",INTERVAL 7 HOUR)) AS day, COUNT(*) AS total FROM " + table
                + " WHERE invitation_id=:eventId AND " + timestamp + ">=:start AND " + timestamp + "<:end" + predicate
                + " GROUP BY day ORDER BY day", args(eventId,start,end),
                (rs,n) -> new Bucket(rs.getDate("day").toLocalDate(),rs.getLong("total"),0,0,0));
    }
    public List<Bucket> responses(Long eventId, Instant start, Instant end) {
        return jdbc.query("""
                SELECT DATE(DATE_ADD(r.responded_at,INTERVAL 7 HOUR)) AS day, COUNT(*) AS total,
                 SUM(r.response_status='ATTENDING') AS attending,
                 SUM(r.response_status='NOT_ATTENDING') AS declined, SUM(r.response_status='MAYBE') AS maybe
                FROM rsvps r JOIN guests g ON g.guest_id=r.guest_id AND g.invitation_id=r.invitation_id
                WHERE r.invitation_id=:eventId AND r.responded_at>=:start AND r.responded_at<:end
                 AND r.response_status IS NOT NULL GROUP BY day ORDER BY day
                """, args(eventId,start,end), (rs,n) -> new Bucket(rs.getDate("day").toLocalDate(),rs.getLong("total"),
                rs.getLong("attending"),rs.getLong("declined"),rs.getLong("maybe")));
    }
    private Map<String,Object> args(Long eventId, Instant start, Instant end) {
        // Database temporal columns store UTC. LocalDateTime avoids host JVM timezone conversion.
        return Map.of("eventId",eventId,"start",LocalDateTime.ofInstant(start,ZoneOffset.UTC),"end",LocalDateTime.ofInstant(end,ZoneOffset.UTC));
    }
}
