package com.koupreng.backend.auth.infrastructure.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Optional;

import com.koupreng.backend.user.domain.AppUser;
import com.koupreng.backend.user.domain.Role;
import com.koupreng.backend.user.infrastructure.persistence.AppUserRepository;
import com.koupreng.backend.auth.infrastructure.session.UserAuthCacheService;

import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

class AppJwtAuthenticationConverterTests {

    @Test
    void staleCacheCannotAcceptRevokedToken() {
        AppUserRepository repository = mock(AppUserRepository.class);
        UserAuthCacheService cache = mock(UserAuthCacheService.class);
        AppUser user = user(AppUser.STATUS_ACTIVE);
        user.setTokenVersion(1);
        when(repository.findById(1L)).thenReturn(Optional.of(user));
        when(cache.getAuthInfo(1L)).thenReturn(Optional.of(new UserAuthCacheService.CachedAuthInfo(true, 0, Role.ADMIN)));
        assertThrows(BadCredentialsException.class,
                () -> new AppJwtAuthenticationConverter(cache, repository).convert(jwtWithTokenVersion(0)));
    }

    @Test
    void staleAdminCacheCannotGrantAdminAfterDemotion() {
        AppUserRepository repository = mock(AppUserRepository.class);
        UserAuthCacheService cache = mock(UserAuthCacheService.class);
        when(repository.findById(1L)).thenReturn(Optional.of(user(AppUser.STATUS_ACTIVE)));
        when(cache.getAuthInfo(1L)).thenReturn(Optional.of(new UserAuthCacheService.CachedAuthInfo(true, 0, Role.ADMIN)));
        JwtAuthenticationToken authentication = new AppJwtAuthenticationConverter(cache, repository).convert(jwtWithTokenVersion(0));
        assertEquals("ROLE_USER", authentication.getAuthorities().iterator().next().getAuthority());
        org.mockito.Mockito.verify(cache).evict(1L);
    }

    @Test
    void staffAuthorityMappingIsPreserved() {
        AppUserRepository repository = mock(AppUserRepository.class);
        AppUser user = user(AppUser.STATUS_ACTIVE);
        user.setRole(Role.STAFF);
        when(repository.findById(1L)).thenReturn(Optional.of(user));
        JwtAuthenticationToken authentication = new AppJwtAuthenticationConverter(new UserAuthCacheService(repository), repository)
                .convert(jwtWithTokenVersion(0));
        assertEquals("ROLE_ADMIN", authentication.getAuthorities().iterator().next().getAuthority());
    }

    @Test
    void convertsValidTokenVersionForActiveUser() {
        AppUserRepository userRepository = mock(AppUserRepository.class);
        UserAuthCacheService cacheService = new UserAuthCacheService(userRepository);
        AppJwtAuthenticationConverter converter = new AppJwtAuthenticationConverter(cacheService, userRepository);
        AppUser user = user(AppUser.STATUS_ACTIVE);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        JwtAuthenticationToken authentication = converter.convert(jwtWithTokenVersion(0));

        assertEquals("1", authentication.getName());
        assertEquals("ROLE_USER", authentication.getAuthorities().iterator().next().getAuthority());
    }

    @Test
    void rejectsDisabledUser() {
        AppUserRepository userRepository = mock(AppUserRepository.class);
        UserAuthCacheService cacheService = new UserAuthCacheService(userRepository);
        AppJwtAuthenticationConverter converter = new AppJwtAuthenticationConverter(cacheService, userRepository);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user(AppUser.STATUS_DISABLED)));

        assertThrows(BadCredentialsException.class, () -> converter.convert(jwtWithTokenVersion(0)));
    }

    @Test
    void rejectsOldTokenAfterLogoutChangesTokenVersion() {
        AppUserRepository userRepository = mock(AppUserRepository.class);
        UserAuthCacheService cacheService = new UserAuthCacheService(userRepository);
        AppJwtAuthenticationConverter converter = new AppJwtAuthenticationConverter(cacheService, userRepository);
        AppUser user = user(AppUser.STATUS_ACTIVE);
        user.incrementTokenVersion();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        assertThrows(BadCredentialsException.class, () -> converter.convert(jwtWithTokenVersion(0)));
    }

    private AppUser user(String status) {
        AppUser user = new AppUser();
        user.setId(1L);
        user.setEmail("user@example.com");
        user.setFullName("Test User");
        user.setRole(Role.USER);
        user.setStatus(status);
        return user;
    }

    private Jwt jwtWithTokenVersion(int tokenVersion) {
        return Jwt.withTokenValue("jwt-token")
                .header("alg", "HS256")
                .subject("1")
                .claim("token_version", tokenVersion)
                .build();
    }
}
