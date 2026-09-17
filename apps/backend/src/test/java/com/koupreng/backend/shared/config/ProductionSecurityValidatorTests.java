package com.koupreng.backend.shared.config;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Set;

import com.koupreng.backend.shared.config.AppProperties.RateLimit.Backend;
import com.koupreng.backend.payment.infrastructure.config.PaymentProperties;
import com.koupreng.backend.shared.security.ApiSecurityProperties;
import com.koupreng.backend.shared.security.waf.WafProperties;

import org.junit.jupiter.api.Test;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.mock.env.MockEnvironment;

class ProductionSecurityValidatorTests {

    @Test
    void defaultDevProfileSkipsProductionValidation() {
        MockEnvironment environment = new MockEnvironment();
        environment.setDefaultProfiles("dev");
        ProductionSecurityValidator validator = validator(
                "weak-local-secret",
                "jdbc:mysql://localhost:3306/koupreng_db?useSSL=false",
                "change-me-local-only",
                "static",
                environment
        );

        assertDoesNotThrow(() -> validator.run(new DefaultApplicationArguments(new String[0])));
    }

    @Test
    void acceptsSecureProductionConfiguration() {
        ProductionSecurityValidator validator = validator(
                "a".repeat(64),
                "jdbc:mysql://db.example.com:3306/koupreng_db?sslMode=VERIFY_IDENTITY&serverTimezone=UTC"
        );

        assertDoesNotThrow(validator::validateProductionConfiguration);
    }

    @Test
    void rejectsWeakProductionJwtSecret() {
        ProductionSecurityValidator validator = validator(
                "change_this_to_a_random_64_plus_character_secret_generated_by_openssl",
                "jdbc:mysql://db.example.com:3306/koupreng_db?sslMode=VERIFY_IDENTITY&serverTimezone=UTC"
        );

        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                validator::validateProductionConfiguration
        );

        assertTrue(exception.getMessage().contains("JWT_SECRET"));
    }

    @Test
    void rejectsInsecureProductionDatabaseUrl() {
        ProductionSecurityValidator validator = validator(
                "a".repeat(64),
                "jdbc:mysql://db.example.com:3306/koupreng_db?useSSL=false&allowPublicKeyRetrieval=true"
        );

        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                validator::validateProductionConfiguration
        );

        assertTrue(exception.getMessage().contains("DB_URL"));
    }

    @Test
    void rejectsPlaceholderProductionAdminPaymentSecret() {
        ProductionSecurityValidator validator = validator(
                "a".repeat(64),
                "jdbc:mysql://db.example.com:3306/koupreng_db?sslMode=VERIFY_IDENTITY&serverTimezone=UTC",
                "change_this_to_random_secret",
                "static"
        );

        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                validator::validateProductionConfiguration
        );

        assertTrue(exception.getMessage().contains("ADMIN_PAYMENT_SECRET"));
    }

    @Test
    void rejectsBlankProductionAdminPaymentSecret() {
        ProductionSecurityValidator validator = validator(
                "a".repeat(64),
                "jdbc:mysql://db.example.com:3306/koupreng_db?sslMode=VERIFY_IDENTITY&serverTimezone=UTC",
                " ",
                "static"
        );

        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                validator::validateProductionConfiguration
        );

        assertTrue(exception.getMessage().contains("ADMIN_PAYMENT_SECRET"));
    }

    @Test
    void rejectsNonStaticProductionPaymentProviderMode() {
        ProductionSecurityValidator validator = validator(
                "a".repeat(64),
                "jdbc:mysql://db.example.com:3306/koupreng_db?sslMode=VERIFY_IDENTITY&serverTimezone=UTC",
                "secure-admin-payment-secret",
                "dynamic"
        );

        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                validator::validateProductionConfiguration
        );

        assertTrue(exception.getMessage().contains("PAYMENT_PROVIDER_MODE"));
    }

    @Test
    void rejectsWrongProductionSubscriptionPaymentLink() {
        ProductionSecurityValidator validator = validator(
                "a".repeat(64),
                "jdbc:mysql://db.example.com:3306/koupreng_db?sslMode=VERIFY_IDENTITY&serverTimezone=UTC",
                "secure-admin-payment-secret",
                "static",
                new MockEnvironment(),
                "https://link.payway.com.kh/wrong-basic-link"
        );

        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                validator::validateProductionConfiguration
        );

        assertTrue(exception.getMessage().contains("ABA subscription links"));
    }

    private ProductionSecurityValidator validator(String jwtSecret, String databaseUrl) {
        return validator(jwtSecret, databaseUrl, "secure-admin-payment-secret", "static");
    }

    private ProductionSecurityValidator validator(
            String jwtSecret,
            String databaseUrl,
            String adminPaymentSecret,
            String providerMode
    ) {
        return validator(
                jwtSecret,
                databaseUrl,
                adminPaymentSecret,
                providerMode,
                new MockEnvironment()
        );
    }

    private ProductionSecurityValidator validator(
            String jwtSecret,
            String databaseUrl,
            String adminPaymentSecret,
            String providerMode,
            MockEnvironment environment
    ) {
        return validator(
                jwtSecret,
                databaseUrl,
                adminPaymentSecret,
                providerMode,
                environment,
                "https://link.payway.com.kh/ABAPAYMu523385B"
        );
    }

    private ProductionSecurityValidator validator(
            String jwtSecret,
            String databaseUrl,
            String adminPaymentSecret,
            String providerMode,
            MockEnvironment environment,
            String basicSubscriptionLink
    ) {
        environment.withProperty("spring.datasource.url", databaseUrl)
                .withProperty("spring.jpa.hibernate.ddl-auto", "none");

        AppProperties appProperties = new AppProperties();
        appProperties.getJwt().setIssuer("koupreng-backend");
        appProperties.getJwt().setSecret(jwtSecret);
        appProperties.getRateLimit().setBackend(Backend.REDIS);
        appProperties.getRateLimit().setFailClosed(true);

        ApiSecurityProperties apiSecurityProperties = new ApiSecurityProperties();
        apiSecurityProperties.getHttps().setRequired(true);
        apiSecurityProperties.getHttps().setHstsEnabled(true);
        apiSecurityProperties.getHttps().setHstsMaxAgeSeconds(31_536_000);
        apiSecurityProperties.getCors().setAllowedOrigins(Set.of("https://app.example.com"));
        apiSecurityProperties.getClientAddress().setForwardedHeadersEnabled(true);

        WafProperties wafProperties = new WafProperties();
        wafProperties.setEnabled(true);
        wafProperties.setAuditOnly(false);

        PaymentProperties paymentProperties = new PaymentProperties();
        paymentProperties.setAdminSecret(adminPaymentSecret);
        paymentProperties.setProviderMode(providerMode);
        paymentProperties.getAba().setStaticLink("https://link.payway.com.kh/ABAPAYrD450560q");
        paymentProperties.getAba().getSubscription().setBasicLink(basicSubscriptionLink);

        return new ProductionSecurityValidator(
                environment,
                appProperties,
                apiSecurityProperties,
                wafProperties,
                paymentProperties
        );
    }
}
