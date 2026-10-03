package com.koupreng.backend.auth.infrastructure.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.server.resource.web.DefaultBearerTokenResolver;
import org.springframework.security.web.csrf.CsrfFilter;
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;

import java.util.Arrays;
import java.util.List;

/** Keeps automatic cookie credentials subject to CSRF while explicit header tokens remain usable. */
public final class CookieCsrfProtectionMatcher implements RequestMatcher {
    private final DefaultBearerTokenResolver headerResolver = new DefaultBearerTokenResolver();
    private final List<RequestMatcher> publicEndpoints;

    public CookieCsrfProtectionMatcher(String... publicPaths) {
        this.publicEndpoints = Arrays.stream(publicPaths)
                .<RequestMatcher>map(path -> PathPatternRequestMatcher.withDefaults().matcher(path))
                .toList();
    }

    @Override
    public boolean matches(HttpServletRequest request) {
        if (!CsrfFilter.DEFAULT_CSRF_MATCHER.matches(request)
                || publicEndpoints.stream().anyMatch(endpoint -> endpoint.matches(request))) {
            return false;
        }
        try {
            return headerResolver.resolve(request) == null;
        } catch (OAuth2AuthenticationException exception) {
            // Malformed headers cannot turn an automatic cookie credential into a CSRF exemption.
            return true;
        }
    }
}
