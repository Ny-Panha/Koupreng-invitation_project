package com.koupreng.backend.payment.application;

import static org.assertj.core.api.Assertions.assertThat;
import com.koupreng.backend.template.api.dto.PublicTemplateResponse;
import com.koupreng.backend.template.domain.InvitationTemplate;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;

class TemplateCheckoutPolicyTests {
    @Test void existingAuthorizedOfferHasServerOwnedPriceIndependentOfCatalogEdits() {
        var template = new InvitationTemplate(); template.setCode("garden-royal-khmer-wedding"); template.setStatus("ACTIVE");
        template.setPrice(new BigDecimal("100.00")); template.setCurrency("KHR");
        var response = PublicTemplateResponse.from(template);
        assertThat(response.isCheckoutEligible()).isTrue();
        assertThat(response.getCheckoutAmount()).isEqualByComparingTo("0.01");
        assertThat(response.getCheckoutCurrency()).isEqualTo("USD");
        assertThat(response.getPrice()).isEqualByComparingTo("100.00");
        assertThat(response.getCurrency()).isEqualTo("KHR");
        template.setStatus("INACTIVE"); assertThat(TemplateCheckoutPolicy.offer(template).eligible()).isFalse();
    }

    @Test void newActivePremiumEntryCannotInventStaticBankOffer() {
        var template = new InvitationTemplate(); template.setCode("new-premium"); template.setStatus("ACTIVE");
        template.setPremium(true); template.setPrice(new BigDecimal("25.00"));
        var response = PublicTemplateResponse.from(template);
        assertThat(response.isCheckoutEligible()).isFalse();
        assertThat(response.getCheckoutAmount()).isNull();
        assertThat(response.getCheckoutPolicy()).isEqualTo("PRODUCT_POLICY_REVIEW_REQUIRED");
    }
}
