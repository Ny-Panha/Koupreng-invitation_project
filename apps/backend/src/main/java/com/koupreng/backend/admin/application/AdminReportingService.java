package com.koupreng.backend.admin.application;

import com.koupreng.backend.admin.api.dto.*;
import com.koupreng.backend.admin.api.dto.AdminReportingModels.*;
import com.koupreng.backend.admin.infrastructure.persistence.AdminReportReadRepository;
import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.user.application.CurrentUserService;
import com.koupreng.backend.user.domain.AppUser;
import com.koupreng.backend.user.domain.Role;
import java.math.BigDecimal;
import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminReportingService {
    private final AdminReportReadRepository repository;
    private final CurrentUserService users;
    public AdminReportingService(AdminReportReadRepository repository, CurrentUserService users) {
        this.repository = repository; this.users = users;
    }
    public void requireAdmin(Authentication authentication) {
        AppUser user = users.currentUser(authentication);
        if (user.getRole() != Role.ADMIN || !AppUser.STATUS_ACTIVE.equals(user.getStatus()) || user.isDeleted()
            || authentication.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN")))
            throw new ApiException(HttpStatus.FORBIDDEN, "Active administrator access is required");
    }
    public AdminReportFilter validate(Authentication authentication, String code, AdminReportQuery query) {
        requireAdmin(authentication);
        return AdminReportFilter.of(AdminReportCatalog.definition(code), query, Instant.now());
    }
    @Transactional(readOnly = true, isolation = Isolation.REPEATABLE_READ)
    public AdminReportResponse report(Authentication authentication, String code, AdminReportQuery query) {
        return snapshot(code, validate(authentication, code, query), UUID.randomUUID().toString());
    }
    /** Also called by the export use case inside its single read-only snapshot transaction. */
    AdminReportResponse snapshot(String code, AdminReportFilter filter, String snapshotId) {
        Definition definition = AdminReportCatalog.definition(code);
        Map<String, Object> summary;
        List<Map<String, Object>> rows;
        List<Series> series = new ArrayList<>();
        if (code.equals("executive")) {
            summary = executive(filter, series);
            rows = executiveRows(summary);
        } else if (code.equals("dictionary")) {
            rows = dictionaryRows(); summary = new LinkedHashMap<>();
        } else {
            summary = repository.summary(definition, filter);
            rows = repository.rows(definition, filter, (long) filter.page() * filter.size(), filter.size());
            if (code.equals("invitations") || code.equals("users")) series.add(new Series("creation", "createdAt", repository.monthly(definition, filter, "createdAt", null)));
            if (code.equals("payments")) series.add(new Series("verifiedReceipts", filter.dimension(), suppressSmallGroups(repository.monthly(definition, filter, filter.dimension().equals("activity") ? "activityAt" : filter.dimension(), "confirmedReceipt"))));
        }
        long total = List.of("executive", "dictionary").contains(code) ? rows.size() : ((Number) summary.get("totalRecords")).longValue();
        if (List.of("executive", "dictionary").contains(code)) {
            rows = sortVirtual(rows, filter);
            int start = (int) Math.min((long) filter.page() * filter.size(), rows.size());
            rows = rows.subList(start, Math.min(start + filter.size(), rows.size()));
            summary.put("totalRecords", total);
        }
        var response = AdminReportResponse.builder().report(code).generatedAt(filter.asOf())
            .rows(rows).page(filter.page()).size(filter.size()).totalElements(total)
            .totalPages((int) ((total + filter.size() - 1) / filter.size()))
            .summary(summary).filteredSummary(summary).definition(definition)
            .metadata(new Metadata(snapshotId, filter.asOf(), AdminReportFilter.ZONE.getId(), filter.from(), filter.to(), filter.dimension(), filter.filters(), total, "FILTERED_PAGE", filter.sort(), filter.direction(), AdminReportCatalog.VERSION))
            .notices(definition.notes()).series(series).build();
        return response;
    }
    List<Map<String, Object>> exportRows(String code, AdminReportFilter filter, long offset, int size) {
        if (code.equals("dictionary")) return virtualPage(sortVirtual(dictionaryRows(), filter), offset, size);
        if (code.equals("executive")) return virtualPage(sortVirtual(executiveRows(executive(filter, new ArrayList<>())), filter), offset, size);
        return repository.rows(AdminReportCatalog.definition(code), filter, offset, size);
    }
    List<Map<String,Object>> legacyExportRows(String code, AdminReportFilter filter, long offset, int size) {
        var original=AdminReportCatalog.definition(code);var columns=new ArrayList<>(original.columns());
        columns.add(new Column(code.equals("invitations") ? "slug" : "legacyPackageName","Legacy CSV","Legacy CSV","TEXT"));
        var projection=new Definition(code,original.titleKm(),original.titleEn(),original.sheetName(),original.defaultDateDimension(),original.dateDimensions(),original.filters(),List.copyOf(columns),original.notes());
        return repository.rows(projection,filter,offset,size);
    }
    private List<Map<String, Object>> virtualPage(List<Map<String, Object>> rows, long offset, int size) {
        int start = (int) Math.min(offset, rows.size()); return rows.subList(start, Math.min(start + size, rows.size()));
    }
    private List<Map<String, Object>> sortVirtual(List<Map<String, Object>> rows, AdminReportFilter filter) {
        var result = new ArrayList<>(rows);
        Comparator<Map<String, Object>> comparator = (a, b) -> {
            Object left = a.get(filter.sort()), right = b.get(filter.sort());
            if (left == null) return right == null ? 0 : 1;
            if (right == null) return -1;
            return left instanceof Number && right instanceof Number
                ? AdminReportReadRepository.decimal(left).compareTo(AdminReportReadRepository.decimal(right)) : left.toString().compareTo(right.toString());
        };
        if(!filter.sort().equals("id")) comparator=comparator.thenComparing(row -> row.get("id").toString());
        result.sort(filter.direction().equals("ASC") ? comparator : comparator.reversed()); return result;
    }
    private AdminReportFilter periodFilter(String code, AdminReportFilter source, String dimension) {
        var query = new AdminReportQuery(); query.setFrom(source.from()); query.setTo(source.to()); query.setDateDimension(dimension);
        return AdminReportFilter.of(AdminReportCatalog.definition(code), query, source.asOf());
    }
    private Map<String, Object> executive(AdminReportFilter filter, List<Series> series) {
        var summary = new LinkedHashMap<>(repository.executive(filter));
        var invitations = periodFilter("invitations", filter, "createdAt");
        var inviteDefinition = AdminReportCatalog.definition("invitations");
        summary.putAll(repository.summary(inviteDefinition, invitations));
        var paymentDefinition = AdminReportCatalog.definition("payments");
        var payments = periodFilter("payments", filter, "paidAt");
        var financial = repository.summary(paymentDefinition, payments);
        financial.remove("totalRecords"); summary.putAll(financial);
        // Pending/failed records frequently have no paidAt. Count/value use their
        // createdAt dimension explicitly; never drop them from executive KPIs.
        var createdPayments = repository.summary(paymentDefinition, periodFilter("payments", filter, "createdAt"));
        summary.put("pendingValueByCurrency", createdPayments.get("pendingValueByCurrency"));
        summary.put("failedValueByCurrency", createdPayments.get("failedValueByCurrency"));
        summary.put("orderStatuses", createdPayments.get("statuses"));
        series.add(new Series("eventCreation", "createdAt", repository.monthly(inviteDefinition, invitations, "createdAt", null)));
        series.add(new Series("verifiedReceipts", "paidAt", suppressSmallGroups(repository.monthly(paymentDefinition, payments, "paidAt", "confirmedReceipt"))));
        if (filter.from() != null && filter.from().minusDays(ChronoUnit.DAYS.between(filter.from(),filter.to())).getYear() >= 1970) {
            long days = ChronoUnit.DAYS.between(filter.from(), filter.to());
            var query = new AdminReportQuery(); query.setFrom(filter.from().minusDays(days)); query.setTo(filter.from());
            var previous = AdminReportFilter.of(inviteDefinition, query, filter.asOf());
            long prior = repository.count(inviteDefinition, previous);
            long current = ((Number) summary.get("totalInvitations")).longValue();
            summary.put("previousPeriodEvents", prior);
            summary.put("periodGrowth", prior == 0 ? null : BigDecimal.valueOf(current - prior).divide(BigDecimal.valueOf(prior), 8, java.math.RoundingMode.HALF_UP));
            summary.put("growthState", prior == 0 ? (current > 0 ? "NEW_ACTIVITY" : "NO_ACTIVITY") : "COMPARABLE");
        } else { summary.put("periodGrowth", null); summary.put("growthState", "NO_COMPARABLE_PERIOD"); }
        return summary;
    }
    public static List<Map<String, Object>> suppressSmallGroups(List<Map<String, Object>> rows) {
        return rows.stream().map(row -> {
            var copy = new LinkedHashMap<>(row);
            boolean suppress = ((Number) row.get("count")).longValue() < 5;
            copy.put("suppressed", suppress);
            if (suppress) { copy.put("amount", null); copy.put("suppressionReason", "SAMPLE_SIZE_UNDER_5"); }
            return Collections.<String,Object>unmodifiableMap(copy);
        }).toList();
    }
    @SuppressWarnings("unchecked")
    public static List<Map<String, Object>> executiveRows(Map<String, Object> summary) {
        var rows = new ArrayList<Map<String, Object>>();
        for (String key : List.of("totalUsers", "activeUsers", "inactiveUsers", "newRegistrations", "totalInvitations", "publishedInvitations", "draftInvitations", "archivedInvitations", "totalTemplates", "activeSubscriptions", "totalGuests", "totalRsvps", "totalCheckIns", "publishedRate", "periodGrowth", "previousPeriodEvents")) {
            var row = new LinkedHashMap<String,Object>(); row.put("id", key); row.put("label", metricLabel(key)); row.put("value", summary.get(key));
            row.put("unit", key.endsWith("Rate") || key.equals("periodGrowth") ? "fraction" : "count");
            row.put("basis", List.of("totalUsers", "activeUsers", "inactiveUsers", "totalTemplates", "activeSubscriptions").contains(key) ? "Current snapshot" : "Selected period / invitation cohort; see KPI dictionary"); rows.add(row);
        }
        for (String metric : List.of("confirmedReceipts", "pendingValue", "failedValue", "templateReceipts", "subscriptionReceipts")) {
            var currencies = (Map<String,Object>) summary.getOrDefault(metric + "ByCurrency", Map.of());
            for (String currency : List.of("USD", "KHR")) {
                var row = new LinkedHashMap<String,Object>(); row.put("id", metric + currency); row.put("label", metricLabel(metric)); row.put("unit", currency); row.put("value", currencies.get(currency));
                row.put("basis", List.of("pendingValue", "failedValue").contains(metric) ? "Order createdAt in period" : "Verified paidAt in period"); rows.add(row);
            }
        }
        Object statuses = summary.get("orderStatuses");
        if (statuses instanceof List<?> list) for (var entry : list) if (entry instanceof Map<?,?> status) {
            rows.add(Map.of("id", "orders-" + status.get("label"), "label", String.valueOf(status.get("label")), "value", status.get("count"), "unit", "orders", "basis", "Order createdAt in period"));
        }
        return rows;
    }
    private static String metricLabel(String code) {
        String key = code.equals("pendingValue") ? "pendingOrderValue" : code;
        return AdminReportCatalog.METRICS.stream().filter(metric -> metric.code().equals(key)).findFirst()
            .map(metric -> metric.labelKm() + " / " + metric.labelEn()).orElse(code);
    }
    public static List<Map<String, Object>> dictionaryRows() {
        return AdminReportCatalog.METRICS.stream().map(metric -> {
            var row = new LinkedHashMap<String,Object>(); row.put("id", metric.code()); row.put("labelKm", metric.labelKm()); row.put("labelEn", metric.labelEn());
            row.put("definition", metric.definition()); row.put("calculation", metric.calculation()); row.put("databaseSource", metric.databaseSource()); row.put("dateDimension", metric.dateDimension());
            row.put("includedStatuses", metric.includedStatuses()); row.put("excludedStatuses", metric.excludedStatuses()); row.put("denominator", metric.denominator());
            row.put("currencyBehavior", metric.currencyBehavior()); row.put("missingDataBehavior", metric.missingDataBehavior()); row.put("version", metric.version()); return (Map<String,Object>) row;
        }).toList();
    }
}
