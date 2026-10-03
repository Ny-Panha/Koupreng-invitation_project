package com.koupreng.backend.payment.application;

import com.koupreng.backend.template.domain.InvitationTemplate;
import java.math.BigDecimal;

/** The existing authorized static offer is independent of editable catalog display pricing. */
public final class TemplateCheckoutPolicy {
    public static final String CURRENCY = "USD";
    public static final BigDecimal AMOUNT = new BigDecimal("0.01");
    private static final String EXISTING_OFFER_CODE = "garden-royal-khmer-wedding";

    private TemplateCheckoutPolicy() { }

    public static Offer offer(InvitationTemplate template) {
        boolean eligible = template != null && "ACTIVE".equalsIgnoreCase(template.getStatus())
                && EXISTING_OFFER_CODE.equalsIgnoreCase(template.getCode());
        return eligible ? new Offer(true, AMOUNT, CURRENCY, "LEGACY_STATIC_OFFER")
                : new Offer(false, null, null, "PRODUCT_POLICY_REVIEW_REQUIRED");
    }

    public record Offer(boolean eligible, BigDecimal amount, String currency, String policy) { }
}
