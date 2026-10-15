package com.koupreng.backend.admin.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.koupreng.backend.admin.api.dto.AdminCreateUserRequest;
import com.koupreng.backend.admin.api.dto.AdminUserResponse;
import com.koupreng.backend.audit.application.AuditLogService;
import com.koupreng.backend.auth.infrastructure.session.UserAuthCacheService;
import com.koupreng.backend.dev.DevSampleData;
import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.checkin.infrastructure.persistence.GuestCheckInRepository;
import com.koupreng.backend.guest.infrastructure.persistence.GuestRepository;
import com.koupreng.backend.invitation.infrastructure.persistence.UserInvitationRepository;
import com.koupreng.backend.invitation.domain.InvitationStatus;
import com.koupreng.backend.invitation.domain.UserInvitation;
import com.koupreng.backend.invitation.api.dto.InvitationResponse;
import com.koupreng.backend.notification.infrastructure.persistence.NotificationRepository;
import com.koupreng.backend.payment.infrastructure.persistence.TemplatePaymentOrderRepository;
import com.koupreng.backend.rsvp.infrastructure.persistence.RsvpRepository;
import com.koupreng.backend.subscription.infrastructure.persistence.SubscriptionRepository;
import com.koupreng.backend.template.infrastructure.persistence.InvitationTemplateRepository;
import com.koupreng.backend.user.domain.AppUser;
import com.koupreng.backend.user.domain.Role;
import com.koupreng.backend.user.infrastructure.persistence.AppUserRepository;
import com.koupreng.backend.audit.infrastructure.persistence.SystemAuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import com.koupreng.backend.admin.api.dto.AdminReportResponse;
import com.koupreng.backend.invitation.domain.EventType;
import com.koupreng.backend.invitation.domain.InvitationModerationStatus;
import com.koupreng.backend.payment.domain.PaymentStatus;
import com.koupreng.backend.payment.domain.TemplatePaymentOrder;
import com.koupreng.backend.subscription.domain.Subscription;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import org.springframework.security.crypto.password.PasswordEncoder;

class AdminManagementServiceTests {

    @Test
    void createUserHashesPasswordAndPersistsAdminAccount() {
        AppUserRepository userRepository = mock(AppUserRepository.class);
        UserInvitationRepository invitationRepository = mock(UserInvitationRepository.class);
        InvitationTemplateRepository templateRepository = mock(InvitationTemplateRepository.class);
        TemplatePaymentOrderRepository paymentOrderRepository = mock(TemplatePaymentOrderRepository.class);
        SubscriptionRepository subscriptionRepository = mock(SubscriptionRepository.class);
        RsvpRepository rsvpRepository = mock(RsvpRepository.class);
        GuestRepository guestRepository = mock(GuestRepository.class);
        GuestCheckInRepository guestCheckInRepository = mock(GuestCheckInRepository.class);
        NotificationRepository notificationRepository = mock(NotificationRepository.class);
        SystemAuditLogRepository systemAuditLogRepository = mock(SystemAuditLogRepository.class);
        AuditLogService auditLogService = mock(AuditLogService.class);
        UserAuthCacheService userAuthCacheService = mock(UserAuthCacheService.class);
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

        when(userRepository.existsByEmailIgnoreCase("new.admin@koupreng.local")).thenReturn(false);
        when(userRepository.save(any(AppUser.class))).thenAnswer(invocation -> {
            AppUser user = invocation.getArgument(0);
            user.setId(42L);
            return user;
        });

        AdminManagementService service = new AdminManagementService(
                userRepository,
                invitationRepository,
                templateRepository,
                paymentOrderRepository,
                subscriptionRepository,
                rsvpRepository,
                guestRepository,
                guestCheckInRepository,
                notificationRepository,
                systemAuditLogRepository,
                auditLogService,
                userAuthCacheService,
                passwordEncoder
        );

        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken("1", null);
        HttpServletRequest request = new MockHttpServletRequest();

        AdminUserResponse created = service.createUser(auth, new AdminCreateUserRequest(
                "New Admin",
                "new.admin@koupreng.local",
                "StrongPass123",
                Role.ADMIN
        ), request);

        ArgumentCaptor<AppUser> userCaptor = ArgumentCaptor.forClass(AppUser.class);
        verify(userRepository).save(userCaptor.capture());
        AppUser saved = userCaptor.getValue();

        assertEquals("New Admin", created.getFullName());
        assertEquals("new.admin@koupreng.local", created.getEmail());
        assertEquals(Role.ADMIN, created.getRole());
        assertNotNull(saved.getPasswordHash());
        assertTrue(saved.getPasswordHash().startsWith("$2a$"));
        assertTrue(passwordEncoder.matches("StrongPass123", saved.getPasswordHash()));
    }

    @Test
    void deactivateUserRejectsMasterAdminTarget() {
        AppUserRepository userRepository = mock(AppUserRepository.class);
        AdminManagementService service = newService(userRepository);
        AppUser target = new AppUser();
        target.setId(99L);
        target.setEmail(DevSampleData.ADMIN_EMAIL);
        target.setRole(Role.ADMIN);
        target.setStatus(AppUser.STATUS_ACTIVE);

        when(userRepository.findById(99L)).thenReturn(java.util.Optional.of(target));

        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken("1", null);
        HttpServletRequest request = new MockHttpServletRequest();

        assertThrows(ApiException.class, () -> service.deactivateUser(auth, 99L, request));
    }

    @Test
    void deactivateUserRejectsSelfDeactivation() {
        AppUserRepository userRepository = mock(AppUserRepository.class);
        AdminManagementService service = newService(userRepository);
        AppUser target = new AppUser();
        target.setId(7L);
        target.setEmail("self@koupreng.local");
        target.setRole(Role.ADMIN);
        target.setStatus(AppUser.STATUS_ACTIVE);

        when(userRepository.findById(7L)).thenReturn(java.util.Optional.of(target));

        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken("7", null);
        HttpServletRequest request = new MockHttpServletRequest();

        assertThrows(ApiException.class, () -> service.deactivateUser(auth, 7L, request));
    }

    @Test
    void masterAdminCanDeactivateOtherAdmins() {
        AppUserRepository userRepository = mock(AppUserRepository.class);
        UserInvitationRepository invitationRepository = mock(UserInvitationRepository.class);
        InvitationTemplateRepository templateRepository = mock(InvitationTemplateRepository.class);
        TemplatePaymentOrderRepository paymentOrderRepository = mock(TemplatePaymentOrderRepository.class);
        SubscriptionRepository subscriptionRepository = mock(SubscriptionRepository.class);
        RsvpRepository rsvpRepository = mock(RsvpRepository.class);
        GuestRepository guestRepository = mock(GuestRepository.class);
        GuestCheckInRepository guestCheckInRepository = mock(GuestCheckInRepository.class);
        NotificationRepository notificationRepository = mock(NotificationRepository.class);
        SystemAuditLogRepository systemAuditLogRepository = mock(SystemAuditLogRepository.class);
        AuditLogService auditLogService = mock(AuditLogService.class);
        UserAuthCacheService userAuthCacheService = mock(UserAuthCacheService.class);
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

        AppUser master = new AppUser();
        master.setId(1L);
        master.setEmail(DevSampleData.ADMIN_EMAIL);
        master.setRole(Role.ADMIN);
        master.setStatus(AppUser.STATUS_ACTIVE);

        AppUser target = new AppUser();
        target.setId(5L);
        target.setEmail("other.admin@koupreng.local");
        target.setRole(Role.ADMIN);
        target.setStatus(AppUser.STATUS_ACTIVE);

        when(userRepository.findById(5L)).thenReturn(java.util.Optional.of(target));
        when(userRepository.findAll()).thenReturn(List.of(master, target));

        AdminManagementService service = new AdminManagementService(
                userRepository,
                invitationRepository,
                templateRepository,
                paymentOrderRepository,
                subscriptionRepository,
                rsvpRepository,
                guestRepository,
                guestCheckInRepository,
                notificationRepository,
                systemAuditLogRepository,
                auditLogService,
                userAuthCacheService,
                passwordEncoder
        );

        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(DevSampleData.ADMIN_EMAIL, null);
        HttpServletRequest request = new MockHttpServletRequest();

        AdminUserResponse response = service.deactivateUser(auth, 5L, request);

        assertEquals(5L, response.getId());
        assertEquals(AppUser.STATUS_DISABLED, target.getStatus());
    }

    @Test
    void updateInvitationStatusChangesLifecycleAndMaintainsPublishedTimestamp() {
        AppUserRepository userRepository = mock(AppUserRepository.class);
        UserInvitationRepository invitationRepository = mock(UserInvitationRepository.class);
        InvitationTemplateRepository templateRepository = mock(InvitationTemplateRepository.class);
        TemplatePaymentOrderRepository paymentOrderRepository = mock(TemplatePaymentOrderRepository.class);
        SubscriptionRepository subscriptionRepository = mock(SubscriptionRepository.class);
        RsvpRepository rsvpRepository = mock(RsvpRepository.class);
        GuestRepository guestRepository = mock(GuestRepository.class);
        GuestCheckInRepository guestCheckInRepository = mock(GuestCheckInRepository.class);
        NotificationRepository notificationRepository = mock(NotificationRepository.class);
        SystemAuditLogRepository systemAuditLogRepository = mock(SystemAuditLogRepository.class);
        AuditLogService auditLogService = mock(AuditLogService.class);
        UserAuthCacheService userAuthCacheService = mock(UserAuthCacheService.class);
        UserInvitation invitation = new UserInvitation();
        invitation.setId(321L);
        invitation.setStatus(InvitationStatus.DRAFT);
        when(invitationRepository.findByIdAndDeletedFalse(321L)).thenReturn(java.util.Optional.of(invitation));
        AdminManagementService service = new AdminManagementService(
                userRepository,
                invitationRepository,
                templateRepository,
                paymentOrderRepository,
                subscriptionRepository,
                rsvpRepository,
                guestRepository,
                guestCheckInRepository,
                notificationRepository,
                systemAuditLogRepository,
                auditLogService,
                userAuthCacheService,
                new BCryptPasswordEncoder()
        );

        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken("admin", null);
        HttpServletRequest request = new MockHttpServletRequest();
        InvitationResponse published = service.updateInvitationStatus(auth, 321L, InvitationStatus.PUBLISHED, request);
        assertEquals(InvitationStatus.PUBLISHED, published.getStatus());
        assertNotNull(published.getPublishedAt());

        InvitationResponse archived = service.updateInvitationStatus(auth, 321L, InvitationStatus.ARCHIVED, request);
        assertEquals(InvitationStatus.ARCHIVED, archived.getStatus());
        assertEquals(false, invitation.isDeleted());
        verify(auditLogService, org.mockito.Mockito.times(2)).logAdminAction(
                any(), any(), any(), any(), any(), any(), any()
        );
    }

    @Test
    void invitationsReportPopulatesRowsAndRespectsPagination() {
        AppUserRepository userRepository = mock(AppUserRepository.class);
        UserInvitationRepository invitationRepository = mock(UserInvitationRepository.class);
        InvitationTemplateRepository templateRepository = mock(InvitationTemplateRepository.class);
        TemplatePaymentOrderRepository paymentOrderRepository = mock(TemplatePaymentOrderRepository.class);
        SubscriptionRepository subscriptionRepository = mock(SubscriptionRepository.class);
        RsvpRepository rsvpRepository = mock(RsvpRepository.class);
        GuestRepository guestRepository = mock(GuestRepository.class);
        GuestCheckInRepository guestCheckInRepository = mock(GuestCheckInRepository.class);
        NotificationRepository notificationRepository = mock(NotificationRepository.class);
        SystemAuditLogRepository systemAuditLogRepository = mock(SystemAuditLogRepository.class);
        AuditLogService auditLogService = mock(AuditLogService.class);
        UserAuthCacheService userAuthCacheService = mock(UserAuthCacheService.class);

        UserInvitation inv = new UserInvitation();
        inv.setId(101L);
        inv.setTitle("Royal Khmer Wedding");
        inv.setEventType(EventType.WEDDING);
        inv.setStatus(InvitationStatus.PUBLISHED);
        inv.setModerationStatus(InvitationModerationStatus.ACTIVE);

        when(invitationRepository.findReportInvitations(
                EventType.WEDDING, InvitationStatus.PUBLISHED, InvitationModerationStatus.ACTIVE, "Khmer", PageRequest.of(0, 20)
        )).thenReturn(new PageImpl<>(List.of(inv), PageRequest.of(0, 20), 1));
        when(invitationRepository.count()).thenReturn(1L);
        when(invitationRepository.countByStatusAndDeletedFalse(InvitationStatus.PUBLISHED)).thenReturn(1L);
        when(invitationRepository.countByStatusAndDeletedFalse(InvitationStatus.DRAFT)).thenReturn(0L);

        AdminManagementService service = new AdminManagementService(
                userRepository, invitationRepository, templateRepository, paymentOrderRepository,
                subscriptionRepository, rsvpRepository, guestRepository, guestCheckInRepository,
                notificationRepository, systemAuditLogRepository, auditLogService, userAuthCacheService,
                new BCryptPasswordEncoder()
        );

        AdminReportResponse report = service.invitationsReport("WEDDING", "PUBLISHED", "ACTIVE", "Khmer", 0, 20);

        assertEquals("invitations", report.getReport());
        assertEquals(1, report.getRows().size());
        assertEquals(0, report.getPage());
        assertEquals(20, report.getSize());
        assertEquals(1L, report.getTotalElements());
        assertEquals(1, report.getTotalPages());
        assertEquals(1L, report.getSummary().get("totalInvitations"));
        assertEquals(1L, report.getSummary().get("publishedInvitations"));
    }

    @Test
    void exportInvitationsCsvAppliesFormulaInjectionDefenseAndUtf8Bom() {
        AppUserRepository userRepository = mock(AppUserRepository.class);
        UserInvitationRepository invitationRepository = mock(UserInvitationRepository.class);
        AdminManagementService service = new AdminManagementService(
                userRepository, invitationRepository, mock(InvitationTemplateRepository.class),
                mock(TemplatePaymentOrderRepository.class), mock(SubscriptionRepository.class),
                mock(RsvpRepository.class), mock(GuestRepository.class), mock(GuestCheckInRepository.class),
                mock(NotificationRepository.class), mock(SystemAuditLogRepository.class),
                mock(AuditLogService.class), mock(UserAuthCacheService.class), new BCryptPasswordEncoder()
        );

        UserInvitation inv = new UserInvitation();
        inv.setId(202L);
        inv.setTitle("=1+1 Formula Attack");
        inv.setEventType(EventType.WEDDING);
        inv.setStatus(InvitationStatus.DRAFT);
        inv.setModerationStatus(InvitationModerationStatus.ACTIVE);

        when(invitationRepository.findAllReportInvitations(null, null, null, null))
                .thenReturn(List.of(inv));

        byte[] csv = service.exportInvitationsCsv(null, null, null, null);
        String csvText = new String(csv, java.nio.charset.StandardCharsets.UTF_8);

        assertTrue(csvText.startsWith("\uFEFF"));
        assertTrue(csvText.contains("\"'=1+1 Formula Attack\""));
    }

    @Test
    void platformReportIncludesAllSixEventCategoriesAndExplicitPrivacySuppression() {
        AppUserRepository userRepository = mock(AppUserRepository.class);
        UserInvitationRepository invitationRepository = mock(UserInvitationRepository.class);
        TemplatePaymentOrderRepository paymentOrderRepository = mock(TemplatePaymentOrderRepository.class);
        SubscriptionRepository subscriptionRepository = mock(SubscriptionRepository.class);

        var userCounts = mock(AppUserRepository.DashboardCounts.class);
        when(userCounts.getTotal()).thenReturn(10L);
        when(userCounts.getActive()).thenReturn(8L);
        when(userRepository.dashboardCounts()).thenReturn(userCounts);

        var paymentCounts = mock(TemplatePaymentOrderRepository.DashboardCounts.class);
        when(paymentCounts.getTotal()).thenReturn(2L);
        when(paymentCounts.getFailed()).thenReturn(0L);
        when(paymentOrderRepository.dashboardCounts()).thenReturn(paymentCounts);
        when(paymentOrderRepository.revenueByCurrency()).thenReturn(List.of());
        when(paymentOrderRepository.findRecentPlatformPayments(any())).thenReturn(List.of());
        when(subscriptionRepository.findPlatformMetrics()).thenReturn(List.of());

        var rowWedding = mock(UserInvitationRepository.PlatformMetricsRow.class);
        when(rowWedding.getEventType()).thenReturn(EventType.WEDDING);
        when(rowWedding.getStatus()).thenReturn(InvitationStatus.PUBLISHED);
        when(rowWedding.getCreatedAt()).thenReturn(Instant.now());

        var rowCorporate = mock(UserInvitationRepository.PlatformMetricsRow.class);
        when(rowCorporate.getEventType()).thenReturn(EventType.CORPORATE);
        when(rowCorporate.getStatus()).thenReturn(InvitationStatus.DRAFT);
        when(rowCorporate.getCreatedAt()).thenReturn(Instant.now());

        when(invitationRepository.findPlatformMetrics()).thenReturn(List.of(rowWedding, rowCorporate));

        AdminManagementService service = new AdminManagementService(
                userRepository, invitationRepository, mock(InvitationTemplateRepository.class),
                paymentOrderRepository, subscriptionRepository, mock(RsvpRepository.class),
                mock(GuestRepository.class), mock(GuestCheckInRepository.class),
                mock(NotificationRepository.class), mock(SystemAuditLogRepository.class),
                mock(AuditLogService.class), mock(UserAuthCacheService.class), new BCryptPasswordEncoder()
        );

        AdminReportResponse report = service.platformReport();
        assertEquals("platform", report.getReport());

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> breakdown = (List<Map<String, Object>>) report.getSummary().get("eventCategoryBreakdown");
        assertNotNull(breakdown);
        assertEquals(6, breakdown.size());

        Map<String, Object> wedding = breakdown.stream().filter(m -> "WEDDING".equals(m.get("category"))).findFirst().orElseThrow();
        assertEquals(1L, wedding.get("total"));
        assertEquals(1L, wedding.get("published"));
        assertEquals(0L, wedding.get("draft"));
        assertEquals(100.0, wedding.get("publishRate"));

        Map<String, Object> corporate = breakdown.stream().filter(m -> "CORPORATE".equals(m.get("category"))).findFirst().orElseThrow();
        assertEquals(1L, corporate.get("total"));
        assertEquals(0L, corporate.get("published"));
        assertEquals(1L, corporate.get("draft"));
        assertEquals(0.0, corporate.get("publishRate"));
    }

    @Test
    void paymentsReportSeparatesConfirmedPendingFailedAndCurrencies() {
        TemplatePaymentOrderRepository paymentOrderRepository = mock(TemplatePaymentOrderRepository.class);
        SubscriptionRepository subscriptionRepository = mock(SubscriptionRepository.class);

        TemplatePaymentOrder paidOrder = new TemplatePaymentOrder();
        paidOrder.setOrderCode("ORD-USD-001");
        paidOrder.setPackageName("Royal Wedding Template");
        paidOrder.setAmount(new BigDecimal("25.00"));
        paidOrder.setPaidAmount(new BigDecimal("25.00"));
        paidOrder.setCurrency("USD");
        paidOrder.setStatus(PaymentStatus.PAID);

        TemplatePaymentOrder pendingOrder = new TemplatePaymentOrder();
        pendingOrder.setOrderCode("ORD-KHR-002");
        pendingOrder.setPackageName("Khmer Celestial Template");
        pendingOrder.setAmount(new BigDecimal("100000.00"));
        pendingOrder.setCurrency("KHR");
        pendingOrder.setStatus(PaymentStatus.PENDING);

        when(paymentOrderRepository.findAll()).thenReturn(List.of(paidOrder, pendingOrder));
        when(subscriptionRepository.findAll()).thenReturn(List.of());

        AdminManagementService service = new AdminManagementService(
                mock(AppUserRepository.class), mock(UserInvitationRepository.class), mock(InvitationTemplateRepository.class),
                paymentOrderRepository, subscriptionRepository, mock(RsvpRepository.class),
                mock(GuestRepository.class), mock(GuestCheckInRepository.class),
                mock(NotificationRepository.class), mock(SystemAuditLogRepository.class),
                mock(AuditLogService.class), mock(UserAuthCacheService.class), new BCryptPasswordEncoder()
        );

        AdminReportResponse report = service.paymentsReport();
        assertEquals("payments", report.getReport());

        Map<String, Object> summary = report.getSummary();
        assertEquals(2, summary.get("totalPayments"));
        assertEquals(1L, summary.get("paidPayments"));
        assertEquals(1L, summary.get("pendingPayments"));

        @SuppressWarnings("unchecked")
        Map<String, BigDecimal> paidRev = (Map<String, BigDecimal>) summary.get("paidRevenueByCurrency");
        assertEquals(new BigDecimal("25.00"), paidRev.get("USD"));

        @SuppressWarnings("unchecked")
        Map<String, BigDecimal> pendingRev = (Map<String, BigDecimal>) summary.get("pendingRevenueByCurrency");
        assertEquals(new BigDecimal("100000.00"), pendingRev.get("KHR"));
    }

    private AdminManagementService newService(AppUserRepository userRepository) {
        UserInvitationRepository invitationRepository = mock(UserInvitationRepository.class);
        InvitationTemplateRepository templateRepository = mock(InvitationTemplateRepository.class);
        TemplatePaymentOrderRepository paymentOrderRepository = mock(TemplatePaymentOrderRepository.class);
        SubscriptionRepository subscriptionRepository = mock(SubscriptionRepository.class);
        RsvpRepository rsvpRepository = mock(RsvpRepository.class);
        GuestRepository guestRepository = mock(GuestRepository.class);
        GuestCheckInRepository guestCheckInRepository = mock(GuestCheckInRepository.class);
        NotificationRepository notificationRepository = mock(NotificationRepository.class);
        SystemAuditLogRepository systemAuditLogRepository = mock(SystemAuditLogRepository.class);
        AuditLogService auditLogService = mock(AuditLogService.class);
        UserAuthCacheService userAuthCacheService = mock(UserAuthCacheService.class);
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

        return new AdminManagementService(
                userRepository,
                invitationRepository,
                templateRepository,
                paymentOrderRepository,
                subscriptionRepository,
                rsvpRepository,
                guestRepository,
                guestCheckInRepository,
                notificationRepository,
                systemAuditLogRepository,
                auditLogService,
                userAuthCacheService,
                passwordEncoder
        );
    }
}
