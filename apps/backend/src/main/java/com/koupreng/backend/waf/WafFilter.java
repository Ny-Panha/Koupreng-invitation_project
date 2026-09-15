package com.koupreng.backend.waf;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.Enumeration;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.security.ClientAddressResolver;
import com.koupreng.backend.service.RateLimitService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.UriUtils;

public class WafFilter extends OncePerRequestFilter {

    private static final Logger LOGGER = LoggerFactory.getLogger(WafFilter.class);

    private static final List<NamedPattern> ATTACK_PATTERNS = List.of(
            new NamedPattern("path-traversal", Pattern.compile("(?i)(?:\\.\\.[/\\\\]|[/\\\\]\\.\\.|%2e%2e|%252e%252e|%c0%ae|%c1%9c)")),
            new NamedPattern("null-byte", Pattern.compile("(?i)(?:%00|\\x00)")),
            new NamedPattern("sql-union-select", Pattern.compile("(?i)\\bunion\\b.{0,80}\\bselect\\b")),
            new NamedPattern("sql-boolean-tautology", Pattern.compile("(?i)(?:'|%27|\"|%22|`)\\s*(?:or|and)\\s+['\"]?[\\w.-]+['\"]?\\s*=\\s*['\"]?[\\w.-]+")),
            new NamedPattern("sql-time-delay", Pattern.compile("(?i)\\b(?:sleep|benchmark)\\s*\\(")),
            new NamedPattern("sql-stacked-statement", Pattern.compile("(?i);\\s*(?:drop|alter|truncate|delete|insert|update)\\b")),
            new NamedPattern("xss-script", Pattern.compile("(?i)(?:<\\s*/?\\s*script\\b|%3c\\s*/?\\s*script\\b)")),
            new NamedPattern("xss-event-handler", Pattern.compile("(?i)\\bon[a-z]{3,30}\\s*=")),
            new NamedPattern("xss-active-uri", Pattern.compile("(?i)\\b(?:javascript|data\\s*:\\s*text/html)\\s*:")),
            new NamedPattern("command-chain", Pattern.compile("(?i)(?:\\|\\||&&|;)\\s*(?:cmd(?:\\.exe)?|powershell|pwsh|bash|sh|curl|wget|nc|netcat)\\b")),
            new NamedPattern("log4shell", Pattern.compile("(?i)\\$\\{\\s*jndi\\s*:")),
            new NamedPattern("template-injection", Pattern.compile("(?i)(?:\\{\\{.{0,120}(?:config|request|self|class|constructor).{0,120}}}|\\$\\{.{0,120}(?:runtime|processbuilder|java).{0,120}})"))
    );

    private final WafProperties properties;
    private final RateLimitService rateLimitService;
    private final ClientAddressResolver clientAddressResolver;

    public WafFilter(
            WafProperties properties,
            RateLimitService rateLimitService,
            ClientAddressResolver clientAddressResolver
    ) {
        this.properties = properties;
        this.rateLimitService = rateLimitService;
        this.clientAddressResolver = clientAddressResolver;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        if (!properties.isEnabled()) {
            return true;
        }

        String path = applicationPath(request);
        return properties.getProtectedPathPrefixes().stream().noneMatch(prefix -> path.equals(prefix) || path.startsWith(prefix + "/"));
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        WafDecision decision = inspectRequestMetadata(request);
        if (decision.allowed()) {
            decision = checkRateLimit(request);
        }

        HttpServletRequest requestToContinue = request;
        if (decision.allowed() && shouldInspectBody(request)) {
            BodyReadResult bodyReadResult = readBody(request);
            if (bodyReadResult.tooLarge()) {
                decision = WafDecision.block(HttpStatus.CONTENT_TOO_LARGE, "body-too-large");
            } else {
                requestToContinue = new CachedBodyHttpServletRequest(request, bodyReadResult.body());
                decision = inspectValue("body", bodyReadResult.asText(request));
            }
        }

        if (!decision.allowed()) {
            logDecision(request, decision);
            if (!properties.isAuditOnly()) {
                writeBlockedResponse(response, decision);
                return;
            }
        }

        filterChain.doFilter(requestToContinue, response);
    }

    private WafDecision inspectRequestMetadata(HttpServletRequest request) {
        String method = request.getMethod() == null ? "" : request.getMethod().toUpperCase(Locale.ROOT);
        if (!properties.getAllowedMethods().contains(method)) {
            return WafDecision.block(HttpStatus.METHOD_NOT_ALLOWED, "method-not-allowed");
        }

        String requestUri = nullToEmpty(request.getRequestURI());
        if (requestUri.length() > properties.getMaxUriLength()) {
            return WafDecision.block(HttpStatus.URI_TOO_LONG, "uri-too-long");
        }

        String query = nullToEmpty(request.getQueryString());
        if (query.length() > properties.getMaxQueryLength()) {
            return WafDecision.block(HttpStatus.URI_TOO_LONG, "query-too-long");
        }

        WafDecision decision = inspectValue("target", requestUri + "?" + query);
        if (!decision.allowed()) {
            return decision;
        }

        decision = inspectHeaders(request);
        if (!decision.allowed()) {
            return decision;
        }

        long contentLength = request.getContentLengthLong();
        if (!isMultipartContent(request.getContentType()) && contentLength > properties.getMaxBodyBytes()) {
            return WafDecision.block(HttpStatus.CONTENT_TOO_LARGE, "body-too-large");
        }

        return WafDecision.allow();
    }

    private WafDecision inspectHeaders(HttpServletRequest request) {
        Enumeration<String> headerNames = request.getHeaderNames();
        if (headerNames == null) {
            return WafDecision.allow();
        }

        int count = 0;
        for (String headerName : Collections.list(headerNames)) {
            count++;
            if (count > properties.getMaxHeaderCount()) {
                return WafDecision.block(HttpStatus.REQUEST_HEADER_FIELDS_TOO_LARGE, "too-many-headers");
            }

            WafDecision decision = inspectValue("header-name", headerName);
            if (!decision.allowed()) {
                return decision;
            }

            Enumeration<String> headerValues = request.getHeaders(headerName);
            if (headerValues == null) {
                continue;
            }

            for (String headerValue : Collections.list(headerValues)) {
                if (headerValue != null && headerValue.length() > properties.getMaxHeaderValueLength()) {
                    return WafDecision.block(HttpStatus.REQUEST_HEADER_FIELDS_TOO_LARGE, "header-too-large");
                }

                if (headerValue != null && (headerValue.contains("\r") || headerValue.contains("\n"))) {
                    return WafDecision.block(HttpStatus.BAD_REQUEST, "header-crlf");
                }

                decision = inspectValue("header-value", headerValue);
                if (!decision.allowed()) {
                    return decision;
                }
            }
        }

        return WafDecision.allow();
    }

    private WafDecision inspectValue(String area, String value) {
        if (value == null || value.isBlank()) {
            return WafDecision.allow();
        }

        WafDecision decision = matchAttackPattern(area, value);
        if (!decision.allowed()) {
            return decision;
        }

        String decoded = decodeRepeatedly(value);
        if (!decoded.equals(value)) {
            return matchAttackPattern(area + "-decoded", decoded);
        }

        return WafDecision.allow();
    }

    private WafDecision matchAttackPattern(String area, String value) {
        for (NamedPattern attackPattern : ATTACK_PATTERNS) {
            if (attackPattern.pattern().matcher(value).find()) {
                return WafDecision.block(HttpStatus.FORBIDDEN, area + ":" + attackPattern.name());
            }
        }
        return WafDecision.allow();
    }

    private WafDecision checkRateLimit(HttpServletRequest request) {
        try {
            rateLimitService.check(
                    "waf:ip:" + clientAddress(request),
                    properties.getMaxRequestsPerMinute(),
                    properties.getRateLimitWindow()
            );
            return WafDecision.allow();
        } catch (ApiException exception) {
            return WafDecision.block(exception.getStatus(), "rate-limit");
        }
    }

    private boolean shouldInspectBody(HttpServletRequest request) {
        String method = request.getMethod();
        if (method == null || BodylessMethod.matches(method)) {
            return false;
        }

        long contentLength = request.getContentLengthLong();
        if (contentLength == 0) {
            return false;
        }

        return isTextLikeContent(request.getContentType());
    }

    private BodyReadResult readBody(HttpServletRequest request) throws IOException {
        int maxBytes = properties.getMaxBodyBytes();
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream(Math.min(maxBytes, 8192));
        byte[] buffer = new byte[4096];
        int total = 0;
        int read;
        while ((read = request.getInputStream().read(buffer)) != -1) {
            total += read;
            if (total > maxBytes) {
                return new BodyReadResult(new byte[0], true);
            }
            outputStream.write(buffer, 0, read);
        }

        return new BodyReadResult(outputStream.toByteArray(), false);
    }

    private String decodeRepeatedly(String value) {
        String decoded = value;
        for (int index = 0; index < 2; index++) {
            try {
                String next = UriUtils.decode(decoded, StandardCharsets.UTF_8);
                if (next.equals(decoded)) {
                    return decoded;
                }
                decoded = next;
            } catch (RuntimeException exception) {
                return decoded;
            }
        }
        return decoded;
    }

    private boolean isTextLikeContent(String contentType) {
        if (contentType == null || contentType.isBlank()) {
            return true;
        }

        try {
            MediaType mediaType = MediaType.parseMediaType(contentType);
            String type = mediaType.getType().toLowerCase(Locale.ROOT);
            String subtype = mediaType.getSubtype().toLowerCase(Locale.ROOT);
            return "text".equals(type)
                    || subtype.equals("json")
                    || subtype.endsWith("+json")
                    || subtype.equals("xml")
                    || subtype.endsWith("+xml")
                    || MediaType.APPLICATION_FORM_URLENCODED.includes(mediaType);
        } catch (RuntimeException exception) {
            return true;
        }
    }

    private boolean isMultipartContent(String contentType) {
        if (contentType == null || contentType.isBlank()) {
            return false;
        }
        try {
            MediaType mediaType = MediaType.parseMediaType(contentType);
            return "multipart".equalsIgnoreCase(mediaType.getType());
        } catch (RuntimeException exception) {
            return false;
        }
    }

    private void logDecision(HttpServletRequest request, WafDecision decision) {
        LOGGER.warn(
                "WAF {} request method={} path={} remote={} rule={}",
                properties.isAuditOnly() ? "observed" : "blocked",
                request.getMethod(),
                applicationPath(request),
                clientAddress(request),
                decision.reason()
        );
    }

    private void writeBlockedResponse(HttpServletResponse response, WafDecision decision) throws IOException {
        HttpStatus status = decision.status();
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.getWriter().write(
                "{\"status\":%d,\"error\":\"%s\",\"message\":\"Request blocked by application firewall\"}"
                        .formatted(status.value(), status.getReasonPhrase())
        );
    }

    private String applicationPath(HttpServletRequest request) {
        String uri = nullToEmpty(request.getRequestURI());
        String contextPath = nullToEmpty(request.getContextPath());
        if (!contextPath.isBlank() && uri.startsWith(contextPath)) {
            return uri.substring(contextPath.length());
        }
        return uri;
    }

    private String clientAddress(HttpServletRequest request) {
        return clientAddressResolver.resolve(request);
    }

    private String nullToEmpty(String value) {
        return value == null ? "" : value;
    }

    private record NamedPattern(String name, Pattern pattern) {
    }

    private record WafDecision(boolean allowed, HttpStatus status, String reason) {
        private static WafDecision allow() {
            return new WafDecision(true, HttpStatus.OK, "allow");
        }

        private static WafDecision block(HttpStatus status, String reason) {
            return new WafDecision(false, status, reason);
        }
    }

    private record BodyReadResult(byte[] bytes, boolean tooLarge) {
        private byte[] body() {
            return bytes == null ? new byte[0] : bytes;
        }

        private String asText(HttpServletRequest request) {
            byte[] bodyBytes = body();
            if (bodyBytes.length == 0) {
                return "";
            }
            return new String(bodyBytes, charset(request));
        }

        private Charset charset(HttpServletRequest request) {
            String contentType = request.getContentType();
            if (contentType == null || contentType.isBlank()) {
                return StandardCharsets.UTF_8;
            }

            try {
                MediaType mediaType = MediaType.parseMediaType(contentType);
                Charset charset = mediaType.getCharset();
                return charset == null ? StandardCharsets.UTF_8 : charset;
            } catch (RuntimeException exception) {
                return StandardCharsets.UTF_8;
            }
        }
    }

    private static class BodylessMethod {
        private static final List<String> METHODS = List.of("GET", "HEAD", "OPTIONS", "TRACE");

        private static boolean matches(String method) {
            return METHODS.contains(method.toUpperCase(Locale.ROOT));
        }
    }
}
