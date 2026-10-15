package com.koupreng.backend.admin.infrastructure.persistence;

import com.koupreng.backend.admin.application.AdminReportFilter;
import com.koupreng.backend.admin.application.AdminReportCatalog;
import com.koupreng.backend.admin.api.dto.AdminReportingModels.Definition;
import java.math.*;
import java.sql.*;
import java.time.*;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class AdminReportReadRepository {
    private final NamedParameterJdbcTemplate jdbc;
    public AdminReportReadRepository(NamedParameterJdbcTemplate jdbc) { this.jdbc = jdbc; }

    private String where(Definition definition, AdminReportFilter filter) {
        var clauses = new ArrayList<String>(); clauses.add("1=1");
        if (filter.from() != null && filter.dimension().equals("activity") && List.of("payments","reconciliation").contains(definition.code())) clauses.add(filter.period("r.activityAt"));
        if (filter.from() != null && !List.of("activity", "metric", "definition").contains(filter.dimension())) {
            if (filter.dimension().equals("activePeriod")) {
                clauses.add("r.startDate < :toUtc AND (r.endDate IS NULL OR r.endDate > :fromUtc)");
            } else if (filter.dimension().equals("eventDate")) clauses.add("r.eventDate >= :fromDate AND r.eventDate < :toDate");
            else clauses.add(filter.period("r." + filter.dimension()));
        }
        filter.filters().forEach((key, value) -> {
            if (key.equals("search")) {
                var search = AdminReportCatalog.definition(definition.code()).columns().stream().filter(c -> c.type().equals("TEXT"))
                    .map(c -> "LOWER(COALESCE(r." + c.key() + ",'')) LIKE :keyword ESCAPE '!' ").collect(Collectors.joining(" OR "));
                clauses.add("(" + search + ")");
            } else clauses.add("r." + (key.equals("paymentType") ? "productType" : key) + " = :" + key);
        });
        return String.join(" AND ", clauses);
    }
    private String source(Definition definition, AdminReportFilter filter) {
        return " FROM (" + AdminReportQueries.base(definition.code(), filter) + ") r WHERE " + where(definition, filter);
    }
    public long count(Definition definition, AdminReportFilter filter) {
        return jdbc.queryForObject("SELECT COUNT(*)" + source(definition, filter), filter.parameters(), Long.class);
    }
    public List<Map<String, Object>> rows(Definition definition, AdminReportFilter filter, long offset, int size) {
        var params = new HashMap<>(filter.parameters()); params.put("limit", size); params.put("offset", offset);
        String columns = definition.columns().stream().map(c -> "r." + c.key()).collect(Collectors.joining(","));
        String order = " ORDER BY r." + filter.sort() + " " + filter.direction();
        if (!filter.sort().equals("id")) order += ",r.id " + filter.direction();
        return jdbc.query("SELECT " + columns + source(definition, filter) + order + " LIMIT :limit OFFSET :offset", params,
            (rs, rowNumber) -> {
                var row = new LinkedHashMap<String, Object>();
                for (int index = 0; index < definition.columns().size(); index++) {
                    var column = definition.columns().get(index); Object value = rs.getObject(index + 1);
                    if (value != null && column.type().equals("DATETIME")) value = rs.getObject(index + 1, LocalDateTime.class).toInstant(ZoneOffset.UTC);
                    else if (value != null && column.type().equals("DATE")) value = rs.getObject(index + 1, LocalDate.class);
                    else if (value instanceof Time time) value = time.toLocalTime().toString();
                    if (column.key().equals("reviewedBy") && value != null && !value.toString().matches("(?:[0-9]+|ADMIN[-:#][0-9]+)")) value = null;
                    row.put(column.key(), value);
                }
                return Collections.unmodifiableMap(row);
            });
    }
    public Map<String, Object> summary(Definition definition, AdminReportFilter filter) {
        String code = definition.code();
        var result = new LinkedHashMap<String, Object>();
        result.put("totalRecords", count(definition, filter));
        if (code.equals("payments") || code.equals("reconciliation")) {
            var money = aggregates("SELECT currency, "
                + "SUM(CASE WHEN reconciliationOutcome='MATCHED' THEN confirmedReceipt ELSE 0 END) confirmedReceipts,"
                + "SUM(CASE WHEN paymentStatus IN ('PENDING','QR_CREATED','CHECKOUT_CREATED','PAID_PENDING_REVIEW','REVIEW_REQUIRED') THEN expectedAmount ELSE 0 END) pendingValue,"
                + "SUM(CASE WHEN paymentStatus IN ('FAILED','REJECTED','EXPIRED','CANCELLED') THEN expectedAmount ELSE 0 END) failedValue,"
                + "SUM(CASE WHEN reconciliationOutcome='MATCHED' AND productType='TEMPLATE' THEN confirmedReceipt ELSE 0 END) templateReceipts,"
                + "SUM(CASE WHEN reconciliationOutcome='MATCHED' AND productType='SUBSCRIPTION' THEN confirmedReceipt ELSE 0 END) subscriptionReceipts"
                + source(definition, filter) + " GROUP BY currency", filter);
            for (String metric : List.of("confirmedReceipts", "pendingValue", "failedValue", "templateReceipts", "subscriptionReceipts")) {
                var currencies = new LinkedHashMap<String, BigDecimal>(); currencies.put("USD", BigDecimal.ZERO); currencies.put("KHR", BigDecimal.ZERO);
                for (var row : money) if (currencies.containsKey(String.valueOf(row.get("currency")))) currencies.put(String.valueOf(row.get("currency")), decimal(row.get(metric)));
                result.put(metric + "ByCurrency", currencies);
            }
            result.put("outcomes", aggregates("SELECT reconciliationOutcome label,COUNT(*) count" + source(definition, filter) + " GROUP BY reconciliationOutcome", filter));
            result.put("statuses", aggregates("SELECT paymentStatus label,COUNT(*) count" + source(definition, filter) + " GROUP BY paymentStatus", filter));
        } else if (code.equals("invitations") || code.equals("engagement")) {
            result.putAll(aggregates("SELECT COUNT(*) totalInvitations,"
                + "COALESCE(SUM(CASE WHEN status='PUBLISHED' THEN 1 ELSE 0 END),0) publishedInvitations,"
                + "COALESCE(SUM(CASE WHEN status='DRAFT' THEN 1 ELSE 0 END),0) draftInvitations,"
                + "COALESCE(SUM(CASE WHEN status='ARCHIVED' THEN 1 ELSE 0 END),0) archivedInvitations,"
                + "COALESCE(SUM(guestCount),0) totalGuests,COALESCE(SUM(rsvpCount),0) totalRsvps,COALESCE(SUM(checkedInCount),0) totalCheckIns"
                + source(definition, filter), filter).getFirst());
            result.put("publishedRate", ratio(result.get("publishedInvitations"), result.get("totalInvitations")));
            result.put("rsvpRate", ratio(result.get("totalRsvps"), result.get("totalGuests")));
            result.put("checkInRate", ratio(result.get("totalCheckIns"), result.get("totalGuests")));
            var categories = aggregates("SELECT eventType category,COUNT(*) total,"
                + "SUM(CASE WHEN status='PUBLISHED' THEN 1 ELSE 0 END) published, SUM(CASE WHEN status='DRAFT' THEN 1 ELSE 0 END) draft"
                + source(definition, filter) + " GROUP BY eventType ORDER BY eventType", filter);
            var complete = new ArrayList<Map<String,Object>>();
            for (String category : List.of("WEDDING","ENGAGEMENT","BIRTHDAY","ANNIVERSARY","CORPORATE","OTHER")) {
                var value = new LinkedHashMap<String,Object>(categories.stream().filter(c -> category.equals(c.get("category"))).findFirst().orElse(Map.of("category",category,"total",0L,"published",0L,"draft",0L)));
                value.put("publishedRate",ratio(value.get("published"),value.get("total"))); complete.add(value);
            }
            result.put("eventCategoryBreakdown", complete);
        } else if (code.equals("users")) {
            result.put("accountStatuses", aggregates("SELECT status label,COUNT(*) count" + source(definition, filter) + " GROUP BY status", filter));
            result.put("paidUsers", aggregates("SELECT COUNT(*) count" + source(definition, filter) + " AND allPaidPurchases>0", filter).getFirst().get("count"));
            result.put("noVerifiedReceiptUsers", aggregates("SELECT COUNT(*) count" + source(definition, filter) + " AND allPaidPurchases=0", filter).getFirst().get("count"));
        } else if (code.equals("subscriptions")) {
            result.put("activeStates", aggregates("SELECT activeState label,COUNT(*) count" + source(definition, filter) + " GROUP BY activeState", filter));
            result.put("subscriptionTiers", aggregates("SELECT packageName tier,COUNT(*) activeSubscriptions" + source(definition, filter) + " AND activeState='ACTIVE' GROUP BY packageName", filter));
        } else if (code.equals("templates")) {
            result.put("categories", aggregates("SELECT category label,COUNT(*) count" + source(definition, filter) + " GROUP BY category", filter));
            result.put("topUsage", aggregates("SELECT name label,usageCount count" + source(definition, filter) + " ORDER BY usageCount DESC,r.id ASC LIMIT 5", filter));
            result.put("topPurchases", aggregates("SELECT name label,verifiedPurchases count" + source(definition, filter) + " ORDER BY verifiedPurchases DESC,r.id ASC LIMIT 5", filter));
        }
        return result;
    }
    private List<Map<String, Object>> aggregates(String sql, AdminReportFilter filter) {
        return jdbc.query(sql, filter.parameters(), mapRow());
    }
    private RowMapper<Map<String, Object>> mapRow() {
        return (rs, rowNumber) -> {
            var row = new LinkedHashMap<String, Object>();
            for (int i = 1; i <= rs.getMetaData().getColumnCount(); i++) {
                String key = rs.getMetaData().getColumnLabel(i);
                // Quoted aliases are not necessary in MySQL; recover canonical DTO keys
                // for drivers (including isolated H2 tests) that uppercase labels.
                String canonical = List.of("currency", "confirmedReceipts", "pendingValue", "failedValue", "templateReceipts", "subscriptionReceipts", "label", "count", "totalInvitations", "publishedInvitations", "draftInvitations", "archivedInvitations", "totalGuests", "totalRsvps", "totalCheckIns", "category", "total", "published", "draft", "tier", "activeSubscriptions", "period", "amount").stream().filter(k -> k.equalsIgnoreCase(key)).findFirst().orElse(key);
                row.put(canonical, rs.getObject(i));
            }
            return row;
        };
    }
    public List<Map<String, Object>> monthly(Definition definition, AdminReportFilter filter, String dateColumn, String amount) {
        // DATETIME columns are UTC. Add 7 hours before extracting calendar months;
        // Phnom Penh has no DST. H2 MySQL mode and MySQL 8 share DATEADD via TIMESTAMPADD.
        String month = "CONCAT(YEAR(TIMESTAMPADD(HOUR,7,r." + dateColumn + ")), '-', LPAD(MONTH(TIMESTAMPADD(HOUR,7,r." + dateColumn + ")),2,'0'))";
        String extra = amount == null ? "" : ",r.currency currency,SUM(r." + amount + ") amount";
        return aggregates("SELECT " + month + " period,COUNT(*) count" + extra + source(definition, filter)
            + (amount == null ? "" : " AND r.reconciliationOutcome='MATCHED'")
            + " GROUP BY " + month + (amount == null ? "" : ",r.currency") + " ORDER BY period", filter);
    }
    public Map<String, Object> executive(AdminReportFilter filter) {
        var params = filter.parameters();
        var counts = jdbc.queryForMap("SELECT COUNT(*) totalUsers, COALESCE(SUM(CASE WHEN status='ACTIVE' THEN 1 ELSE 0 END),0) activeUsers FROM users WHERE deleted=false", params);
        var result = new LinkedHashMap<String, Object>();
        result.put("totalUsers", counts.get("totalUsers")); result.put("activeUsers", counts.get("activeUsers"));
        result.put("inactiveUsers", decimal(counts.get("totalUsers")).subtract(decimal(counts.get("activeUsers"))));
        result.put("newRegistrations", jdbc.queryForObject("SELECT COUNT(*) FROM users WHERE deleted=false AND " + filter.period("created_at"), params, Long.class));
        result.put("totalTemplates", jdbc.queryForObject("SELECT COUNT(*) FROM templates", params, Long.class));
        result.put("activeSubscriptions", jdbc.queryForObject("SELECT COUNT(*) FROM (" + subscriptions() + ") s WHERE activeState='ACTIVE'", params, Long.class));
        return result;
    }
    private String subscriptions() { return AdminReportQueries.subscriptions(); }
    public static BigDecimal decimal(Object number) { return number == null ? BigDecimal.ZERO : new BigDecimal(number.toString()); }
    public static BigDecimal ratio(Object numerator, Object denominator) {
        BigDecimal bottom = decimal(denominator);
        return bottom.signum() == 0 ? null : decimal(numerator).divide(bottom, 8, RoundingMode.HALF_UP);
    }
}
