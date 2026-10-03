package com.koupreng.backend.invitation.application;

import com.koupreng.backend.shared.config.AppProperties;
import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.shared.security.ApiSecurityProperties;
import com.koupreng.backend.shared.security.ClientAddressResolver;
import com.koupreng.backend.shared.security.RateLimitService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import static org.junit.jupiter.api.Assertions.*;

class InvitationPasswordAttemptLimiterTests {
    @AfterEach void cleanup() { RequestContextHolder.resetRequestAttributes(); }

    @Test
    void failuresAreBoundedByInvitationAndClientWithoutChargingSuccesses() {
        AppProperties properties = new AppProperties();
        properties.getInvitation().setMaxPasswordFailuresPerMinute(2);
        var limiter = new InvitationPasswordAttemptLimiter(new RateLimitService(null, properties),
                new ClientAddressResolver(new ApiSecurityProperties()), properties);
        client("127.0.0.1");
        for (int i = 0; i < 10; i++) { limiter.assertAllowed(10L); }
        limiter.recordFailure(10L);
        limiter.assertAllowed(10L);
        limiter.recordFailure(10L);
        assertEquals(429, assertThrows(ApiException.class, () -> limiter.assertAllowed(10L)).getStatus().value());
        assertDoesNotThrow(() -> limiter.assertAllowed(11L));
        client("127.0.0.2");
        assertDoesNotThrow(() -> limiter.assertAllowed(10L));
    }

    private void client(String address) {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr(address);
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));
    }
}
