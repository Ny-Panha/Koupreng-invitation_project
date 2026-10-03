package com.koupreng.backend.invitation.application;

import com.koupreng.backend.shared.config.AppProperties;
import com.koupreng.backend.shared.security.ClientAddressResolver;
import com.koupreng.backend.shared.security.RateLimitService;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import java.time.Duration;

@Component
public class InvitationPasswordAttemptLimiter {
    private final RateLimitService rateLimitService;
    private final ClientAddressResolver clientAddressResolver;
    private final AppProperties appProperties;

    public InvitationPasswordAttemptLimiter(RateLimitService rateLimitService,
            ClientAddressResolver clientAddressResolver, AppProperties appProperties) {
        this.rateLimitService = rateLimitService;
        this.clientAddressResolver = clientAddressResolver;
        this.appProperties = appProperties;
    }

    public void assertAllowed(Long invitationId) {
        rateLimitService.assertAllowed(key(invitationId), maxFailures());
    }

    public void recordFailure(Long invitationId) {
        rateLimitService.check(key(invitationId), maxFailures(), Duration.ofMinutes(1));
    }

    private int maxFailures() {
        return appProperties.getInvitation().getMaxPasswordFailuresPerMinute();
    }

    private String key(Long invitationId) {
        var attributes = RequestContextHolder.getRequestAttributes();
        String client = attributes instanceof ServletRequestAttributes servlet
                ? clientAddressResolver.resolve(servlet.getRequest()) : "unknown";
        return "invitation-password:" + invitationId + ":" + client;
    }
}
