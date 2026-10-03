package com.koupreng.backend.budget.domain;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/** Currency-preserving arithmetic; no exchange rate or historical cap currency is inferred. */
public record BudgetTotals(
        Map<String, BigDecimal> estimatedByCurrency,
        Map<String, BigDecimal> actualByCurrency,
        Map<String, Map<String, BigDecimal>> estimatedByCurrencyAndCategory,
        Map<String, Map<String, BigDecimal>> actualByCurrencyAndCategory
) {
    public static BudgetTotals of(List<BudgetItem> items) {
        Map<String, BigDecimal> estimated = new LinkedHashMap<>();
        Map<String, BigDecimal> actual = new LinkedHashMap<>();
        Map<String, Map<String, BigDecimal>> estimatedCategories = new LinkedHashMap<>();
        Map<String, Map<String, BigDecimal>> actualCategories = new LinkedHashMap<>();
        for (BudgetItem item : items) {
            String currency = normalized(item.getCurrency(), "USD");
            String category = normalized(item.getCategory(), "OTHER");
            estimated.merge(currency, value(item.getEstimatedCost()), BigDecimal::add);
            actual.merge(currency, value(item.getActualCost()), BigDecimal::add);
            estimatedCategories.computeIfAbsent(currency, ignored -> new LinkedHashMap<>())
                    .merge(category, value(item.getEstimatedCost()), BigDecimal::add);
            actualCategories.computeIfAbsent(currency, ignored -> new LinkedHashMap<>())
                    .merge(category, value(item.getActualCost()), BigDecimal::add);
        }
        return new BudgetTotals(estimated, actual, estimatedCategories, actualCategories);
    }

    public boolean comparable() { return estimatedByCurrency.size() <= 1; }

    public String currency() {
        return !comparable() ? null : estimatedByCurrency.keySet().stream().findFirst().orElse("USD");
    }

    public BigDecimal estimated() {
        return comparable() ? estimatedByCurrency.values().stream().findFirst().orElse(BigDecimal.ZERO) : null;
    }

    public BigDecimal actual() {
        return comparable() ? actualByCurrency.values().stream().findFirst().orElse(BigDecimal.ZERO) : null;
    }

    public static BigDecimal value(BigDecimal amount) { return amount == null ? BigDecimal.ZERO : amount; }

    private static String normalized(String text, String fallback) {
        return text == null || text.isBlank() ? fallback : text.trim().toUpperCase(Locale.ROOT);
    }
}
