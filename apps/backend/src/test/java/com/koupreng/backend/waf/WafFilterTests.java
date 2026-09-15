package com.koupreng.backend.waf;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.nio.charset.StandardCharsets;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicReference;

import jakarta.servlet.FilterChain;

import com.koupreng.backend.config.AppProperties;
import com.koupreng.backend.security.ApiSecurityProperties;
import com.koupreng.backend.security.ClientAddressResolver;
import com.koupreng.backend.shared.security.RateLimitService;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class WafFilterTests {

    @Test
    void allowsNormalJsonApiRequestAndKeepsBodyReadable() throws Exception {
        WafFilter filter = filter(new WafProperties());
        byte[] body = """
                {"email":"user@example.com","password":"Str0ng!Password"}
                """.getBytes(StandardCharsets.UTF_8);
        MockHttpServletRequest request = apiRequest("POST", "/api/auth/login");
        request.setContentType(MediaType.APPLICATION_JSON_VALUE);
        request.setContent(body);
        MockHttpServletResponse response = new MockHttpServletResponse();
        AtomicReference<byte[]> bodySeenByController = new AtomicReference<>();

        filter.doFilter(request, response, (servletRequest, servletResponse) ->
                bodySeenByController.set(servletRequest.getInputStream().readAllBytes()));

        assertEquals(200, response.getStatus());
        assertArrayEquals(body, bodySeenByController.get());
    }

    @Test
    void blocksPathTraversalBeforeController() throws Exception {
        WafFilter filter = filter(new WafProperties());
        MockHttpServletRequest request = apiRequest("GET", "/api/users/../admin");
        MockHttpServletResponse response = new MockHttpServletResponse();
        AtomicBoolean controllerCalled = new AtomicBoolean();

        filter.doFilter(request, response, markCalled(controllerCalled));

        assertEquals(403, response.getStatus());
        assertFalse(controllerCalled.get());
        assertTrue(response.getContentAsString().contains("Request blocked by application firewall"));
    }

    @Test
    void blocksSuspiciousJsonBodyBeforeController() throws Exception {
        WafFilter filter = filter(new WafProperties());
        MockHttpServletRequest request = apiRequest("POST", "/api/auth/login");
        request.setContentType(MediaType.APPLICATION_JSON_VALUE);
        request.setContent("""
                {"email":"user@example.com","password":"' OR 1=1 --"}
                """.getBytes(StandardCharsets.UTF_8));
        MockHttpServletResponse response = new MockHttpServletResponse();
        AtomicBoolean controllerCalled = new AtomicBoolean();

        filter.doFilter(request, response, markCalled(controllerCalled));

        assertEquals(403, response.getStatus());
        assertFalse(controllerCalled.get());
    }

    @Test
    void blocksOversizedBody() throws Exception {
        WafProperties properties = new WafProperties();
        properties.setMaxBodyBytes(1024);
        WafFilter filter = filter(properties);
        MockHttpServletRequest request = apiRequest("POST", "/api/auth/login");
        request.setContentType(MediaType.APPLICATION_JSON_VALUE);
        request.setContent("x".repeat(1025).getBytes(StandardCharsets.UTF_8));
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, markCalled(new AtomicBoolean()));

        assertEquals(413, response.getStatus());
    }

    @Test
    void rateLimitsApiRequestsPerClientAddress() throws Exception {
        WafProperties properties = new WafProperties();
        properties.setMaxRequestsPerMinute(1);
        WafFilter filter = filter(properties);

        MockHttpServletResponse firstResponse = new MockHttpServletResponse();
        filter.doFilter(apiRequest("GET", "/api/health"), firstResponse, (request, response) -> {
        });

        MockHttpServletResponse secondResponse = new MockHttpServletResponse();
        filter.doFilter(apiRequest("GET", "/api/health"), secondResponse, markCalled(new AtomicBoolean()));

        assertEquals(200, firstResponse.getStatus());
        assertEquals(429, secondResponse.getStatus());
    }

    private MockHttpServletRequest apiRequest(String method, String path) {
        MockHttpServletRequest request = new MockHttpServletRequest(method, path);
        request.setRequestURI(path);
        request.setRemoteAddr("203.0.113.10");
        return request;
    }

    private FilterChain markCalled(AtomicBoolean called) {
        return (servletRequest, servletResponse) -> called.set(true);
    }

    private WafFilter filter(WafProperties properties) {
        ObjectProvider<StringRedisTemplate> redisTemplateProvider = new ObjectProvider<>() {
        };
        RateLimitService rateLimitService = new RateLimitService(redisTemplateProvider, new AppProperties());
        ClientAddressResolver clientAddressResolver = new ClientAddressResolver(new ApiSecurityProperties());
        return new WafFilter(properties, rateLimitService, clientAddressResolver);
    }
}
