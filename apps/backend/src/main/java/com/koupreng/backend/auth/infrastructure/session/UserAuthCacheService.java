package com.koupreng.backend.auth.infrastructure.session;

import java.time.Duration;
import java.util.Optional;

import com.koupreng.backend.entity.user.AppUser;
import com.koupreng.backend.entity.user.Role;
import com.koupreng.backend.repository.AppUserRepository;

import io.micrometer.core.instrument.MeterRegistry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

/**
 * Distributed cache for JWT authentication state backed by Redis.
 * Prevents querying the database on every authenticated request while ensuring
 * that token version revocations, role changes, and bans propagate instantly
 * across all application replicas.
 */
@Service
public class UserAuthCacheService {

    private static final Logger log = LoggerFactory.getLogger(UserAuthCacheService.class);
    private static final String CACHE_KEY_PREFIX = "auth:user:";
    private static final long TTL_SECONDS = 60;
    public static final String FALLBACK_METRIC = "auth.cache.fallback";

    private final AppUserRepository userRepository;
    private final ObjectProvider<StringRedisTemplate> redisTemplateProvider;
    private final ObjectProvider<MeterRegistry> meterRegistryProvider;

    @Autowired
    public UserAuthCacheService(
            AppUserRepository userRepository,
            ObjectProvider<StringRedisTemplate> redisTemplateProvider,
            ObjectProvider<MeterRegistry> meterRegistryProvider
    ) {
        this.userRepository = userRepository;
        this.redisTemplateProvider = redisTemplateProvider;
        this.meterRegistryProvider = meterRegistryProvider;
    }

    public UserAuthCacheService(
            AppUserRepository userRepository,
            ObjectProvider<StringRedisTemplate> redisTemplateProvider
    ) {
        this(userRepository, redisTemplateProvider, null);
    }

    public UserAuthCacheService(AppUserRepository userRepository) {
        this(userRepository, null, null);
    }

    /**
     * Returns cached auth info for the given user ID. Checks Redis first,
     * falling back to the database and populating the Redis cache on miss.
     */
    public Optional<CachedAuthInfo> getAuthInfo(Long userId) {
        if (userId == null) {
            return Optional.empty();
        }

        StringRedisTemplate redisTemplate = getRedisTemplate();
        String key = CACHE_KEY_PREFIX + userId;

        if (redisTemplate != null) {
            try {
                String cachedValue = redisTemplate.opsForValue().get(key);
                Optional<CachedAuthInfo> cached = CachedAuthInfo.deserialize(cachedValue);
                if (cached.isPresent()) {
                    return cached;
                }
            } catch (Exception ex) {
                recordFallback(userId, "redis_read_error", ex.getMessage());
            }
        } else {
            recordFallback(userId, "redis_unavailable", "RedisTemplate bean not available");
        }

        return userRepository.findById(userId).map(user -> {
            CachedAuthInfo info = CachedAuthInfo.from(user);
            if (redisTemplate != null) {
                try {
                    redisTemplate.opsForValue().set(key, info.serialize(), Duration.ofSeconds(TTL_SECONDS));
                } catch (Exception ex) {
                    recordFallback(userId, "redis_write_error", ex.getMessage());
                }
            }
            return info;
        });
    }

    /**
     * Evicts the cached auth info for the given user ID across all replicas.
     * Must be invoked whenever user status, token version, or role changes.
     */
    public void evict(Long userId) {
        if (userId == null) {
            return;
        }

        StringRedisTemplate redisTemplate = getRedisTemplate();
        if (redisTemplate != null) {
            try {
                redisTemplate.delete(CACHE_KEY_PREFIX + userId);
            } catch (Exception ex) {
                recordFallback(userId, "redis_evict_error", ex.getMessage());
            }
        } else {
            recordFallback(userId, "redis_unavailable", "RedisTemplate bean not available during evict");
        }
    }

    private void recordFallback(Long userId, String reason, String details) {
        log.warn("auth.cache.fallback user={} reason={}: {}", userId, reason, details);
        if (meterRegistryProvider != null) {
            meterRegistryProvider.ifAvailable(registry -> {
                try {
                    registry.counter(FALLBACK_METRIC, "reason", reason).increment();
                } catch (Exception ex) {
                    log.debug("Failed to increment fallback metric: {}", ex.getMessage());
                }
            });
        }
    }

    private StringRedisTemplate getRedisTemplate() {
        return redisTemplateProvider != null ? redisTemplateProvider.getIfAvailable() : null;
    }

    /**
     * Snapshot of user authentication state used for JWT token validation.
     */
    public record CachedAuthInfo(
            boolean active,
            int tokenVersion,
            Role role
    ) {
        public static CachedAuthInfo from(AppUser user) {
            return new CachedAuthInfo(
                    user.isActive(),
                    user.getTokenVersion(),
                    user.getRole()
            );
        }

        public String serialize() {
            return active + ":" + tokenVersion + ":" + role.name();
        }

        public static Optional<CachedAuthInfo> deserialize(String data) {
            if (data == null || data.isBlank()) {
                return Optional.empty();
            }
            String[] parts = data.split(":", 3);
            if (parts.length < 3) {
                return Optional.empty();
            }
            try {
                boolean active = Boolean.parseBoolean(parts[0]);
                int tokenVersion = Integer.parseInt(parts[1]);
                Role role = Role.valueOf(parts[2]);
                return Optional.of(new CachedAuthInfo(active, tokenVersion, role));
            } catch (Exception ex) {
                return Optional.empty();
            }
        }
    }
}
