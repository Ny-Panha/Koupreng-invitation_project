package com.koupreng.backend.reporting.domain;

import com.koupreng.backend.payment.domain.PaymentStatus;
import com.koupreng.backend.payment.domain.TemplateOrder;
import com.koupreng.backend.payment.domain.TemplatePaymentOrder;
import java.math.BigDecimal;
import java.util.Collection;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;

/** Currency ledgers without an invented exchange rate. */
public record RevenueTotals(Map<String, BigDecimal> byCurrency) {
    public interface AmountInCurrency {
        String getCurrency();
        BigDecimal getTotal();
    }
    public RevenueTotals {
        byCurrency = Collections.unmodifiableMap(new LinkedHashMap<>(byCurrency));
    }

    public static RevenueTotals fromPayments(Collection<TemplatePaymentOrder> payments, Collection<TemplateOrder> legacy) {
        Map<String, BigDecimal> totals = new LinkedHashMap<>();
        for (TemplatePaymentOrder payment : payments) {
            if (payment.getStatus() == PaymentStatus.PAID) {
                add(totals, payment.getCurrency(), payment.getPaidAmount() == null ? payment.getAmount() : payment.getPaidAmount());
            }
        }
        for (TemplateOrder payment : legacy) {
            if (payment.getStatus() == PaymentStatus.PAID) {
                add(totals, payment.getCurrency(), payment.getPaidAmount() == null ? payment.getAmount() : payment.getPaidAmount());
            }
        }
        return new RevenueTotals(totals);
    }

    public static RevenueTotals fromAmounts(Collection<? extends AmountInCurrency> amounts) {
        Map<String, BigDecimal> totals = new LinkedHashMap<>();
        amounts.forEach(amount -> add(totals, amount.getCurrency(), amount.getTotal()));
        return new RevenueTotals(totals);
    }

    public Map<String, Object> summaryFields() {
        Map<String, Object> fields = new LinkedHashMap<>();
        fields.put("totalRevenue", total()); fields.put("revenueByCurrency", byCurrency());
        fields.put("revenueComparable", comparable()); fields.put("currency", currency());
        return fields;
    }

    public boolean comparable() { return byCurrency.size() <= 1; }
    public BigDecimal total() { return comparable() ? byCurrency.values().stream().reduce(BigDecimal.ZERO, BigDecimal::add) : null; }
    public String currency() { return comparable() ? byCurrency.keySet().stream().findFirst().orElse("USD") : null; }

    public static void add(Map<String, BigDecimal> totals, String currency, BigDecimal amount) {
        if (amount != null) {
            String normalized = currency == null || currency.isBlank() ? "USD" : currency.trim().toUpperCase(Locale.ROOT);
            totals.merge(normalized, amount, BigDecimal::add);
        }
    }
}
