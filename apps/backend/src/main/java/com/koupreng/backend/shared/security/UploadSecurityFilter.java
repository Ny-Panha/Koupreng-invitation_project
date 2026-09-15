package com.koupreng.backend.shared.security;

import java.io.IOException;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Adds security headers to uploaded file responses to prevent script execution
 * and Stored XSS attacks without breaking {@code <img>} avatar/template rendering.
 * <ul>
 *   <li>{@code X-Content-Type-Options: nosniff} prevents MIME type sniffing</li>
 *   <li>{@code Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; sandbox}
 *       sandboxes the document and disallows any scripts if the file is opened directly</li>
 *   <li>{@code X-Frame-Options: DENY} prevents embedding in malicious iframes</li>
 * </ul>
 */
public class UploadSecurityFilter extends OncePerRequestFilter {

    private static final String UPLOADS_PATH_PREFIX = "/uploads/";

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String path = request.getRequestURI();
        if (path != null && path.startsWith(UPLOADS_PATH_PREFIX)) {
            response.setHeader("X-Content-Type-Options", "nosniff");
            response.setHeader("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'; sandbox");
            response.setHeader("X-Frame-Options", "DENY");
        }

        filterChain.doFilter(request, response);
    }
}
