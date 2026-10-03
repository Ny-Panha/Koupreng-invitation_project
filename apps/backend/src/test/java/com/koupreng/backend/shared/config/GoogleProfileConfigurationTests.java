package com.koupreng.backend.shared.config;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.context.ConfigDataApplicationContextInitializer;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.context.annotation.Configuration;

class GoogleProfileConfigurationTests {

    private final ApplicationContextRunner runner = new ApplicationContextRunner()
            .withInitializer(new ConfigDataApplicationContextInitializer())
            .withUserConfiguration(PropertiesConfiguration.class)
            .withPropertyValues("spring.profiles.active=prod", "JWT_SECRET=" + "a".repeat(64));

    @Test
    void productionProfileBindsOfficialGoogleJwksDefault() {
        runner.run(context -> assertEquals("https://www.googleapis.com/oauth2/v3/certs",
                context.getBean(AppProperties.class).getOauth().getGoogle().getJwkSetUri()));
    }

    @Test
    void explicitGoogleJwksOverrideStillBinds() {
        runner.withPropertyValues("GOOGLE_JWK_SET_URI=https://keys.example.test/google.json")
                .run(context -> assertEquals("https://keys.example.test/google.json",
                        context.getBean(AppProperties.class).getOauth().getGoogle().getJwkSetUri()));
    }

    @Configuration(proxyBeanMethods = false)
    @EnableConfigurationProperties(AppProperties.class)
    static class PropertiesConfiguration {
    }
}
