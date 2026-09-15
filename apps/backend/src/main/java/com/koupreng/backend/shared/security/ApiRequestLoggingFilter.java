package com.koupreng.backend.shared.security;

import java.io.IOException;
import java.security.Principal;
import java.time.Duration;
import java.time.Instant;
import java.util.UUID;
import java.util.regex.Pattern;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.filter.OncePerRequestFilter;

public class ApiRequestLoggingFilter extends OncePerRequestFilter {

    public static final String REQUEST_ID_HEADER = "X-Request-Id";

    private static final Logger LOGGER = LoggerFactory.getLogger(ApiRequestLoggingFilter.class);
    private static final Pattern SAFE_REQUEST_ID = Pattern.compile("[A-Za-z0-9._-]{8,100}");

    private final ApiSecurityProperties.ApiLogging properties;

    public ApiRequestLoggingFilter(ApiSecurityProperties.ApiLogging properties) {
        this.properties = properties;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        if (!properties.isEnabled()) {
            return true;
        }

        String path = applicationPath(request);
        if (!path.startsWith("/api")) {
            return true;
        }

        return !properties.isIncludeHealthChecks() && "/api/health".equals(path);
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String requestId = requestId(request);
        response.setHeader(REQUEST_ID_HEADER, requestId);

        Instant startedAt = Instant.now();
        try {
            filterChain.doFilter(request, response);
        } finally {
            long durationMs = Duration.between(startedAt, Instant.now()).toMillis();
            int status = response.getStatus();
            String message = "api_request id={} method={} path={} status={} durationMs={} remote={} user={}";
            Object[] arguments = {
                    requestId,
                    request.getMethod(),
                    requestTarget(request),
                    status,
                    durationMs,
                    clientAddress(request),
                    principalName(request)
            };

            if (status >= 500) {
                LOGGER.warn(message, arguments);
            } else {
                LOGGER.info(message, arguments);
            }
        }
    }

    private String requestId(HttpServletRequest request) {
        String provided = request.getHeader(REQUEST_ID_HEADER);
        if (provided != null && SAFE_REQUEST_ID.matcher(provided).matches()) {
            return provided;
        }
        return UUID.randomUUID().toString();
    }

    private String requestTarget(HttpServletRequest request) {
        String path = applicationPath(request);
        if (!properties.isIncludeQueryString()) {
            return path;
        }

        String queryString = request.getQueryString();
        return queryString == null || queryString.isBlank() ? path : path + "?" + queryString;
    }

    private String applicationPath(HttpServletRequest request) {
        String uri = request.getRequestURI() == null ? "" : request.getRequestURI();
        String contextPath = request.getContextPath() == null ? "" : request.getContextPath();
        if (!contextPath.isBlank() && uri.startsWith(contextPath)) {
            return uri.substring(contextPath.length());
        }
        return uri;
    }

    private String clientAddress(HttpServletRequest request) {
        String remoteAddress = request.getRemoteAddr();
        return remoteAddress == null || remoteAddress.isBlank() ? "unknown" : remoteAddress;
    }

    private String principalName(HttpServletRequest request) {
        Principal principal = request.getUserPrincipal();
        return principal == null ? "anonymous" : principal.getName();
    }
}
