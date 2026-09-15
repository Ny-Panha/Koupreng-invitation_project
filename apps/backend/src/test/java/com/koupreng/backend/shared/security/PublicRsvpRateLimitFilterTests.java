package com.koupreng.backend.shared.security;

import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.shared.config.AppProperties;
import com.koupreng.backend.shared.security.RateLimitService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.util.concurrent.atomic.AtomicBoolean;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;

class PublicRsvpRateLimitFilterTests {

    @Test
    void rateLimitsPublicRsvpWritesPerInvitationAndClient() throws Exception {
        PublicRsvpRateLimitFilter filter = filter(1);

        MockHttpServletResponse first = new MockHttpServletResponse();
        AtomicBoolean firstCalled = new AtomicBoolean();
        filter.doFilter(request("/api/v1/public/invitations/wedding/rsvp"), first,
                (request, response) -> firstCalled.set(true));

        MockHttpServletResponse second = new MockHttpServletResponse();
        AtomicBoolean secondCalled = new AtomicBoolean();
        filter.doFilter(request("/api/v1/public/invitations/wedding/rsvp"), second,
                (request, response) -> secondCalled.set(true));

        assertTrue(firstCalled.get());
        assertEquals(200, first.getStatus());
        assertFalse(secondCalled.get());
        assertEquals(429, second.getStatus());
        assertTrue(second.getContentAsString().contains("RSVP_RATE_LIMITED"));
    }

    @Test
    void personalizedTokensShareTheSlugBucketWithoutEnteringTheKey() throws Exception {
        PublicRsvpRateLimitFilter filter = filter(1);

        filter.doFilter(request("/api/v1/public/invitations/wedding/guests/token-one/rsvp"),
                new MockHttpServletResponse(), (request, response) -> {
                });
        MockHttpServletResponse replay = new MockHttpServletResponse();
        filter.doFilter(request("/api/v1/public/invitations/wedding/guests/token-two/rsvp"), replay,
                (request, response) -> {
                });

        assertEquals(429, replay.getStatus());
    }

    @Test
    void ignoresNonRsvpPublicWrites() throws Exception {
        PublicRsvpRateLimitFilter filter = filter(1);
        AtomicBoolean called = new AtomicBoolean();

        filter.doFilter(request("/api/v1/public/invitations/wedding/access/verify"),
                new MockHttpServletResponse(), (request, response) -> called.set(true));

        assertTrue(called.get());
    }

    @Test
    void failsClosedWithServiceUnavailableWhenRateLimiterIsUnavailable() throws Exception {
        AppProperties properties = new AppProperties();
        RateLimitService rateLimitService = mock(RateLimitService.class);
        doThrow(new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Rate limiter is unavailable"))
                .when(rateLimitService).check(anyString(), anyInt(), any());
        PublicRsvpRateLimitFilter filter = new PublicRsvpRateLimitFilter(
                properties.getInvitation(),
                rateLimitService,
                new ClientAddressResolver(new ApiSecurityProperties())
        );
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request("/api/v1/public/invitations/wedding/rsvp"), response,
                (request, servletResponse) -> {
                });

        assertEquals(503, response.getStatus());
        assertTrue(response.getContentAsString().contains("RATE_LIMIT_UNAVAILABLE"));
    }

    private PublicRsvpRateLimitFilter filter(int limit) {
        AppProperties properties = new AppProperties();
        properties.getInvitation().setMaxPublicRsvpSubmissionsPerMinute(limit);
        ObjectProvider<StringRedisTemplate> redisTemplateProvider = new ObjectProvider<>() {
        };
        RateLimitService rateLimitService = new RateLimitService(redisTemplateProvider, properties);
        ClientAddressResolver addressResolver = new ClientAddressResolver(new ApiSecurityProperties());
        return new PublicRsvpRateLimitFilter(properties.getInvitation(), rateLimitService, addressResolver);
    }

    private MockHttpServletRequest request(String path) {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", path);
        request.setRequestURI(path);
        request.setRemoteAddr("203.0.113.12");
        return request;
    }
}
