package com.koupreng.backend.shared.security;

import java.io.IOException;
import java.security.Principal;
import java.util.UUID;
import java.util.regex.Pattern;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import com.koupreng.backend.devmonitor.application.ApiMonitorService;
import com.koupreng.backend.devmonitor.infrastructure.DevSqlStatementTracker;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerMapping;

public class ApiRequestLoggingFilter extends OncePerRequestFilter {

    public static final String REQUEST_ID_HEADER = "X-Request-Id";
    public static final String ACTION_ID_HEADER = "X-Action-Id";
    public static final String CLIENT_APP_HEADER = "X-Client-App";
    public static final String FRONTEND_ROUTE_HEADER = "X-Frontend-Route";
    public static final String CLIENT_ACTION_HEADER = "X-Client-Action";
    public static final String CLIENT_DURATION_HEADER = "X-Client-Duration-Ms";

    private static final Logger LOGGER = LoggerFactory.getLogger(ApiRequestLoggingFilter.class);
    private static final Pattern SAFE_REQUEST_ID = Pattern.compile("[A-Za-z0-9._-]{8,100}");
    private static final Pattern SAFE_ACTION_ID = Pattern.compile("[A-Za-z0-9._-]{1,64}");
    private static final Pattern SAFE_APP_NAME = Pattern.compile("[A-Za-z0-9._-]{1,50}");
    private static final Pattern SAFE_CLIENT_ACTION = Pattern.compile("[A-Za-z0-9._-]{1,50}");
    private static final Pattern SAFE_ROUTE_PATH = Pattern.compile("[A-Za-z0-9._/~-]{1,100}");
    private static final Pattern SENSITIVE_QUERY_PARAM = Pattern.compile("(?i)(password|token|secret|access_token|refresh_token|code|key)=([^&]*)");

    private final ApiSecurityProperties.ApiLogging properties;
    private final ApiMonitorService apiMonitorService;

    public ApiRequestLoggingFilter(
            ApiSecurityProperties.ApiLogging properties,
            ApiMonitorService apiMonitorService
    ) {
        this.properties = properties;
        this.apiMonitorService = apiMonitorService;
    }

    public ApiRequestLoggingFilter(ApiSecurityProperties.ApiLogging properties) {
        this(properties, null);
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
        String actionId = sanitizeHeader(request.getHeader(ACTION_ID_HEADER), SAFE_ACTION_ID, "");

        response.setHeader(REQUEST_ID_HEADER, requestId);
        if (!actionId.isEmpty()) {
            response.setHeader(ACTION_ID_HEADER, actionId);
        }

        MDC.put("requestId", requestId);
        if (!actionId.isEmpty()) {
            MDC.put("actionId", actionId);
        }

        DevSqlStatementTracker.startTrace();
        long startNano = System.nanoTime();
        DevSqlStatementTracker.TraceResult traceResult = DevSqlStatementTracker.TraceResult.empty();

        try {
            filterChain.doFilter(request, response);
        } finally {
            traceResult = DevSqlStatementTracker.stopTrace();
            long durationMs = (System.nanoTime() - startNano) / 1_000_000L;
            int status = response.getStatus();
            String message = "api_request id={} action={} method={} path={} status={} durationMs={} remote={} user={}";
            Object[] arguments = {
                    requestId,
                    actionId.isEmpty() ? "-" : actionId,
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

            MDC.remove("requestId");
            MDC.remove("actionId");

            recordDevMonitorEvent(request, requestId, actionId, status, durationMs, traceResult);
        }
    }

    private void recordDevMonitorEvent(
            HttpServletRequest request,
            String requestId,
            String actionId,
            int status,
            long durationMs,
            DevSqlStatementTracker.TraceResult traceResult
    ) {
        if (apiMonitorService == null || !apiMonitorService.isEnabled()) {
            return;
        }

        String path = applicationPath(request);
        if (path.startsWith("/api/v1/admin/dev-monitor") || "/api/health".equals(path)) {
            return;
        }

        String clientApp = sanitizeHeader(request.getHeader(CLIENT_APP_HEADER), SAFE_APP_NAME, "external");
        String frontendRoute = sanitizeHeader(request.getHeader(FRONTEND_ROUTE_HEADER), SAFE_ROUTE_PATH, "");
        String clientAction = sanitizeHeader(request.getHeader(CLIENT_ACTION_HEADER), SAFE_CLIENT_ACTION, "");

        long clientDurationMs = 0L;
        String clientDurHeader = request.getHeader(CLIENT_DURATION_HEADER);
        if (clientDurHeader != null && !clientDurHeader.isBlank()) {
            try {
                clientDurationMs = Long.parseLong(clientDurHeader.trim());
            } catch (NumberFormatException ignored) {
            }
        }

        String matchedPattern = "";
        Object patternAttr = request.getAttribute(HandlerMapping.BEST_MATCHING_PATTERN_ATTRIBUTE);
        if (patternAttr != null) {
            matchedPattern = patternAttr.toString();
        }

        String controller = "";
        Object handlerAttr = request.getAttribute(HandlerMapping.BEST_MATCHING_HANDLER_ATTRIBUTE);
        if (handlerAttr instanceof HandlerMethod handlerMethod) {
            controller = handlerMethod.getBeanType().getSimpleName() + "." + handlerMethod.getMethod().getName() + "()";
        }

        String userPrincipal = "anonymous";
        String userRole = "ANONYMOUS";
        boolean authenticated = false;

        Authentication auth = SecurityContextHolder.getContext() != null
                ? SecurityContextHolder.getContext().getAuthentication()
                : null;

        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            authenticated = true;
            userPrincipal = auth.getName();
            userRole = auth.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .findFirst()
                    .orElse("AUTHENTICATED");
        } else if (request.getUserPrincipal() != null) {
            authenticated = true;
            userPrincipal = request.getUserPrincipal().getName();
            if (request.isUserInRole("ADMIN")) {
                userRole = "ROLE_ADMIN";
            } else if (request.isUserInRole("USER")) {
                userRole = "ROLE_USER";
            } else {
                userRole = "AUTHENTICATED";
            }
        }

        String errorCode = "";
        Object errAttr = request.getAttribute("koupreng.error_code");
        if (errAttr != null) {
            errorCode = errAttr.toString();
        } else if (status >= 400) {
            errorCode = "HTTP_" + status;
        }

        String contractStatus = "UNMATCHED";
        if (path.startsWith("/api/v1") || "/api/health".equals(path)) {
            contractStatus = "MATCHED";
        } else if (path.startsWith("/api")) {
            contractStatus = "COMPATIBILITY_ALIAS";
        }

        apiMonitorService.recordEvent(
                requestId,
                actionId,
                clientApp,
                frontendRoute,
                clientAction,
                request.getMethod(),
                path,
                requestTarget(request),
                matchedPattern,
                controller,
                status,
                durationMs,
                clientDurationMs,
                traceResult.queryCount(),
                traceResult.durationMs(),
                traceResult.nPlusOneDetected(),
                "BACKEND_OBSERVED",
                contractStatus,
                clientAddress(request),
                userPrincipal,
                userRole,
                authenticated,
                errorCode
        );
    }

    private String sanitizeHeader(String value, Pattern safePattern, String defaultValue) {
        if (value != null && safePattern.matcher(value).matches()) {
            return value;
        }
        return defaultValue;
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
        if (queryString == null || queryString.isBlank()) {
            return path;
        }
        String sanitizedQuery = SENSITIVE_QUERY_PARAM.matcher(queryString).replaceAll("$1=[REDACTED]");
        return path + "?" + sanitizedQuery;
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
