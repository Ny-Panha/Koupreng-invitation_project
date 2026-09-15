package com.koupreng.backend.auth.api.dto;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.Test;

class LoginRequestTests {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void bindsIdentifier() throws Exception {
        LoginRequest request = readLoginRequest("identifier", "vireak@gmail.com");

        assertEquals("vireak@gmail.com", request.identifier());
    }

    @Test
    void bindsEmailAlias() throws Exception {
        LoginRequest request = readLoginRequest("email", "vireak@gmail.com");

        assertEquals("vireak@gmail.com", request.identifier());
    }

    @Test
    void bindsPhoneAlias() throws Exception {
        LoginRequest request = readLoginRequest("phone", "+85512345678");

        assertEquals("+85512345678", request.identifier());
    }

    @Test
    void bindsEmailOrPhoneAlias() throws Exception {
        LoginRequest request = readLoginRequest("emailOrPhone", "vireak@gmail.com");

        assertEquals("vireak@gmail.com", request.identifier());
    }

    private LoginRequest readLoginRequest(String identifierField, String identifierValue) throws Exception {
        return objectMapper.readValue(
                """
                {
                  "%s": "%s",
                  "password": "NewPassword123!"
                }
                """.formatted(identifierField, identifierValue),
                LoginRequest.class
        );
    }
}
