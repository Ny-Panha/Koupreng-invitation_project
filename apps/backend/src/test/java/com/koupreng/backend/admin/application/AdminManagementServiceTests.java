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
import com.koupreng.backend.notification.infrastructure.persistence.NotificationRepository;
import com.koupreng.backend.payment.infrastructure.persistence.TemplatePaymentOrderRepository;
import com.koupreng.backend.rsvp.infrastructure.persistence.RsvpRepository;
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
import org.springframework.security.crypto.password.PasswordEncoder;

class AdminManagementServiceTests {

    @Test
    void createUserHashesPasswordAndPersistsAdminAccount() {
        AppUserRepository userRepository = mock(AppUserRepository.class);
        UserInvitationRepository invitationRepository = mock(UserInvitationRepository.class);
        InvitationTemplateRepository templateRepository = mock(InvitationTemplateRepository.class);
        TemplatePaymentOrderRepository paymentOrderRepository = mock(TemplatePaymentOrderRepository.class);
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

    private AdminManagementService newService(AppUserRepository userRepository) {
        UserInvitationRepository invitationRepository = mock(UserInvitationRepository.class);
        InvitationTemplateRepository templateRepository = mock(InvitationTemplateRepository.class);
        TemplatePaymentOrderRepository paymentOrderRepository = mock(TemplatePaymentOrderRepository.class);
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
