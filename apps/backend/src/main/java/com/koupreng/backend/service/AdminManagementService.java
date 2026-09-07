package com.koupreng.backend.service;

import com.koupreng.backend.common.ApiException;
import com.koupreng.backend.dto.admin.AdminInvitationModerationRequest;
import com.koupreng.backend.dto.admin.AdminReportResponse;
import com.koupreng.backend.dto.admin.AdminTemplatePremiumRequest;
import com.koupreng.backend.dto.admin.AdminTemplateRequest;
import com.koupreng.backend.dto.admin.AdminTemplateResponse;
import com.koupreng.backend.dto.admin.AdminUserResponse;
import com.koupreng.backend.dto.admin.SystemAuditLogResponse;
import com.koupreng.backend.dto.checkin.CheckInResponse;
import com.koupreng.backend.dto.invitation.InvitationResponse;
import com.koupreng.backend.dto.payment.TemplatePaymentStatusResponse;
import com.koupreng.backend.dto.rsvp.RsvpResponse;
import com.koupreng.backend.entity.audit.SystemAuditLog;
import com.koupreng.backend.entity.invitation.GuestCheckIn;
import com.koupreng.backend.entity.invitation.InvitationTemplate;
import com.koupreng.backend.entity.invitation.TemplateCategory;
import com.koupreng.backend.entity.invitation.UserInvitation;
import com.koupreng.backend.entity.payment.TemplatePaymentOrder;
import com.koupreng.backend.entity.user.AppUser;
import com.koupreng.backend.entity.user.Role;
import com.koupreng.backend.enums.InvitationModerationStatus;
import com.koupreng.backend.enums.InvitationStatus;
import com.koupreng.backend.enums.NotificationStatus;
import com.koupreng.backend.enums.PaymentStatus;
import com.koupreng.backend.repository.AppUserRepository;
import com.koupreng.backend.repository.GuestCheckInRepository;
import com.koupreng.backend.repository.GuestRepository;
import com.koupreng.backend.repository.InvitationTemplateRepository;
import com.koupreng.backend.repository.NotificationRepository;
import com.koupreng.backend.repository.RsvpRepository;
import com.koupreng.backend.repository.SystemAuditLogRepository;
import com.koupreng.backend.repository.TemplatePaymentOrderRepository;
import com.koupreng.backend.repository.UserInvitationRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Comparator;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;

@Service
public class AdminManagementService {

    private static final String STATUS_ACTIVE = AppUser.STATUS_ACTIVE;
    private static final String STATUS_DISABLED = AppUser.STATUS_DISABLED;
    private static final String TEMPLATE_STATUS_ACTIVE = "ACTIVE";
    private static final String TEMPLATE_STATUS_INACTIVE = "INACTIVE";
    private static final String KEEP_TEMPLATE_CODE = "garden-royal-khmer-wedding";

    private final AppUserRepository userRepository;
    private final UserInvitationRepository invitationRepository;
    private final InvitationTemplateRepository templateRepository;
    private final TemplatePaymentOrderRepository paymentOrderRepository;
    private final RsvpRepository rsvpRepository;
    private final GuestRepository guestRepository;
    private final GuestCheckInRepository guestCheckInRepository;
    private final NotificationRepository notificationRepository;
    private final SystemAuditLogRepository systemAuditLogRepository;
    private final AuditLogService auditLogService;
    private final UserAuthCacheService userAuthCacheService;

    public AdminManagementService(
            AppUserRepository userRepository,
            UserInvitationRepository invitationRepository,
            InvitationTemplateRepository templateRepository,
            TemplatePaymentOrderRepository paymentOrderRepository,
            RsvpRepository rsvpRepository,
            GuestRepository guestRepository,
            GuestCheckInRepository guestCheckInRepository,
            NotificationRepository notificationRepository,
            SystemAuditLogRepository systemAuditLogRepository,
            AuditLogService auditLogService,
            UserAuthCacheService userAuthCacheService
    ) {
        this.userRepository = userRepository;
        this.invitationRepository = invitationRepository;
        this.templateRepository = templateRepository;
        this.paymentOrderRepository = paymentOrderRepository;
        this.rsvpRepository = rsvpRepository;
        this.guestRepository = guestRepository;
        this.guestCheckInRepository = guestCheckInRepository;
        this.notificationRepository = notificationRepository;
        this.systemAuditLogRepository = systemAuditLogRepository;
        this.auditLogService = auditLogService;
        this.userAuthCacheService = userAuthCacheService;
    }

    @Transactional(readOnly = true)
    public List<AdminUserResponse> listUsers() {
        return userRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(AdminUserResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public AdminUserResponse getUser(Long userId) {
        return AdminUserResponse.from(requireUser(userId));
    }

    @Transactional
    public AdminUserResponse activateUser(Authentication authentication, Long userId, HttpServletRequest request) {
        AppUser user = requireUser(userId);
        user.setStatus(STATUS_ACTIVE);
        user.incrementTokenVersion();
        userAuthCacheService.evict(userId);
        auditLogService.logAdminAction(authentication, "USER_ACTIVATED", "USER", userId,
                "Activated user account", request, Map.of("status", STATUS_ACTIVE));
        return AdminUserResponse.from(user);
    }

    @Transactional
    public AdminUserResponse deactivateUser(Authentication authentication, Long userId, HttpServletRequest request) {
        AppUser user = requireUser(userId);
        ensureNotLastActiveAdmin(user);
        user.setStatus(STATUS_DISABLED);
        user.incrementTokenVersion();
        userAuthCacheService.evict(userId);
        auditLogService.logAdminAction(authentication, "USER_DEACTIVATED", "USER", userId,
                "Deactivated user account", request, Map.of("status", STATUS_DISABLED));
        return AdminUserResponse.from(user);
    }

    @Transactional
    public AdminUserResponse updateUserRole(
            Authentication authentication,
            Long userId,
            Role role,
            HttpServletRequest request
    ) {
        AppUser user = requireUser(userId);
        if (user.getRole() == Role.ADMIN && role != Role.ADMIN && userRepository.countByRole(Role.ADMIN) <= 1) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "At least one admin account is required");
        }
        Role previousRole = user.getRole();
        user.setRole(role);
        user.incrementTokenVersion();
        userAuthCacheService.evict(userId);
        auditLogService.logAdminAction(authentication, "USER_ROLE_CHANGED", "USER", userId,
                "Changed user role", request, Map.of("from", previousRole, "to", role));
        return AdminUserResponse.from(user);
    }

    @Transactional(readOnly = true)
    public List<InvitationResponse> listUserInvitations(Long userId) {
        requireUser(userId);
        return invitationRepository.findAllByUserIdAndDeletedFalseOrderByCreatedAtDesc(userId).stream()
                .map(InvitationResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AdminTemplateResponse> listTemplates() {
        return templateRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(AdminTemplateResponse::from)
                .toList();
    }

    @Transactional
    public AdminTemplateResponse createTemplate(
            Authentication authentication,
            AdminTemplateRequest requestBody,
            HttpServletRequest request
    ) {
        InvitationTemplate template = new InvitationTemplate();
        applyTemplateRequest(template, requestBody);
        if (template.getCode() == null || template.getCode().isBlank()) {
            template.setCode("template-" + System.currentTimeMillis());
        }
        if (template.getCategory() == null) {
            template.setCategory(TemplateCategory.TRADITIONAL);
        }
        if (template.getStatus() == null || template.getStatus().isBlank()) {
            template.setStatus(TEMPLATE_STATUS_ACTIVE);
        }
        InvitationTemplate saved = templateRepository.save(template);
        auditLogService.logAdminAction(authentication, "TEMPLATE_CREATED", "TEMPLATE", saved.getId(),
                "Created template", request, Map.of("name", saved.getName()));
        return AdminTemplateResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public AdminTemplateResponse getTemplate(Long templateId) {
        return AdminTemplateResponse.from(requireTemplate(templateId));
    }

    @Transactional
    public AdminTemplateResponse updateTemplate(
            Authentication authentication,
            Long templateId,
            AdminTemplateRequest requestBody,
            HttpServletRequest request
    ) {
        InvitationTemplate template = requireTemplate(templateId);
        applyTemplateRequest(template, requestBody);
        InvitationTemplate saved = templateRepository.save(template);
        auditLogService.logAdminAction(authentication, "TEMPLATE_UPDATED", "TEMPLATE", templateId,
                "Updated template", request, Map.of("name", saved.getName()));
        return AdminTemplateResponse.from(saved);
    }

    @Transactional
    public AdminTemplateResponse activateTemplate(Authentication authentication, Long templateId, HttpServletRequest request) {
        InvitationTemplate template = requireTemplate(templateId);
        template.setStatus(TEMPLATE_STATUS_ACTIVE);
        InvitationTemplate saved = templateRepository.save(template);
        auditLogService.logAdminAction(authentication, "TEMPLATE_ACTIVATED", "TEMPLATE", templateId,
                "Activated template", request, Map.of("status", TEMPLATE_STATUS_ACTIVE));
        return AdminTemplateResponse.from(saved);
    }

    @Transactional
    public AdminTemplateResponse deactivateTemplate(Authentication authentication, Long templateId, HttpServletRequest request) {
        InvitationTemplate template = requireTemplate(templateId);
        template.setStatus(TEMPLATE_STATUS_INACTIVE);
        InvitationTemplate saved = templateRepository.save(template);
        auditLogService.logAdminAction(authentication, "TEMPLATE_DEACTIVATED", "TEMPLATE", templateId,
                "Deactivated template", request, Map.of("status", TEMPLATE_STATUS_INACTIVE));
        return AdminTemplateResponse.from(saved);
    }

    @Transactional
    public AdminTemplateResponse updateTemplatePremium(
            Authentication authentication,
            Long templateId,
            AdminTemplatePremiumRequest requestBody,
            HttpServletRequest request
    ) {
        InvitationTemplate template = requireTemplate(templateId);
        boolean isPremium = requestBody == null || requestBody.getPremium() == null || Boolean.TRUE.equals(requestBody.getPremium());
        template.setPremium(isPremium);
        InvitationTemplate saved = templateRepository.save(template);
        auditLogService.logAdminAction(authentication, "TEMPLATE_PREMIUM_CHANGED", "TEMPLATE", templateId,
                "Updated template premium flag", request, Map.of("premium", isPremium));
        return AdminTemplateResponse.from(saved);
    }

    @Transactional
    public void deleteTemplate(Authentication authentication, Long templateId, HttpServletRequest request) {
        InvitationTemplate template = requireTemplate(templateId);
        templateRepository.delete(template);
        auditLogService.logAdminAction(authentication, "TEMPLATE_DELETED", "TEMPLATE", templateId,
                "Deleted template", request, Map.of("name", template.getName()));
    }

    @Transactional(readOnly = true)
    public List<InvitationResponse> listInvitations() {
        return invitationRepository.findAllByDeletedFalseOrderByCreatedAtDesc().stream()
                .map(InvitationResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public InvitationResponse getInvitation(Long invitationId) {
        return InvitationResponse.from(requireInvitation(invitationId));
    }

    @Transactional
    public InvitationResponse moderateInvitation(
            Authentication authentication,
            Long invitationId,
            AdminInvitationModerationRequest requestBody,
            HttpServletRequest request
    ) {
        UserInvitation invitation = requireInvitation(invitationId);
        invitation.setModerationStatus(requestBody.getStatus());
        if (requestBody.getStatus() == InvitationModerationStatus.DELETED) {
            invitation.setDeleted(true);
            invitation.setStatus(InvitationStatus.ARCHIVED);
        }
        auditLogService.logAdminAction(authentication, "INVITATION_MODERATED", "INVITATION", invitationId,
                trimOrDefault(requestBody.getReason(), "Changed invitation moderation status"),
                request,
                Map.of("status", requestBody.getStatus()));
        return InvitationResponse.from(invitation);
    }

    @Transactional
    public InvitationResponse activateInvitation(Authentication authentication, Long invitationId, HttpServletRequest request) {
        UserInvitation invitation = requireInvitation(invitationId);
        invitation.setModerationStatus(InvitationModerationStatus.ACTIVE);
        auditLogService.logAdminAction(authentication, "INVITATION_ACTIVATED", "INVITATION", invitationId,
                "Activated invitation moderation status", request, Map.of("moderationStatus", InvitationModerationStatus.ACTIVE));
        return InvitationResponse.from(invitation);
    }

    @Transactional
    public InvitationResponse deactivateInvitation(Authentication authentication, Long invitationId, HttpServletRequest request) {
        UserInvitation invitation = requireInvitation(invitationId);
        invitation.setModerationStatus(InvitationModerationStatus.HIDDEN);
        auditLogService.logAdminAction(authentication, "INVITATION_DEACTIVATED", "INVITATION", invitationId,
                "Hidden invitation from moderation", request, Map.of("moderationStatus", InvitationModerationStatus.HIDDEN));
        return InvitationResponse.from(invitation);
    }

    @Transactional(readOnly = true)
    public AdminReportResponse usersReport() {
        List<AdminUserResponse> rows = listUsers();
        return AdminReportResponse.builder()
                .report("users")
                .generatedAt(Instant.now())
                .summary(Map.of(
                        "totalUsers", rows.size(),
                        "activeUsers", rows.stream().filter(AdminUserResponse::isActive).count(),
                        "adminUsers", rows.stream().filter(user -> user.getRole() == Role.ADMIN).count()
                ))
                .rows(rows)
                .build();
    }

    @Transactional(readOnly = true)
    public AdminReportResponse invitationsReport() {
        List<InvitationResponse> rows = listInvitations();
        return AdminReportResponse.builder()
                .report("invitations")
                .generatedAt(Instant.now())
                .summary(Map.of(
                        "totalInvitations", rows.size(),
                        "publishedInvitations", rows.stream().filter(row -> row.getStatus() == InvitationStatus.PUBLISHED).count(),
                        "hiddenInvitations", rows.stream()
                                .filter(row -> row.getModerationStatus() == InvitationModerationStatus.HIDDEN)
                                .count()
                ))
                .rows(rows)
                .build();
    }

    @Transactional(readOnly = true)
    public AdminReportResponse paymentsReport() {
        List<TemplatePaymentOrder> orders = paymentOrderRepository.findAll();
        List<TemplatePaymentStatusResponse> rows = orders.stream()
                .sorted(paymentOrderComparator())
                .map(order -> TemplatePaymentStatusResponse.from(order, "Payment status"))
                .toList();
        BigDecimal revenue = orders.stream()
                .filter(order -> order.getStatus() == PaymentStatus.PAID)
                .map(order -> order.getPaidAmount() == null ? order.getAmount() : order.getPaidAmount())
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return AdminReportResponse.builder()
                .report("payments")
                .generatedAt(Instant.now())
                .summary(Map.of(
                        "totalPayments", orders.size(),
                        "paidPayments", orders.stream().filter(order -> order.getStatus() == PaymentStatus.PAID).count(),
                        "failedPayments", orders.stream()
                                .filter(order -> order.getStatus() == PaymentStatus.FAILED || order.getStatus() == PaymentStatus.REJECTED)
                                .count(),
                        "totalRevenue", revenue
                ))
                .rows(rows)
                .build();
    }

    @Transactional(readOnly = true)
    public AdminReportResponse rsvpReport() {
        List<RsvpResponse> rows = rsvpRepository.findAll().stream()
                .map(RsvpResponse::from)
                .toList();
        return AdminReportResponse.builder()
                .report("rsvp")
                .generatedAt(Instant.now())
                .summary(Map.of(
                        "totalRsvps", rows.size(),
                        "attending", rows.stream().filter(row -> row.getResponseStatus() == com.koupreng.backend.enums.RsvpStatus.ATTENDING).count(),
                        "declined", rows.stream().filter(row -> row.getResponseStatus() == com.koupreng.backend.enums.RsvpStatus.NOT_ATTENDING).count(),
                        "maybe", rows.stream().filter(row -> row.getResponseStatus() == com.koupreng.backend.enums.RsvpStatus.MAYBE).count()
                ))
                .rows(rows)
                .build();
    }

    @Transactional(readOnly = true)
    public AdminReportResponse systemReport() {
        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalUsers", userRepository.count());
        summary.put("totalInvitations", invitationRepository.count());
        summary.put("totalGuests", guestRepository.count());
        summary.put("totalRsvps", rsvpRepository.count());
        summary.put("totalNotifications", notificationRepository.count());
        summary.put("failedNotifications", notificationRepository.countByStatus(NotificationStatus.FAILED));
        return AdminReportResponse.builder()
                .report("system")
                .generatedAt(Instant.now())
                .summary(summary)
                .rows(List.of())
                .build();
    }

    @Transactional(readOnly = true)
    public AdminReportResponse analyticsOverview() {
        List<UserInvitation> invitations = invitationRepository.findAllByDeletedFalseOrderByCreatedAtDesc();
        List<TemplatePaymentOrder> orders = paymentOrderRepository.findAll();
        BigDecimal revenue = orders.stream()
                .filter(order -> order.getStatus() == PaymentStatus.PAID)
                .map(order -> order.getPaidAmount() == null ? order.getAmount() : order.getPaidAmount())
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        long totalGuests = guestRepository.count();
        long totalRsvps = rsvpRepository.count();

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalUsers", userRepository.count());
        summary.put("activeUsers", userRepository.findAll().stream().filter(AppUser::isActive).count());
        summary.put("totalInvitations", invitations.size());
        summary.put("publishedInvitations", countInvitations(invitations, InvitationStatus.PUBLISHED));
        summary.put("totalGuests", totalGuests);
        summary.put("totalRsvps", totalRsvps);
        summary.put("rsvpConversion", totalGuests == 0 ? 0 : (double) totalRsvps / totalGuests);
        summary.put("totalRevenue", revenue);
        summary.put("failedPayments", orders.stream()
                .filter(order -> order.getStatus() == PaymentStatus.FAILED || order.getStatus() == PaymentStatus.REJECTED)
                .count());
        return AdminReportResponse.builder()
                .report("analytics-overview")
                .generatedAt(Instant.now())
                .summary(summary)
                .rows(invitations.stream().limit(10).map(InvitationResponse::from).toList())
                .build();
    }

    @Transactional(readOnly = true)
    public AdminReportResponse analyticsRevenue() {
        return paymentsReport();
    }

    @Transactional(readOnly = true)
    public AdminReportResponse analyticsTemplates() {
        List<AdminTemplateResponse> templates = listTemplates();
        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalTemplates", templates.size());
        summary.put("activeTemplates", templates.stream().filter(template -> statusEquals(template.getStatus(), TEMPLATE_STATUS_ACTIVE)).count());
        summary.put("premiumTemplates", templates.stream().filter(AdminTemplateResponse::isPremium).count());
        return AdminReportResponse.builder()
                .report("analytics-templates")
                .generatedAt(Instant.now())
                .summary(summary)
                .rows(templates)
                .build();
    }

    @Transactional(readOnly = true)
    public AdminReportResponse analyticsDelivery() {
        List<com.koupreng.backend.entity.invitation.Guest> guests = guestRepository.findAll();
        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalGuests", guests.size());
        summary.put("sent", guests.stream().filter(guest -> statusEquals(guest.getSendStatus(), "SENT")).count());
        summary.put("delivered", guests.stream().filter(guest -> statusEquals(guest.getSendStatus(), "DELIVERED")).count());
        summary.put("failed", guests.stream().filter(guest -> statusEquals(guest.getSendStatus(), "FAILED")).count());
        summary.put("opened", guests.stream().filter(guest -> guest.getInvitationViewedAt() != null).count());
        summary.put("failedNotifications", notificationRepository.countByStatus(NotificationStatus.FAILED));
        return AdminReportResponse.builder()
                .report("analytics-delivery")
                .generatedAt(Instant.now())
                .summary(summary)
                .rows(List.of())
                .build();
    }

    @Transactional(readOnly = true)
    public AdminReportResponse analyticsRsvp() {
        List<RsvpResponse> rows = rsvpRepository.findAll().stream()
                .map(RsvpResponse::from)
                .toList();
        long totalGuests = guestRepository.count();
        long attending = rows.stream()
                .filter(row -> row.getResponseStatus() == com.koupreng.backend.enums.RsvpStatus.ATTENDING)
                .count();
        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalGuests", totalGuests);
        summary.put("totalRsvps", rows.size());
        summary.put("attending", attending);
        summary.put("declined", rows.stream()
                .filter(row -> row.getResponseStatus() == com.koupreng.backend.enums.RsvpStatus.NOT_ATTENDING)
                .count());
        summary.put("maybe", rows.stream()
                .filter(row -> row.getResponseStatus() == com.koupreng.backend.enums.RsvpStatus.MAYBE)
                .count());
        summary.put("rsvpConversion", totalGuests == 0 ? 0 : (double) rows.size() / totalGuests);
        summary.put("attendingRate", totalGuests == 0 ? 0 : (double) attending / totalGuests);
        return AdminReportResponse.builder()
                .report("analytics-rsvp")
                .generatedAt(Instant.now())
                .summary(summary)
                .rows(rows)
                .build();
    }

    @Transactional(readOnly = true)
    public AdminReportResponse analyticsCheckIn() {
        List<GuestCheckIn> checkIns = guestCheckInRepository.findAll().stream()
                .sorted(Comparator.comparing(
                        GuestCheckIn::getCheckedInAt,
                        Comparator.nullsLast(Comparator.naturalOrder())
                ).reversed())
                .toList();
        long totalGuests = guestRepository.count();
        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalGuests", totalGuests);
        summary.put("checkedIn", checkIns.size());
        summary.put("remaining", Math.max(0, totalGuests - checkIns.size()));
        summary.put("checkInRate", totalGuests == 0 ? 0 : (double) checkIns.size() / totalGuests);
        return AdminReportResponse.builder()
                .report("analytics-check-in")
                .generatedAt(Instant.now())
                .summary(summary)
                .rows(checkIns.stream().limit(50).map(checkIn -> CheckInResponse.from(checkIn, false)).toList())
                .build();
    }

    @Transactional(readOnly = true)
    public AdminReportResponse systemHealth() {
        long failedNotifications = notificationRepository.countByStatus(NotificationStatus.FAILED);
        List<TemplatePaymentOrder> orders = paymentOrderRepository.findAll();
        long pendingPayments = orders.stream()
                .filter(order -> order.getStatus() == PaymentStatus.PENDING
                        || order.getStatus() == PaymentStatus.PAID_PENDING_REVIEW)
                .count();
        long rejectedPayments = orders.stream()
                .filter(order -> order.getStatus() == PaymentStatus.REJECTED
                        || order.getStatus() == PaymentStatus.FAILED)
                .count();

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("status", failedNotifications > 0 || rejectedPayments > 0 ? "WARN" : "OK");
        summary.put("totalUsers", userRepository.count());
        summary.put("totalInvitations", invitationRepository.count());
        summary.put("failedNotifications", failedNotifications);
        summary.put("pendingPayments", pendingPayments);
        summary.put("rejectedPayments", rejectedPayments);
        summary.put("auditLogEvents", systemAuditLogRepository.count());
        return AdminReportResponse.builder()
                .report("system-health")
                .generatedAt(Instant.now())
                .summary(summary)
                .rows(List.of())
                .build();
    }

    @Transactional(readOnly = true)
    public List<SystemAuditLogResponse> recentAuditLogs() {
        return systemAuditLogRepository.findTop100ByOrderByCreatedAtDesc().stream()
                .map(SystemAuditLogResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public AdminReportResponse alerts() {
        List<Map<String, Object>> rows = new ArrayList<>();
        long failedNotifications = notificationRepository.countByStatus(NotificationStatus.FAILED);
        if (failedNotifications > 0) {
            rows.add(Map.of(
                    "severity", "WARNING",
                    "title", "Failed notifications",
                    "count", failedNotifications,
                    "description", "One or more notifications failed delivery."
            ));
        }
        long pendingReviews = paymentOrderRepository.findAll().stream()
                .filter(order -> order.getStatus() == PaymentStatus.PAID_PENDING_REVIEW)
                .count();
        if (pendingReviews > 0) {
            rows.add(Map.of(
                    "severity", "INFO",
                    "title", "Payments waiting for review",
                    "count", pendingReviews,
                    "description", "Template payments were detected but need admin review."
            ));
        }
        long recentSystemEvents = systemAuditLogRepository.findTop100ByOrderByCreatedAtDesc().stream()
                .filter(this::isHighSignalSystemEvent)
                .count();
        if (recentSystemEvents > 0) {
            rows.add(Map.of(
                    "severity", "INFO",
                    "title", "Recent system events",
                    "count", recentSystemEvents,
                    "description", "Recent system audit events are available for review."
            ));
        }
        if (rows.isEmpty()) {
            rows.add(Map.of(
                    "severity", "OK",
                    "title", "No active alerts",
                    "count", 0,
                    "description", "No failed delivery or payment review alerts are active."
            ));
        }

        return AdminReportResponse.builder()
                .report("alerts")
                .generatedAt(Instant.now())
                .summary(Map.of("totalAlerts", rows.size()))
                .rows(rows)
                .build();
    }

    private boolean isHighSignalSystemEvent(SystemAuditLog log) {
        return log.getAction() != null
                && (log.getAction().contains("CHECKED_IN")
                || log.getAction().contains("PAYMENT")
                || log.getAction().contains("FAILED"));
    }

    private void applyTemplateRequest(InvitationTemplate template, AdminTemplateRequest requestBody) {
        template.setName(trimOrDefault(requestBody.getName(), "Untitled template"));
        template.setCategory(requestBody.getCategory());
        template.setThumbnailUrl(trimToNull(requestBody.getThumbnailUrl()));
        template.setPreviewUrl(trimToNull(requestBody.getPreviewUrl()));
        if (requestBody.getCode() != null) {
            template.setCode(trimToNull(requestBody.getCode()));
        }
        if (requestBody.getDescription() != null) {
            template.setDescription(trimToNull(requestBody.getDescription()));
        }
        if (requestBody.getPrice() != null) {
            template.setPrice(requestBody.getPrice());
        }
        if (requestBody.getCurrency() != null) {
            template.setCurrency(trimToNull(requestBody.getCurrency()));
        }
        if (requestBody.getSortOrder() != null) {
            template.setSortOrder(requestBody.getSortOrder());
        }
        if (requestBody.getPremium() != null) {
            template.setPremium(requestBody.getPremium());
        }
        if (requestBody.getStatus() != null && !requestBody.getStatus().isBlank()) {
            template.setStatus(requestBody.getStatus().trim().toUpperCase(Locale.ROOT));
        }
    }

    private AppUser requireUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private long countInvitations(List<UserInvitation> invitations, InvitationStatus status) {
        return invitations.stream()
                .filter(invitation -> invitation.getStatus() == status)
                .count();
    }

    private boolean statusEquals(String value, String expected) {
        return value != null && value.trim().equalsIgnoreCase(expected);
    }

    private InvitationTemplate requireTemplate(Long templateId) {
        return templateRepository.findById(templateId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Template not found"));
    }

    private UserInvitation requireInvitation(Long invitationId) {
        return invitationRepository.findByIdAndDeletedFalse(invitationId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Invitation not found"));
    }

    private void ensureNotLastActiveAdmin(AppUser user) {
        if (user.getRole() != Role.ADMIN) {
            return;
        }
        long activeAdmins = userRepository.findAll().stream()
                .filter(candidate -> candidate.getRole() == Role.ADMIN)
                .filter(AppUser::isActive)
                .count();
        if (activeAdmins <= 1) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "At least one active admin account is required");
        }
    }

    private Comparator<TemplatePaymentOrder> paymentOrderComparator() {
        return Comparator.comparing(
                TemplatePaymentOrder::getCreatedAt,
                Comparator.nullsLast(Comparator.naturalOrder())
        ).reversed();
    }

    private String trimOrDefault(String value, String defaultValue) {
        String trimmed = trimToNull(value);
        return trimmed == null ? defaultValue : trimmed;
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
