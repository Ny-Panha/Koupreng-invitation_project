package com.koupreng.backend.payment.infrastructure.config;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "app.payment")
public class PaymentProperties {

    @NotBlank
    private String adminSecret = "change-me-local-only";

    @NotBlank
    private String providerMode = "static";

    private boolean autoConfirmTelegramDetected;

    @Min(1)
    private long orderExpiryMinutes = 30;

    private final Aba aba = new Aba();

    public String getAdminSecret() {
        return adminSecret;
    }

    public void setAdminSecret(String adminSecret) {
        this.adminSecret = adminSecret;
    }

    public String getProviderMode() {
        return providerMode;
    }

    public void setProviderMode(String providerMode) {
        this.providerMode = providerMode;
    }

    public boolean isAutoConfirmTelegramDetected() {
        return autoConfirmTelegramDetected;
    }

    public void setAutoConfirmTelegramDetected(boolean autoConfirmTelegramDetected) {
        this.autoConfirmTelegramDetected = autoConfirmTelegramDetected;
    }

    public long getOrderExpiryMinutes() {
        return orderExpiryMinutes;
    }

    public void setOrderExpiryMinutes(long orderExpiryMinutes) {
        this.orderExpiryMinutes = orderExpiryMinutes;
    }

    public Aba getAba() {
        return aba;
    }

    public static class Aba {

        @NotBlank
        private String staticLink = "https://pay.ababank.com/oRF8/vx2dp884";

        private final Subscription subscription = new Subscription();

        public String getStaticLink() {
            return staticLink;
        }

        public void setStaticLink(String staticLink) {
            this.staticLink = staticLink;
        }

        public Subscription getSubscription() {
            return subscription;
        }

        public static class Subscription {

            @NotBlank
            private String basicLink = "https://link.payway.com.kh/ABAPAYMu523385B";

            @NotBlank
            private String proLink = "https://link.payway.com.kh/ABAPAY9G523386h";

            @NotBlank
            private String premiumLink = "https://link.payway.com.kh/ABAPAYBo5233877";

            public String getBasicLink() {
                return basicLink;
            }

            public void setBasicLink(String basicLink) {
                this.basicLink = basicLink;
            }

            public String getProLink() {
                return proLink;
            }

            public void setProLink(String proLink) {
                this.proLink = proLink;
            }

            public String getPremiumLink() {
                return premiumLink;
            }

            public void setPremiumLink(String premiumLink) {
                this.premiumLink = premiumLink;
            }
        }
    }
}
