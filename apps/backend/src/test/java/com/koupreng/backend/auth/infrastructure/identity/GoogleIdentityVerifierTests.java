package com.koupreng.backend.auth.infrastructure.identity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.time.Instant;
import java.util.Date;

import com.koupreng.backend.shared.config.AppProperties;
import com.koupreng.backend.shared.exception.ApiException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.sun.net.httpserver.HttpServer;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

class GoogleIdentityVerifierTests {
    private HttpServer server;
    private RSAKey key;
    private GoogleIdentityVerifier verifier;

    @BeforeEach
    void isolatedJwks() throws Exception {
        key = generatedKey();
        byte[] publicKeys = new JWKSet(key.toPublicJWK()).toString().getBytes(StandardCharsets.UTF_8);
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/jwks", exchange -> {
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, publicKeys.length);
            try (var body = exchange.getResponseBody()) {
                body.write(publicKeys);
            }
        });
        server.start();
        AppProperties properties = new AppProperties();
        properties.getOauth().getGoogle().setClientIds(java.util.List.of("test-client"));
        properties.getOauth().getGoogle().setJwkSetUri("http://127.0.0.1:" + server.getAddress().getPort() + "/jwks");
        verifier = new GoogleIdentityVerifier(properties);
    }

    @AfterEach
    void stopOwnedJwks() {
        if (server != null) {
            server.stop(0);
        }
    }

    @Test
    void configuredJwksAcceptsSignedVerifiedIdentity() throws Exception {
        var identity = verifier.verify(token(key, "https://accounts.google.com", "test-client", 300, true));
        assertEquals("subject-123", identity.providerId());
        assertEquals("user@example.test", identity.email());
    }

    @Test
    void wrongIssuerIsRejected() throws Exception {
        rejected(token(key, "https://attacker.example.test", "test-client", 300, true));
    }

    @Test
    void wrongAudienceIsRejected() throws Exception {
        rejected(token(key, "https://accounts.google.com", "wrong-client", 300, true));
    }

    @Test
    void expiredTokenIsRejected() throws Exception {
        rejected(token(key, "https://accounts.google.com", "test-client", -120, true));
    }

    @Test
    void wrongSigningKeyIsRejected() throws Exception {
        rejected(token(generatedKey(), "https://accounts.google.com", "test-client", 300, true));
    }

    @Test
    void unverifiedEmailIsRejected() throws Exception {
        rejected(token(key, "https://accounts.google.com", "test-client", 300, false));
    }

    private void rejected(String token) {
        assertEquals(HttpStatus.UNAUTHORIZED, assertThrows(ApiException.class, () -> verifier.verify(token)).getStatus());
    }

    private String token(RSAKey signingKey, String issuer, String audience, long remainingSeconds, boolean verified)
            throws Exception {
        Instant now = Instant.now();
        var claims = new JWTClaimsSet.Builder().issuer(issuer).audience(audience).subject("subject-123")
                .issueTime(Date.from(now.minusSeconds(300))).expirationTime(Date.from(now.plusSeconds(remainingSeconds)))
                .claim("email", "USER@example.test").claim("email_verified", verified).claim("name", "Test User").build();
        SignedJWT jwt = new SignedJWT(new JWSHeader.Builder(JWSAlgorithm.RS256).keyID("generated-test-key").build(), claims);
        jwt.sign(new RSASSASigner(signingKey));
        return jwt.serialize();
    }

    private RSAKey generatedKey() throws Exception {
        var generator = KeyPairGenerator.getInstance("RSA");
        generator.initialize(2048);
        var pair = generator.generateKeyPair();
        return new RSAKey.Builder((RSAPublicKey) pair.getPublic()).privateKey((RSAPrivateKey) pair.getPrivate())
                .keyID("generated-test-key").build();
    }
}
