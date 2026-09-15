package com.koupreng.backend.auth.infrastructure.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import jakarta.servlet.http.Cookie;

import com.koupreng.backend.config.AppProperties;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

class CookieBearerTokenResolverTests {

    @Test
    void authorizationHeaderTakesPriorityOverCookie() {
        CookieBearerTokenResolver resolver = resolver(true);
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer header-token");
        request.setCookies(new Cookie("koupreng_access_token", "cookie-token"));

        assertEquals("header-token", resolver.resolve(request));
    }

    @Test
    void resolvesCookieTokenWhenCookieAuthEnabledAndHeaderMissing() {
        CookieBearerTokenResolver resolver = resolver(true);
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setCookies(new Cookie("koupreng_access_token", "cookie-token"));

        assertEquals("cookie-token", resolver.resolve(request));
    }

    @Test
    void ignoresCookieTokenWhenCookieAuthDisabled() {
        CookieBearerTokenResolver resolver = resolver(false);
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setCookies(new Cookie("koupreng_access_token", "cookie-token"));

        assertNull(resolver.resolve(request));
    }

    private CookieBearerTokenResolver resolver(boolean cookieEnabled) {
        AppProperties.Auth.Cookie properties = new AppProperties().getAuth().getCookie();
        properties.setEnabled(cookieEnabled);
        properties.setName("koupreng_access_token");
        return new CookieBearerTokenResolver(properties);
    }
}
