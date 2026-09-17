package com.koupreng.backend.subscription.infrastructure.payment;

import com.koupreng.backend.payment.infrastructure.config.PaymentProperties;
import com.koupreng.backend.shared.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Locale;
import java.util.Set;

@Component
public class SubscriptionPaymentPlanResolver {

    private static final Set<String> SUPPORTED_CODES = Set.of("BASIC", "PRO", "PREMIUM");

    private final PaymentProperties paymentProperties;

    public SubscriptionPaymentPlanResolver(PaymentProperties paymentProperties) {
        this.paymentProperties = paymentProperties;
    }

    public boolean supports(String packageCode) {
        return packageCode != null && SUPPORTED_CODES.contains(packageCode.trim().toUpperCase(Locale.ROOT));
    }

    public SubscriptionPaymentPlan resolve(String packageCode) {
        String normalizedCode = packageCode == null ? "" : packageCode.trim().toUpperCase(Locale.ROOT);
        PaymentProperties.Aba.Subscription links = paymentProperties.getAba().getSubscription();
        return switch (normalizedCode) {
            case "BASIC" -> new SubscriptionPaymentPlan(
                    "BASIC", new BigDecimal("0.01"), "USD", links.getBasicLink());
            case "PRO" -> new SubscriptionPaymentPlan(
                    "PRO", new BigDecimal("199.00"), "USD", links.getProLink());
            case "PREMIUM" -> new SubscriptionPaymentPlan(
                    "PREMIUM", new BigDecimal("499.00"), "USD", links.getPremiumLink());
            default -> throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "SUBSCRIPTION_PACKAGE_NOT_PURCHASABLE",
                    "Package is not available for subscription checkout"
            );
        };
    }

    public record SubscriptionPaymentPlan(
            String packageCode,
            BigDecimal amount,
            String currency,
            String paymentUrl
    ) {
    }
}
