package com.koupreng.backend.reporting.application;

import com.koupreng.backend.invitation.application.InvitationService;
import com.koupreng.backend.invitation.domain.UserInvitation;
import com.koupreng.backend.media.domain.MediaFile;
import com.koupreng.backend.media.domain.MediaType;
import com.koupreng.backend.template.domain.InvitationTemplate;
import com.koupreng.backend.user.application.CurrentUserService;
import com.koupreng.backend.user.domain.AppUser;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import org.hibernate.SessionFactory;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.core.Authentication;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:p2-query-growth;MODE=MySQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.properties.hibernate.boot.allow_jdbc_metadata_access=true",
        "spring.jpa.properties.hibernate.generate_statistics=true"
})
@ActiveProfiles("test")
@Transactional
class QueryGrowthIntegrationTests {
    @Autowired EntityManager entityManager;
    @Autowired EntityManagerFactory entityManagerFactory;
    @Autowired InvitationService invitationService;
    @Autowired DashboardReportService dashboard;
    @MockitoBean CurrentUserService currentUserService;

    @Test
    void adminRevenueRetainsHistoricCurrencyMeaning() {
        Authentication authentication = mock(Authentication.class);
        when(authentication.getAuthorities()).thenAnswer(ignored -> java.util.List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_ADMIN")));
        AppUser owner = new AppUser(); owner.setEmail("currency-report@example.test"); owner.setFullName("Currency report"); entityManager.persist(owner);
        for (String currency : new String[]{"USD", "KHR"}) {
            var payment = new com.koupreng.backend.payment.domain.TemplatePaymentOrder(); payment.setUser(owner);
            payment.setOrderCode("currency-" + currency); payment.setTransactionId("currency-tx-" + currency);
            payment.setTemplateId(1L); payment.setTemplateName("Historical template"); payment.setPackageName("Historical purchase");
            payment.setStatus(com.koupreng.backend.payment.domain.PaymentStatus.PAID); payment.setCurrency(currency);
            payment.setAmount(new java.math.BigDecimal("USD".equals(currency) ? "10.00" : "40000"));
            entityManager.persist(payment);
        }
        entityManager.flush(); entityManager.clear(); when(currentUserService.currentUser(authentication)).thenReturn(owner);
        var result = dashboard.getAdminDashboard(authentication);
        assertEquals(null, result.getTotalRevenue()); assertEquals(false, result.isRevenueComparable());
        org.assertj.core.api.Assertions.assertThat(result.getRevenueByCurrency().get("USD")).isEqualByComparingTo("10.00");
        org.assertj.core.api.Assertions.assertThat(result.getRevenueByCurrency().get("KHR")).isEqualByComparingTo("40000");
    }

    @Test
    void adminDashboardLoadsOnlyRecentEntitiesWhilePreservingFullCounts() {
        Authentication authentication = mock(Authentication.class);
        when(authentication.getAuthorities()).thenAnswer(ignored -> java.util.List.of(
                new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_ADMIN")));
        AppUser owner = new AppUser(); owner.setEmail("admin-query@example.test"); owner.setFullName("Admin query");
        entityManager.persist(owner);
        InvitationTemplate template = new InvitationTemplate(); template.setName("Admin query template"); template.setCode("admin-query-template");
        entityManager.persist(template);
        for (int index = 0; index < 20; index++) {
            UserInvitation invitation = new UserInvitation(); invitation.setTitle("Admin query " + index);
            invitation.setSlug("admin-query-" + index); invitation.setUser(owner); invitation.setTemplate(template);
            entityManager.persist(invitation);
        }
        entityManager.flush(); entityManager.clear();
        when(currentUserService.currentUser(authentication)).thenReturn(owner);
        var statistics = entityManagerFactory.unwrap(SessionFactory.class).getStatistics(); statistics.clear();
        var result = dashboard.getAdminDashboard(authentication);
        assertEquals(20, result.getTotalInvitations()); assertEquals(1, result.getTotalTemplates());
        assertEquals(1, result.getTotalUsers()); assertEquals(5, result.getRecentInvitations().size());
        System.out.println("P2_ADMIN_QUERY_COUNTS invitations=20 entities=" + statistics.getEntityLoadCount()
                + " statements=" + statistics.getPrepareStatementCount());
        assertTrue(statistics.getEntityLoadCount() <= 12, "Admin dashboard must load recent rows, not the full invitation table");
    }

    @Test
    void invitationCoverAndDashboardQueryCountsRemainBoundedAsInvitationCountGrows() {
        Authentication authentication = mock(Authentication.class);
        AppUser owner = new AppUser();
        owner.setEmail("query-growth@example.test");
        owner.setFullName("Query regression");
        entityManager.persist(owner);
        InvitationTemplate template = new InvitationTemplate();
        template.setName("Query regression template");
        template.setCode("query-growth-template");
        entityManager.persist(template);
        for (int index = 0; index < 20; index++) {
            UserInvitation invitation = new UserInvitation();
            invitation.setTitle("Query fixture " + index);
            invitation.setSlug("query-growth-" + index);
            invitation.setUser(owner);
            invitation.setTemplate(template);
            entityManager.persist(invitation);
            MediaFile cover = new MediaFile();
            cover.setInvitation(invitation);
            cover.setMediaType(MediaType.COVER_IMAGE);
            cover.setFileUrl("/uploads/query-" + index + ".png");
            entityManager.persist(cover);
        }
        entityManager.flush();
        entityManager.clear();
        when(currentUserService.currentUser(authentication)).thenReturn(owner);
        var statistics = entityManagerFactory.unwrap(SessionFactory.class).getStatistics();
        statistics.clear();
        var invitations = invitationService.listMine(authentication, null);
        assertEquals(20, invitations.size());
        assertTrue(invitations.stream().allMatch(invitation -> invitation.getCoverUrl() != null));
        long coverQueries = statistics.getPrepareStatementCount();
        entityManager.clear();
        statistics.clear();
        assertEquals(20, dashboard.getMyDashboard(authentication).getTotalInvitations());
        long dashboardQueries = statistics.getPrepareStatementCount();
        System.out.println("P2_QUERY_COUNTS invitations=20 covers=" + coverQueries + " dashboard=" + dashboardQueries);
        assertTrue(coverQueries <= 5, "Cover queries must not grow with every invitation: " + coverQueries);
        assertTrue(dashboardQueries <= 12, "Dashboard queries must not grow with every invitation: " + dashboardQueries);
    }
}
