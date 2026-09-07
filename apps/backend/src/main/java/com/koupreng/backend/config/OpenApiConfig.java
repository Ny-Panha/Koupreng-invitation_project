package com.koupreng.backend.config;

import java.util.List;
import java.util.Map;
import java.util.Set;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.koupreng.backend.dev.DevSampleData;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.examples.Example;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springdoc.core.customizers.OperationCustomizer;

@Configuration
public class OpenApiConfig {

    public static final String BEARER_AUTH = "bearerAuth";

    private static final Set<String> PUBLIC_PATHS_IN_PROTECTED_CONTROLLERS = Set.of(
            "/api/v1/public/invitations/{slug}",
            "/api/v1/public/invitations/{slug}/guest-view",
            "/api/v1/public/invitations/{slug}/access/verify",
            "/api/v1/public/invitations/{slug}/media",
            "/api/v1/public/invitations/{slug}/rsvp",
            "/api/v1/public/invitations/{slug}/guests/{inviteToken}/rsvp",
            "/api/v1/public/invitations/{slug}/rsvp-summary-public",
            "/api/v1/public/invitations/{slug}/wishes",
            "/api/v1/payway/callback",
            "/api/v1/payway/return",
            "/api/v1/payway/cancel"
    );

    private static final Map<String, String> SPECIAL_OPERATION_SUMMARIES = Map.ofEntries(
            Map.entry("alerts", "List administration alerts"),
            Map.entry("draft", "Draft invitation copy"),
            Map.entry("events", "List invitation delivery events"),
            Map.entry("formalText", "Generate formal invitation text"),
            Map.entry("manual", "Check in a guest manually"),
            Map.entry("packages", "List available subscription packages"),
            Map.entry("plan", "Retrieve the seating plan"),
            Map.entry("receipt", "Retrieve a payment receipt"),
            Map.entry("scan", "Process a guest check-in scan"),
            Map.entry("story", "Generate an invitation story"),
            Map.entry("systemHealth", "Review system health"),
            Map.entry("timelineSuggestion", "Suggest an invitation timeline"),
            Map.entry("translate", "Translate invitation copy"),
            Map.entry("wishes", "List invitation wishes")
    );

    @Bean
    public OpenAPI kouprengOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Koupreng E-Invitation API")
                        .description("""
                                REST API for the Koupreng E-Invitation platform, including authentication,
                                users, invitations, templates, guests, RSVP, check-in, media, payments,
                                organizations, subscriptions, notifications, reporting, administration,
                                and related services. The current contract includes both legacy /api routes
                                and versioned /api/v1 routes; the version below does not imply a global base path.
                                """)
                        .version("v1"))
                .components(new Components().addSecuritySchemes(
                        BEARER_AUTH,
                        new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Paste the accessToken returned by POST /api/auth/login. "
                                        + "Scalar adds the Bearer prefix automatically; do not type it twice.")
                ));
    }

    @Bean
    public OpenApiCustomizer publicOperationSecurityCustomizer() {
        return openApi -> PUBLIC_PATHS_IN_PROTECTED_CONTROLLERS.forEach(path -> {
            if (openApi.getPaths() == null || openApi.getPaths().get(path) == null) {
                return;
            }
            openApi.getPaths().get(path).readOperations()
                    .forEach(operation -> operation.setSecurity(List.of()));
        });
    }

    /**
     * Preserve hand-written business summaries and provide readable fallbacks for
     * straightforward CRUD operations. This avoids repeating boilerplate
     * {@code @Operation} annotations across every controller method.
     */
    @Bean
    public OperationCustomizer operationSummaryCustomizer() {
        return (operation, handlerMethod) -> {
            if (operation.getSummary() == null || operation.getSummary().isBlank()) {
                String methodName = handlerMethod.getMethod().getName();
                operation.setSummary(defaultSummary(methodName,
                        controllerResource(handlerMethod.getBeanType().getSimpleName())));
            }
            return operation;
        };
    }

    /**
     * Attach whole request examples after Springdoc has derived the real schema
     * and validation constraints from each handler method. Keeping this logic
     * centralized avoids large JSON annotations across the controllers.
     */
    @Bean
    public OperationCustomizer requestExampleCustomizer(ObjectMapper objectMapper) {
        return (operation, handlerMethod) -> {
            for (org.springframework.core.MethodParameter methodParameter
                    : handlerMethod.getMethodParameters()) {
                if (!methodParameter.hasParameterAnnotation(
                        org.springframework.web.bind.annotation.RequestBody.class)) {
                    continue;
                }
                List<OpenApiExamples.NamedExample> examples = OpenApiExamples.forRequestType(
                        methodParameter.getParameterType());
                if (examples.isEmpty() || operation.getRequestBody() == null
                        || operation.getRequestBody().getContent() == null) {
                    continue;
                }
                operation.getRequestBody().getContent().values().forEach(mediaType -> {
                    for (OpenApiExamples.NamedExample namedExample : examples) {
                        mediaType.addExamples(namedExample.name(), new Example()
                                .summary(namedExample.summary())
                                .value(readJson(objectMapper, namedExample.json())));
                    }
                });
            }

            if (operation.getParameters() != null) {
                operation.getParameters().forEach(parameter -> {
                    Object example = parameterExample(parameter.getName());
                    if (example != null && parameter.getExample() == null) {
                        parameter.setExample(example);
                    }
                });
            }
            return operation;
        };
    }

    private static Object readJson(ObjectMapper objectMapper, String json) {
        try {
            return objectMapper.readValue(json, Object.class);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Invalid built-in OpenAPI request example", exception);
        }
    }

    private static Object parameterExample(String name) {
        return switch (name) {
            case "slug" -> DevSampleData.INVITATION_SLUG;
            case "inviteToken", "token" -> DevSampleData.ATTENDING_GUEST_TOKEN;
            case "accessToken" -> DevSampleData.INVITATION_ACCESS_TOKEN;
            case "id", "itemId", "rsvpId", "invitationId", "guestId", "tableId",
                    "assignmentId", "organizationId",
                    "memberId", "templateId", "packageId", "userId", "notificationId",
                    "giftId", "budgetItemId", "eventId" -> 1;
            case "page" -> 0;
            case "size" -> 20;
            case "lang", "language" -> "km";
            case "keyword", "query" -> "wedding";
            case "orderCode" -> "<pending-order-code>";
            default -> null;
        };
    }

    private static String defaultSummary(String methodName, String resource) {
        String specialSummary = SPECIAL_OPERATION_SUMMARIES.get(methodName);
        if (specialSummary != null) {
            return specialSummary;
        }
        return switch (methodName) {
            case "list" -> "List " + resource + " records";
            case "get" -> "Retrieve a " + resource + " record";
            case "create" -> "Create a " + resource + " record";
            case "update" -> "Update a " + resource + " record";
            case "delete" -> "Delete a " + resource + " record";
            case "summary" -> "Summarize " + resource + " activity";
            case "export" -> "Export " + resource + " data";
            case "search" -> "Search " + resource + " records";
            case "current" -> "Retrieve the current " + resource;
            case "history" -> "List " + resource + " history";
            case "assign" -> "Create a seating assignment";
            case "unassign" -> "Remove a seating assignment";
            default -> capitalize(splitCamelCase(methodName));
        };
    }

    private static String controllerResource(String className) {
        String withoutSuffix = className.endsWith("Controller")
                ? className.substring(0, className.length() - "Controller".length())
                : className;
        return splitCamelCase(withoutSuffix).toLowerCase(java.util.Locale.ROOT);
    }

    private static String splitCamelCase(String value) {
        return value.replaceAll("([a-z0-9])([A-Z])", "$1 $2")
                .replaceAll("([A-Z])([A-Z][a-z])", "$1 $2");
    }

    private static String capitalize(String value) {
        if (value.isEmpty()) {
            return value;
        }
        return Character.toUpperCase(value.charAt(0)) + value.substring(1);
    }
}
