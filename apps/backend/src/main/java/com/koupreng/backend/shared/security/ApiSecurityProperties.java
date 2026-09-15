package com.koupreng.backend.shared.security;

import java.util.LinkedHashSet;
import java.util.Set;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "app.security")
public class ApiSecurityProperties {

    @Valid
    private final Cors cors = new Cors();

    @Valid
    private final Https https = new Https();

    @Valid
    private final ApiLogging logging = new ApiLogging();

    @Valid
    private final Upload upload = new Upload();

    @Valid
    private final ClientAddress clientAddress = new ClientAddress();

    public Cors getCors() {
        return cors;
    }

    public Https getHttps() {
        return https;
    }

    public ApiLogging getLogging() {
        return logging;
    }

    public Upload getUpload() {
        return upload;
    }

    public ClientAddress getClientAddress() {
        return clientAddress;
    }

    public static class Cors {

        private boolean enabled = true;

        @NotEmpty
        private Set<String> allowedOrigins = new LinkedHashSet<>(Set.of("http://localhost:5173"));

        @NotEmpty
        private Set<String> allowedMethods = new LinkedHashSet<>(Set.of(
                "GET",
                "POST",
                "PATCH",
                "PUT",
                "DELETE",
                "OPTIONS"
        ));

        @NotEmpty
        private Set<String> allowedHeaders = new LinkedHashSet<>(Set.of(
                "Authorization",
                "Content-Type",
                "X-Requested-With",
                "X-Request-Id"
        ));

        private Set<String> exposedHeaders = new LinkedHashSet<>(Set.of("X-Request-Id"));

        private boolean allowCredentials;

        @Min(0)
        private long maxAgeSeconds = 1800;

        public boolean isEnabled() {
            return enabled;
        }

        public void setEnabled(boolean enabled) {
            this.enabled = enabled;
        }

        public Set<String> getAllowedOrigins() {
            return allowedOrigins;
        }

        public void setAllowedOrigins(Set<String> allowedOrigins) {
            this.allowedOrigins = normalizeValues(allowedOrigins, false);
        }

        public Set<String> getAllowedMethods() {
            return allowedMethods;
        }

        public void setAllowedMethods(Set<String> allowedMethods) {
            this.allowedMethods = normalizeValues(allowedMethods, true);
        }

        public Set<String> getAllowedHeaders() {
            return allowedHeaders;
        }

        public void setAllowedHeaders(Set<String> allowedHeaders) {
            this.allowedHeaders = normalizeValues(allowedHeaders, false);
        }

        public Set<String> getExposedHeaders() {
            return exposedHeaders;
        }

        public void setExposedHeaders(Set<String> exposedHeaders) {
            this.exposedHeaders = normalizeValues(exposedHeaders, false);
        }

        public boolean isAllowCredentials() {
            return allowCredentials;
        }

        public void setAllowCredentials(boolean allowCredentials) {
            this.allowCredentials = allowCredentials;
        }

        public long getMaxAgeSeconds() {
            return maxAgeSeconds;
        }

        public void setMaxAgeSeconds(long maxAgeSeconds) {
            this.maxAgeSeconds = maxAgeSeconds;
        }
    }

    public static class Https {

        private boolean required;
        private boolean hstsEnabled = true;

        @Min(0)
        private long hstsMaxAgeSeconds = 31_536_000;

        public boolean isRequired() {
            return required;
        }

        public void setRequired(boolean required) {
            this.required = required;
        }

        public boolean isHstsEnabled() {
            return hstsEnabled;
        }

        public void setHstsEnabled(boolean hstsEnabled) {
            this.hstsEnabled = hstsEnabled;
        }

        public long getHstsMaxAgeSeconds() {
            return hstsMaxAgeSeconds;
        }

        public void setHstsMaxAgeSeconds(long hstsMaxAgeSeconds) {
            this.hstsMaxAgeSeconds = hstsMaxAgeSeconds;
        }
    }

    public static class ApiLogging {

        private boolean enabled = true;
        private boolean includeQueryString;
        private boolean includeHealthChecks;

        public boolean isEnabled() {
            return enabled;
        }

        public void setEnabled(boolean enabled) {
            this.enabled = enabled;
        }

        public boolean isIncludeQueryString() {
            return includeQueryString;
        }

        public void setIncludeQueryString(boolean includeQueryString) {
            this.includeQueryString = includeQueryString;
        }

        public boolean isIncludeHealthChecks() {
            return includeHealthChecks;
        }

        public void setIncludeHealthChecks(boolean includeHealthChecks) {
            this.includeHealthChecks = includeHealthChecks;
        }
    }

    public static class Upload {

        private boolean enabled = true;

        @Min(1)
        private long maxFileSizeBytes = 50L * 1024 * 1024;

        @Min(1)
        private int maxFiles = 5;

        @NotEmpty
        private Set<String> allowedContentTypes = new LinkedHashSet<>(Set.of(
                "image/jpeg",
                "image/png",
                "image/webp",
                "application/pdf",
                "video/mp4",
                "video/webm",
                "audio/mpeg",
                "audio/mp3",
                "audio/wav",
                "audio/ogg",
                "text/csv",
                "application/csv",
                "application/vnd.ms-excel",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "application/octet-stream"
        ));

        @NotEmpty
        private Set<String> allowedExtensions = new LinkedHashSet<>(Set.of(
                ".jpg",
                ".jpeg",
                ".png",
                ".webp",
                ".pdf",
                ".mp4",
                ".webm",
                ".mp3",
                ".wav",
                ".ogg",
                ".csv",
                ".xlsx"
        ));

        private boolean verifySignatures = true;

        public boolean isEnabled() {
            return enabled;
        }

        public void setEnabled(boolean enabled) {
            this.enabled = enabled;
        }

        public long getMaxFileSizeBytes() {
            return maxFileSizeBytes;
        }

        public void setMaxFileSizeBytes(long maxFileSizeBytes) {
            this.maxFileSizeBytes = maxFileSizeBytes;
        }

        public int getMaxFiles() {
            return maxFiles;
        }

        public void setMaxFiles(int maxFiles) {
            this.maxFiles = maxFiles;
        }

        public Set<String> getAllowedContentTypes() {
            return allowedContentTypes;
        }

        public void setAllowedContentTypes(Set<String> allowedContentTypes) {
            this.allowedContentTypes = normalizeValues(allowedContentTypes, false);
        }

        public Set<String> getAllowedExtensions() {
            return allowedExtensions;
        }

        public void setAllowedExtensions(Set<String> allowedExtensions) {
            Set<String> normalized = new LinkedHashSet<>();
            for (String extension : normalizeValues(allowedExtensions, false)) {
                normalized.add(extension.startsWith(".") ? extension.toLowerCase() : "." + extension.toLowerCase());
            }
            this.allowedExtensions = normalized;
        }

        public boolean isVerifySignatures() {
            return verifySignatures;
        }

        public void setVerifySignatures(boolean verifySignatures) {
            this.verifySignatures = verifySignatures;
        }
    }

    public static class ClientAddress {

        private boolean forwardedHeadersEnabled;

        public boolean isForwardedHeadersEnabled() {
            return forwardedHeadersEnabled;
        }

        public void setForwardedHeadersEnabled(boolean forwardedHeadersEnabled) {
            this.forwardedHeadersEnabled = forwardedHeadersEnabled;
        }
    }

    private static Set<String> normalizeValues(Set<String> values, boolean uppercase) {
        Set<String> normalized = new LinkedHashSet<>();
        if (values == null) {
            return normalized;
        }

        for (String value : values) {
            if (value == null || value.isBlank()) {
                continue;
            }

            String trimmed = value.trim();
            normalized.add(uppercase ? trimmed.toUpperCase() : trimmed);
        }
        return normalized;
    }
}
