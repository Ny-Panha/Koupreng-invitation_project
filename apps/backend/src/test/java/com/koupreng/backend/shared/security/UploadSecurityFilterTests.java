package com.koupreng.backend.shared.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.io.IOException;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class UploadSecurityFilterTests {

    private final UploadSecurityFilter filter = new UploadSecurityFilter();

    @Test
    void addsSandboxHeadersWithoutAttachmentDispositionForUploads() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/uploads/avatar.png");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain filterChain = (req, res) -> {};

        filter.doFilterInternal(request, response, filterChain);

        assertEquals("nosniff", response.getHeader("X-Content-Type-Options"));
        assertEquals("default-src 'none'; style-src 'unsafe-inline'; sandbox", response.getHeader("Content-Security-Policy"));
        assertEquals("DENY", response.getHeader("X-Frame-Options"));
        assertNull(response.getHeader("Content-Disposition"), "Content-Disposition should not be set to attachment to preserve <img> rendering");
    }

    @Test
    void skipsHeadersForNonUploadRoutes() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/auth/login");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain filterChain = (req, res) -> {};

        filter.doFilterInternal(request, response, filterChain);

        assertNull(response.getHeader("X-Content-Type-Options"));
        assertNull(response.getHeader("Content-Security-Policy"));
        assertNull(response.getHeader("X-Frame-Options"));
    }
}
