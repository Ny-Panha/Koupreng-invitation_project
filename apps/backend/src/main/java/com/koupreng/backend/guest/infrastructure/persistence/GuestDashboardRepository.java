package com.koupreng.backend.guest.infrastructure.persistence;

import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;
import java.util.*;

/** Bounded reads and database aggregates; no guest contacts are loaded for totals. */
@Repository
public class GuestDashboardRepository {
    private final NamedParameterJdbcTemplate jdbc;
    private static final String JOINS = " FROM guests g LEFT JOIN rsvps r ON r.guest_id=g.guest_id AND r.invitation_id=g.invitation_id LEFT JOIN guest_check_ins c ON c.guest_id=g.guest_id AND c.invitation_id=g.invitation_id AND c.is_active=true ";
    private static final String TO_INVITE = "r.response_status IS NULL AND c.check_in_id IS NULL AND (g.send_status IS NULL OR g.send_status IN ('PENDING','មិនទាន់ផ្ញើ'))";
    public GuestDashboardRepository(NamedParameterJdbcTemplate jdbc) { this.jdbc = jdbc; }
    public record Totals(long guestRecords, long reservedSeats, long attendingRecords, long declinedRecords, long maybeRecords,
                         long unansweredRecords, long respondedRecords, long toInviteRecords, long checkedInRecords,
                         long confirmedAttendees, long markedSentRecords) { }
    public record PageIds(List<Long> ids, long total) { }

    public Totals totals(Long eventId) {
        String sql = """
                SELECT COUNT(g.guest_id) AS guest_records,
                 COALESCE(SUM(CASE WHEN g.seat_count IS NULL OR g.seat_count<1 THEN 1 ELSE g.seat_count END),0) AS seats,
                 COALESCE(SUM(CASE WHEN r.response_status='ATTENDING' THEN 1 ELSE 0 END),0) AS attending,
                 COALESCE(SUM(CASE WHEN r.response_status='NOT_ATTENDING' THEN 1 ELSE 0 END),0) AS declined,
                 COALESCE(SUM(CASE WHEN r.response_status='MAYBE' THEN 1 ELSE 0 END),0) AS maybe,
                 COALESCE(SUM(CASE WHEN r.response_status IS NULL THEN 1 ELSE 0 END),0) AS unanswered,
                 COALESCE(SUM(CASE WHEN r.response_status IS NOT NULL THEN 1 ELSE 0 END),0) AS responded,
                 COALESCE(SUM(CASE WHEN %s THEN 1 ELSE 0 END),0) AS to_invite,
                 COALESCE(SUM(CASE WHEN c.check_in_id IS NOT NULL THEN 1 ELSE 0 END),0) AS checked_in,
                 COALESCE(SUM(CASE WHEN r.response_status='ATTENDING' THEN GREATEST(COALESCE(r.attendee_count,0),0) ELSE 0 END),0) AS attendees,
                 COALESCE(SUM(CASE WHEN g.send_status IN ('SENT','OPENED','បានផ្ញើ','បានបើក') OR g.last_sent_at IS NOT NULL OR g.invitation_viewed_at IS NOT NULL THEN 1 ELSE 0 END),0) AS marked_sent
                """.formatted(TO_INVITE) + JOINS + " WHERE g.invitation_id=:eventId";
        return jdbc.queryForObject(sql, Map.of("eventId", eventId), (rs, row) -> new Totals(rs.getLong("guest_records"), rs.getLong("seats"), rs.getLong("attending"), rs.getLong("declined"), rs.getLong("maybe"), rs.getLong("unanswered"), rs.getLong("responded"), rs.getLong("to_invite"), rs.getLong("checked_in"), rs.getLong("attendees"), rs.getLong("marked_sent")));
    }

    public PageIds page(Long eventId, int page, int size, String search, String group, String category, String status) {
        Map<String,Object> args = new HashMap<>(); args.put("eventId", eventId);
        StringBuilder where = new StringBuilder(" WHERE g.invitation_id=:eventId");
        if (!search.isBlank()) {
            args.put("search", "%" + search.replace("!", "!!").replace("%", "!%").replace("_", "!_") + "%");
            where.append(" AND (g.guest_name LIKE :search ESCAPE '!' OR g.companion_name LIKE :search ESCAPE '!' OR g.phone LIKE :search ESCAPE '!' OR g.guest_group LIKE :search ESCAPE '!' OR g.side_type LIKE :search ESCAPE '!' OR g.table_number LIKE :search ESCAPE '!')");
        }
        if (!group.isBlank()) { where.append(" AND g.guest_group=:guestGroup"); args.put("guestGroup", group); }
        if (!category.isBlank()) { where.append(" AND g.side_type=:category"); args.put("category", category); }
        where.append(switch (status) {
            case "pending" -> " AND (" + TO_INVITE + ")";
            case "responded" -> " AND r.response_status IS NOT NULL";
            case "checkedIn" -> " AND c.check_in_id IS NOT NULL";
            case "attending" -> " AND r.response_status='ATTENDING'";
            case "declined" -> " AND r.response_status='NOT_ATTENDING'";
            case "maybe" -> " AND r.response_status='MAYBE'";
            case "unanswered" -> " AND r.response_status IS NULL";
            default -> "";
        });
        Long total = jdbc.queryForObject("SELECT COUNT(*)" + JOINS + where, args, Long.class);
        args.put("limit", size); args.put("offset", (long)page * size);
        var ids = jdbc.queryForList("SELECT g.guest_id" + JOINS + where + " ORDER BY g.created_at DESC,g.guest_id DESC LIMIT :limit OFFSET :offset", args, Long.class);
        return new PageIds(ids, total == null ? 0 : total);
    }
}
