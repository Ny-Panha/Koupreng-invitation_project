package com.koupreng.backend.subscription.application;

import java.math.BigDecimal;
import java.time.DateTimeException;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;
import java.time.format.ResolverStyle;
import java.util.Locale;
import java.util.Optional;
import java.util.regex.Pattern;

record PayWaySubscriptionAlert(BigDecimal amount, String currency, String payer, String suffix,
                               String merchant, String transactionId, String approvalCode, Instant bankMinute) {
    private static final ZoneId MERCHANT_ZONE = ZoneId.of("Asia/Phnom_Penh");
    private static final Duration ALERT_WINDOW = Duration.ofMinutes(5);
    private static final DateTimeFormatter BANK_TIME = new DateTimeFormatterBuilder().parseCaseInsensitive()
            .appendPattern("MMM d, h:mm a uuuu").toFormatter(Locale.ENGLISH).withResolverStyle(ResolverStyle.STRICT);
    private static final Pattern SUCCESS_ALERT = Pattern.compile("""
            \\A (?<currency>US\\$|\\$|USD|KHR) \\s* (?<amount>[0-9]{1,10}(?:\\.[0-9]{1,2})?)
            \\s+ paid\\s+by\\s+ (?<payer>[^()\\p{Cc}]{1,120}?) \\s* \\(\\*(?<suffix>[0-9]{3})\\)
            \\s+ on\\s+ (?<date>[A-Za-z]{3}\\s+[0-9]{1,2},\\s+[0-9]{1,2}:[0-9]{2}\\s+(?:AM|PM))
            \\s+ via\\s+ABA\\s+PAY\\s+at\\s+ (?<merchant>[^\\p{Cc}]{1,120}?) \\.\\s+
            Trx\\.\\s+ID:\\s* (?<transaction>[0-9]{1,32}),\\s* APV:\\s* (?<approval>[0-9]{1,32}) \\.? \\z
            """, Pattern.COMMENTS | Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CHARACTER_CLASS);

    static Optional<PayWaySubscriptionAlert> parse(String message, Instant postedAt, Instant now) {
        if (message == null || postedAt == null || postedAt.isAfter(now)
                || postedAt.plus(ALERT_WINDOW).isBefore(now)) {
            return Optional.empty();
        }
        var parts = SUCCESS_ALERT.matcher(message.strip());
        if (!parts.matches()) return Optional.empty();
        try {
            var postedLocal = postedAt.atZone(MERCHANT_ZONE);
            var paidLocal = LocalDateTime.parse(parts.group("date").replaceAll("\\s+", " ")
                    + " " + postedLocal.getYear(), BANK_TIME);
            if (postedLocal.getMonthValue() == 1 && paidLocal.getMonthValue() == 12) {
                paidLocal = paidLocal.minusYears(1);
            }
            Instant bankMinute = paidLocal.atZone(MERCHANT_ZONE).toInstant();
            if (bankMinute.isAfter(postedAt) || bankMinute.plus(ALERT_WINDOW).isBefore(postedAt)) {
                return Optional.empty();
            }
            String currency = parts.group("currency").toUpperCase(Locale.ROOT);
            return Optional.of(new PayWaySubscriptionAlert(new BigDecimal(parts.group("amount")),
                    currency.endsWith("$") ? "USD" : currency, parts.group("payer"), parts.group("suffix"),
                    parts.group("merchant"), parts.group("transaction"), parts.group("approval"), bankMinute));
        } catch (DateTimeException invalidBankDate) {
            return Optional.empty();
        }
    }
}
