package com.koupreng.backend.reporting.application;

import static org.junit.jupiter.api.Assertions.*;
import static org.assertj.core.api.Assertions.assertThat;
import com.koupreng.backend.admin.application.AdminManagementService;
import com.koupreng.backend.payment.domain.PaymentStatus;
import com.koupreng.backend.payment.domain.TemplatePaymentOrder;
import com.koupreng.backend.payment.infrastructure.persistence.TemplatePaymentOrderRepository;
import com.koupreng.backend.invitation.infrastructure.persistence.UserInvitationRepository;
import com.koupreng.backend.template.infrastructure.persistence.InvitationTemplateRepository;
import com.koupreng.backend.user.domain.AppUser;
import com.koupreng.backend.user.domain.Role;
import com.koupreng.backend.user.infrastructure.persistence.AppUserRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
@EnabledIfEnvironmentVariable(named = "RUN_FLYWAY_INTEGRATION", matches = "true")
class ReportingIntegrityMySqlTests {
    @Autowired DashboardReportService dashboard;
    @Autowired AdminManagementService admin;
    @Autowired AppUserRepository users;
    @Autowired TemplatePaymentOrderRepository payments;
    @Autowired UserInvitationRepository invitations;
    @Autowired InvitationTemplateRepository templates;

    @DynamicPropertySource static void database(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", () -> required("FLYWAY_TEST_DB_URL"));
        registry.add("spring.datasource.username", () -> required("FLYWAY_TEST_DB_USERNAME"));
        registry.add("spring.datasource.password", () -> required("FLYWAY_TEST_DB_PASSWORD"));
        registry.add("spring.datasource.driver-class-name", () -> "com.mysql.cj.jdbc.Driver");
        registry.add("spring.flyway.enabled", () -> true);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "validate");
        registry.add("spring.jpa.database-platform", () -> "org.hibernate.dialect.MySQLDialect");
        registry.add("spring.jpa.properties.hibernate.boot.allow_jdbc_metadata_access", () -> true);
    }

    @Test void aggregateProjectionsRetainCountsCurrencyAndPaidMetadataOnMySql() {
        var owner = new AppUser(); owner.setEmail("report-" + UUID.randomUUID() + "@example.test");
        owner.setFullName("Report fixture"); owner.setRole(Role.ADMIN); owner = users.saveAndFlush(owner);
        var auth = UsernamePasswordAuthenticationToken.authenticated(owner.getId().toString(), "unused", List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));
        var usd = payment(owner, "USD", "10.00", "12.00", PaymentStatus.PAID);
        var khr = payment(owner, "KHR", "40000", null, PaymentStatus.PAID);
        payment(owner, "USD", "999.00", null, PaymentStatus.PENDING);

        var mine = dashboard.getMyDashboard(auth);
        assertFalse(mine.isRevenueComparable()); assertNull(mine.getTotalRevenue());
        assertThat(mine.getRevenueByCurrency().get("USD")).isEqualByComparingTo("12.00");
        assertThat(mine.getRevenueByCurrency().get("KHR")).isEqualByComparingTo("40000");
        var global = dashboard.getAdminDashboard(auth);
        assertEquals(users.count(), global.getTotalUsers());
        assertEquals(templates.count(), global.getTotalTemplates());
        assertEquals(invitations.dashboardCounts().getTotal(), global.getTotalInvitations());
        assertEquals(payments.count(), global.getTotalPayments());
        assertFalse(global.isRevenueComparable()); assertNull(global.getTotalRevenue());
        assertTrue(global.getRecentPayments().size() <= 5);
        assertFalse((boolean) admin.analyticsOverview().getSummary().get("revenueComparable"));
        assertNull(admin.paymentsReport().getSummary().get("totalRevenue"));
        assertEquals(usd.getPaidAmount(), payments.findById(usd.getId()).orElseThrow().getPaidAmount());
        assertEquals(khr.getCurrency(), payments.findById(khr.getId()).orElseThrow().getCurrency());
    }

    private TemplatePaymentOrder payment(AppUser owner, String currency, String amount, String paidAmount, PaymentStatus status) {
        var value = new TemplatePaymentOrder(); value.setUser(owner); value.setOrderCode("report-" + UUID.randomUUID());
        value.setTransactionId("report-tx-" + UUID.randomUUID()); value.setTemplateId(1L); value.setTemplateName("Historical template");
        value.setPackageName("Historical purchase"); value.setCurrency(currency); value.setAmount(new BigDecimal(amount));
        value.setPaidAmount(paidAmount == null ? null : new BigDecimal(paidAmount)); value.setStatus(status);
        return payments.saveAndFlush(value);
    }
    private static String required(String key) { String value = System.getenv(key); if (value == null || value.isBlank()) { throw new IllegalStateException("Missing isolated test configuration: " + key); } return value; }
}
