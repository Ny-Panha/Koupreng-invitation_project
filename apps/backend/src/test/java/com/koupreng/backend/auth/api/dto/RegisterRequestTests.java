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
}
