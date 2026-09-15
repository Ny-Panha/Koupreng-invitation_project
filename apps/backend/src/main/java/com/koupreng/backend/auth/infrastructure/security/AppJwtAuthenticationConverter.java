package com.koupreng.backend.auth.infrastructure.security;

import java.util.List;

import com.koupreng.backend.auth.infrastructure.session.UserAuthCacheService;
import com.koupreng.backend.auth.infrastructure.session.UserAuthCacheService.CachedAuthInfo;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

public class AppJwtAuthenticationConverter implements Converter<Jwt, JwtAuthenticationToken> {

    private final UserAuthCacheService userAuthCacheService;

    public AppJwtAuthenticationConverter(UserAuthCacheService userAuthCacheService) {
        this.userAuthCacheService = userAuthCacheService;
    }

    @Override
    public JwtAuthenticationToken convert(Jwt jwt) {
        Long userId = parseUserId(jwt.getSubject());
        CachedAuthInfo authInfo = userAuthCacheService.getAuthInfo(userId)
                .orElseThrow(() -> new BadCredentialsException("Authentication required"));

        if (!authInfo.active()) {
            throw new BadCredentialsException("Account is disabled");
        }
        validateTokenVersion(jwt, authInfo);

        List<GrantedAuthority> authorities = List.of(
                new SimpleGrantedAuthority("ROLE_" + authInfo.role().name())
        );
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
