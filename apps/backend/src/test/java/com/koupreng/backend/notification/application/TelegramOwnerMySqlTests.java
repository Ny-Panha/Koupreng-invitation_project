package com.koupreng.backend.notification.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.koupreng.backend.notification.infrastructure.persistence.NotificationRepository;
import com.koupreng.backend.notification.infrastructure.persistence.TelegramOwnerRepository;
import com.koupreng.backend.user.domain.AppUser;
import com.koupreng.backend.user.infrastructure.persistence.AppUserRepository;
import java.time.Instant;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

@SpringBootTest
@ActiveProfiles("test")
@EnabledIfEnvironmentVariable(named = "RUN_FLYWAY_INTEGRATION", matches = "true")
class TelegramOwnerMySqlTests {
    @Autowired TelegramOwnerRepository owners;
    @Autowired AppUserRepository users;
    @Autowired NotificationRepository notifications;

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", () -> System.getenv("FLYWAY_TEST_DB_URL"));
        registry.add("spring.datasource.username", () -> System.getenv("FLYWAY_TEST_DB_USERNAME"));
        registry.add("spring.datasource.password", () -> System.getenv("FLYWAY_TEST_DB_PASSWORD"));
        registry.add("spring.datasource.driver-class-name", () -> "com.mysql.cj.jdbc.Driver");
        registry.add("spring.flyway.enabled", () -> true);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "validate");
        registry.add("spring.jpa.database-platform", () -> "org.hibernate.dialect.MySQLDialect");
    }

    @Test
    void challengeIsSingleUseAndDeliveryIsBoundToTheOptedInOwner() {
        var owner = user();
        var other = user();
        long chat = 9000000000L + owner.getId();
        Instant now = Instant.now();
        String expired = digestFixture();
        owners.createChallenge(owner.getId(), expired, now.minusSeconds(1));
        assertFalse(owners.consumeChallenge(expired, chat, now));

        String digest = digestFixture();
        owners.createChallenge(owner.getId(), digest, now.plusSeconds(300));
        assertTrue(owners.consumeChallenge(digest, chat, now));
        assertFalse(owners.consumeChallenge(digest, chat + 1, now));
        assertTrue(owners.linkedChat(other.getId()).isEmpty());

        String delivery = UUID.randomUUID().toString();
        owners.enqueue(owner.getId(), delivery, "Event notice", "Fixture");
        owners.enqueue(owner.getId(), delivery, "Duplicate", "Fixture");
        owners.enqueue(other.getId(), UUID.randomUUID().toString(), "No consent", "Fixture");
        var queued = notifications.findByUserIdOrderByCreatedAtDesc(owner.getId());
        assertEquals(1, queued.size());
        assertEquals(Long.toString(chat), queued.getFirst().getRecipientTelegramId());
        assertTrue(notifications.findByUserIdOrderByCreatedAtDesc(other.getId()).isEmpty());

        owners.disconnect(owner.getId());
        assertTrue(owners.activeOwner(chat).isEmpty());
        owners.enqueue(owner.getId(), UUID.randomUUID().toString(), "Disconnected", "Fixture");
        assertEquals(1, notifications.findByUserIdOrderByCreatedAtDesc(owner.getId()).size());
    }

    @Test
    void webhookReplayIsScopedToEachBotIdentity() {
        long update = Instant.now().toEpochMilli();
        assertTrue(owners.acceptUpdate("991001", update));
        assertFalse(owners.acceptUpdate("991001", update));
        assertTrue(owners.acceptUpdate("991002", update));
    }

    private AppUser user() {
        AppUser user = new AppUser();
        user.setFullName("Telegram QA");
        user.setEmail(UUID.randomUUID() + "@example.test");
        return users.saveAndFlush(user);
    }

    private String digestFixture() {
        return java.util.HexFormat.of().formatHex(
                UUID.randomUUID().toString().substring(0, 32).getBytes(java.nio.charset.StandardCharsets.US_ASCII));
    }
}
