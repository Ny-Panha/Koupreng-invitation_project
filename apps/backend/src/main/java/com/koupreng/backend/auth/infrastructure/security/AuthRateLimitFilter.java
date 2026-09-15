package com.koupreng.backend.auth.infrastructure.security;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Locale;
import java.util.Map;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.shared.config.AppProperties;
import com.koupreng.backend.shared.security.ClientAddressResolver;
import com.koupreng.backend.shared.security.RateLimitService;

import org.springframework.http.MediaType;
import org.springframework.web.filter.OncePerRequestFilter;

public class AuthRateLimitFilter extends OncePerRequestFilter {

    private static final Duration WINDOW = Duration.ofMinutes(1);
    private static final Map<String, AuthEndpoint> AUTH_ENDPOINTS = Map.ofEntries(
            Map.entry("/api/v1/auth/login", AuthEndpoint.LOGIN),
            Map.entry("/api/v1/auth/register", AuthEndpoint.REGISTER),
            Map.entry("/api/v1/auth/google", AuthEndpoint.SOCIAL),
            Map.entry("/api/v1/auth/telegram", AuthEndpoint.SOCIAL),
            Map.entry("/api/v1/auth/forgot-password", AuthEndpoint.FORGOT_PASSWORD),
            Map.entry("/api/v1/auth/reset-password", AuthEndpoint.RESET_PASSWORD),
            Map.entry("/api/auth/login", AuthEndpoint.LOGIN),
            Map.entry("/api/auth/register", AuthEndpoint.REGISTER),
            Map.entry("/api/auth/google", AuthEndpoint.SOCIAL),
            Map.entry("/api/auth/telegram", AuthEndpoint.SOCIAL),
            Map.entry("/api/auth/forgot-password", AuthEndpoint.FORGOT_PASSWORD),
            Map.entry("/api/auth/reset-password", AuthEndpoint.RESET_PASSWORD)
    );

    private final AppProperties.Auth authProperties;
    private final RateLimitService rateLimitService;
    private final ClientAddressResolver clientAddressResolver;

    public AuthRateLimitFilter(
            AppProperties.Auth authProperties,
            RateLimitService rateLimitService,
            ClientAddressResolver clientAddressResolver
    ) {
        this.authProperties = authProperties;
        this.rateLimitService = rateLimitService;
        this.clientAddressResolver = clientAddressResolver;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        AuthEndpoint endpoint = endpoint(request);
        if (endpoint == null) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            rateLimitService.check(rateLimitKey(request, endpoint), limit(endpoint), WINDOW);
        } catch (ApiException exception) {
            response.setStatus(exception.getStatus().value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding(StandardCharsets.UTF_8.name());
            response.getWriter().write("""
                    {"status":%d,"error":"%s","message":"Too many authentication attempts. Try again later."}
                    """.formatted(exception.getStatus().value(), exception.getStatus().getReasonPhrase()));
            return;
        }

        filterChain.doFilter(request, response);
    }

    private AuthEndpoint endpoint(HttpServletRequest request) {
        String method = request.getMethod();
        if (method == null || !"POST".equals(method.toUpperCase(Locale.ROOT))) {
            return null;
        }
        return AUTH_ENDPOINTS.get(applicationPath(request));
    }

    private int limit(AuthEndpoint endpoint) {
        return switch (endpoint) {
            case LOGIN -> authProperties.getMaxLoginAttemptsPerMinute();
            case REGISTER -> authProperties.getMaxRegisterAttemptsPerMinute();
            case SOCIAL -> authProperties.getMaxSocialLoginAttemptsPerMinute();
            case FORGOT_PASSWORD -> authProperties.getMaxForgotPasswordAttemptsPerMinute();
            case RESET_PASSWORD -> authProperties.getMaxResetPasswordAttemptsPerMinute();
        };
    }

    private String rateLimitKey(HttpServletRequest request, AuthEndpoint endpoint) {
        return "auth:%s:ip:%s".formatted(endpoint.name().toLowerCase(Locale.ROOT), clientAddressResolver.resolve(request));
    }

    private String applicationPath(HttpServletRequest request) {
        String uri = nullToEmpty(request.getRequestURI());
        String contextPath = nullToEmpty(request.getContextPath());
        if (!contextPath.isBlank() && uri.startsWith(contextPath)) {
            return uri.substring(contextPath.length());
        }
        return uri;
    }

    private String nullToEmpty(String value) {
        return value == null ? "" : value;
    }

    private enum AuthEndpoint {
        LOGIN,
        REGISTER,
        SOCIAL,
        FORGOT_PASSWORD,
        RESET_PASSWORD
    }
}
