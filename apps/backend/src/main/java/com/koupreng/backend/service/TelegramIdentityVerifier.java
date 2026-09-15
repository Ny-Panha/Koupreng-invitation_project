package com.koupreng.backend.service;

import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.config.AppProperties;
import com.koupreng.backend.dto.TelegramLoginRequest;
import com.koupreng.backend.entity.user.AuthProvider;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Service;

@Service
public class TelegramIdentityVerifier {

    private static final Logger log = LoggerFactory.getLogger(TelegramIdentityVerifier.class);
    private static final long ALLOWED_CLOCK_SKEW_SECONDS = 60;
    private static final String OIDC_ISSUER = "https://oauth.telegram.org";

    private final AppProperties.Oauth.Telegram telegramProperties;
    private final JwtDecoder jwtDecoder;
    private final ObjectProvider<StringRedisTemplate> redisTemplateProvider;
    private final Clock clock = Clock.systemUTC();

    @Autowired
    public TelegramIdentityVerifier(
            AppProperties appProperties,
            ObjectProvider<StringRedisTemplate> redisTemplateProvider
    ) {
        this.telegramProperties = appProperties.getOauth().getTelegram();
        this.jwtDecoder = NimbusJwtDecoder.withJwkSetUri(telegramProperties.getJwkSetUri()).build();
        this.redisTemplateProvider = redisTemplateProvider;
    }

    public TelegramIdentityVerifier(AppProperties appProperties) {
        this(appProperties, null);
    }

    public ExternalAuthIdentity verify(TelegramLoginRequest request) {
        if (!isBlank(request.idToken())) {
            return verifyIdToken(request.idToken());
        }

        return verifyLegacyWidgetPayload(request);
    }

    private ExternalAuthIdentity verifyIdToken(String idToken) {
        String clientId = configuredClientId();
        if (clientId.isBlank()) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Telegram login is not configured");
        }

        Jwt jwt;
        try {
            jwt = jwtDecoder.decode(idToken);
        } catch (JwtException exception) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid Telegram ID token");
        }

        String issuer = jwt.getIssuer() == null ? "" : jwt.getIssuer().toString();
        if (!OIDC_ISSUER.equals(issuer)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid Telegram ID token issuer");
        }

        if (jwt.getAudience().stream().noneMatch(clientId::equals)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Telegram ID token audience is not allowed");
        }

        Instant now = clock.instant();
        Instant expiresAt = jwt.getExpiresAt();
        if (expiresAt == null || expiresAt.isBefore(now)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Telegram ID token has expired");
        }

        Instant issuedAt = jwt.getIssuedAt();
        if (issuedAt != null && issuedAt.isAfter(now.plusSeconds(ALLOWED_CLOCK_SKEW_SECONDS))) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Telegram ID token timestamp is invalid");
        }

        String providerId = claimAsString(jwt, "id");
        if (providerId.isBlank()) {
            providerId = jwt.getSubject();
        }

        if (isBlank(providerId)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Telegram ID token is missing account data");
        }

        String fullName = claimAsString(jwt, "name");
        if (fullName.isBlank()) {
            String username = claimAsString(jwt, "preferred_username");
            fullName = username.isBlank() ? "Telegram User " + providerId : "@" + username;
        }

        return telegramIdentity(providerId, fullName);
    }

    private ExternalAuthIdentity verifyLegacyWidgetPayload(TelegramLoginRequest request) {
        String botToken = telegramProperties.getBotToken();
        if (botToken == null || botToken.isBlank()) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Telegram login is not configured");
        }

        if (request.id() == null || request.authDate() == null || isBlank(request.hash())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Telegram login data is incomplete");
        }

        Instant now = clock.instant();
        Instant authTime = Instant.ofEpochSecond(request.authDate());
        if (authTime.isAfter(now.plusSeconds(ALLOWED_CLOCK_SKEW_SECONDS))) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Telegram login timestamp is invalid");
        }

        if (authTime.plusSeconds(telegramProperties.getAuthMaxAgeSeconds()).isBefore(now)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Telegram login data has expired");
        }

        String expectedHash = expectedHash(request, botToken);
        if (!constantTimeEquals(expectedHash, request.hash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid Telegram login data");
        }

        deduplicateHash(request.hash());

        return telegramIdentity(String.valueOf(request.id()), fullName(request));
    }

    private void deduplicateHash(String hash) {
        StringRedisTemplate redisTemplate = redisTemplateProvider != null ? redisTemplateProvider.getIfAvailable() : null;
        if (redisTemplate == null) {
            return;
        }

        String key = "telegram:auth:hash:" + hash;
        Duration ttl = Duration.ofSeconds(Math.max(60, telegramProperties.getAuthMaxAgeSeconds()));
        try {
            Boolean isNew = redisTemplate.opsForValue().setIfAbsent(key, "1", ttl);
            if (Boolean.FALSE.equals(isNew)) {
                throw new ApiException(HttpStatus.UNAUTHORIZED, "Telegram login data has already been used");
            }
        } catch (ApiException exception) {
            throw exception;
        } catch (Exception ex) {
            log.warn("Failed to verify Telegram replay protection in Redis: {}", ex.getMessage());
        }
    }

    private ExternalAuthIdentity telegramIdentity(String providerId, String fullName) {
        return new ExternalAuthIdentity(
                AuthProvider.TELEGRAM,
                providerId,
                "telegram-" + providerId + "@" + telegramProperties.getEmailDomain(),
                fullName.trim()
        );
    }

    private String configuredClientId() {
        if (!isBlank(telegramProperties.getClientId())) {
            return telegramProperties.getClientId().trim();
        }

        String botToken = telegramProperties.getBotToken();
        if (botToken == null) {
            return "";
        }

        int tokenSeparator = botToken.indexOf(':');
        String botId = tokenSeparator < 0 ? botToken : botToken.substring(0, tokenSeparator);
        return botId.chars().allMatch(Character::isDigit) ? botId : "";
    }

    private String expectedHash(TelegramLoginRequest request, String botToken) {
        try {
            MessageDigest sha256 = MessageDigest.getInstance("SHA-256");
            byte[] secretKey = sha256.digest(botToken.getBytes(StandardCharsets.UTF_8));

            Mac hmac = Mac.getInstance("HmacSHA256");
            hmac.init(new SecretKeySpec(secretKey, "HmacSHA256"));
            byte[] signature = hmac.doFinal(dataCheckString(request).getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(signature);
        } catch (NoSuchAlgorithmException | InvalidKeyException exception) {
            throw new IllegalStateException("Could not verify Telegram login data", exception);
        }
    }

    private String dataCheckString(TelegramLoginRequest request) {
        Map<String, String> values = new TreeMap<>();
        values.put("auth_date", String.valueOf(request.authDate()));
        values.put("id", String.valueOf(request.id()));
        putIfPresent(values, "first_name", request.firstName());
        putIfPresent(values, "last_name", request.lastName());
        putIfPresent(values, "photo_url", request.photoUrl());
        putIfPresent(values, "username", request.username());

        return values.entrySet().stream()
                .map(entry -> entry.getKey() + "=" + entry.getValue())
                .collect(Collectors.joining("\n"));
    }

    private void putIfPresent(Map<String, String> values, String key, String value) {
        if (value != null) {
            values.put(key, value);
        }
    }

    private boolean constantTimeEquals(String expectedHash, String actualHash) {
        byte[] expected = expectedHash.getBytes(StandardCharsets.UTF_8);
        byte[] actual = actualHash == null ? new byte[0] : actualHash.toLowerCase().getBytes(StandardCharsets.UTF_8);
        return MessageDigest.isEqual(expected, actual);
    }

    private String claimAsString(Jwt jwt, String claimName) {
        Object value = jwt.getClaim(claimName);
        return value == null ? "" : String.valueOf(value).trim();
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private String fullName(TelegramLoginRequest request) {
        String joinedName = ((request.firstName() == null ? "" : request.firstName().trim())
                + " "
                + (request.lastName() == null ? "" : request.lastName().trim())).trim();
        if (!joinedName.isBlank()) {
            return joinedName;
        }

        if (request.username() != null && !request.username().isBlank()) {
            return "@" + request.username().trim();
        }

        return "Telegram User " + request.id();
    }
}
