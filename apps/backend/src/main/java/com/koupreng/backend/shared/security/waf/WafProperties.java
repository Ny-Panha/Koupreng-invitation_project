package com.koupreng.backend.shared.security.waf;

import java.time.Duration;
import java.util.LinkedHashSet;
import java.util.Set;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "app.waf")
public class WafProperties {

    private boolean enabled = true;
    private boolean auditOnly;

    @Min(256)
    private int maxUriLength = 2048;

    @Min(0)
    private int maxQueryLength = 2048;

    @Min(1024)
    private int maxBodyBytes = 65536;

    @Min(256)
    private int maxHeaderValueLength = 4096;

    @Min(1)
    private int maxHeaderCount = 80;

    @Min(1)
    private int maxRequestsPerMinute = 120;

    @NotEmpty
    private Set<String> protectedPathPrefixes = new LinkedHashSet<>(Set.of("/api"));

    @NotEmpty
    private Set<String> allowedMethods = new LinkedHashSet<>(Set.of(
            "GET",
            "POST",
            "PATCH",
            "PUT",
            "DELETE",
            "OPTIONS"
    ));

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public boolean isAuditOnly() {
        return auditOnly;
    }

    public void setAuditOnly(boolean auditOnly) {
        this.auditOnly = auditOnly;
    }

    public int getMaxUriLength() {
        return maxUriLength;
    }

    public void setMaxUriLength(int maxUriLength) {
        this.maxUriLength = maxUriLength;
    }

    public int getMaxQueryLength() {
        return maxQueryLength;
    }

    public void setMaxQueryLength(int maxQueryLength) {
        this.maxQueryLength = maxQueryLength;
    }

    public int getMaxBodyBytes() {
        return maxBodyBytes;
    }

    public void setMaxBodyBytes(int maxBodyBytes) {
        this.maxBodyBytes = maxBodyBytes;
    }

    public int getMaxHeaderValueLength() {
        return maxHeaderValueLength;
    }

    public void setMaxHeaderValueLength(int maxHeaderValueLength) {
        this.maxHeaderValueLength = maxHeaderValueLength;
    }

    public int getMaxHeaderCount() {
        return maxHeaderCount;
    }

    public void setMaxHeaderCount(int maxHeaderCount) {
        this.maxHeaderCount = maxHeaderCount;
    }

    public int getMaxRequestsPerMinute() {
        return maxRequestsPerMinute;
    }

    public void setMaxRequestsPerMinute(int maxRequestsPerMinute) {
        this.maxRequestsPerMinute = maxRequestsPerMinute;
    }

    public Duration getRateLimitWindow() {
        return Duration.ofMinutes(1);
    }

    public Set<String> getProtectedPathPrefixes() {
        return protectedPathPrefixes;
    }

    public void setProtectedPathPrefixes(Set<String> protectedPathPrefixes) {
        this.protectedPathPrefixes = normalizePathPrefixes(protectedPathPrefixes);
    }

    public Set<String> getAllowedMethods() {
        return allowedMethods;
    }

    public void setAllowedMethods(Set<String> allowedMethods) {
        Set<String> normalized = new LinkedHashSet<>();
        if (allowedMethods != null) {
            for (String method : allowedMethods) {
                if (method != null && !method.isBlank()) {
                    normalized.add(method.trim().toUpperCase());
                }
            }
        }
        this.allowedMethods = normalized;
    }

    private Set<String> normalizePathPrefixes(Set<String> values) {
        Set<String> normalized = new LinkedHashSet<>();
        if (values != null) {
            for (String value : values) {
                if (value == null || value.isBlank()) {
                    continue;
                }

                String prefix = value.trim();
                normalized.add(prefix.startsWith("/") ? prefix : "/" + prefix);
            }
        }
        return normalized;
    }
}
