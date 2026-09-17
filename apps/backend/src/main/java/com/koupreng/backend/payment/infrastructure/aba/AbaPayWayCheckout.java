package com.koupreng.backend.payment.infrastructure.aba;

import java.util.Map;

public final class AbaPayWayCheckout {

    private final String checkoutUrl;
    private final String qrString;
    private final String qrImageUrl;
    private final String abaPayDeeplink;
    private final String requestJson;
    private final String responseJson;
    private final Map<String, String> requestFields;

    public AbaPayWayCheckout(
            String checkoutUrl,
            String qrString,
            String qrImageUrl,
            String abaPayDeeplink,
            String requestJson,
            String responseJson,
            Map<String, String> requestFields
    ) {
        this.checkoutUrl = checkoutUrl;
        this.qrString = qrString;
        this.qrImageUrl = qrImageUrl;
        this.abaPayDeeplink = abaPayDeeplink;
        this.requestJson = requestJson;
        this.responseJson = responseJson;
        this.requestFields = Map.copyOf(requestFields);
    }

    public String checkoutUrl() {
        return checkoutUrl;
    }

    public String qrString() {
        return qrString;
    }

    public String qrImageUrl() {
        return qrImageUrl;
    }

    public String abaPayDeeplink() {
        return abaPayDeeplink;
    }

    public String requestJson() {
        return requestJson;
    }

    public String responseJson() {
        return responseJson;
    }

    public Map<String, String> requestFields() {
        return requestFields;
    }
}
