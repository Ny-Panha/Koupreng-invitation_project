package com.koupreng.backend.media.infrastructure.config;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "app.storage")
public class StorageProperties {

    private Provider provider = Provider.LOCAL;

    @Valid
    private final Local local = new Local();

    @Valid
    private final Cloudinary cloudinary = new Cloudinary();

    public Provider getProvider() {
        return provider;
    }

    public void setProvider(Provider provider) {
        this.provider = provider == null ? Provider.LOCAL : provider;
    }

    public Local getLocal() {
        return local;
    }

    public Cloudinary getCloudinary() {
        return cloudinary;
    }

    public enum Provider {
        LOCAL,
        CLOUDINARY
    }

    public static class Local {

        @NotBlank
        private String uploadDir = "uploads";

        @NotBlank
        private String publicBaseUrl = "/uploads";

        public String getUploadDir() {
            return uploadDir;
        }

        public void setUploadDir(String uploadDir) {
            this.uploadDir = uploadDir;
        }

        public String getPublicBaseUrl() {
            return publicBaseUrl;
        }

        public void setPublicBaseUrl(String publicBaseUrl) {
            this.publicBaseUrl = publicBaseUrl;
        }
    }

    public static class Cloudinary {

        private String cloudName = "";

        private String apiKey = "";

        private String apiSecret = "";

        @NotBlank
        private String folder = "koupreng";

        public String getCloudName() {
            return cloudName;
        }

        public void setCloudName(String cloudName) {
            this.cloudName = cloudName;
        }

        public String getApiKey() {
            return apiKey;
        }

        public void setApiKey(String apiKey) {
            this.apiKey = apiKey;
        }

        public String getApiSecret() {
            return apiSecret;
        }

        public void setApiSecret(String apiSecret) {
            this.apiSecret = apiSecret;
        }

        public String getFolder() {
            return folder;
        }

        public void setFolder(String folder) {
            this.folder = folder;
        }
    }
}
