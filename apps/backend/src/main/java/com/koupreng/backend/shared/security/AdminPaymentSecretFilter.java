package com.koupreng.backend.shared.security;

import com.koupreng.backend.payment.infrastructure.config.PaymentProperties;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.List;

@Component
public class AdminPaymentSecretFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(AdminPaymentSecretFilter.class);
    public static final String ADMIN_PAYMENT_SECRET_HEADER = "X-ADMIN-PAYMENT-SECRET";
    private static final List<String> PROTECTED_PATH_PREFIXES = List.of(
            "/api/v1/internal/template-payments/",
            "/api/v1/internal/subscription-payments/"
    );

    private final PaymentProperties paymentProperties;

    public AdminPaymentSecretFilter(PaymentProperties paymentProperties) {
        this.paymentProperties = paymentProperties;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        String contextPath = request.getContextPath();
        if (contextPath != null && !contextPath.isBlank() && path.startsWith(contextPath)) {
            path = path.substring(contextPath.length());
        }
        boolean protectedPath = PROTECTED_PATH_PREFIXES.stream().anyMatch(path::startsWith);
        return HttpMethod.OPTIONS.matches(request.getMethod()) || !protectedPath;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String providedSecret = request.getHeader(ADMIN_PAYMENT_SECRET_HEADER);
        String expectedSecret = paymentProperties.getAdminSecret();

        if (providedSecret == null || providedSecret.isBlank()) {
            log.warn("Rejected internal payment request path={} reason=missing-secret remote={}",
                    request.getRequestURI(), request.getRemoteAddr());
            writeError(response, HttpStatus.UNAUTHORIZED, "Admin payment secret is required");
            return;
        }

        if (!constantTimeEquals(providedSecret, expectedSecret)) {
            log.warn("Rejected internal payment request path={} reason=invalid-secret remote={}",
                    request.getRequestURI(), request.getRemoteAddr());
            writeError(response, HttpStatus.FORBIDDEN, "Admin payment secret is invalid");
            return;
        }

        log.info("Accepted internal payment request path={} remote={}",
                request.getRequestURI(), request.getRemoteAddr());
        filterChain.doFilter(request, response);
    }

    private boolean constantTimeEquals(String provided, String expected) {
        byte[] providedBytes = provided.getBytes(StandardCharsets.UTF_8);
        byte[] expectedBytes = expected == null ? new byte[0] : expected.getBytes(StandardCharsets.UTF_8);
        return MessageDigest.isEqual(providedBytes, expectedBytes);
    }

    private void writeError(HttpServletResponse response, HttpStatus status, String message) throws IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.getWriter().write("""
                {"status":%d,"error":"%s","message":"%s"}
                """.formatted(status.value(), status.getReasonPhrase(), message));
    }
}
