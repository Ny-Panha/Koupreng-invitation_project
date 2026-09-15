package com.koupreng.backend.service;

import com.koupreng.backend.user.application.CurrentUserService;

import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.dto.admin.AdminUserResponse;
import com.koupreng.backend.dto.dashboard.AdminDashboardSummaryResponse;
import com.koupreng.backend.dto.dashboard.GuestStatusReportResponse;
import com.koupreng.backend.dto.dashboard.InvitationDashboardResponse;
import com.koupreng.backend.dto.dashboard.RsvpReportResponse;
import com.koupreng.backend.dto.dashboard.UserDashboardSummaryResponse;
import com.koupreng.backend.dto.guest.GuestResponse;
import com.koupreng.backend.dto.invitation.InvitationResponse;
import com.koupreng.backend.dto.invitation.InvitationSummaryResponse;
import com.koupreng.backend.dto.notification.NotificationResponse;
import com.koupreng.backend.dto.payment.TemplatePaymentStatusResponse;
import com.koupreng.backend.dto.rsvp.RsvpResponse;
import com.koupreng.backend.entity.invitation.Guest;
import com.koupreng.backend.template.domain.InvitationTemplate;
import com.koupreng.backend.entity.invitation.Rsvp;
import com.koupreng.backend.entity.invitation.UserInvitation;
import com.koupreng.backend.entity.payment.TemplateOrder;
import com.koupreng.backend.entity.payment.TemplatePaymentOrder;
import com.koupreng.backend.user.domain.AppUser;
import com.koupreng.backend.enums.InvitationStatus;
import com.koupreng.backend.enums.PaymentStatus;
import com.koupreng.backend.enums.RsvpStatus;
import com.koupreng.backend.user.infrastructure.persistence.AppUserRepository;
import com.koupreng.backend.repository.GuestRepository;
import com.koupreng.backend.template.infrastructure.persistence.InvitationTemplateRepository;
import com.koupreng.backend.repository.NotificationRepository;
import com.koupreng.backend.repository.RsvpRepository;
import com.koupreng.backend.repository.TemplateOrderRepository;
import com.koupreng.backend.repository.TemplatePaymentOrderRepository;
import com.koupreng.backend.repository.UserInvitationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
public class DashboardReportService {

    private final UserInvitationRepository invitationRepository;
    private final GuestRepository guestRepository;
    private final RsvpRepository rsvpRepository;
    private final NotificationRepository notificationRepository;
    private final TemplatePaymentOrderRepository templatePaymentOrderRepository;
    private final TemplateOrderRepository templateOrderRepository;
    private final AppUserRepository userRepository;
    private final InvitationTemplateRepository templateRepository;
    private final CurrentUserService currentUserService;

    public DashboardReportService(
            UserInvitationRepository invitationRepository,
            GuestRepository guestRepository,
            RsvpRepository rsvpRepository,
            NotificationRepository notificationRepository,
            TemplatePaymentOrderRepository templatePaymentOrderRepository,
            TemplateOrderRepository templateOrderRepository,
            AppUserRepository userRepository,
            InvitationTemplateRepository templateRepository,
            CurrentUserService currentUserService
    ) {
        this.invitationRepository = invitationRepository;
        this.guestRepository = guestRepository;
        this.rsvpRepository = rsvpRepository;
        this.notificationRepository = notificationRepository;
        this.templatePaymentOrderRepository = templatePaymentOrderRepository;
        this.templateOrderRepository = templateOrderRepository;
        this.userRepository = userRepository;
        this.templateRepository = templateRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
    public UserDashboardSummaryResponse getMyDashboard(Authentication authentication) {
        AppUser user = currentUserService.currentUser(authentication);
        List<UserInvitation> invitations = invitationRepository
                .findAllByUserIdAndDeletedFalseOrderByCreatedAtDesc(user.getId());
        List<Guest> guests = invitations.stream()
                .flatMap(invitation -> guestRepository.findByInvitationIdOrderByCreatedAtDesc(invitation.getId()).stream())
                .toList();
        List<Rsvp> rsvps = invitations.stream()
                .flatMap(invitation -> rsvpRepository.findByInvitationIdOrderByRespondedAtDesc(invitation.getId()).stream())
                .toList();
        List<TemplatePaymentOrder> templatePaymentOrders = templatePaymentOrderRepository
                .findByUserIdOrderByCreatedAtDesc(user.getId());
        List<TemplateOrder> legacyOrders = templateOrderRepository.findByUserIdOrderByCreatedAtDesc(user.getId());

        long totalPendingRsvp = invitations.stream()
                .mapToLong(invitation -> rsvpRepository.countPendingGuests(invitation.getId()))
                .sum();

        return UserDashboardSummaryResponse.builder()
                .totalInvitations(invitations.size())
                .publishedInvitations(countInvitations(invitations, InvitationStatus.PUBLISHED))
                .draftInvitations(countInvitations(invitations, InvitationStatus.DRAFT))
                .totalGuests(guests.size())
                .totalInvited(guests.stream().filter(this::isInvited).count())
                .totalResponded(rsvps.size())
                .totalAttending(countRsvps(rsvps, RsvpStatus.ATTENDING))
                .totalDeclined(countRsvps(rsvps, RsvpStatus.NOT_ATTENDING))
                .totalMaybe(countRsvps(rsvps, RsvpStatus.MAYBE))
                .totalPendingRsvp(totalPendingRsvp)
                .totalPayments(templatePaymentOrders.size() + legacyOrders.size())
                .totalRevenue(sumPaidTemplatePaymentOrders(templatePaymentOrders)
                        .add(sumPaidTemplateOrders(legacyOrders)))
                .recentInvitations(invitations.stream()
                        .limit(5)
                        .map(InvitationSummaryResponse::from)
                        .toList())
                .recentRsvps(rsvps.stream()
                        .sorted(byRespondedAtDesc())
                        .limit(5)
                        .map(RsvpResponse::from)
                        .toList())
                .recentNotifications(notificationRepository.findTop5ByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                        .map(NotificationResponse::from)
                        .toList())
                .build();
    }

    @Transactional(readOnly = true)
    public InvitationDashboardResponse getInvitationDashboard(Authentication authentication, Long invitationId) {
        UserInvitation invitation = requireInvitationForReport(authentication, invitationId);
        List<Guest> guests = guestRepository.findByInvitationIdOrderByGuestGroupAscTableNumberAscGuestNameAsc(invitationId);
        List<Rsvp> rsvps = rsvpRepository.findByInvitationIdOrderByRespondedAtDesc(invitationId);

        return InvitationDashboardResponse.builder()
                .invitationId(invitation.getId())
                .title(invitation.getTitle())
                .slug(invitation.getSlug())
                .status(invitation.getStatus())
                .eventDate(invitation.getEventDate())
                .totalGuests(guests.size())
                .totalInvited(guests.stream().filter(this::isInvited).count())
                .totalResponded(rsvps.size())
                .attending(countRsvps(rsvps, RsvpStatus.ATTENDING))
                .declined(countRsvps(rsvps, RsvpStatus.NOT_ATTENDING))
                .maybe(countRsvps(rsvps, RsvpStatus.MAYBE))
                .pending(rsvpRepository.countPendingGuests(invitationId))
                .totalWishes(rsvps.stream().filter(rsvp -> trimToNull(rsvp.getMessage()) != null).count())
                .totalContributions(sumGuestContributions(guests))
                .deliverySent(guests.stream().filter(guest -> statusEquals(guest.getSendStatus(), "SENT")).count())
                .deliveryFailed(guests.stream().filter(guest -> statusEquals(guest.getSendStatus(), "FAILED")).count())
                .openedCount(guests.stream().filter(guest -> guest.getInvitationViewedAt() != null).count())
                .build();
    }

    @Transactional(readOnly = true)
    public RsvpReportResponse getRsvpReport(Authentication authentication, Long invitationId) {
        requireInvitationForReport(authentication, invitationId);
        List<Rsvp> rsvps = rsvpRepository.findByInvitationIdOrderByRespondedAtDesc(invitationId);
        return RsvpReportResponse.builder()
                .invitationId(invitationId)
                .totalGuests(guestRepository.countByInvitationId(invitationId))
                .yesCount(countRsvps(rsvps, RsvpStatus.ATTENDING))
                .noCount(countRsvps(rsvps, RsvpStatus.NOT_ATTENDING))
                .maybeCount(countRsvps(rsvps, RsvpStatus.MAYBE))
                .pendingCount(rsvpRepository.countPendingGuests(invitationId))
                .attendeeTotal(rsvpRepository.sumAttendeeCountByInvitationIdAndStatus(invitationId, RsvpStatus.ATTENDING))
                .responses(rsvps.stream().map(RsvpResponse::from).toList())
                .build();
    }

    @Transactional(readOnly = true)
    public GuestStatusReportResponse getGuestStatusReport(Authentication authentication, Long invitationId) {
        requireInvitationForReport(authentication, invitationId);
        List<Guest> guests = guestRepository.findByInvitationIdOrderByGuestGroupAscTableNumberAscGuestNameAsc(invitationId);
        long responded = rsvpRepository.countByInvitationId(invitationId);
        return GuestStatusReportResponse.builder()
                .invitationId(invitationId)
                .totalGuests(guests.size())
                .ready(guests.stream().filter(this::isReady).count())
                .linkGenerated(guests.stream().filter(guest -> trimToNull(guest.getInviteToken()) != null).count())
                .sent(guests.stream().filter(guest -> statusEquals(guest.getSendStatus(), "SENT")).count())
                .delivered(guests.stream().filter(guest -> statusEquals(guest.getSendStatus(), "DELIVERED")).count())
                .failed(guests.stream().filter(guest -> statusEquals(guest.getSendStatus(), "FAILED")).count())
                .opened(guests.stream().filter(guest -> guest.getInvitationViewedAt() != null).count())
                .responded(responded)
                .notResponded(Math.max(0, guests.size() - responded))
                .guests(guests.stream().map(GuestResponse::from).toList())
                .build();
    }

    @Transactional(readOnly = true)
    public AdminDashboardSummaryResponse getAdminDashboard(Authentication authentication) {
        requireAdmin(authentication);
        List<AppUser> users = userRepository.findAllByOrderByCreatedAtDesc();
        List<InvitationTemplate> templates = templateRepository.findAllByOrderByCreatedAtDesc();
        List<UserInvitation> invitations = invitationRepository.findAllByDeletedFalseOrderByCreatedAtDesc();
        List<TemplatePaymentOrder> payments = templatePaymentOrderRepository.findAll();

        return AdminDashboardSummaryResponse.builder()
                .totalUsers(users.size())
                .activeUsers(users.stream().filter(AppUser::isActive).count())
                .inactiveUsers(users.stream().filter(user -> !user.isActive()).count())
                .totalTemplates(templates.size())
                .activeTemplates(templates.stream().filter(template -> statusEquals(template.getStatus(), "ACTIVE")).count())
                .premiumTemplates(templates.stream().filter(InvitationTemplate::isPremium).count())
                .totalInvitations(invitations.size())
                .publishedInvitations(countInvitations(invitations, InvitationStatus.PUBLISHED))
                .totalGuests(guestRepository.count())
                .totalRsvps(rsvpRepository.count())
                .totalPayments(payments.size())
                .totalRevenue(sumPaidTemplatePaymentOrders(payments))
                .failedPayments(payments.stream()
                        .filter(order -> order.getStatus() == PaymentStatus.FAILED || order.getStatus() == PaymentStatus.REJECTED)
                        .count())
                .recentUsers(users.stream().limit(5).map(AdminUserResponse::from).toList())
                .recentInvitations(invitations.stream().limit(5).map(InvitationResponse::from).toList())
                .recentPayments(payments.stream()
                        .sorted(byPaymentCreatedAtDesc())
                        .limit(5)
                        .map(order -> TemplatePaymentStatusResponse.from(order, "Payment status"))
                        .toList())
                .systemHealthSummary("OK")
                .build();
    }

    @Transactional(readOnly = true)
    public String exportGuestReportCsv(Authentication authentication, Long invitationId) {
        GuestStatusReportResponse report = getGuestStatusReport(authentication, invitationId);
        Map<Long, Rsvp> rsvpsByGuestId = rsvpRepository.findByInvitationIdOrderByRespondedAtDesc(invitationId).stream()
                .filter(rsvp -> rsvp.getGuest() != null && rsvp.getGuest().getId() != null)
                .collect(java.util.stream.Collectors.toMap(
                        rsvp -> rsvp.getGuest().getId(),
                        rsvp -> rsvp,
                        (left, right) -> left
                ));
        StringBuilder csv = new StringBuilder();
        csv.append("guestId,guestName,email,phone,group,seatCount,tableNumber,sendStatus,rsvpStatus,attendeeCount,lastSentAt,openedAt,contributionStatus,totalContributed\n");
        for (GuestResponse guest : report.getGuests()) {
            Rsvp rsvp = rsvpsByGuestId.get(guest.getId());
            csv.append(csvValue(guest.getId()))
                    .append(',').append(csvValue(guest.getGuestName()))
                    .append(',').append(csvValue(guest.getEmail()))
                    .append(',').append(csvValue(guest.getPhone()))
                    .append(',').append(csvValue(guest.getGuestGroup()))
                    .append(',').append(csvValue(guest.getSeatCount()))
                    .append(',').append(csvValue(guest.getTableNumber()))
                    .append(',').append(csvValue(guest.getSendStatus()))
                    .append(',').append(csvValue(rsvp == null ? null : rsvp.getResponseStatus()))
                    .append(',').append(csvValue(rsvp == null ? null : rsvp.getAttendeeCount()))
                    .append(',').append(csvValue(guest.getLastSentAt()))
                    .append(',').append(csvValue(guest.getInvitationViewedAt()))
                    .append(',').append(csvValue(guest.getContributionStatus()))
                    .append(',').append(csvValue(guest.getTotalContributed()))
                    .append('\n');
        }
        return csv.toString();
    }

    @Transactional(readOnly = true)
    public String exportRsvpReportCsv(Authentication authentication, Long invitationId) {
        RsvpReportResponse report = getRsvpReport(authentication, invitationId);
        StringBuilder csv = new StringBuilder();
        csv.append("rsvpId,guestId,guestName,status,attendeeCount,message,respondedAt\n");
        for (RsvpResponse rsvp : report.getResponses()) {
            csv.append(csvValue(rsvp.getId()))
                    .append(',').append(csvValue(rsvp.getGuestId()))
                    .append(',').append(csvValue(rsvp.getGuestName()))
                    .append(',').append(csvValue(rsvp.getResponseStatus()))
                    .append(',').append(csvValue(rsvp.getAttendeeCount()))
                    .append(',').append(csvValue(rsvp.getMessage()))
                    .append(',').append(csvValue(rsvp.getRespondedAt()))
                    .append('\n');
        }
        return csv.toString();
    }

    private UserInvitation requireInvitationForReport(Authentication authentication, Long invitationId) {
        AppUser user = currentUserService.currentUser(authentication);
        UserInvitation invitation = invitationRepository.findByIdAndDeletedFalse(invitationId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Invitation not found"));
        if (!isAdmin(authentication)
                && (invitation.getUser() == null || !Objects.equals(invitation.getUser().getId(), user.getId()))) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You do not have access to this invitation");
        }
        return invitation;
    }

    private void requireAdmin(Authentication authentication) {
        currentUserService.currentUser(authentication);
        if (!isAdmin(authentication)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Admin access is required");
        }
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication != null
                && authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ROLE_ADMIN"::equals);
    }

    private long countInvitations(List<UserInvitation> invitations, InvitationStatus status) {
        return invitations.stream()
                .filter(invitation -> invitation.getStatus() == status)
                .count();
    }

    private long countRsvps(List<Rsvp> rsvps, RsvpStatus status) {
        return rsvps.stream()
                .filter(rsvp -> rsvp.getResponseStatus() == status)
                .count();
    }

    private BigDecimal sumGuestContributions(List<Guest> guests) {
        return guests.stream()
                .map(Guest::getTotalContributed)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal sumPaidTemplatePaymentOrders(List<TemplatePaymentOrder> orders) {
        return orders.stream()
                .filter(order -> order.getStatus() == PaymentStatus.PAID)
                .map(order -> order.getPaidAmount() == null ? order.getAmount() : order.getPaidAmount())
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal sumPaidTemplateOrders(List<TemplateOrder> orders) {
        return orders.stream()
                .filter(order -> order.getStatus() == PaymentStatus.PAID)
                .map(order -> order.getPaidAmount() == null ? order.getAmount() : order.getPaidAmount())
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private boolean isReady(Guest guest) {
        return trimToNull(guest.getGuestName()) != null
                && (trimToNull(guest.getEmail()) != null || trimToNull(guest.getPhone()) != null);
    }

    private boolean isInvited(Guest guest) {
        return trimToNull(guest.getInviteToken()) != null
                || trimToNull(guest.getQrCodeUrl()) != null
                || trimToNull(guest.getSendStatus()) != null;
    }

    private boolean statusEquals(String value, String expected) {
        return value != null && value.trim().equalsIgnoreCase(expected);
    }

    private Comparator<Rsvp> byRespondedAtDesc() {
        return Comparator.comparing(
                Rsvp::getRespondedAt,
                Comparator.nullsLast(Comparator.naturalOrder())
        ).reversed();
    }

    private Comparator<TemplatePaymentOrder> byPaymentCreatedAtDesc() {
        return Comparator.comparing(
                TemplatePaymentOrder::getCreatedAt,
                Comparator.nullsLast(Comparator.naturalOrder())
        ).reversed();
    }

    private String csvValue(Object value) {
        if (value == null) {
            return "";
        }
        String text = value instanceof java.time.Instant ? value.toString() : String.valueOf(value);
        if (text.contains(",") || text.contains("\"") || text.contains("\n")) {
            return "\"" + text.replace("\"", "\"\"") + "\"";
        }
        return text;
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
