package com.koupreng.backend.auth.infrastructure.session;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Duration;
import java.util.Optional;
import java.util.function.Consumer;

import com.koupreng.backend.user.domain.AppUser;
import com.koupreng.backend.user.domain.Role;
import com.koupreng.backend.user.infrastructure.persistence.AppUserRepository;
import com.koupreng.backend.auth.infrastructure.session.UserAuthCacheService.CachedAuthInfo;

import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

class UserAuthCacheServiceTests {

    private AppUserRepository userRepository;
    private StringRedisTemplate redisTemplate;
    private ValueOperations<String, String> valueOperations;
    private ObjectProvider<StringRedisTemplate> redisTemplateProvider;
    private ObjectProvider<MeterRegistry> meterRegistryProvider;
    private MeterRegistry meterRegistry;
    private UserAuthCacheService cacheService;

    @BeforeEach
    @SuppressWarnings("unchecked")
    void setUp() {
        userRepository = mock(AppUserRepository.class);
        redisTemplate = mock(StringRedisTemplate.class);
        valueOperations = mock(ValueOperations.class);
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);

        redisTemplateProvider = mock(ObjectProvider.class);
        when(redisTemplateProvider.getIfAvailable()).thenReturn(redisTemplate);

        meterRegistry = new SimpleMeterRegistry();
        meterRegistryProvider = mock(ObjectProvider.class);
        org.mockito.Mockito.doAnswer(invocation -> {
            Consumer<MeterRegistry> consumer = invocation.getArgument(0);
            consumer.accept(meterRegistry);
            return null;
        }).when(meterRegistryProvider).ifAvailable(any());

        cacheService = new UserAuthCacheService(userRepository, redisTemplateProvider, meterRegistryProvider);
    }

    @Test
    void returnsFromRedisOnCacheHitWithoutQueryingDb() {
        when(valueOperations.get("auth:user:42")).thenReturn("true:3:ADMIN");

        Optional<CachedAuthInfo> result = cacheService.getAuthInfo(42L);

        assertTrue(result.isPresent());
        assertTrue(result.get().active());
        assertEquals(3, result.get().tokenVersion());
        assertEquals(Role.ADMIN, result.get().role());
        verify(userRepository, never()).findById(any());
        assertEquals(0.0, meterRegistry.counter(UserAuthCacheService.FALLBACK_METRIC, "reason", "redis_unavailable").count());
    }

    @Test
    void queriesDbAndCachesInRedisOnCacheMiss() {
        when(valueOperations.get("auth:user:42")).thenReturn(null);
        AppUser user = new AppUser();
        user.setId(42L);
        user.setStatus(AppUser.STATUS_ACTIVE);
        user.setTokenVersion(1);
        user.setRole(Role.USER);
        when(userRepository.findById(42L)).thenReturn(Optional.of(user));

        Optional<CachedAuthInfo> result = cacheService.getAuthInfo(42L);

        assertTrue(result.isPresent());
        assertEquals(Role.USER, result.get().role());
        assertEquals(1, result.get().tokenVersion());
        assertTrue(result.get().active());
        verify(valueOperations).set(eq("auth:user:42"), eq("true:1:USER"), any(Duration.class));
    }

    @Test
    void evictDeletesKeyFromRedis() {
        cacheService.evict(42L);

        verify(redisTemplate).delete("auth:user:42");
    }

    @Test
    void fallsBackToDbAndIncrementsMetricWhenRedisProviderReturnsNull() {
        when(redisTemplateProvider.getIfAvailable()).thenReturn(null);
        AppUser user = new AppUser();
        user.setId(99L);
        user.setStatus(AppUser.STATUS_ACTIVE);
        user.setTokenVersion(2);
        user.setRole(Role.ADMIN);
        when(userRepository.findById(99L)).thenReturn(Optional.of(user));

        Optional<CachedAuthInfo> result = cacheService.getAuthInfo(99L);

        assertTrue(result.isPresent());
        assertEquals(Role.ADMIN, result.get().role());
        verify(userRepository).findById(99L);
        assertEquals(1.0, meterRegistry.counter(UserAuthCacheService.FALLBACK_METRIC, "reason", "redis_unavailable").count());
    }

    @Test
    void fallsBackToDbAndIncrementsMetricWhenRedisReadFails() {
        when(valueOperations.get("auth:user:50")).thenThrow(new RuntimeException("Connection timeout"));
        AppUser user = new AppUser();
        user.setId(50L);
        user.setStatus(AppUser.STATUS_ACTIVE);
        user.setTokenVersion(1);
        user.setRole(Role.USER);
        when(userRepository.findById(50L)).thenReturn(Optional.of(user));

        Optional<CachedAuthInfo> result = cacheService.getAuthInfo(50L);

        assertTrue(result.isPresent());
        assertEquals(Role.USER, result.get().role());
        verify(userRepository).findById(50L);
        assertEquals(1.0, meterRegistry.counter(UserAuthCacheService.FALLBACK_METRIC, "reason", "redis_read_error").count());
    }

    @Test
    void recordsFallbackMetricWhenRedisEvictFails() {
        org.mockito.Mockito.doThrow(new RuntimeException("Redis cluster down"))
                .when(redisTemplate).delete("auth:user:77");

        cacheService.evict(77L);

        assertEquals(1.0, meterRegistry.counter(UserAuthCacheService.FALLBACK_METRIC, "reason", "redis_evict_error").count());
    }
}
