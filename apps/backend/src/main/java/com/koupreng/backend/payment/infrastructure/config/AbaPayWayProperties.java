package com.koupreng.backend.payment.infrastructure.config;

import org.springframework.beans.factory.InitializingBean;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.EnvironmentAware;
import org.springframework.core.env.Environment;

import java.util.Arrays;
import java.util.List;

@ConfigurationProperties(prefix = "app.payment.payway")
public class AbaPayWayProperties implements EnvironmentAware, InitializingBean {

    private Environment environment;

    private String merchantId = "";
    private String publicKey = "";
    private String rsaPublicKey = "";
    private String rsaPrivateKey = "";
    private String apiUrl = "";
    private String returnUrl = "";
    private String cancelUrl = "";
    private String continueSuccessUrl = "";
    private String callbackUrl = "";
    private boolean sandbox = false;
    private String paymentOption = "abapay_deeplink";
    private long orderExpiryMinutes = 15;

    @Override
    public void setEnvironment(Environment environment) {
        this.environment = environment;
    }

    @Override
    public void afterPropertiesSet() {
        if (!isProductionProfile() || isStaticProviderMode()) {
            return;
        }
        List<String> missing = new java.util.ArrayList<>();
        if (getMerchantId().isBlank()) {
            missing.add("ABA_PAYWAY_MERCHANT_ID");
        }
        if (getPublicKey().isBlank()) {
            missing.add("ABA_PAYWAY_PUBLIC_KEY");
        }
        if (getApiUrl().isBlank()) {
            missing.add("ABA_PAYWAY_API_URL");
        }
        if (getCallbackUrl().isBlank()) {
            missing.add("ABA_PAYWAY_CALLBACK_URL");
        }
        if (!missing.isEmpty()) {
            throw new IllegalStateException("Missing ABA PayWay configuration: " + String.join(", ", missing));
        }
    }

    private boolean isProductionProfile() {
        return environment != null
                && Arrays.stream(environment.getActiveProfiles())
                        .anyMatch(profile -> "prod".equalsIgnoreCase(profile)
                                || "production".equalsIgnoreCase(profile));
    }

    private boolean isStaticProviderMode() {
        if (environment == null) {
            return true;
        }
        return "static".equalsIgnoreCase(trim(environment.getProperty("app.payment.provider-mode", "static")));
    }

    public String getMerchantId() {
        return trim(merchantId);
    }

    public void setMerchantId(String merchantId) {
        this.merchantId = merchantId;
    }

    public String getPublicKey() {
        return normalizeKey(publicKey);
    }

    public void setPublicKey(String publicKey) {
        this.publicKey = publicKey;
    }

    public String getRsaPublicKey() {
        return normalizeKey(rsaPublicKey);
    }

    public void setRsaPublicKey(String rsaPublicKey) {
        this.rsaPublicKey = rsaPublicKey;
    }

    public String getRsaPrivateKey() {
        return normalizeKey(rsaPrivateKey);
    }

    public void setRsaPrivateKey(String rsaPrivateKey) {
        this.rsaPrivateKey = rsaPrivateKey;
    }

    public String getApiUrl() {
        return trim(apiUrl);
    }

    public void setApiUrl(String apiUrl) {
        this.apiUrl = apiUrl;
    }

    public String getReturnUrl() {
        return trim(returnUrl);
    }

    public void setReturnUrl(String returnUrl) {
        this.returnUrl = returnUrl;
    }

    public String getCancelUrl() {
        return trim(cancelUrl);
    }

    public void setCancelUrl(String cancelUrl) {
        this.cancelUrl = cancelUrl;
    }

    public String getContinueSuccessUrl() {
        return trim(continueSuccessUrl);
    }

    public void setContinueSuccessUrl(String continueSuccessUrl) {
        this.continueSuccessUrl = continueSuccessUrl;
    }

    public String getCallbackUrl() {
        return trim(callbackUrl);
    }

    public void setCallbackUrl(String callbackUrl) {
        this.callbackUrl = callbackUrl;
    }

    public boolean isSandbox() {
        return sandbox;
    }

    public void setSandbox(boolean sandbox) {
        this.sandbox = sandbox;
    }

    public String getPaymentOption() {
        return trim(paymentOption).isBlank() ? "abapay_deeplink" : trim(paymentOption);
    }

    public void setPaymentOption(String paymentOption) {
        this.paymentOption = paymentOption;
    }

    public long getOrderExpiryMinutes() {
        return orderExpiryMinutes;
    }

    public void setOrderExpiryMinutes(long orderExpiryMinutes) {
        this.orderExpiryMinutes = orderExpiryMinutes;
    }

    public String getCheckTransactionUrl() {
        String url = getApiUrl();
        if (url.endsWith("/purchase")) {
            return url.substring(0, url.length() - "/purchase".length()) + "/check-transaction";
        }
        return url.replace("/payments/purchase", "/payments/check-transaction");
    }

    private String normalizeKey(String value) {
        return trim(value).replace("\\n", "\n");
    }

    private String trim(String value) {
        if (value == null) {
            return "";
        }
        String trimmed = value.trim();
        if (trimmed.length() >= 2
                && ((trimmed.startsWith("\"") && trimmed.endsWith("\""))
                        || (trimmed.startsWith("'") && trimmed.endsWith("'")))) {
            return trimmed.substring(1, trimmed.length() - 1).trim();
        }
        return trimmed;
    }
}
