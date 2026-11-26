package com.koupreng.backend.notification.infrastructure.persistence;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.Optional;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class TelegramOwnerRepository {
    private final JdbcClient jdbc;

    public TelegramOwnerRepository(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public Optional<Long> linkedChat(long userId) {
        return jdbc.sql("""
                SELECT telegram_user_id FROM telegram_owner_links
                WHERE user_id = :userId AND telegram_user_id IS NOT NULL
                """).param("userId", userId).query(Long.class).optional();
    }

    public Optional<Long> activeOwner(long chatId) {
        return jdbc.sql("""
                SELECT l.user_id FROM telegram_owner_links l
                JOIN users u ON u.user_id = l.user_id
                WHERE l.telegram_user_id = :chatId AND u.status = 'ACTIVE' AND u.deleted = FALSE
                """).param("chatId", chatId).query(Long.class).optional();
    }

    public void createChallenge(long userId, String digest, Instant expiresAt) {
        jdbc.sql("""
                INSERT INTO telegram_owner_links (user_id, challenge_hash, challenge_expires_at)
                VALUES (:userId, :digest, :expiresAt)
                ON DUPLICATE KEY UPDATE challenge_hash = IF(telegram_user_id IS NULL, :digest, challenge_hash),
                    challenge_expires_at = IF(telegram_user_id IS NULL, :expiresAt, challenge_expires_at)
                """).param("userId", userId).param("digest", digest)
                .param("expiresAt", Timestamp.from(expiresAt)).update();
    }

    public boolean consumeChallenge(String digest, long chatId, Instant now) {
        return jdbc.sql("""
                UPDATE telegram_owner_links l JOIN users u ON u.user_id = l.user_id
                SET l.telegram_user_id = :chatId, l.challenge_hash = NULL, l.challenge_expires_at = NULL
                WHERE l.challenge_hash = :digest AND l.challenge_expires_at > :now
                  AND l.telegram_user_id IS NULL AND u.status = 'ACTIVE' AND u.deleted = FALSE
                """).param("digest", digest).param("chatId", chatId).param("now", Timestamp.from(now)).update() == 1;
    }

    public java.util.List<UpcomingInvitation> upcoming(long afterId, java.time.LocalDate from,
                                                      java.time.LocalDate to) {
        return jdbc.sql("""
                SELECT i.invitation_id, i.user_id, i.title, i.event_date,
                       CASE WHEN JSON_VALID(i.content_json)
                            THEN JSON_UNQUOTE(JSON_EXTRACT(i.content_json, '$.eventTimezone')) END AS timezone
                FROM invitations i JOIN telegram_owner_links l ON l.user_id = i.user_id
                JOIN users u ON u.user_id = l.user_id
                WHERE i.invitation_id > :afterId AND i.event_date BETWEEN :from AND :to
                  AND i.deleted = FALSE AND i.status = 'PUBLISHED' AND i.moderation_status = 'ACTIVE'
                  AND l.telegram_user_id IS NOT NULL AND u.status = 'ACTIVE' AND u.deleted = FALSE
                ORDER BY i.invitation_id LIMIT 100
                """).param("afterId", afterId).param("from", from).param("to", to)
                .query((rs, row) -> new UpcomingInvitation(rs.getLong(1), rs.getLong(2), rs.getString(3),
                        rs.getObject(4, java.time.LocalDate.class), rs.getString(5))).list();
    }

    public record UpcomingInvitation(long id, long userId, String title, java.time.LocalDate date, String timezone) {}

    public void enqueue(long userId, String key, String title, String text) {
        jdbc.sql("""
                INSERT INTO notifications (user_id, recipient_telegram_id, payment_delivery_key, channel,
                    status, type, title, message, next_delivery_at, delivery_attempts, created_at, updated_at)
                SELECT l.user_id, l.telegram_user_id, :key, 'TELEGRAM', 'PENDING', 'SYSTEM_ALERT',
                    :title, :text, UTC_TIMESTAMP(6), 0, UTC_TIMESTAMP(6), UTC_TIMESTAMP(6)
                FROM telegram_owner_links l JOIN users u ON u.user_id = l.user_id
                WHERE l.user_id = :userId AND l.telegram_user_id IS NOT NULL
                  AND u.status = 'ACTIVE' AND u.deleted = FALSE
                ON DUPLICATE KEY UPDATE payment_delivery_key = notifications.payment_delivery_key
                """).param("userId", userId).param("key", "owner:" + key).param("title", title)
                .param("text", text).update();
    }

    public boolean acceptUpdate(String botId, long updateId) {
        return jdbc.sql("""
                INSERT IGNORE INTO telegram_user_updates (bot_id, update_id, received_at)
                VALUES (:botId, :updateId, UTC_TIMESTAMP(6))
                """).param("botId", botId).param("updateId", updateId).update() == 1;
    }

    public void expireUpdates(Instant cutoff) {
        jdbc.sql("DELETE FROM telegram_user_updates WHERE received_at < :cutoff LIMIT 10000")
                .param("cutoff", Timestamp.from(cutoff)).update();
    }

    public void disconnect(long userId) {
        jdbc.sql("DELETE FROM telegram_owner_links WHERE user_id = :userId").param("userId", userId).update();
    }

    public void disconnectChat(long chatId) {
        jdbc.sql("DELETE FROM telegram_owner_links WHERE telegram_user_id = :chatId").param("chatId", chatId).update();
    }
}
