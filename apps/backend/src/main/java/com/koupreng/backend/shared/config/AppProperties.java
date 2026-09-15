package com.koupreng.backend.shared.config;

import java.util.ArrayList;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    @Valid
    private final Jwt jwt = new Jwt();

    @Valid
    private final Auth auth = new Auth();

    @Valid
    private final Oauth oauth = new Oauth();

    @Valid
    private final RateLimit rateLimit = new RateLimit();

    @Valid
    private final Invitation invitation = new Invitation();

    public Jwt getJwt() {
        return jwt;
    }

    public Auth getAuth() {
        return auth;
    }

    public Oauth getOauth() {
        return oauth;
    }

    public RateLimit getRateLimit() {
        return rateLimit;
    }

    public Invitation getInvitation() {
        return invitation;
    }

    public static class Jwt {

        @NotBlank
        private String issuer;

        @NotBlank
        @Size(min = 32)
        private String secret;

        @Positive
        private long accessTokenMinutes = 15;

        public String getIssuer() {
            return issuer;
        }

        public void setIssuer(String issuer) {
            this.issuer = issuer;
        }

        public String getSecret() {
            return secret;
        }

        public void setSecret(String secret) {
            this.secret = secret;
        }

        public long getAccessTokenMinutes() {
            return accessTokenMinutes;
        }

        public void setAccessTokenMinutes(long accessTokenMinutes) {
            this.accessTokenMinutes = accessTokenMinutes;
        }
    }

    public static class Auth {

        @Valid
        private final Cookie cookie = new Cookie();

        private boolean firstUserAdminEnabled = false;

        @Min(1)
        private int maxLoginAttemptsPerMinute = 10;

        @Min(1)
        private int maxRegisterAttemptsPerMinute = 5;

        @Min(1)
        private int maxSocialLoginAttemptsPerMinute = 20;

        @Min(1)
        private int maxForgotPasswordAttemptsPerMinute = 3;

        @Min(1)
        private int maxResetPasswordAttemptsPerMinute = 5;

        public Cookie getCookie() {
            return cookie;
        }

        public boolean isFirstUserAdminEnabled() {
            return firstUserAdminEnabled;
        }

        public void setFirstUserAdminEnabled(boolean firstUserAdminEnabled) {
            this.firstUserAdminEnabled = firstUserAdminEnabled;
        }

        public int getMaxLoginAttemptsPerMinute() {
            return maxLoginAttemptsPerMinute;
        }

        public void setMaxLoginAttemptsPerMinute(int maxLoginAttemptsPerMinute) {
            this.maxLoginAttemptsPerMinute = maxLoginAttemptsPerMinute;
        }

        public int getMaxRegisterAttemptsPerMinute() {
            return maxRegisterAttemptsPerMinute;
        }

        public void setMaxRegisterAttemptsPerMinute(int maxRegisterAttemptsPerMinute) {
            this.maxRegisterAttemptsPerMinute = maxRegisterAttemptsPerMinute;
        }

        public int getMaxSocialLoginAttemptsPerMinute() {
            return maxSocialLoginAttemptsPerMinute;
        }

        public void setMaxSocialLoginAttemptsPerMinute(int maxSocialLoginAttemptsPerMinute) {
            this.maxSocialLoginAttemptsPerMinute = maxSocialLoginAttemptsPerMinute;
        }

        public int getMaxForgotPasswordAttemptsPerMinute() {
            return maxForgotPasswordAttemptsPerMinute;
        }

        public void setMaxForgotPasswordAttemptsPerMinute(int maxForgotPasswordAttemptsPerMinute) {
            this.maxForgotPasswordAttemptsPerMinute = maxForgotPasswordAttemptsPerMinute;
        }

        public int getMaxResetPasswordAttemptsPerMinute() {
            return maxResetPasswordAttemptsPerMinute;
        }

        public void setMaxResetPasswordAttemptsPerMinute(int maxResetPasswordAttemptsPerMinute) {
            this.maxResetPasswordAttemptsPerMinute = maxResetPasswordAttemptsPerMinute;
        }

        public static class Cookie {

            private boolean enabled;

            @NotBlank
            @Pattern(regexp = "^[A-Za-z0-9_-]+$")
            private String name = "koupreng_access_token";

            private boolean secure;

            private boolean httpOnly = true;

            @NotBlank
            @Pattern(regexp = "(?i)lax|strict|none")
            private String sameSite = "Strict";

            @Min(0)
            private long maxAgeSeconds = 900;

            public boolean isEnabled() {
                return enabled;
            }

            public void setEnabled(boolean enabled) {
                this.enabled = enabled;
            }

            public String getName() {
                return name;
            }

            public void setName(String name) {
                this.name = name;
            }

            public boolean isSecure() {
                return secure;
            }

            public void setSecure(boolean secure) {
                this.secure = secure;
            }

            public boolean isHttpOnly() {
                return httpOnly;
            }

            public void setHttpOnly(boolean httpOnly) {
                this.httpOnly = httpOnly;
            }

            public String getSameSite() {
                return sameSite;
            }

            public void setSameSite(String sameSite) {
                if (sameSite == null || sameSite.isBlank()) {
                    this.sameSite = sameSite;
                    return;
                }
                String normalized = sameSite.trim();
                this.sameSite = normalized.substring(0, 1).toUpperCase() + normalized.substring(1).toLowerCase();
            }

            public long getMaxAgeSeconds() {
                return maxAgeSeconds;
            }

            public void setMaxAgeSeconds(long maxAgeSeconds) {
                this.maxAgeSeconds = maxAgeSeconds;
            }
        }
    }

    public static class Oauth {

        @Valid
        private final Google google = new Google();

        @Valid
        private final Telegram telegram = new Telegram();

        public Google getGoogle() {
            return google;
        }

        public Telegram getTelegram() {
            return telegram;
        }

        public static class Google {

            private List<String> clientIds = new ArrayList<>();

            @NotBlank
            private String jwkSetUri = "https://www.googleapis.com/oauth2/v3/certs";

            public List<String> getClientIds() {
                return clientIds;
            }

            public void setClientIds(List<String> clientIds) {
                this.clientIds = clientIds == null ? new ArrayList<>() : clientIds;
            }

            public String getJwkSetUri() {
                return jwkSetUri;
            }

            public void setJwkSetUri(String jwkSetUri) {
                this.jwkSetUri = jwkSetUri;
            }
        }

        public static class Telegram {

            private String botToken = "";

            private String clientId = "";

            @NotBlank
            private String jwkSetUri = "https://oauth.telegram.org/.well-known/jwks.json";

            @Min(120)
            private long authMaxAgeSeconds = 600;

            @NotBlank
            private String emailDomain = "telegram.local";

            public String getBotToken() {
                return botToken;
            }

            public void setBotToken(String botToken) {
                this.botToken = botToken;
            }

            public String getClientId() {
                return clientId;
            }

            public void setClientId(String clientId) {
                this.clientId = clientId;
            }

            public String getJwkSetUri() {
                return jwkSetUri;
            }

            public void setJwkSetUri(String jwkSetUri) {
                this.jwkSetUri = jwkSetUri;
            }

            public long getAuthMaxAgeSeconds() {
                return authMaxAgeSeconds;
            }

            public void setAuthMaxAgeSeconds(long authMaxAgeSeconds) {
                this.authMaxAgeSeconds = authMaxAgeSeconds;
            }

            public String getEmailDomain() {
                return emailDomain;
            }

            public void setEmailDomain(String emailDomain) {
                this.emailDomain = emailDomain;
            }
        }
    }

    public static class RateLimit {

        private Backend backend = Backend.MEMORY;

        @NotBlank
        private String redisKeyPrefix = "koupreng:rate-limit:";

        private boolean failClosed = true;

        public Backend getBackend() {
            return backend;
        }

        public void setBackend(Backend backend) {
            this.backend = backend == null ? Backend.MEMORY : backend;
        }

        public String getRedisKeyPrefix() {
            return redisKeyPrefix;
        }

        public void setRedisKeyPrefix(String redisKeyPrefix) {
            this.redisKeyPrefix = redisKeyPrefix;
        }

        public boolean isFailClosed() {
            return failClosed;
        }

        public void setFailClosed(boolean failClosed) {
            this.failClosed = failClosed;
        }

        public enum Backend {
            MEMORY,
            REDIS
        }
    }

    public static class Invitation {

        @NotBlank
        private String publicBaseUrl = "http://localhost:5173";

        @Min(1)
        private int maxPublicRsvpSubmissionsPerMinute = 5;

        public String getPublicBaseUrl() {
            return publicBaseUrl;
        }

        public void setPublicBaseUrl(String publicBaseUrl) {
            this.publicBaseUrl = publicBaseUrl;
        }

        public int getMaxPublicRsvpSubmissionsPerMinute() {
            return maxPublicRsvpSubmissionsPerMinute;
        }

        public void setMaxPublicRsvpSubmissionsPerMinute(int maxPublicRsvpSubmissionsPerMinute) {
            this.maxPublicRsvpSubmissionsPerMinute = maxPublicRsvpSubmissionsPerMinute;
        }
    }
}
