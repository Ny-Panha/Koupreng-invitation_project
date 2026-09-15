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
    private long orderExpiryMinutes = 60;

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
        private String staticLink = "https://link.payway.com.kh/ABAPAYrD450560q";

        public String getStaticLink() {
            return staticLink;
        }

        public void setStaticLink(String staticLink) {
            this.staticLink = staticLink;
        }
    }
}
