package com.koupreng.backend.admin.application;

import com.koupreng.backend.auth.infrastructure.session.UserAuthCacheService;

import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.admin.api.dto.AdminCreateUserRequest;
import com.koupreng.backend.admin.api.dto.AdminInvitationModerationRequest;
import com.koupreng.backend.admin.api.dto.AdminReportResponse;
import com.koupreng.backend.admin.api.dto.AdminTemplatePremiumRequest;
import com.koupreng.backend.admin.api.dto.AdminTemplateRequest;
import com.koupreng.backend.admin.api.dto.AdminTemplateResponse;
import com.koupreng.backend.admin.api.dto.AdminUserResponse;
import com.koupreng.backend.audit.api.dto.SystemAuditLogResponse;
import com.koupreng.backend.invitation.api.dto.InvitationResponse;
import com.koupreng.backend.rsvp.api.dto.RsvpResponse;
import com.koupreng.backend.rsvp.domain.RsvpStatus;
import com.koupreng.backend.audit.domain.SystemAuditLog;
import com.koupreng.backend.template.domain.InvitationTemplate;
import com.koupreng.backend.template.domain.TemplateCategory;
import com.koupreng.backend.invitation.domain.UserInvitation;
import com.koupreng.backend.payment.domain.TemplatePaymentOrder;
import com.koupreng.backend.user.domain.AppUser;
import com.koupreng.backend.user.domain.Role;
import com.koupreng.backend.invitation.domain.InvitationModerationStatus;
import com.koupreng.backend.invitation.domain.InvitationStatus;
import com.koupreng.backend.notification.domain.NotificationStatus;
import com.koupreng.backend.payment.domain.PaymentStatus;
import com.koupreng.backend.user.infrastructure.persistence.AppUserRepository;
import com.koupreng.backend.checkin.infrastructure.persistence.GuestCheckInRepository;
import com.koupreng.backend.guest.infrastructure.persistence.GuestRepository;
import com.koupreng.backend.template.infrastructure.persistence.InvitationTemplateRepository;
import com.koupreng.backend.notification.infrastructure.persistence.NotificationRepository;
import com.koupreng.backend.rsvp.infrastructure.persistence.RsvpRepository;
import com.koupreng.backend.audit.infrastructure.persistence.SystemAuditLogRepository;
import com.koupreng.backend.audit.application.AuditLogService;
import com.koupreng.backend.payment.infrastructure.persistence.TemplatePaymentOrderRepository;
import com.koupreng.backend.subscription.infrastructure.persistence.SubscriptionRepository;
import com.koupreng.backend.invitation.infrastructure.persistence.UserInvitationRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.util.Comparator;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.math.BigDecimal;
import org.springframework.data.domain.PageRequest;

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
    private final SubscriptionRepository subscriptionRepository;
    private final RsvpRepository rsvpRepository;
    private final GuestRepository guestRepository;
    private final GuestCheckInRepository guestCheckInRepository;
    private final NotificationRepository notificationRepository;
    private final SystemAuditLogRepository systemAuditLogRepository;
    private final AuditLogService auditLogService;
    private final UserAuthCacheService userAuthCacheService;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @org.springframework.beans.factory.annotation.Autowired
    public AdminManagementService(
            AppUserRepository userRepository,
            UserInvitationRepository invitationRepository,
            InvitationTemplateRepository templateRepository,
            TemplatePaymentOrderRepository paymentOrderRepository,
            SubscriptionRepository subscriptionRepository,
            RsvpRepository rsvpRepository,
            GuestRepository guestRepository,
            GuestCheckInRepository guestCheckInRepository,
            NotificationRepository notificationRepository,
            SystemAuditLogRepository systemAuditLogRepository,
            AuditLogService auditLogService,
            UserAuthCacheService userAuthCacheService,
            org.springframework.security.crypto.password.PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.invitationRepository = invitationRepository;
        this.templateRepository = templateRepository;
        this.paymentOrderRepository = paymentOrderRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.rsvpRepository = rsvpRepository;
        this.guestRepository = guestRepository;
        this.guestCheckInRepository = guestCheckInRepository;
        this.notificationRepository = notificationRepository;
        this.systemAuditLogRepository = systemAuditLogRepository;
        this.auditLogService = auditLogService;
        this.userAuthCacheService = userAuthCacheService;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public AdminUserResponse createUser(
            Authentication authentication,
            AdminCreateUserRequest requestBody,
            HttpServletRequest request
    ) {
        String email = requestBody.getEmail() == null ? null : requestBody.getEmail().trim().toLowerCase(Locale.ROOT);
        String fullName = requestBody.getFullName() == null ? null : requestBody.getFullName().trim();
        String password = requestBody.getPassword();
        Role role = requestBody.getRole() == null ? Role.USER : requestBody.getRole();

        if (email == null || email.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Email is required");
        }
        if (fullName == null || fullName.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Full name is required");
        }
        if (password == null || password.length() < 8) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Password must be at least 8 characters");
        }
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ApiException(HttpStatus.CONFLICT, "Email already registered");
        }

        AppUser user = new AppUser();
        user.setEmail(email);
        user.setFullName(fullName);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole(role);
        user.setStatus(AppUser.STATUS_ACTIVE);

        AppUser saved = userRepository.save(user);
        auditLogService.logAdminAction(authentication, "USER_CREATED", "USER", saved.getId(),
                "Created new user account", request, Map.of("email", saved.getEmail(), "role", saved.getRole()));
        return AdminUserResponse.from(saved);
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
        ensureNotSelfDeactivation(authentication, user);
        ensureNotMasterAdmin(user);
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
    public InvitationResponse updateInvitationStatus(
            Authentication authentication,
            Long invitationId,
            InvitationStatus status,
            HttpServletRequest request
    ) {
        UserInvitation invitation = requireInvitation(invitationId);
        InvitationStatus previousStatus = invitation.getStatus();
        invitation.setStatus(status);
        if (status == InvitationStatus.PUBLISHED && invitation.getPublishedAt() == null) {
            invitation.setPublishedAt(Instant.now());
        } else if (status == InvitationStatus.DRAFT) {
            invitation.setPublishedAt(null);
        }
        auditLogService.logAdminAction(authentication, "INVITATION_STATUS_CHANGED", "INVITATION", invitationId,
                "Changed invitation publication status", request,
                Map.of("from", previousStatus == null ? "UNKNOWN" : previousStatus, "to", status));
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
                .rows(List.of())
                .build();
    }

    @Transactional(readOnly = true)
    public AdminReportResponse paymentsReport() {
        List<TemplatePaymentOrder> orders = paymentOrderRepository.findAll();
        var revenue = com.koupreng.backend.reporting.domain.RevenueTotals.fromPayments(orders, List.of());
        Map<String, Object> summary = new LinkedHashMap<>(revenue.summaryFields());
        summary.put("totalPayments", orders.size());
        summary.put("paidPayments", orders.stream().filter(order -> order.getStatus() == PaymentStatus.PAID).count());
        summary.put("failedPayments", orders.stream()
                .filter(order -> order.getStatus() == PaymentStatus.FAILED || order.getStatus() == PaymentStatus.REJECTED).count());
        return AdminReportResponse.builder()
                .report("payments")
                .generatedAt(Instant.now())
                .summary(summary)
                .rows(paymentOrderRepository.findRecentPlatformPayments(PageRequest.of(0, 20)).stream()
                    .map(row -> safeTransaction(
                        row.getReference(), row.getPackageName(), row.getAmount(), row.getCurrency(),
                        row.getStatus() == null ? "UNKNOWN" : row.getStatus().name(), row.getProvider(), row.getCreatedAt(), "TEMPLATE"))
                    .toList())
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
                        "attending", rows.stream().filter(row -> row.getResponseStatus() == RsvpStatus.ATTENDING).count(),
                        "declined", rows.stream().filter(row -> row.getResponseStatus() == RsvpStatus.NOT_ATTENDING).count(),
                        "maybe", rows.stream().filter(row -> row.getResponseStatus() == RsvpStatus.MAYBE).count()
                ))
                .rows(List.of())
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
        return platformReport();
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
            .rows(List.of())
            .build();
    }

    @Transactional(readOnly = true)
    public AdminReportResponse analyticsDelivery() {
        List<com.koupreng.backend.guest.domain.Guest> guests = guestRepository.findAll();
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
    public AdminReportResponse platformReport() {
        Instant now = Instant.now();
        YearMonth currentMonth = YearMonth.from(now.atZone(ZoneOffset.UTC));
        Map<YearMonth, Long> monthlyEvents = new HashMap<>();
        for (int monthOffset = 11; monthOffset >= 0; monthOffset--) {
            monthlyEvents.put(currentMonth.minusMonths(monthOffset), 0L);
        }

        long totalInvitations = 0;
        long publishedInvitations = 0;
        long draftInvitations = 0;
        long suspendedInvitations = 0;
        Map<String, Long> eventCategories = new LinkedHashMap<>();
        eventCategories.put("WEDDING", 0L);
        eventCategories.put("ENGAGEMENT", 0L);
        eventCategories.put("ANNIVERSARY_BIRTHDAY", 0L);

        for (var invitation : invitationRepository.findPlatformMetrics()) {
            totalInvitations++;
            if (invitation.getCreatedAt() != null) {
                YearMonth createdMonth = YearMonth.from(invitation.getCreatedAt().atZone(ZoneOffset.UTC));
                monthlyEvents.computeIfPresent(createdMonth, (month, count) -> count + 1);
            }
            if (invitation.getStatus() == InvitationStatus.PUBLISHED) publishedInvitations++;
            if (invitation.getStatus() == InvitationStatus.DRAFT || invitation.getStatus() == InvitationStatus.UNPUBLISHED) draftInvitations++;
            if (invitation.getModerationStatus() == InvitationModerationStatus.HIDDEN
                    || invitation.getModerationStatus() == InvitationModerationStatus.SUSPENDED) suspendedInvitations++;

            String eventType = invitation.getEventType() == null ? "" : invitation.getEventType().name();
            if ("WEDDING".equals(eventType)) eventCategories.computeIfPresent("WEDDING", (key, count) -> count + 1);
            else if ("ENGAGEMENT".equals(eventType)) eventCategories.computeIfPresent("ENGAGEMENT", (key, count) -> count + 1);
            else if ("ANNIVERSARY".equals(eventType) || "BIRTHDAY".equals(eventType)) {
                eventCategories.computeIfPresent("ANNIVERSARY_BIRTHDAY", (key, count) -> count + 1);
            }
        }

        var users = userRepository.dashboardCounts();
        var payments = paymentOrderRepository.dashboardCounts();
        List<SubscriptionRepository.PlatformMetricsRow> subscriptions = subscriptionRepository.findPlatformMetrics();
        Map<String, Long> subscriptionTiers = new LinkedHashMap<>();
        subscriptionTiers.put("Basic", 0L);
        subscriptionTiers.put("Pro", 0L);
        subscriptionTiers.put("Premium", 0L);
        Map<Long, Integer> lastTierByUser = new HashMap<>();
        long tierTransitions = 0;
        long upgrades = 0;
        long downgrades = 0;
        Map<String, BigDecimal> revenueByCurrency = new LinkedHashMap<>();
        Map<String, BigDecimal> paymentRevenueByCurrency = new LinkedHashMap<>();
        Map<String, BigDecimal> subscriptionRevenueByCurrency = new LinkedHashMap<>();
        paymentOrderRepository.revenueByCurrency().forEach(amount -> {
            com.koupreng.backend.reporting.domain.RevenueTotals.add(revenueByCurrency, amount.getCurrency(), amount.getTotal());
            com.koupreng.backend.reporting.domain.RevenueTotals.add(paymentRevenueByCurrency, amount.getCurrency(), amount.getTotal());
        });
        List<PlatformTransaction> transactions = new ArrayList<>();
        paymentOrderRepository.findRecentPlatformPayments(PageRequest.of(0, 20)).forEach(payment ->
                transactions.add(new PlatformTransaction(payment.getCreatedAt(), safeTransaction(
                        payment.getReference(), payment.getPackageName(), payment.getAmount(), payment.getCurrency(),
                        payment.getStatus() == null ? "UNKNOWN" : payment.getStatus().name(), payment.getProvider(), payment.getCreatedAt(), "TEMPLATE"))));

        for (var subscription : subscriptions) {
            String tier = subscriptionTier(subscription.getPackageCode(), subscription.getPackageName());
            int rank = tierRank(tier);
            if (Boolean.TRUE.equals(subscription.getActive())
                    && (subscription.getEndDate() == null || subscription.getEndDate().isAfter(now))) {
                subscriptionTiers.computeIfPresent(tier, (key, count) -> count + 1);
            }
            if (subscription.getUserId() != null && rank > 0) {
                Integer previousRank = lastTierByUser.put(subscription.getUserId(), rank);
                if (previousRank != null && previousRank != rank) {
                    tierTransitions++;
                    if (rank > previousRank) upgrades++; else downgrades++;
                }
            }
            if ("PAID".equalsIgnoreCase(subscription.getPaymentStatus())) {
                BigDecimal paidAmount = subscription.getPaidAmount() == null ? subscription.getAmount() : subscription.getPaidAmount();
                com.koupreng.backend.reporting.domain.RevenueTotals.add(revenueByCurrency, subscription.getCurrency(), paidAmount);
                com.koupreng.backend.reporting.domain.RevenueTotals.add(subscriptionRevenueByCurrency, subscription.getCurrency(), paidAmount);
            }
            if (subscription.getReference() != null && !subscription.getReference().isBlank()) {
                String transactionStatus = subscription.getPaymentStatus() == null ? subscription.getStatus() : subscription.getPaymentStatus();
                BigDecimal amount = subscription.getPaidAmount() == null ? subscription.getAmount() : subscription.getPaidAmount();
                transactions.add(new PlatformTransaction(subscription.getCreatedAt(), safeTransaction(
                        subscription.getReference(), subscription.getPackageName(), amount, subscription.getCurrency(),
                        transactionStatus, subscription.getProvider(), subscription.getCreatedAt(), "SUBSCRIPTION")));
            }
        }

        transactions.sort(Comparator.comparing(PlatformTransaction::createdAt, Comparator.nullsLast(Comparator.reverseOrder())));
        List<Map<String, Object>> eventGrowth = monthlyEvents.entrySet().stream().map(entry -> Map.<String, Object>of(
                "month", entry.getKey().toString(), "created", entry.getValue())).toList();
        List<Map<String, Object>> categoryBreakdown = eventCategories.entrySet().stream().map(entry -> Map.<String, Object>of(
                "category", entry.getKey(), "count", entry.getValue())).toList();
        List<Map<String, Object>> tierBreakdown = subscriptionTiers.entrySet().stream().map(entry -> Map.<String, Object>of(
                "tier", entry.getKey(), "activeSubscriptions", entry.getValue())).toList();

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalUsers", users.getTotal());
        summary.put("activeUsers", users.getActive());
        summary.put("totalInvitations", totalInvitations);
        summary.put("publishedInvitations", publishedInvitations);
        summary.put("draftInvitations", draftInvitations);
        summary.put("suspendedInvitations", suspendedInvitations);
        summary.put("totalGuests", guestRepository.count());
        summary.put("totalRsvps", rsvpRepository.count());
        summary.put("totalCheckIns", guestCheckInRepository.countActiveCheckIns());
        summary.put("eventCreationGrowth", eventGrowth);
        summary.put("eventCategoryBreakdown", categoryBreakdown);
        summary.put("subscriptionTiers", tierBreakdown);
        summary.put("subscriptionTransitions", tierTransitions);
        summary.put("upgradeRate", tierTransitions == 0 ? 0 : upgrades * 100.0 / tierTransitions);
        summary.put("downgradeRate", tierTransitions == 0 ? 0 : downgrades * 100.0 / tierTransitions);
        summary.put("totalPayments", payments.getTotal());
        summary.put("failedPayments", payments.getFailed());
        summary.put("totalRevenueUsd", revenueByCurrency.getOrDefault("USD", BigDecimal.ZERO));
        summary.put("revenueByCurrency", revenueByCurrency);
        summary.put("paymentRevenueByCurrency", paymentRevenueByCurrency);
        summary.put("subscriptionRevenueByCurrency", subscriptionRevenueByCurrency);
        summary.put("revenueComparable", revenueByCurrency.size() <= 1);

        Map<String, Map<String, Object>> transactionGroups = new LinkedHashMap<>();
        for (PlatformTransaction transaction : transactions) {
            Map<String, Object> source = transaction.data();
            String date = transaction.createdAt() == null ? "Unknown" : YearMonth.from(transaction.createdAt().atZone(ZoneOffset.UTC)).toString();
            String type = String.valueOf(source.getOrDefault("type", "PAYMENT"));
            String provider = String.valueOf(source.getOrDefault("provider", "UNKNOWN"));
            String currency = String.valueOf(source.getOrDefault("currency", "USD"));
            String groupKey = String.join("|", date, type, provider, currency);
            Map<String, Object> group = transactionGroups.computeIfAbsent(groupKey, ignored -> {
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("period", date);
                row.put("type", type);
                row.put("provider", provider);
                row.put("status", "AGGREGATED");
                row.put("currency", currency);
                row.put("transactionCount", 0L);
                row.put("totalAmount", BigDecimal.ZERO);
                return row;
            });
            group.put("transactionCount", ((Long) group.get("transactionCount")) + 1);
            BigDecimal transactionAmount = source.get("amount") instanceof BigDecimal value ? value : BigDecimal.ZERO;
            group.put("totalAmount", ((BigDecimal) group.get("totalAmount")).add(transactionAmount));
        }
        List<Map<String, Object>> aggregateTransactions = transactionGroups.values().stream()
                .peek(row -> {
                    if (((Long) row.get("transactionCount")) < 5) row.put("totalAmount", null);
                })
                .sorted(Comparator.comparing(row -> String.valueOf(row.get("period")), Comparator.reverseOrder()))
                .limit(20).toList();

        return AdminReportResponse.builder()
                .report("platform")
                .generatedAt(now)
                .summary(summary)
                .rows(aggregateTransactions)
                .build();
    }

    private static Map<String, Object> safeTransaction(
            String reference, String packageName, BigDecimal amount, String currency,
            String status, String provider, Instant createdAt, String type
    ) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("reference", reference);
        row.put("packageName", packageName);
        row.put("amount", amount);
        row.put("currency", currency == null || currency.isBlank() ? "USD" : currency);
        row.put("status", status);
        row.put("provider", provider);
        row.put("createdAt", createdAt);
        row.put("type", type);
        return row;
    }

    private static String subscriptionTier(String code, String name) {
        String normalized = ((code == null ? "" : code) + " " + (name == null ? "" : name)).toLowerCase(Locale.ROOT);
        if (normalized.contains("premium")) return "Premium";
        if (normalized.contains("pro")) return "Pro";
        if (normalized.contains("basic")) return "Basic";
        return "Basic";
    }

    private static int tierRank(String tier) {
        return switch (tier) {
            case "Basic" -> 1;
            case "Pro" -> 2;
            case "Premium" -> 3;
            default -> 0;
        };
    }

    private record PlatformTransaction(Instant createdAt, Map<String, Object> data) { }

    @Transactional(readOnly = true)
    public AdminReportResponse analyticsRsvp() {
        List<RsvpResponse> rows = rsvpRepository.findAll().stream()
                .map(RsvpResponse::from)
                .toList();
        long totalGuests = guestRepository.count();
        long attending = rows.stream()
                .filter(row -> row.getResponseStatus() == RsvpStatus.ATTENDING)
                .count();
        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalGuests", totalGuests);
        summary.put("totalRsvps", rows.size());
        summary.put("attending", attending);
        summary.put("declined", rows.stream()
                .filter(row -> row.getResponseStatus() == RsvpStatus.NOT_ATTENDING)
                .count());
        summary.put("maybe", rows.stream()
                .filter(row -> row.getResponseStatus() == RsvpStatus.MAYBE)
                .count());
        summary.put("rsvpConversion", totalGuests == 0 ? 0 : (double) rows.size() / totalGuests);
        summary.put("attendingRate", totalGuests == 0 ? 0 : (double) attending / totalGuests);
        return AdminReportResponse.builder()
                .report("analytics-rsvp")
                .generatedAt(Instant.now())
                .summary(summary)
                .rows(List.of())
                .build();
    }

    @Transactional(readOnly = true)
    public AdminReportResponse analyticsCheckIn() {
        long totalGuests = guestRepository.count();
        long checkedIn = guestCheckInRepository.countActiveCheckIns();
        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalGuests", totalGuests);
        summary.put("checkedIn", checkedIn);
        summary.put("remaining", Math.max(0, totalGuests - checkedIn));
        summary.put("checkInRate", totalGuests == 0 ? 0 : (double) checkedIn / totalGuests);
        return AdminReportResponse.builder()
                .report("analytics-check-in")
                .generatedAt(Instant.now())
                .summary(summary)
            .rows(List.of())
                .build();
    }

    @Transactional(readOnly = true)
    public AdminReportResponse systemHealth() {
        long failedNotifications = notificationRepository.countByStatus(NotificationStatus.FAILED);
        var payments = paymentOrderRepository.dashboardCounts();
        long pendingPayments = payments.getPending();
        long rejectedPayments = payments.getFailed();

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
        long pendingReviews = paymentOrderRepository.dashboardCounts().getReview();
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
        if (requestBody.getPrimaryColor() != null) {
            template.setPrimaryColor(trimToNull(requestBody.getPrimaryColor()));
        }
        if (requestBody.getSecondaryColor() != null) {
            template.setSecondaryColor(trimToNull(requestBody.getSecondaryColor()));
        }
        if (requestBody.getBackgroundColor() != null) {
            template.setBackgroundColor(trimToNull(requestBody.getBackgroundColor()));
        }
    }

    private AppUser requireUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
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

    private void ensureNotSelfDeactivation(Authentication authentication, AppUser user) {
        if (authentication == null || user == null) {
            return;
        }
        try {
            Long actorId = Long.valueOf(authentication.getName());
            if (actorId.equals(user.getId())) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "You cannot deactivate your own account");
            }
        } catch (NumberFormatException ignored) {
            // authentication principal may be an email address in some flows; guard using email below
        }

        String principal = authentication.getName();
        if (principal != null && user.getEmail() != null && principal.equalsIgnoreCase(user.getEmail())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "You cannot deactivate your own account");
        }
    }

    private void ensureNotMasterAdmin(AppUser user) {
        if (user == null || user.getEmail() == null) {
            return;
        }
        if (user.getEmail().equalsIgnoreCase(com.koupreng.backend.dev.DevSampleData.ADMIN_EMAIL)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Master admin account cannot be deactivated");
        }
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
