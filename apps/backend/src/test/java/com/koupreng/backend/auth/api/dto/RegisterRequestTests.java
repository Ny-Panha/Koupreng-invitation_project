package com.koupreng.backend.auth.api.dto;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.Test;

class RegisterRequestTests {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void bindsCamelCaseFullName() throws Exception {
        RegisterRequest request = readRegisterRequest("fullName");

        assertEquals("Vireak", request.fullName());
    }

    @Test
    void bindsLowercaseFullNameAlias() throws Exception {
        RegisterRequest request = readRegisterRequest("fullname");

        assertEquals("Vireak", request.fullName());
    }

    @Test
    void bindsSnakeCaseFullNameAlias() throws Exception {
        RegisterRequest request = readRegisterRequest("full_name");

        assertEquals("Vireak", request.fullName());
    }

    private RegisterRequest readRegisterRequest(String fullNameField) throws Exception {
        return objectMapper.readValue(
                """
                {
                  "email": "vireak@gmail.com",
                  "password": "NewPassword123!",
                  "%s": "Vireak"
                }
                """.formatted(fullNameField),
                RegisterRequest.class
        );
    }

    @Test
    void registrationRejectsMissingUppercaseAndShortPassword() {
        try (var factory = jakarta.validation.Validation.buildDefaultValidatorFactory()) {
            var validator = factory.getValidator();
            for (String password : new String[]{"lowercase123", "Abc123"}) {
                org.junit.jupiter.api.Assertions.assertFalse(validator.validate(
                        new RegisterRequest("Vireak", "vireak@example.test", null, password)).isEmpty());
            }
            org.junit.jupiter.api.Assertions.assertTrue(validator.validate(
                    new RegisterRequest("Vireak", "vireak@example.test", null, "Password123")).isEmpty());
        }
    }
}
