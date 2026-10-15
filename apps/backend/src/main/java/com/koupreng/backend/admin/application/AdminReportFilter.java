package com.koupreng.backend.admin.application;

import com.koupreng.backend.admin.api.dto.AdminReportQuery;
import com.koupreng.backend.admin.api.dto.AdminReportingModels.Definition;
import com.koupreng.backend.shared.exception.ApiException;
import java.time.*;
import java.util.*;
import org.springframework.http.HttpStatus;

/** Immutable query snapshot shared by aggregation, pagination and export. */
public record AdminReportFilter(LocalDate from, LocalDate to, String dimension,
        Map<String, String> filters, String sort, String direction, int page, int size, Instant asOf) {
    public static final ZoneId ZONE = ZoneId.of("Asia/Phnom_Penh");
    public static AdminReportFilter of(Definition definition, AdminReportQuery query, Instant now) {
        var from = query.getFrom(); var to = query.getTo();
        if ((from == null) != (to == null) || (from != null && (!from.isBefore(to)
                || from.getYear() < 1970 || to.getYear() > 9998))) bad("Use a valid inclusive from / exclusive to date range");
        String dimension = blank(query.getDateDimension());
        if (dimension == null) dimension = definition.defaultDateDimension();
        if (!definition.dateDimensions().contains(dimension)) bad("Unsupported date dimension for this report");
        var fields = new LinkedHashMap<String, String>();
        put(fields, "eventType", query.getEventType()); put(fields, "status", query.getStatus());
        put(fields, "moderationStatus", query.getModerationStatus()); put(fields, "paymentType", query.getPaymentType());
        put(fields, "paymentStatus", query.getPaymentStatus()); put(fields, "provider", query.getProvider());
        put(fields, "currency", query.getCurrency());
        if (query.getPackageId() != null) {
            if (query.getPackageId() < 1) bad("Invalid package ID");
            fields.put("packageId", query.getPackageId().toString());
        }
        String search = blank(query.getSearch());
        if (search != null) {
            if (search.length() > 160 || search.codePoints().anyMatch(Character::isISOControl)) bad("Search is limited to 160 printable characters");
            fields.put("search", search);
        }
        if (!definition.filters().containsAll(fields.keySet())) bad("A filter is not supported by the selected report");
        if (fields.containsKey("eventType") && !List.of("WEDDING", "ENGAGEMENT", "BIRTHDAY", "ANNIVERSARY", "CORPORATE", "OTHER").contains(fields.get("eventType"))) bad("Invalid event type");
        if (fields.containsKey("currency") && !List.of("USD", "KHR").contains(fields.get("currency"))) bad("Only explicit USD or KHR currency filters are supported");
        if (fields.containsKey("paymentType") && !List.of("TEMPLATE", "SUBSCRIPTION").contains(fields.get("paymentType"))) bad("Invalid payment type");
        String sort = blank(query.getSort());
        if (sort == null) sort = definition.columns().stream().anyMatch(c -> c.key().equals("createdAt")) ? "createdAt" : "id";
        final String column = sort;
        if (definition.columns().stream().noneMatch(c -> c.key().equals(column))) bad("Unsupported sort column");
        String direction = blank(query.getDirection());
        direction = direction == null ? "DESC" : direction.toUpperCase(Locale.ROOT);
        if (!List.of("ASC", "DESC").contains(direction)) bad("Invalid sort direction");
        int page = query.getPage() == null ? 0 : query.getPage();
        int size = query.getSize() == null ? 20 : query.getSize();
        if (page < 0 || page > 1_000_000 || size < 1 || size > 200) bad("Page must be nonnegative; size must be 1..200");
        return new AdminReportFilter(from, to, dimension, Collections.unmodifiableMap(fields), sort, direction, page, size, now);
    }
    private static void put(Map<String, String> map, String key, String value) {
        value = blank(value);
        if (value == null || value.equalsIgnoreCase("ALL")) return;
        value = value.toUpperCase(Locale.ROOT);
        if (!value.matches("[A-Z0-9_]{1,80}")) bad("Invalid " + key);
        map.put(key, value);
    }
    public static String blank(String value) { return value == null || value.isBlank() ? null : value.trim(); }
    private static void bad(String message) { throw new ApiException(HttpStatus.BAD_REQUEST, message); }
    public Map<String, Object> parameters() {
        var values = new HashMap<String, Object>();
        // Physical DATETIME values for Instant mappings are UTC. Bind LocalDateTime
        // explicitly, avoiding the JDBC client's Asia/Phnom_Penh display timezone.
        values.put("asOf", LocalDateTime.ofInstant(asOf, ZoneOffset.UTC));
        if (from != null) {
            values.put("fromUtc", LocalDateTime.ofInstant(from.atStartOfDay(ZONE).toInstant(), ZoneOffset.UTC));
            values.put("toUtc", LocalDateTime.ofInstant(to.atStartOfDay(ZONE).toInstant(), ZoneOffset.UTC));
            values.put("fromDate", from); values.put("toDate", to);
        }
        filters.forEach((key, value) -> values.put(key, key.equals("packageId") ? Long.valueOf(value) : value));
        if (filters.containsKey("search")) values.put("keyword", "%" + filters.get("search").toLowerCase(Locale.ROOT)
            .replace("!", "!!").replace("%", "!%").replace("_", "!_") + "%");
        return values;
    }
    public String period(String field) { return from == null ? "1=1" : field + " >= :fromUtc AND " + field + " < :toUtc"; }
}
