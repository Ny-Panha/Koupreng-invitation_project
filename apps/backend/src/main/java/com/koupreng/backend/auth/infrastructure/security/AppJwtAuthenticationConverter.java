package com.koupreng.backend.auth.infrastructure.security;

import java.util.List;

import com.koupreng.backend.auth.infrastructure.session.UserAuthCacheService;
import com.koupreng.backend.auth.infrastructure.session.UserAuthCacheService.CachedAuthInfo;
import com.koupreng.backend.dev.DevSampleData;
import com.koupreng.backend.user.domain.AppUser;
import com.koupreng.backend.user.infrastructure.persistence.AppUserRepository;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

public class AppJwtAuthenticationConverter implements Converter<Jwt, JwtAuthenticationToken> {

    private final UserAuthCacheService userAuthCacheService;
    private final AppUserRepository userRepository;

    public AppJwtAuthenticationConverter(UserAuthCacheService userAuthCacheService, AppUserRepository userRepository) {
        this.userAuthCacheService = userAuthCacheService;
        this.userRepository = userRepository;
    }

    @Override
    public JwtAuthenticationToken convert(Jwt jwt) {
        Long userId = parseUserId(jwt.getSubject());
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new BadCredentialsException("Authentication required"));

        if (!user.isActive() || AppUser.STATUS_DISABLED.equalsIgnoreCase(user.getStatus())) {
            throw new BadCredentialsException("Account is disabled");
        }

        CachedAuthInfo authInfo = userAuthCacheService.getAuthInfo(userId)
                .orElseThrow(() -> new BadCredentialsException("Authentication required"));

        if (!authInfo.active()) {
            throw new BadCredentialsException("Account is disabled");
        }
        validateTokenVersion(jwt, authInfo);

        String authority = authInfo.role() == com.koupreng.backend.user.domain.Role.STAFF
            ? "ROLE_ADMIN"
            : "ROLE_" + authInfo.role().name();
        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(authority));
        return new JwtAuthenticationToken(jwt, authorities, userId.toString());
    }

    private Long parseUserId(String subject) {
        if (subject == null || subject.isBlank()) {
            throw new BadCredentialsException("Token is missing subject");
        }
        try {
            return Long.valueOf(subject);
        } catch (NumberFormatException ex) {
            throw new BadCredentialsException("Token subject is not a valid user id");
        }
    }

    private void validateTokenVersion(Jwt jwt, CachedAuthInfo authInfo) {
        Object value = jwt.getClaim("token_version");
        if (!(value instanceof Number version) || version.intValue() != authInfo.tokenVersion()) {
            throw new BadCredentialsException("Authentication required");
        }
    }
}
