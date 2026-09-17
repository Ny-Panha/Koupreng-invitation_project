package com.koupreng.backend.shared.config;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Set;

import com.koupreng.backend.shared.config.AppProperties.RateLimit.Backend;
import com.koupreng.backend.payment.infrastructure.config.PaymentProperties;
import com.koupreng.backend.shared.security.ApiSecurityProperties;
import com.koupreng.backend.shared.security.waf.WafProperties;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
public class ProductionSecurityValidator implements ApplicationRunner {

    private static final int MIN_PRODUCTION_JWT_SECRET_LENGTH = 64;
    private static final Set<String> PLACEHOLDER_JWT_SECRETS = Set.of(
            "replace_with_a_random_64_character_or_longer_secret"
    );
    private static final String REQUIRED_STATIC_ABA_PAYMENT_LINK = "https://link.payway.com.kh/ABAPAYrD450560q";
    private static final String REQUIRED_BASIC_PAYMENT_LINK =
            "https://link.payway.com.kh/ABAPAYMu523385B";
    private static final String REQUIRED_PRO_PAYMENT_LINK =
            "https://link.payway.com.kh/ABAPAY9G523386h";
    private static final String REQUIRED_PREMIUM_PAYMENT_LINK =
            "https://link.payway.com.kh/ABAPAYBo5233877";
    private static final Set<String> PLACEHOLDER_ADMIN_PAYMENT_SECRETS = Set.of(
            "change-me-local-only",
            "change_this_to_random_secret",
            "change_this_to_a_random_secret",
            "change_this_to_a_random_secret_here",
            "change-me",
            "change_me",
            "placeholder"
    );

    private final Environment environment;
    private final AppProperties appProperties;
    private final ApiSecurityProperties apiSecurityProperties;
    private final WafProperties wafProperties;
    private final PaymentProperties paymentProperties;

    public ProductionSecurityValidator(
            Environment environment,
            AppProperties appProperties,
            ApiSecurityProperties apiSecurityProperties,
            WafProperties wafProperties,
            PaymentProperties paymentProperties
    ) {
        this.environment = environment;
        this.appProperties = appProperties;
        this.apiSecurityProperties = apiSecurityProperties;
        this.wafProperties = wafProperties;
        this.paymentProperties = paymentProperties;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!isDevelopmentProfile()) {
            validateProductionConfiguration();
        }
    }

    void validateProductionConfiguration() {
        List<String> failures = new ArrayList<>();

        validateJwt(failures);
        validateHttps(failures);
        validateCors(failures);
        validateWaf(failures);
        validateRateLimiting(failures);
        validateDatabase(failures);
        validateAuthBootstrap(failures);
        validatePayment(failures);

        if (!failures.isEmpty()) {
            throw new IllegalStateException(
                    "Production security configuration errors: " + String.join("; ", failures)
            );
        }
    }

    private boolean isDevelopmentProfile() {
        String[] profiles = environment.getActiveProfiles();
        if (profiles.length == 0) {
            String propertyProfile = environment.getProperty("spring.profiles.active");
            if (propertyProfile != null && !propertyProfile.isBlank()) {
                profiles = propertyProfile.split(",");
            }
        }
        if (profiles.length == 0) {
            profiles = environment.getDefaultProfiles();
        }
        return Arrays.stream(profiles)
                .map(String::trim)
                .map(profile -> profile.toLowerCase(Locale.ROOT))
                .anyMatch(profile -> "dev".equals(profile)
                        || "local".equals(profile)
                        || "test".equals(profile));
    }

    private void validateJwt(List<String> failures) {
        String secret = nullToEmpty(appProperties.getJwt().getSecret());
        String normalizedSecret = secret.trim().toLowerCase(Locale.ROOT);

        if (secret.length() < MIN_PRODUCTION_JWT_SECRET_LENGTH) {
            failures.add("JWT_SECRET must be at least 64 characters in production");
        }
        if (PLACEHOLDER_JWT_SECRETS.contains(secret)
                || normalizedSecret.contains("replace_with")
                || normalizedSecret.contains("change_me")
                || normalizedSecret.contains("change_this")) {
            failures.add("JWT_SECRET must not use the example placeholder value");
        }
    }

    private void validateHttps(List<String> failures) {
        ApiSecurityProperties.Https https = apiSecurityProperties.getHttps();
        if (!https.isRequired()) {
            failures.add("HTTPS_REQUIRED must be true in production");
        }
        if (!https.isHstsEnabled()) {
            failures.add("HSTS_ENABLED must be true in production");
        }
        if (https.getHstsMaxAgeSeconds() < 31_536_000) {
            failures.add("HSTS_MAX_AGE_SECONDS must be at least 31536000 in production");
        }
        if (!apiSecurityProperties.getClientAddress().isForwardedHeadersEnabled()) {
            failures.add("CLIENT_ADDRESS_FORWARDED_HEADERS_ENABLED must be true behind the production proxy");
        }
    }

    private void validateCors(List<String> failures) {
        ApiSecurityProperties.Cors cors = apiSecurityProperties.getCors();
        if (!cors.isEnabled()) {
            failures.add("CORS_ENABLED must be true in production");
            return;
        }
        if (cors.getAllowedOrigins().isEmpty()) {
            failures.add("CORS_ALLOWED_ORIGINS must list the production frontend origins");
            return;
        }

        for (String origin : cors.getAllowedOrigins()) {
            String normalizedOrigin = nullToEmpty(origin).trim().toLowerCase(Locale.ROOT);
            if ("*".equals(normalizedOrigin)) {
                failures.add("CORS_ALLOWED_ORIGINS must not contain wildcard origins in production");
            } else if (!normalizedOrigin.startsWith("https://")) {
                failures.add("CORS_ALLOWED_ORIGINS entries must use https in production: " + origin);
            }
        }
    }

    private void validateWaf(List<String> failures) {
        if (!wafProperties.isEnabled()) {
            failures.add("WAF_ENABLED must be true in production");
        }
        if (wafProperties.isAuditOnly()) {
            failures.add("WAF_AUDIT_ONLY must be false in production");
        }
    }

    private void validateRateLimiting(List<String> failures) {
        if (appProperties.getRateLimit().getBackend() != Backend.REDIS) {
            failures.add("RATE_LIMIT_BACKEND must be redis in production");
        }
        if (!appProperties.getRateLimit().isFailClosed()) {
            failures.add("RATE_LIMIT_FAIL_CLOSED must be true in production");
        }
    }

    private void validateDatabase(List<String> failures) {
        String databaseUrl = nullToEmpty(environment.getProperty("spring.datasource.url"));
        String ddlAuto = nullToEmpty(environment.getProperty("spring.jpa.hibernate.ddl-auto", "none"))
                .toLowerCase(Locale.ROOT);
        boolean flywayEnabled = environment.getProperty("spring.flyway.enabled", Boolean.class, true);

        if (databaseUrl.isBlank()) {
            failures.add("DB_URL must be configured in production");
        } else {
            validateDatabaseSsl(databaseUrl, failures);
        }

        if (!Set.of("none", "validate").contains(ddlAuto)) {
            failures.add("JPA_DDL_AUTO must be none or validate in production");
        }
        if (!flywayEnabled) {
            failures.add("FLYWAY_ENABLED must be true in production");
        }
    }

    private void validateDatabaseSsl(String databaseUrl, List<String> failures) {
        String lowerUrl = databaseUrl.toLowerCase(Locale.ROOT);
        if (lowerUrl.startsWith("jdbc:mysql:")) {
            if (lowerUrl.contains("usessl=false")) {
                failures.add("MySQL DB_URL must not set useSSL=false in production");
            }
            if (lowerUrl.contains("allowpublickeyretrieval=true")) {
                failures.add("MySQL DB_URL must not set allowPublicKeyRetrieval=true in production");
            }
            if (!containsAny(lowerUrl, "sslmode=required", "sslmode=verify_ca",
                    "sslmode=verify_identity", "usessl=true")) {
                failures.add("MySQL DB_URL must require TLS in production");
            }
            return;
        }

        if (lowerUrl.startsWith("jdbc:postgresql:")
                && !containsAny(lowerUrl, "sslmode=require", "sslmode=verify-ca", "sslmode=verify-full")) {
            failures.add("PostgreSQL DB_URL must require TLS in production");
        }
    }

    private void validateAuthBootstrap(List<String> failures) {
        if (appProperties.getAuth().isFirstUserAdminEnabled()) {
            failures.add("FIRST_USER_ADMIN_ENABLED must be false in production");
        }
    }

    private void validatePayment(List<String> failures) {
        String adminSecret = nullToEmpty(paymentProperties.getAdminSecret()).trim();
        String normalizedSecret = adminSecret.toLowerCase(Locale.ROOT);
        if (adminSecret.isBlank()) {
            failures.add("ADMIN_PAYMENT_SECRET must be configured in production");
        } else if (PLACEHOLDER_ADMIN_PAYMENT_SECRETS.contains(normalizedSecret)
                || normalizedSecret.startsWith("${")
                || normalizedSecret.contains("replace_with")
                || normalizedSecret.contains("change-me")
                || normalizedSecret.contains("change_me")
                || normalizedSecret.contains("change_this")) {
            failures.add("ADMIN_PAYMENT_SECRET must not use an example placeholder value");
        }

        String providerMode = nullToEmpty(paymentProperties.getProviderMode()).trim();
        if (!"static".equalsIgnoreCase(providerMode)) {
            failures.add("PAYMENT_PROVIDER_MODE must be static in production");
        }

        String staticLink = nullToEmpty(paymentProperties.getAba().getStaticLink()).trim();
        if (!REQUIRED_STATIC_ABA_PAYMENT_LINK.equals(staticLink)) {
            failures.add("ABA_PAYWAY_STATIC_LINK must use the approved static ABA KHQR link");
        }

        PaymentProperties.Aba.Subscription subscriptionLinks = paymentProperties.getAba().getSubscription();
        if (!REQUIRED_BASIC_PAYMENT_LINK.equals(nullToEmpty(subscriptionLinks.getBasicLink()).trim())
                || !REQUIRED_PRO_PAYMENT_LINK.equals(nullToEmpty(subscriptionLinks.getProLink()).trim())
                || !REQUIRED_PREMIUM_PAYMENT_LINK.equals(
                        nullToEmpty(subscriptionLinks.getPremiumLink()).trim())) {
            failures.add("ABA subscription links must use the three approved fixed PayWay URLs");
        }
    }

    private boolean containsAny(String value, String... needles) {
        for (String needle : needles) {
            if (value.contains(needle)) {
                return true;
            }
        }
        return false;
    }

    private String nullToEmpty(String value) {
        return value == null ? "" : value;
    }
}
