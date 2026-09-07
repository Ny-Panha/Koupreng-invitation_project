package com.koupreng.backend.dev;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;

import jakarta.persistence.EntityManager;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.security.crypto.password.PasswordEncoder;

class DevSampleDataConditionTests {

    private final ApplicationContextRunner contextRunner = new ApplicationContextRunner()
            .withUserConfiguration(TestConfiguration.class)
            .withBean(EntityManager.class, () -> mock(EntityManager.class))
            .withBean(PasswordEncoder.class, () -> mock(PasswordEncoder.class));

    @Test
    void loadsOnlyWithDevProfileAndEnabledProperty() {
        contextRunner
                .withInitializer(context -> context.getEnvironment().setActiveProfiles("dev"))
                .withPropertyValues(
                        "app.dev-sample-data.enabled=true"
                )
                .run(context -> assertEquals(
                        1, context.getBeanNamesForType(DevSampleDataInitializer.class).length));
    }

    @Test
    void doesNotLoadWhenPropertyIsDisabled() {
        contextRunner
                .withInitializer(context -> context.getEnvironment().setActiveProfiles("dev"))
                .withPropertyValues(
                        "app.dev-sample-data.enabled=false"
                )
                .run(context -> assertEquals(
                        0, context.getBeanNamesForType(DevSampleDataInitializer.class).length));
    }

    @Test
    void doesNotLoadInProductionEvenIfPropertyIsEnabled() {
        contextRunner
                .withInitializer(context -> context.getEnvironment().setActiveProfiles("prod"))
                .withPropertyValues(
                        "app.dev-sample-data.enabled=true"
                )
                .run(context -> assertEquals(
                        0, context.getBeanNamesForType(DevSampleDataInitializer.class).length));
    }

    @Configuration(proxyBeanMethods = false)
    @Import(DevSampleDataInitializer.class)
    static class TestConfiguration {
    }
}
