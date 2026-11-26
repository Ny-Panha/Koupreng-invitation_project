package com.koupreng.backend.subscription.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.math.BigDecimal;
import java.time.Instant;
import org.junit.jupiter.api.Test;

class PayWaySubscriptionAlertTests {
    private static final String RECEIPT = "$0.01 paid by DEMO PAYER (*741) on Nov 26, 01:07 PM via ABA PAY at "
            + "DEMO MERCHANT. Trx. ID: 990000000001, APV: 123456.";
    private static final Instant POSTED_AT = Instant.parse("2026-11-26T06:07:24Z");

    @Test
    void decodesReceiptWithLocalBankMinuteAndNumericIdentifiers() {
        var alert = PayWaySubscriptionAlert.parse(RECEIPT, POSTED_AT, POSTED_AT.plusSeconds(2)).orElseThrow();
        assertEquals(new BigDecimal("0.01"), alert.amount());
        assertEquals("USD", alert.currency());
        assertEquals("DEMO PAYER", alert.payer());
        assertEquals("741", alert.suffix());
        assertEquals("DEMO MERCHANT", alert.merchant());
        assertEquals("990000000001", alert.transactionId());
        assertEquals("123456", alert.approvalCode());
        assertEquals(Instant.parse("2026-11-26T06:07:00Z"), alert.bankMinute());
    }

    @Test
    void rejectsMalformedUnsuccessfulAndStaleReceipts() {
        assertTrue(PayWaySubscriptionAlert.parse("Refund: " + RECEIPT, POSTED_AT, POSTED_AT).isEmpty());
        assertTrue(PayWaySubscriptionAlert.parse(RECEIPT.replace("Nov 26", "Nov 31"), POSTED_AT, POSTED_AT).isEmpty());
        assertTrue(PayWaySubscriptionAlert.parse(RECEIPT, POSTED_AT.plusSeconds(301), POSTED_AT.plusSeconds(301)).isEmpty());
        assertTrue(PayWaySubscriptionAlert.parse(RECEIPT, POSTED_AT, POSTED_AT.plusSeconds(301)).isEmpty());
        assertTrue(PayWaySubscriptionAlert.parse(RECEIPT, POSTED_AT, POSTED_AT.minusSeconds(1)).isEmpty());
    }

    @Test
    void resolvesYearFromCambodiaTimeAcrossNewYear() {
        Instant afterMidnight = Instant.parse("2026-12-31T17:00:04Z");
        String receipt = RECEIPT.replace("Nov 26, 01:07 PM", "Dec 31, 11:59 PM");
        var alert = PayWaySubscriptionAlert.parse(receipt, afterMidnight, afterMidnight).orElseThrow();
        assertEquals(Instant.parse("2026-12-31T16:59:00Z"), alert.bankMinute());
    }
}
