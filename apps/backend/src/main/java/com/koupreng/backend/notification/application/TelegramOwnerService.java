package com.koupreng.backend.notification.application;

import com.koupreng.backend.notification.infrastructure.TelegramUserBotProperties;
import com.koupreng.backend.notification.infrastructure.persistence.TelegramOwnerRepository;
import com.koupreng.backend.shared.config.AppProperties;
import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.user.application.CurrentUserService;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class TelegramOwnerService {
    private static final String HELP = "/settings · ការកំណត់ / Settings\n/stop · ផ្ដាច់ / Disconnect";
    private final SecureRandom random = new SecureRandom();
    private final CurrentUserService users;
    private final TelegramOwnerRepository owners;
    private final TelegramUserBotProperties bot;
    private final String baseUrl;

    public TelegramOwnerService(CurrentUserService users, TelegramOwnerRepository owners,
            TelegramUserBotProperties bot, AppProperties app) {
        this.users = users;
        this.owners = owners;
        this.bot = bot;
        this.baseUrl = app.getInvitation().getPublicBaseUrl().replaceAll("/+$", "");
    }

    public Settings settings(Authentication authentication) {
        long userId = users.currentUser(authentication).getId();
        return new Settings(bot.enabled(), bot.enabled() && owners.linkedChat(userId).isPresent());
    }

    public ConnectLink begin(Authentication authentication) {
        if (!bot.enabled()) throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Telegram notifications are unavailable");
        long userId = users.currentUser(authentication).getId();
        if (owners.linkedChat(userId).isPresent()) {
            throw new ApiException(HttpStatus.CONFLICT, "Disconnect your current Telegram chat before linking a new one");
        }
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        String challenge = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        Instant expiresAt = Instant.now().plusSeconds(300);
        owners.createChallenge(userId, digest(challenge), expiresAt);
        return new ConnectLink("https://t.me/" + bot.username() + "?start=" + challenge, expiresAt);
    }

    public void disconnect(Authentication authentication) {
        owners.disconnect(users.currentUser(authentication).getId());
    }

    @org.springframework.transaction.annotation.Transactional
    public Map<String, Object> receive(String suppliedSecret, com.fasterxml.jackson.databind.JsonNode update) {
        if (!bot.enabled()) throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Telegram notifications are unavailable");
        if (suppliedSecret == null || !MessageDigest.isEqual(suppliedSecret.getBytes(StandardCharsets.UTF_8),
                bot.webhookSecret().getBytes(StandardCharsets.UTF_8))) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Invalid Telegram webhook secret");
        }
        var message = update.path("message");
        var from = message.path("from");
        var chat = message.path("chat");
        long chatId = chat.path("id").asLong(0);
        if (!"private".equals(chat.path("type").asText()) || chatId <= 0
                || chatId != from.path("id").asLong(0) || from.path("is_bot").asBoolean(true)
                || message.has("forward_origin") || message.has("sender_chat") || message.has("via_bot")) {
            return Map.of();
        }
        String[] command = message.path("text").asText().strip().split("\\s+", 2);
        long updateId = update.path("update_id").asLong(-1);
        if (updateId < 0 || !owners.acceptUpdate(bot.token().substring(0, bot.token().indexOf(':')), updateId)) {
            return Map.of();
        }
        String reply = switch (command[0]) {
            case "/start" -> start(chatId, command);
            case "/help" -> "Koupreng Invitation\n" + HELP;
            case "/stop" -> {
                owners.disconnectChat(chatId);
                yield "បានផ្ដាច់ Telegram / Telegram disconnected";
            }
            case "/settings", "/events", "/guests", "/rsvp", "/stats", "/subscription", "/payment" ->
                    accountLink(chatId, command[0]);
            default -> null;
        };
        return reply == null ? Map.of() : Map.of("method", "sendMessage", "chat_id", chatId, "text", reply);
    }

    private String start(long chatId, String[] command) {
        if (command.length == 1) return "Koupreng Invitation\n" + HELP + "\n" + baseUrl + "/app/notifications";
        try {
            if (command[1].matches("[A-Za-z0-9_-]{43}")
                    && owners.consumeChallenge(digest(command[1]), chatId, Instant.now())) {
                return "បានភ្ជាប់ Telegram / Telegram notifications connected\n" + HELP;
            }
        } catch (DuplicateKeyException alreadyLinked) {
            return "Telegram នេះបានភ្ជាប់រួចហើយ / This Telegram chat is already linked.";
        }
        return "តំណភ្ជាប់ផុតកំណត់ / Link expired or already used. " + baseUrl + "/app/notifications";
    }

    private String accountLink(long chatId, String command) {
        if (owners.activeOwner(chatId).isEmpty()) {
            return "ភ្ជាប់គណនីរបស់អ្នក / Connect your account: " + baseUrl + "/app/notifications";
        }
        String path = switch (command) {
            case "/settings" -> "/app/notifications";
            case "/subscription" -> "/app/packages";
            case "/payment" -> "/app/payments";
            default -> "/app/events";
        };
        return baseUrl + path;
    }

    private static String digest(String challenge) {
        try {
            byte[] bytes = MessageDigest.getInstance("SHA-256").digest(challenge.getBytes(StandardCharsets.UTF_8));
            return java.util.HexFormat.of().formatHex(bytes);
        } catch (NoSuchAlgorithmException impossible) {
            throw new IllegalStateException(impossible);
        }
    }

    public record Settings(boolean available, boolean connected) {}
    public record ConnectLink(String url, Instant expiresAt) {}
}
