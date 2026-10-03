package com.koupreng.backend.reporting.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.koupreng.backend.guest.infrastructure.persistence.GuestRepository;
import com.koupreng.backend.guest.domain.Guest;
import com.koupreng.backend.invitation.domain.UserInvitation;
import com.koupreng.backend.invitation.infrastructure.persistence.UserInvitationRepository;
import com.koupreng.backend.notification.infrastructure.persistence.NotificationRepository;
import com.koupreng.backend.payment.infrastructure.persistence.TemplateOrderRepository;
import com.koupreng.backend.payment.infrastructure.persistence.TemplatePaymentOrderRepository;
import com.koupreng.backend.rsvp.infrastructure.persistence.RsvpRepository;
import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.template.infrastructure.persistence.InvitationTemplateRepository;
import com.koupreng.backend.user.application.CurrentUserService;
import com.koupreng.backend.user.domain.AppUser;
import com.koupreng.backend.user.infrastructure.persistence.AppUserRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;

class DashboardReportServiceTests {

    @Test
    void mixedCurrencyHistoricPaymentsCannotBecomeOneRevenueNumber() {
        Fixture fixture = fixture();
        var usd = new com.koupreng.backend.payment.domain.TemplatePaymentOrder();
        usd.setStatus(com.koupreng.backend.payment.domain.PaymentStatus.PAID); usd.setCurrency("USD"); usd.setAmount(new java.math.BigDecimal("10.00"));
        var khr = new com.koupreng.backend.payment.domain.TemplateOrder();
        khr.setStatus(com.koupreng.backend.payment.domain.PaymentStatus.PAID); khr.setCurrency("KHR"); khr.setAmount(new java.math.BigDecimal("40000"));
        when(fixture.paymentRepository.findByUserIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(usd));
        when(fixture.legacyOrderRepository.findByUserIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(khr));
        var result = fixture.service.getMyDashboard(fixture.authentication);
        assertEquals(null, result.getTotalRevenue());
        assertEquals(false, result.isRevenueComparable());
        assertEquals(null, result.getCurrency());
        assertEquals(new java.math.BigDecimal("10.00"), result.getRevenueByCurrency().get("USD"));
        assertEquals(new java.math.BigDecimal("40000"), result.getRevenueByCurrency().get("KHR"));
    }

    @Test
    void guestReportCsvNeutralizesSpreadsheetFormulasAndEscapesMultilineNames() {
        Fixture fixture = fixture();
        UserInvitation invitation = invitation(user(1L));
        when(fixture.invitationRepository.findByIdAndDeletedFalse(10L)).thenReturn(Optional.of(invitation));
        Guest guest = new Guest();
        guest.setId(20L);
        guest.setInvitation(invitation);
        guest.setGuestName("=HYPERLINK(\"untrusted\")\nsecond line");
        when(fixture.guestRepository.findByInvitationIdOrderByGuestGroupAscTableNumberAscGuestNameAsc(10L))
                .thenReturn(List.of(guest));
        String csv = fixture.service.exportGuestReportCsv(fixture.authentication, 10L);
        assertTrue(csv.contains("\"'=HYPERLINK(\"\"untrusted\"\")\nsecond line\""));
        assertTrue(csv.startsWith("guestId,guestName,email,phone,"));
    }

    @Test
    void invitationReportRejectsAnotherOwnerBeforeReadingReportData() {
        Fixture fixture = fixture();
        AppUser otherUser = user(2L);
        when(fixture.currentUserService.currentUser(fixture.authentication)).thenReturn(otherUser);
        when(fixture.authentication.getAuthorities()).thenReturn(List.of());
        when(fixture.invitationRepository.findByIdAndDeletedFalse(10L))
                .thenReturn(Optional.of(invitation(user(1L))));

        ApiException exception = assertThrows(ApiException.class,
                () -> fixture.service.getInvitationDashboard(fixture.authentication, 10L));

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatus());
        verify(fixture.guestRepository, never())
                .findByInvitationIdOrderByGuestGroupAscTableNumberAscGuestNameAsc(10L);
    }

    @Test
    void adminDashboardRejectsNonAdminBeforeReadingGlobalData() {
        Fixture fixture = fixture();
        when(fixture.authentication.getAuthorities()).thenReturn(List.of());

        ApiException exception = assertThrows(ApiException.class,
                () -> fixture.service.getAdminDashboard(fixture.authentication));

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatus());
        verify(fixture.userRepository, never()).findAllByOrderByCreatedAtDesc();
    }

    private Fixture fixture() {
        UserInvitationRepository invitationRepository = mock(UserInvitationRepository.class);
        GuestRepository guestRepository = mock(GuestRepository.class);
        RsvpRepository rsvpRepository = mock(RsvpRepository.class);
        NotificationRepository notificationRepository = mock(NotificationRepository.class);
        TemplatePaymentOrderRepository paymentRepository = mock(TemplatePaymentOrderRepository.class);
        TemplateOrderRepository orderRepository = mock(TemplateOrderRepository.class);
        AppUserRepository userRepository = mock(AppUserRepository.class);
        InvitationTemplateRepository templateRepository = mock(InvitationTemplateRepository.class);
        CurrentUserService currentUserService = mock(CurrentUserService.class);
        Authentication authentication = mock(Authentication.class);
        when(currentUserService.currentUser(authentication)).thenReturn(user(1L));

        DashboardReportService service = new DashboardReportService(
                invitationRepository,
                guestRepository,
                rsvpRepository,
                notificationRepository,
                paymentRepository,
                orderRepository,
                userRepository,
                templateRepository,
                currentUserService
        );
        return new Fixture(service, invitationRepository, guestRepository, userRepository,
                currentUserService, authentication, paymentRepository, orderRepository);
    }

    private UserInvitation invitation(AppUser owner) {
        UserInvitation invitation = new UserInvitation();
        invitation.setId(10L);
        invitation.setUser(owner);
        return invitation;
    }

    private AppUser user(Long id) {
        AppUser user = new AppUser();
        user.setId(id);
        return user;
    }

    private record Fixture(
            DashboardReportService service,
            UserInvitationRepository invitationRepository,
            GuestRepository guestRepository,
            AppUserRepository userRepository,
            CurrentUserService currentUserService,
            Authentication authentication,
            TemplatePaymentOrderRepository paymentRepository,
            TemplateOrderRepository legacyOrderRepository
    ) {
    }
}
