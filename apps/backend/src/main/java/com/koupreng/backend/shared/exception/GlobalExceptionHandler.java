package com.koupreng.backend.shared.exception;

import java.time.Instant;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import com.koupreng.backend.shared.i18n.MessageService;

/** Central, transport-level translation of exceptions into the stable API error contract. */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    private final MessageService msg;

    public GlobalExceptionHandler(MessageService msg) {
        this.msg = msg;
    }

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<Map<String, Object>> handleApiException(ApiException exception) {
        HttpStatus status = exception == null ? HttpStatus.INTERNAL_SERVER_ERROR : exception.getStatus();
        String code = exception == null ? "INTERNAL_ERROR" : exception.getCode();
        return error(status, code, messageOrDefault(exception, msg.get("error.bad-request")));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException exception) {
        Map<String, String> fields = new LinkedHashMap<>();
        for (FieldError fieldError : exception.getBindingResult().getFieldErrors()) {
            fields.put(fieldError.getField(), fieldError.getDefaultMessage());
        }

        Map<String, Object> body = errorBody(HttpStatus.BAD_REQUEST, msg.get("error.validation-failed"));
        body.put("fields", fields);
        body.put("fieldErrors", fields);
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, Object>> handleConstraintViolation(ConstraintViolationException exception) {
        Map<String, String> fields = new LinkedHashMap<>();
        for (ConstraintViolation<?> violation : exception.getConstraintViolations()) {
            fields.put(violation.getPropertyPath().toString(), violation.getMessage());
        }

        Map<String, Object> body = errorBody(HttpStatus.BAD_REQUEST, msg.get("error.validation-failed"));
        body.put("fields", fields);
        body.put("fieldErrors", fields);
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrity(DataIntegrityViolationException exception) {
        if (causedByConstraint(exception, "uk_guests_invitation_email_normalized")
                || causedByConstraint(exception, "uk_guests_invitation_phone_normalized")) {
            return error(HttpStatus.CONFLICT, "GUEST_DUPLICATE", msg.get("guest.duplicate"));
        }
        return error(HttpStatus.CONFLICT, "DATA_CONFLICT", msg.get("error.data-conflict"));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleMalformedJson(HttpMessageNotReadableException exception) {
        return error(HttpStatus.BAD_REQUEST, msg.get("error.malformed-json"));
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<Map<String, Object>> handleMethodNotSupported(HttpRequestMethodNotSupportedException exception) {
        return error(HttpStatus.METHOD_NOT_ALLOWED, msg.get("error.method-not-supported"));
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<Map<String, Object>> handleMediaTypeNotSupported(HttpMediaTypeNotSupportedException exception) {
        return error(HttpStatus.UNSUPPORTED_MEDIA_TYPE, msg.get("error.media-type-not-supported"));
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNoResourceFound(NoResourceFoundException exception) {
        return error(HttpStatus.NOT_FOUND, msg.get("error.not-found"));
    }

    @ExceptionHandler(org.springframework.web.method.annotation.MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, Object>> handleTypeMismatch(
            org.springframework.web.method.annotation.MethodArgumentTypeMismatchException exception) {
        return error(HttpStatus.NOT_FOUND, msg.get("error.not-found"));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, Object>> handleMaxUploadSize(MaxUploadSizeExceededException exception) {
        return error(HttpStatus.CONTENT_TOO_LARGE, msg.get("error.file-too-large"));
    }

    @ExceptionHandler(MultipartException.class)
    public ResponseEntity<Map<String, Object>> handleMultipart(MultipartException exception) {
        return error(HttpStatus.BAD_REQUEST, msg.get("error.multipart"));
    }

    @ExceptionHandler({BadCredentialsException.class, AccessDeniedException.class})
    public ResponseEntity<Map<String, Object>> handleSecurity(RuntimeException exception) {
        HttpStatus status = exception instanceof AccessDeniedException
                ? HttpStatus.FORBIDDEN
                : HttpStatus.UNAUTHORIZED;
        String fallback = exception instanceof AccessDeniedException
                ? msg.get("auth.forbidden")
                : msg.get("auth.unauthorized");
        return error(status, messageOrDefault(exception, fallback));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleUnexpected(Exception exception) {
        log.error("Unhandled API exception", exception);
        return error(HttpStatus.INTERNAL_SERVER_ERROR, msg.get("error.unexpected"));
    }

    private ResponseEntity<Map<String, Object>> error(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(errorBody(status, message));
    }

    private ResponseEntity<Map<String, Object>> error(HttpStatus status, String code, String message) {
        return ResponseEntity.status(status).body(errorBody(status, code, message));
    }

    private Map<String, Object> errorBody(HttpStatus status, String message) {
        return errorBody(status, defaultCode(status), message);
    }

    private Map<String, Object> errorBody(HttpStatus status, String code, String message) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", Instant.now());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("code", code);
        body.put("message", message);
        body.put("path", currentRequestPath());
        body.put("fieldErrors", Collections.emptyMap());
        return body;
    }

    private String currentRequestPath() {
        if (RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attributes) {
            return attributes.getRequest().getRequestURI();
        }
        return "";
    }

    private boolean causedByConstraint(Throwable exception, String constraintName) {
        Throwable current = exception;
        while (current != null) {
            String message = current.getMessage();
            if (message != null && message.toLowerCase(java.util.Locale.ROOT)
                    .contains(constraintName.toLowerCase(java.util.Locale.ROOT))) {
                return true;
            }
            current = current.getCause();
        }
        return false;
    }

    private String defaultCode(HttpStatus status) {
        return switch (status) {
            case BAD_REQUEST -> "REQUEST_INVALID";
            case UNAUTHORIZED -> "AUTH_UNAUTHORIZED";
            case FORBIDDEN -> "AUTH_FORBIDDEN";
            case NOT_FOUND -> "RESOURCE_NOT_FOUND";
            case METHOD_NOT_ALLOWED -> "METHOD_NOT_ALLOWED";
            case UNSUPPORTED_MEDIA_TYPE -> "MEDIA_TYPE_UNSUPPORTED";
            case CONTENT_TOO_LARGE -> "UPLOAD_TOO_LARGE";
            default -> "INTERNAL_ERROR";
        };
    }

    private String messageOrDefault(Exception exception, String defaultMessage) {
        if (exception == null || exception.getMessage() == null || exception.getMessage().isBlank()) {
            return defaultMessage;
        }
        return exception.getMessage();
    }
}
