package com.koupreng.backend.service.payment;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.config.payment.AbaPayWayProperties;
import com.koupreng.backend.dto.payment.CreateTemplatePaymentRequest;
import com.koupreng.backend.entity.payment.TemplatePaymentOrder;
import com.koupreng.backend.user.domain.AppUser;
import com.koupreng.backend.enums.PaymentStatus;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URI;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.TreeMap;

@Service
public class AbaPayWayService {

    private static final DateTimeFormatter REQ_TIME_FORMAT = DateTimeFormatter.ofPattern("yyyyMMddHHmmss")
            .withZone(ZoneOffset.UTC);
    private static final TypeReference<Map<String, Object>> MAP_TYPE = new TypeReference<>() {
    };
    private static final List<String> PURCHASE_HASH_FIELDS = List.of(
            "req_time",
            "merchant_id",
            "tran_id",
            "amount",
            "items",
            "shipping",
            "ctid",
            "pwt",
            "firstname",
            "lastname",
            "email",
            "phone",
            "type",
            "payment_option",
            "return_url",
            "cancel_url",
            "continue_success_url",
            "return_deeplink",
            "currency",
            "custom_fields",
            "return_params"
    );
    private final AbaPayWayProperties properties;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public AbaPayWayService(AbaPayWayProperties properties, ObjectMapper objectMapper) {
        this.properties = properties;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(15))
                .build();
    }

    public AbaPayWayCheckout createCheckout(
            TemplatePaymentOrder order,
            CreateTemplatePaymentRequest request,
            AppUser user
    ) {
        requireConfiguredForPurchase();

        Map<String, String> fields = new LinkedHashMap<>();
        fields.put("req_time", requestTime());
        fields.put("merchant_id", properties.getMerchantId());
        fields.put("tran_id", order.getTransactionId());

        BuyerName buyerName = buyerName(request.getBuyerName(), user);
        fields.put("firstname", buyerName.firstname());
        fields.put("lastname", buyerName.lastname());
        fields.put("email", buyerEmail(request.getBuyerEmail(), user));
        fields.put("phone", buyerPhone(request.getBuyerPhone(), user));
        fields.put("type", "purchase");
        fields.put("payment_option", properties.getPaymentOption());
        fields.put("items", encodedItems(order));
        fields.put("shipping", "0.00");
        fields.put("amount", amountForPayWay(order.getAmount(), order.getCurrency()));
        fields.put("currency", order.getCurrency());
        fields.put("return_url", base64(properties.getCallbackUrl()));
        fields.put("cancel_url", appendOrderCode(properties.getCancelUrl(), order.getOrderCode()));
        fields.put("continue_success_url", appendOrderCode(properties.getContinueSuccessUrl(), order.getOrderCode()));
        fields.put("return_params", order.getOrderCode());
        fields.put("hash", generatePurchaseHash(fields));

        String requestJson = toJson(redactedAuditPayload(fields));
        String responseBody = callPurchaseApi(fields);
        Map<String, Object> responsePayload = parseJsonObject(responseBody);
        String qrString = firstText(
                responsePayload.get("qrString"),
                responsePayload.get("qr_string"),
                nested(responsePayload, "data", "qrString"),
                nested(responsePayload, "data", "qr_string")
        );
        String deeplink = firstText(
                responsePayload.get("abapay_deeplink"),
                responsePayload.get("abapayDeepLink"),
                responsePayload.get("deeplink"),
                nested(responsePayload, "data", "abapay_deeplink"),
                nested(responsePayload, "data", "deeplink")
        );
        if (qrString == null) {
            qrString = qrStringFromDeeplink(deeplink);
        }
        String qrImageUrl = normalizeQrImage(firstText(
                responsePayload.get("qr_image"),
                responsePayload.get("qrImage"),
                responsePayload.get("qr_image_url"),
                responsePayload.get("qrImageUrl"),
                nested(responsePayload, "data", "qr_image"),
                nested(responsePayload, "data", "qrImage")
        ));
        String checkoutUrl = firstText(
                deeplink,
                responsePayload.get("checkout_url"),
                responsePayload.get("checkoutUrl"),
                responsePayload.get("payment_url"),
                responsePayload.get("paymentUrl")
        );

        if (qrString == null && qrImageUrl == null && checkoutUrl == null) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "QR generation failed");
        }

        return new AbaPayWayCheckout(
                checkoutUrl,
                qrString,
                qrImageUrl,
                deeplink,
                requestJson,
                responseBody,
                Collections.unmodifiableMap(fields)
        );
    }

    public boolean verifyCallbackSignature(Map<String, Object> payload, String receivedSignature) {
        String signature = firstText(
                receivedSignature,
                payload == null ? null : payload.get("hash"),
                payload == null ? null : payload.get("signature"),
                payload == null ? null : payload.get("hmac")
        );
        if (payload == null || signature == null) {
            return false;
        }
        requirePublicKey();
        // Must match the callback signing contract configured by ABA PayWay for the merchant.
        String expected = hmacSha512Base64(callbackCanonicalString(payload), properties.getPublicKey());
        return MessageDigest.isEqual(
                expected.getBytes(StandardCharsets.UTF_8),
                signature.trim().getBytes(StandardCharsets.UTF_8)
        );
    }

    public PayWayTransactionVerification checkTransaction(String transactionId) {
        requireConfiguredForPurchase();

        Map<String, String> fields = new LinkedHashMap<>();
        fields.put("req_time", requestTime());
        fields.put("merchant_id", properties.getMerchantId());
        fields.put("tran_id", transactionId);
        fields.put("hash", hmacSha512Base64(
                fields.get("req_time") + properties.getMerchantId() + transactionId,
                properties.getPublicKey()
        ));

        String boundary = "----KouprengPayWay" + System.currentTimeMillis();
        HttpRequest request = HttpRequest.newBuilder(URI.create(properties.getCheckTransactionUrl()))
                .timeout(Duration.ofSeconds(30))
                .header("Accept", "application/json")
                .header("Content-Type", "multipart/form-data; boundary=" + boundary)
                .POST(HttpRequest.BodyPublishers.ofByteArray(multipartBody(fields, boundary)))
                .build();

        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new ApiException(HttpStatus.BAD_GATEWAY, "ABA PayWay verification failed");
            }
            Map<String, Object> payload = objectMapper.readValue(response.body(), MAP_TYPE);
            return verificationFromResponse(transactionId, payload, response.body());
        } catch (IOException | InterruptedException exception) {
            if (exception instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            throw new ApiException(HttpStatus.BAD_GATEWAY, "ABA PayWay verification failed");
        }
    }

    public String toJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException exception) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not serialize PayWay payload");
        }
    }

    public String requestTime() {
        return REQ_TIME_FORMAT.format(Instant.now());
    }

    private PayWayTransactionVerification verificationFromResponse(
            String requestedTransactionId,
            Map<String, Object> payload,
            String rawResponseJson
    ) {
        Map<String, Object> data = asMap(payload.get("data"));
        Map<String, Object> status = asMap(payload.get("status"));

        Object codeValue = firstNonNull(data.get("payment_status_code"), payload.get("status"));
        String paywayStatus = firstText(
                data.get("payment_status"),
                payload.get("description"),
                status.get("message"),
                codeValue
        );
        Integer statusCode = integerValue(codeValue);
        boolean approved = statusCode != null && statusCode == 0
                || "APPROVED".equalsIgnoreCase(paywayStatus)
                || "approved".equalsIgnoreCase(paywayStatus);

        PaymentStatus mappedStatus = mapPayWayStatus(statusCode, paywayStatus);
        BigDecimal amount = decimalValue(firstNonNull(
                data.get("payment_amount"),
                data.get("total_amount"),
                payload.get("amount"),
                payload.get("totalAmount")
        ));
        String currency = firstText(
                data.get("payment_currency"),
                data.get("original_currency"),
                payload.get("original_currency")
        );
        String paywayTransactionId = firstText(
                data.get("transaction_id"),
                status.get("tran_id"),
                payload.get("tran_id"),
                requestedTransactionId
        );

        return new PayWayTransactionVerification(
                approved,
                mappedStatus,
                amount,
                currency,
                paywayStatus,
                paywayTransactionId,
                rawResponseJson
        );
    }

    private PaymentStatus mapPayWayStatus(Integer statusCode, String paywayStatus) {
        if (statusCode != null) {
            return switch (statusCode) {
                case 0 -> PaymentStatus.PAID;
                case 1, 2 -> PaymentStatus.QR_CREATED;
                case 3 -> PaymentStatus.FAILED;
                case 4 -> PaymentStatus.CANCELLED;
                default -> PaymentStatus.REJECTED;
            };
        }
        if ("APPROVED".equalsIgnoreCase(paywayStatus) || "approved".equalsIgnoreCase(paywayStatus)) {
            return PaymentStatus.PAID;
        }
        if ("DECLINED".equalsIgnoreCase(paywayStatus) || "failed".equalsIgnoreCase(paywayStatus)) {
            return PaymentStatus.FAILED;
        }
        return PaymentStatus.REJECTED;
    }

    /**
     * Must match ABA PayWay purchase hash documentation exactly:
     * HMAC-SHA512 over the documented ordered field values, base64 encoded.
     */
    public String generatePurchaseHash(Map<String, String> fields) {
        StringBuilder builder = new StringBuilder();
        for (String field : PURCHASE_HASH_FIELDS) {
            builder.append(fields.getOrDefault(field, ""));
        }
        return hmacSha512Base64(builder.toString(), properties.getPublicKey());
    }

    public boolean verifyCallbackHash(Map<String, Object> payload, String receivedSignature) {
        return verifyCallbackSignature(payload, receivedSignature);
    }

    private String hmacSha512Base64(String message, String key) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512"));
            return Base64.getEncoder().encodeToString(mac.doFinal(message.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException | InvalidKeyException exception) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not sign ABA PayWay request");
        }
    }

    private String callbackCanonicalString(Map<String, Object> payload) {
        TreeMap<String, Object> sorted = new TreeMap<>();
        payload.forEach((key, value) -> {
            if (key != null && !isSignatureField(key)) {
                sorted.put(key, value);
            }
        });

        StringBuilder builder = new StringBuilder();
        sorted.values().forEach(value -> builder.append(callbackValue(value)));
        return builder.toString();
    }

    private String callbackValue(Object value) {
        if (value == null) {
            return "";
        }
        if (value instanceof Map<?, ?> || value instanceof List<?>) {
            return toJson(value);
        }
        return String.valueOf(value);
    }

    private boolean isSignatureField(String key) {
        String normalized = key.toLowerCase(Locale.ROOT);
        return "hash".equals(normalized)
                || "signature".equals(normalized)
                || "hmac".equals(normalized);
    }

    private String encodedItems(TemplatePaymentOrder order) {
        List<Map<String, Object>> items = new ArrayList<>();
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("name", order.getTemplateName() + " - " + order.getPackageName());
        item.put("quantity", 1);
        item.put("price", amountForPayWay(order.getAmount(), order.getCurrency()));
        items.add(item);
        return base64(toJson(items));
    }

    private Map<String, Object> redactedAuditPayload(Map<String, String> fields) {
        Map<String, Object> audit = new LinkedHashMap<>(fields);
        audit.put("sandbox", properties.isSandbox());
        audit.put("payway_api_url", properties.getApiUrl());
        return audit;
    }

    private String callPurchaseApi(Map<String, String> fields) {
        String boundary = "----KouprengPayWay" + System.currentTimeMillis();
        HttpRequest request = HttpRequest.newBuilder(URI.create(properties.getApiUrl()))
                .timeout(Duration.ofSeconds(30))
                .header("Accept", "application/json")
                .header("Content-Type", "multipart/form-data; boundary=" + boundary)
                .header("Referer", referer())
                .POST(HttpRequest.BodyPublishers.ofByteArray(multipartBody(fields, boundary)))
                .build();

        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new ApiException(HttpStatus.BAD_GATEWAY, "ABA PayWay request failed");
            }
            return response.body();
        } catch (IOException | InterruptedException exception) {
            if (exception instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            throw new ApiException(HttpStatus.BAD_GATEWAY, "ABA PayWay request failed");
        }
    }

    private byte[] multipartBody(Map<String, String> fields, String boundary) {
        StringBuilder body = new StringBuilder();
        fields.forEach((name, value) -> body
                .append("--").append(boundary).append("\r\n")
                .append("Content-Disposition: form-data; name=\"").append(name).append("\"\r\n\r\n")
                .append(value == null ? "" : value)
                .append("\r\n"));
        body.append("--").append(boundary).append("--\r\n");
        return body.toString().getBytes(StandardCharsets.UTF_8);
    }

    private Map<String, Object> parseJsonObject(String responseBody) {
        try {
            return objectMapper.readValue(responseBody, MAP_TYPE);
        } catch (JsonProcessingException exception) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "QR generation failed");
        }
    }

    private String normalizeQrImage(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String trimmed = value.trim();
        if (trimmed.startsWith("data:image/")) {
            return trimmed;
        }
        if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
            return trimmed;
        }
        if (trimmed.length() > 100 && !trimmed.contains(" ")) {
            return "data:image/png;base64," + trimmed;
        }
        return trimmed;
    }

    private String qrStringFromDeeplink(String deeplink) {
        if (deeplink == null || deeplink.isBlank()) {
            return null;
        }
        int queryIndex = deeplink.indexOf('?');
        if (queryIndex < 0 || queryIndex == deeplink.length() - 1) {
            return null;
        }
        String[] pairs = deeplink.substring(queryIndex + 1).split("&");
        for (String pair : pairs) {
            String[] parts = pair.split("=", 2);
            if (parts.length == 2 && "qrcode".equalsIgnoreCase(parts[0])) {
                return URLDecoder.decode(parts[1], StandardCharsets.UTF_8);
            }
        }
        return null;
    }

    private Object nested(Map<String, Object> root, String objectKey, String valueKey) {
        Object value = root.get(objectKey);
        if (value instanceof Map<?, ?> nestedMap) {
            return nestedMap.get(valueKey);
        }
        return null;
    }

    private String referer() {
        String source = firstText(properties.getContinueSuccessUrl(), properties.getReturnUrl());
        if (source == null) {
            return "";
        }
        try {
            URI uri = URI.create(source);
            if (uri.getScheme() == null || uri.getHost() == null) {
                return source;
            }
            int port = uri.getPort();
            return uri.getScheme() + "://" + uri.getHost() + (port >= 0 ? ":" + port : "");
        } catch (IllegalArgumentException exception) {
            return source;
        }
    }

    private String amountForPayWay(BigDecimal amount, String currency) {
        if ("KHR".equalsIgnoreCase(currency)) {
            return amount.setScale(0, RoundingMode.UNNECESSARY).toPlainString();
        }
        return amount.setScale(2, RoundingMode.UNNECESSARY).toPlainString();
    }

    private String buyerEmail(String requestedEmail, AppUser user) {
        String value = firstText(requestedEmail, user == null ? null : user.getEmail());
        return value == null ? "" : trimTo(value, 50);
    }

    private String buyerPhone(String requestedPhone, AppUser user) {
        String value = firstText(requestedPhone, user == null ? null : user.getPhone());
        String digits = value == null ? "" : value.replaceAll("[^0-9]", "");
        if (digits.length() < 8) {
            return "012345678";
        }
        return trimTo(digits, 20);
    }

    private BuyerName buyerName(String requestedName, AppUser user) {
        String source = firstText(requestedName, user == null ? null : user.getFullName(), "PayWay Customer");
        String cleaned = source.replaceAll("[^\\p{L}\\p{N}\\s]", " ").replaceAll("\\s+", " ").trim();
        if (cleaned.isBlank()) {
            cleaned = "PayWay Customer";
        }
        String[] parts = cleaned.split("\\s+", 2);
        String firstname = trimTo(parts[0], 20);
        String lastname = parts.length > 1 ? trimTo(parts[1], 20) : "Customer";
        return new BuyerName(firstname, lastname);
    }

    private String appendOrderCode(String url, String orderCode) {
        if (url == null || url.isBlank()) {
            return "";
        }
        String separator = url.contains("?") ? "&" : "?";
        return url + separator + "orderCode=" + URLEncoder.encode(orderCode, StandardCharsets.UTF_8);
    }

    private String base64(String value) {
        return Base64.getEncoder().encodeToString(
                Objects.toString(value, "").getBytes(StandardCharsets.UTF_8)
        );
    }

    private void requireConfiguredForPurchase() {
        if (properties.getMerchantId().isBlank()
                || properties.getPublicKey().isBlank()
                || properties.getApiUrl().isBlank()) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "ABA PayWay dynamic API credentials are not configured");
        }
    }

    private void requirePublicKey() {
        if (properties.getPublicKey().isBlank()) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "ABA PayWay public key is not configured");
        }
    }

    private Map<String, Object> asMap(Object value) {
        if (value instanceof Map<?, ?> source) {
            Map<String, Object> map = new LinkedHashMap<>();
            source.forEach((key, mapValue) -> map.put(String.valueOf(key), mapValue));
            return map;
        }
        return Map.of();
    }

    private Object firstNonNull(Object... values) {
        for (Object value : values) {
            if (value != null) {
                return value;
            }
        }
        return null;
    }

    private String firstText(Object... values) {
        return java.util.Arrays.stream(values)
                .filter(Objects::nonNull)
                .map(String::valueOf)
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .findFirst()
                .orElse(null);
    }

    private BigDecimal decimalValue(Object value) {
        if (value == null) {
            return null;
        }
        try {
            return new BigDecimal(String.valueOf(value)).setScale(2, RoundingMode.HALF_UP);
        } catch (NumberFormatException exception) {
            return null;
        }
    }

    private Integer integerValue(Object value) {
        if (value instanceof Number number) {
            return number.intValue();
        }
        if (value == null) {
            return null;
        }
        try {
            return Integer.valueOf(value.toString().trim());
        } catch (NumberFormatException exception) {
            return null;
        }
    }

    private String trimTo(String value, int maxLength) {
        if (value == null) {
            return "";
        }
        String trimmed = value.trim();
        return trimmed.length() <= maxLength ? trimmed : trimmed.substring(0, maxLength);
    }

    private record BuyerName(String firstname, String lastname) {
    }
}
