package com.koupreng.backend.auth.infrastructure.security;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Duration;

import jakarta.servlet.FilterChain;

import com.koupreng.backend.shared.config.AppProperties;
import com.koupreng.backend.shared.security.ClientAddressResolver;
import com.koupreng.backend.shared.security.RateLimitService;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class AuthRateLimitFilterTests {

    @ParameterizedTest
    @ValueSource(strings = {"/api/v1/auth/login", "/api/auth/login"})
    void canonicalAndCompatibilityLoginRoutesUseTheSameRateLimitBucket(String path) throws Exception {
        AppProperties.Auth properties = new AppProperties.Auth();
        RateLimitService rateLimitService = mock(RateLimitService.class);
        ClientAddressResolver clientAddressResolver = mock(ClientAddressResolver.class);
        FilterChain filterChain = mock(FilterChain.class);
        when(clientAddressResolver.resolve(org.mockito.ArgumentMatchers.any()))
                .thenReturn("203.0.113.10");

        AuthRateLimitFilter filter = new AuthRateLimitFilter(
                properties,
                rateLimitService,
                clientAddressResolver
        );
        MockHttpServletRequest request = new MockHttpServletRequest("POST", path);
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, filterChain);

        verify(rateLimitService).check(
                "auth:login:ip:203.0.113.10",
                properties.getMaxLoginAttemptsPerMinute(),
                Duration.ofMinutes(1)
        );
        verify(filterChain).doFilter(request, response);
    }
}
