package com.koupreng.backend.shared.exception;

import org.springframework.http.HttpStatus;

/**
 * Base exception for failures that are safe to expose through the public API.
 *
 * <p>Domain modules should provide a stable machine-readable code whenever a
 * client may need to distinguish the failure from other errors with the same
 * HTTP status.</p>
 */
public class ApiException extends RuntimeException {

    private final HttpStatus status;
    private final String code;

    public ApiException(HttpStatus status, String message) {
        this(status, defaultCode(status), message);
    }

    public ApiException(HttpStatus status, String code, String message) {
        super(message);
        this.status = status == null ? HttpStatus.INTERNAL_SERVER_ERROR : status;
        this.code = code == null || code.isBlank() ? defaultCode(this.status) : code;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public String getCode() {
        return code;
    }

    private static String defaultCode(HttpStatus status) {
        if (status == null) {
            return "INTERNAL_ERROR";
        }
        return switch (status) {
            case BAD_REQUEST -> "REQUEST_INVALID";
            case UNAUTHORIZED -> "AUTH_UNAUTHORIZED";
            case FORBIDDEN -> "AUTH_FORBIDDEN";
            case NOT_FOUND -> "RESOURCE_NOT_FOUND";
            case CONFLICT -> "RESOURCE_CONFLICT";
            case TOO_MANY_REQUESTS -> "RATE_LIMITED";
            case INTERNAL_SERVER_ERROR -> "INTERNAL_ERROR";
            default -> "API_ERROR";
        };
    }
}
