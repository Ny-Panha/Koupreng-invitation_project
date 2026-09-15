package com.koupreng.backend.auth.infrastructure.identity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.config.AppProperties;
import com.koupreng.backend.auth.api.dto.TelegramLoginRequest;
import com.koupreng.backend.auth.domain.ExternalAuthIdentity;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.http.HttpStatus;

class TelegramIdentityVerifierTests {

    private static final String BOT_TOKEN = "123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11";

    private AppProperties appProperties;
    private StringRedisTemplate redisTemplate;
    private ValueOperations<String, String> valueOperations;
    private ObjectProvider<StringRedisTemplate> redisTemplateProvider;
    private TelegramIdentityVerifier verifier;

    @BeforeEach
    @SuppressWarnings("unchecked")
    void setUp() {
        appProperties = new AppProperties();
        appProperties.getOauth().getTelegram().setBotToken(BOT_TOKEN);
        appProperties.getOauth().getTelegram().setAuthMaxAgeSeconds(600);

        redisTemplate = mock(StringRedisTemplate.class);
        valueOperations = mock(ValueOperations.class);
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);

        redisTemplateProvider = mock(ObjectProvider.class);
        when(redisTemplateProvider.getIfAvailable()).thenReturn(redisTemplate);

        verifier = new TelegramIdentityVerifier(appProperties, redisTemplateProvider);
    }

    @Test
    void acceptsValidLoginAndRegistersHashInRedis() throws Exception {
        long authDate = Instant.now().getEpochSecond();
        String dataCheckString = "auth_date=" + authDate + "\nfirst_name=John\nid=12345678\nusername=johndoe";
        String hash = computeTelegramHash(dataCheckString, BOT_TOKEN);

        when(valueOperations.setIfAbsent(eq("telegram:auth:hash:" + hash), eq("1"), any(Duration.class)))
                .thenReturn(true);

        TelegramLoginRequest request = new TelegramLoginRequest(
                null, 12345678L, "John", null, "johndoe", null, authDate, hash
        );

        ExternalAuthIdentity identity = verifier.verify(request);
        assertNotNull(identity);
        assertEquals("12345678", identity.providerId());
    }

    @Test
    void rejectsReplayedHashWhenAlreadyInRedis() throws Exception {
        long authDate = Instant.now().getEpochSecond();
        String dataCheckString = "auth_date=" + authDate + "\nfirst_name=John\nid=12345678\nusername=johndoe";
        String hash = computeTelegramHash(dataCheckString, BOT_TOKEN);

        when(valueOperations.setIfAbsent(eq("telegram:auth:hash:" + hash), eq("1"), any(Duration.class)))
                .thenReturn(false);

        TelegramLoginRequest request = new TelegramLoginRequest(
                null, 12345678L, "John", null, "johndoe", null, authDate, hash
        );

        ApiException exception = assertThrows(ApiException.class, () -> verifier.verify(request));
        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatus());
        assertEquals("Telegram login data has already been used", exception.getMessage());
    }

    private String computeTelegramHash(String dataCheckString, String botToken) throws Exception {
        MessageDigest sha256 = MessageDigest.getInstance("SHA-256");
        byte[] secretKey = sha256.digest(botToken.getBytes(StandardCharsets.UTF_8));
        Mac hmac = Mac.getInstance("HmacSHA256");
        hmac.init(new SecretKeySpec(secretKey, "HmacSHA256"));
        byte[] signature = hmac.doFinal(dataCheckString.getBytes(StandardCharsets.UTF_8));
        return HexFormat.of().formatHex(signature);
    }
}
