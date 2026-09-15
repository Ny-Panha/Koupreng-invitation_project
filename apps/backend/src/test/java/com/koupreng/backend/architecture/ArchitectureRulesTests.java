package com.koupreng.backend.architecture;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.classes;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;

import org.springframework.web.bind.annotation.RestController;

@AnalyzeClasses(
        packages = "com.koupreng.backend",
        importOptions = ImportOption.DoNotIncludeTests.class
)
class ArchitectureRulesTests {

    @ArchTest
    static final ArchRule controllers_do_not_access_persistence_directly = noClasses()
            .that().areAnnotatedWith(RestController.class)
            .should().dependOnClassesThat().resideInAnyPackage(
                    "com.koupreng.backend.repository..",
                    "com.koupreng.backend..infrastructure.persistence.."
            )
            .because("HTTP adapters must delegate persistence work to application use cases");

    @ArchTest
    static final ArchRule controllers_do_not_expose_domain_or_jpa_types = noClasses()
            .that().areAnnotatedWith(RestController.class)
            .should().dependOnClassesThat().resideInAnyPackage(
                    "com.koupreng.backend.entity..",
                    "com.koupreng.backend..domain.."
            )
            .because("HTTP contracts must use DTOs instead of persistence or domain objects");

    @ArchTest
    static final ArchRule controllers_do_not_call_infrastructure_ports_directly = noClasses()
            .that().areAnnotatedWith(RestController.class)
            .should().dependOnClassesThat().resideInAnyPackage(
                    "com.koupreng.backend..application.port.."
            )
            .because("HTTP adapters must delegate business operations to application use cases");

    @ArchTest
    static final ArchRule v2_domain_packages_do_not_depend_on_outer_layers = noClasses()
            .that().resideInAnyPackage(
                    "com.koupreng.backend.auth.domain..",
                    "com.koupreng.backend.user.domain..",
                    "com.koupreng.backend.payment.domain..",
                    "com.koupreng.backend.subscription.domain..",
                    "com.koupreng.backend.template.domain..",
                    "com.koupreng.backend.invitation.domain..",
                    "com.koupreng.backend.media.domain..",
                    "com.koupreng.backend.guest.domain..",
                    "com.koupreng.backend.rsvp.domain..",
                    "com.koupreng.backend.checkin.domain..",
                    "com.koupreng.backend.seating.domain.."
            )
            .should().dependOnClassesThat().resideInAnyPackage(
                    "com.koupreng.backend.controller..",
                    "com.koupreng.backend.service..",
                    "com.koupreng.backend.repository..",
                    "com.koupreng.backend.config..",
                    "com.koupreng.backend..api..",
                    "com.koupreng.backend..application..",
                    "com.koupreng.backend..infrastructure.."
            )
            .because("domain code must remain independent of delivery, application, and infrastructure layers");

    @ArchTest
    static final ArchRule rest_controllers_live_in_explicit_http_packages = classes()
            .that().areAnnotatedWith(RestController.class)
            .should().resideInAnyPackage(
                    "com.koupreng.backend.controller..",
                    "com.koupreng.backend..api.."
            )
            .because("HTTP adapters must be discoverable at a documented boundary");
}
