package com.koupreng.backend.shared.exception;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Map;

import com.koupreng.backend.shared.i18n.MessageService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.HttpRequestMethodNotSupportedException;

class GlobalExceptionHandlerTests {

    private final MessageService messageService = mock(MessageService.class);
    private final GlobalExceptionHandler handler = new GlobalExceptionHandler(messageService);

    @BeforeEach
    void setUp() {
        when(messageService.get("error.method-not-supported")).thenReturn("Request method is not supported");
    }

    @Test
    void methodNotSupportedReturns405InsteadOfGeneric500() {
        ResponseEntity<Map<String, Object>> response = handler.handleMethodNotSupported(
                new HttpRequestMethodNotSupportedException("GET", List.of("POST"))
        );

        assertEquals(HttpStatus.METHOD_NOT_ALLOWED, response.getStatusCode());
        assertEquals(405, response.getBody().get("status"));
        assertEquals("Request method is not supported", response.getBody().get("message"));
        assertEquals("METHOD_NOT_ALLOWED", response.getBody().get("code"));
    }

    @Test
    void apiExceptionExposesStableCodeWithoutImplementationDetails() {
        ResponseEntity<Map<String, Object>> response = handler.handleApiException(
                new ApiException(HttpStatus.CONFLICT, "SEATING_CAPACITY_EXCEEDED", "Table capacity exceeded")
        );

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertEquals("SEATING_CAPACITY_EXCEEDED", response.getBody().get("code"));
        assertEquals("Table capacity exceeded", response.getBody().get("message"));
    }

    @Test
    void nullStatusFallsBackToInternalServerError() {
        ApiException exception = new ApiException(null, null, "Unexpected failure");

        ResponseEntity<Map<String, Object>> response = handler.handleApiException(exception);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals("INTERNAL_ERROR", response.getBody().get("code"));
    }
}
