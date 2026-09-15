package com.koupreng.backend.service;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.config.AppProperties;
import com.koupreng.backend.config.AppProperties.RateLimit.Backend;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.data.redis.RedisConnectionFailureException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class RateLimitService {

    private static final int MAX_MEMORY_BUCKETS = 10_000;

    private final Clock clock = Clock.systemUTC();
    private final Map<String, Window> memoryWindows = new ConcurrentHashMap<>();
    private final ObjectProvider<StringRedisTemplate> redisTemplateProvider;
    private final AppProperties.RateLimit rateLimitProperties;

    public RateLimitService(
            ObjectProvider<StringRedisTemplate> redisTemplateProvider,
            AppProperties appProperties
    ) {
        this.redisTemplateProvider = redisTemplateProvider;
        this.rateLimitProperties = appProperties.getRateLimit();
    }

    public void check(String key, int maxAttempts, Duration windowSize) {
        if (rateLimitProperties.getBackend() == Backend.REDIS) {
            checkRedis(key, maxAttempts, windowSize);
            return;
        }

        checkMemory(key, maxAttempts, windowSize);
    }

    private void checkMemory(String key, int maxAttempts, Duration windowSize) {
        Instant now = clock.instant();
        RateLimitDecision decision = new RateLimitDecision();

        memoryWindows.compute(key, (ignored, current) -> {
            if (current == null || !current.resetAt.isAfter(now)) {
                return new Window(now.plus(windowSize), 1);
            }

            if (current.attempts >= maxAttempts) {
                decision.blocked = true;
                return current;
            }

            current.attempts++;
            return current;
        });

        if (memoryWindows.size() > MAX_MEMORY_BUCKETS) {
            memoryWindows.entrySet().removeIf(entry -> !entry.getValue().resetAt.isAfter(now));
        }

        if (decision.blocked) {
            throw tooManyRequests();
        }
    }

    private void checkRedis(String key, int maxAttempts, Duration windowSize) {
        StringRedisTemplate redisTemplate = redisTemplateProvider.getIfAvailable();
        if (redisTemplate == null) {
            handleRedisUnavailable();
            return;
        }

        String redisKey = rateLimitProperties.getRedisKeyPrefix() + key;
        try {
            Long attempts = redisTemplate.opsForValue().increment(redisKey);
            if (attempts != null && attempts == 1L) {
                redisTemplate.expire(redisKey, windowSize);
            }

            if (attempts != null && attempts > maxAttempts) {
                throw tooManyRequests();
            }
        } catch (RedisConnectionFailureException exception) {
            handleRedisUnavailable();
        } catch (RuntimeException exception) {
            if (exception instanceof ApiException apiException) {
                throw apiException;
            }
            handleRedisUnavailable();
        }
    }

    private void handleRedisUnavailable() {
        if (rateLimitProperties.isFailClosed()) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Rate limiter is unavailable");
        }
    }

    private ApiException tooManyRequests() {
        return new ApiException(HttpStatus.TOO_MANY_REQUESTS, "Too many requests. Try again later.");
    }

    private static class Window {
        private final Instant resetAt;
        private int attempts;

        private Window(Instant resetAt, int attempts) {
            this.resetAt = resetAt;
            this.attempts = attempts;
        }
    }

    private static class RateLimitDecision {
        private boolean blocked;
    }
}
