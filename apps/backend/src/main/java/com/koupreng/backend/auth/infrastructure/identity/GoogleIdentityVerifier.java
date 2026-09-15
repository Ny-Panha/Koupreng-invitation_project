package com.koupreng.backend.auth.infrastructure.identity;

import java.util.List;
import java.util.Locale;
import java.util.Set;

import com.koupreng.backend.auth.domain.ExternalAuthIdentity;
import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.config.AppProperties;
import com.koupreng.backend.entity.user.AuthProvider;

import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Service;

@Service
public class GoogleIdentityVerifier {

    private static final Set<String> ACCEPTED_ISSUERS = Set.of(
            "accounts.google.com",
            "https://accounts.google.com"
    );

    private final AppProperties.Oauth.Google googleProperties;
    private final JwtDecoder jwtDecoder;

    public GoogleIdentityVerifier(AppProperties appProperties) {
        this.googleProperties = appProperties.getOauth().getGoogle();
        this.jwtDecoder = NimbusJwtDecoder.withJwkSetUri(googleProperties.getJwkSetUri()).build();
    }

    public ExternalAuthIdentity verify(String idToken) {
        List<String> clientIds = configuredClientIds();
        if (clientIds.isEmpty()) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Google login is not configured");
        }

        Jwt jwt;
        try {
            jwt = jwtDecoder.decode(idToken);
        } catch (JwtException exception) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid Google ID token");
        }

        String issuer = jwt.getIssuer() == null ? "" : jwt.getIssuer().toString();
        if (!ACCEPTED_ISSUERS.contains(issuer)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid Google ID token issuer");
        }

        if (jwt.getAudience().stream().noneMatch(clientIds::contains)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Google ID token audience is not allowed");
        }

        String providerId = jwt.getSubject();
        String email = claimAsString(jwt, "email");
        if (isBlank(providerId) || isBlank(email)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Google ID token is missing account data");
        }

        if (!claimAsBoolean(jwt, "email_verified")) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Google account email is not verified");
        }

        String fullName = claimAsString(jwt, "name");
        if (isBlank(fullName)) {
            fullName = email.split("@", 2)[0];
        }

        return new ExternalAuthIdentity(
                AuthProvider.GOOGLE,
                providerId,
                email.trim().toLowerCase(Locale.ROOT),
                fullName.trim()
        );
    }

    private List<String> configuredClientIds() {
        return googleProperties.getClientIds().stream()
                .filter(value -> value != null && !value.isBlank())
                .map(String::trim)
                .toList();
    }

    private boolean claimAsBoolean(Jwt jwt, String claimName) {
        Object value = jwt.getClaim(claimName);
        if (value instanceof Boolean booleanValue) {
            return booleanValue;
        }
        return "true".equalsIgnoreCase(String.valueOf(value));
    }

    private String claimAsString(Jwt jwt, String claimName) {
        Object value = jwt.getClaim(claimName);
        return value == null ? "" : String.valueOf(value);
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
