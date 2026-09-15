package com.koupreng.backend.shared.security;

import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.shared.config.AppProperties;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;

public class PublicRsvpRateLimitFilter extends OncePerRequestFilter {

    private static final String PATH_PREFIX = "/api/v1/public/invitations/";
    private static final Duration WINDOW = Duration.ofMinutes(1);

    private final AppProperties.Invitation properties;
    private final RateLimitService rateLimitService;
    private final ClientAddressResolver clientAddressResolver;

    public PublicRsvpRateLimitFilter(
            AppProperties.Invitation properties,
            RateLimitService rateLimitService,
            ClientAddressResolver clientAddressResolver
    ) {
        this.properties = properties;
        this.rateLimitService = rateLimitService;
        this.clientAddressResolver = clientAddressResolver;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return invitationSlug(request) == null;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String slug = invitationSlug(request);
        if (slug == null) {
            filterChain.doFilter(request, response);
            return;
        }

        String key = "public-rsvp:slug:%s:ip:%s".formatted(
                slug.toLowerCase(Locale.ROOT),
                clientAddressResolver.resolve(request)
        );
        try {
            rateLimitService.check(key, properties.getMaxPublicRsvpSubmissionsPerMinute(), WINDOW);
        } catch (ApiException exception) {
            if (exception.getStatus() == HttpStatus.TOO_MANY_REQUESTS) {
                writeFailure(
                        response,
                        request,
                        HttpStatus.TOO_MANY_REQUESTS,
                        "RSVP_RATE_LIMITED",
                        "Too many RSVP submissions. Try again later."
                );
            } else {
                writeFailure(
                        response,
                        request,
                        HttpStatus.SERVICE_UNAVAILABLE,
                        "RATE_LIMIT_UNAVAILABLE",
                        "RSVP service is temporarily unavailable."
                );
            }
            return;
        }
        filterChain.doFilter(request, response);
    }

    private String invitationSlug(HttpServletRequest request) {
        if (!"POST".equalsIgnoreCase(request.getMethod())) {
            return null;
        }
        String path = applicationPath(request);
        if (!path.startsWith(PATH_PREFIX)) {
            return null;
        }
        String remainder = path.substring(PATH_PREFIX.length());
        String[] segments = remainder.split("/");
        boolean genericRsvp = segments.length == 2 && "rsvp".equals(segments[1]);
        boolean personalizedRsvp = segments.length == 4
                && "guests".equals(segments[1])
                && "rsvp".equals(segments[3]);
        return (genericRsvp || personalizedRsvp) && !segments[0].isBlank() ? segments[0] : null;
    }

    private String applicationPath(HttpServletRequest request) {
        String uri = request.getRequestURI() == null ? "" : request.getRequestURI();
        String contextPath = request.getContextPath() == null ? "" : request.getContextPath();
        return !contextPath.isBlank() && uri.startsWith(contextPath)
                ? uri.substring(contextPath.length())
                : uri;
    }

    private void writeFailure(
            HttpServletResponse response,
            HttpServletRequest request,
            HttpStatus status,
            String code,
            String message
    ) throws IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.getWriter().write("""
                {"timestamp":"%s","status":%d,"error":"%s","code":"%s","message":"%s","path":"%s","fieldErrors":{}}
                """.formatted(
                        Instant.now(),
                        status.value(),
                        status.getReasonPhrase(),
                        code,
                        message,
                        jsonString(applicationPath(request))
                ));
    }

    private String jsonString(String value) {
        return value.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\r", "\\r")
                .replace("\n", "\\n");
    }
}
