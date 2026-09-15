package com.koupreng.backend.service;

import com.koupreng.backend.user.application.CurrentUserService;

import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.config.PaymentProperties;
import com.koupreng.backend.dto.subscription.SubscriptionPackageResponse;
import com.koupreng.backend.dto.subscription.SubscriptionPackageRequest;
import com.koupreng.backend.dto.subscription.SubscriptionResponse;
import com.koupreng.backend.entity.subscription.Subscription;
import com.koupreng.backend.entity.subscription.SubscriptionPackage;
import com.koupreng.backend.user.domain.AppUser;
import com.koupreng.backend.repository.SubscriptionPackageRepository;
import com.koupreng.backend.repository.SubscriptionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

@Service
public class SubscriptionService {

    private static final ZoneId BUSINESS_ZONE = ZoneId.of("Asia/Phnom_Penh");
    private static final DateTimeFormatter ORDER_DATE_FORMAT = DateTimeFormatter.ofPattern("yyMMdd")
            .withZone(BUSINESS_ZONE);

    private final SubscriptionPackageRepository packageRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final CurrentUserService currentUserService;
    private final PaymentProperties paymentProperties;
    private final AuditLogService auditLogService;
    private final SecureRandom random = new SecureRandom();

    public SubscriptionService(
            SubscriptionPackageRepository packageRepository,
            SubscriptionRepository subscriptionRepository,
            CurrentUserService currentUserService,
            PaymentProperties paymentProperties,
            AuditLogService auditLogService
    ) {
        this.packageRepository = packageRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.currentUserService = currentUserService;
        this.paymentProperties = paymentProperties;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public List<SubscriptionPackageResponse> listPackages() {
        return packageRepository.findByActiveTrueOrderBySortOrderAscPriceAsc().stream()
                .map(SubscriptionPackageResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public SubscriptionResponse current(Authentication authentication) {
        AppUser user = currentUserService.currentUser(authentication);
        return subscriptionRepository.findActiveForUser(user.getId(), Instant.now()).stream()
                .findFirst()
                .map(subscription -> SubscriptionResponse.from(subscription, "Current subscription is active."))
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public List<SubscriptionResponse> history(Authentication authentication) {
        AppUser user = currentUserService.currentUser(authentication);
        return subscriptionRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(subscription -> SubscriptionResponse.from(subscription, statusMessage(subscription)))
                .toList();
    }

    @Transactional
    public SubscriptionResponse purchase(Authentication authentication, Long packageId) {
        AppUser user = currentUserService.currentUser(authentication);
        SubscriptionPackage plan = packageRepository.findByIdAndActiveTrue(packageId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Package not found"));
        BigDecimal price = plan.getPrice() == null ? BigDecimal.ZERO : plan.getPrice();
        Instant now = Instant.now();

        if (price.compareTo(BigDecimal.ZERO) <= 0) {
            deactivateActiveSubscriptions(user.getId(), now);
            Subscription subscription = baseSubscription(user, plan, price);
            subscription.setStartDate(now);
            subscription.setEndDate(endDate(now, plan.getDurationDays()));
            subscription.setPaymentStatus("FREE");
            subscription.setStatus("ACTIVE");
            subscription.setActive(true);
            Subscription saved = subscriptionRepository.save(subscription);
            if (auditLogService != null) {
                auditLogService.logSystemEvent("SUBSCRIPTION_CREATED", "SUBSCRIPTION", saved.getId(), "Free subscription activated immediately for package: " + plan.getPackageName(), java.util.Map.of("userId", user.getId(), "packageId", plan.getId()));
            }
            return SubscriptionResponse.from(
                    saved,
                    "Package activated immediately."
            );
        }

        Subscription subscription = baseSubscription(user, plan, price);
        subscription.setOrderCode(uniqueOrderCode());
        subscription.setPaymentStatus("PENDING");
        subscription.setStatus("PENDING_PAYMENT");
        subscription.setActive(false);
        subscription.setProvider("ABA_PAYWAY_STATIC_TELEGRAM");
        subscription.setPaymentLink(paymentProperties.getAba().getStaticLink());
        subscription.setPaymentNote(subscription.getOrderCode());
        Subscription saved = subscriptionRepository.save(subscription);
        if (auditLogService != null) {
            auditLogService.logSystemEvent("SUBSCRIPTION_CREATED", "SUBSCRIPTION", saved.getId(), "Subscription payment order created for package: " + plan.getPackageName() + ", code: " + saved.getOrderCode(), java.util.Map.of("userId", user.getId(), "packageId", plan.getId()));
        }
        return SubscriptionResponse.from(
                saved,
                "Subscription payment order created. Use the payment note before support confirms activation."
        );
    }

    private Subscription baseSubscription(AppUser user, SubscriptionPackage plan, BigDecimal price) {
        Subscription subscription = new Subscription();
        subscription.setUser(user);
        subscription.setSubscriptionPackage(plan);
        subscription.setAmount(price);
        subscription.setCurrency(normalizeCurrency(plan.getCurrency()));
        return subscription;
    }

    private void deactivateActiveSubscriptions(Long userId, Instant now) {
        for (Subscription subscription : subscriptionRepository.findActiveForUser(userId, now)) {
            subscription.setActive(false);
            subscription.setStatus("REPLACED");
        }
    }

    private Instant endDate(Instant start, Integer durationDays) {
        if (durationDays == null || durationDays <= 0) {
            return null;
        }
        return start.plusSeconds(durationDays.longValue() * 86_400L);
    }

    private String uniqueOrderCode() {
        String date = ORDER_DATE_FORMAT.format(Instant.now());
        for (int attempt = 0; attempt < 80; attempt++) {
            String candidate = "SUB" + date + (random.nextInt(9000) + 1000);
            if (!subscriptionRepository.existsByOrderCode(candidate)) {
                return candidate;
            }
        }
        throw new ApiException(HttpStatus.CONFLICT, "Could not generate subscription order code");
    }

    private String normalizeCurrency(String currency) {
        String normalized = currency == null || currency.isBlank()
                ? "USD"
                : currency.trim().toUpperCase(Locale.ROOT);
        if (!"USD".equals(normalized) && !"KHR".equals(normalized)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Currency mismatch");
        }
        return normalized;
    }

    private String statusMessage(Subscription subscription) {
        return switch (subscription.getStatus() == null ? "" : subscription.getStatus()) {
            case "ACTIVE" -> "Subscription is active.";
            case "REPLACED" -> "Subscription was replaced by a newer package.";
            case "PENDING_PAYMENT" -> "Waiting for payment confirmation.";
            default -> "Subscription status: " + subscription.getStatus();
        };
    }

    @Transactional(readOnly = true)
    public List<SubscriptionPackageResponse> listAllPackages() {
        return packageRepository.findAll().stream()
                .map(SubscriptionPackageResponse::from)
                .toList();
    }

    @Transactional
    public SubscriptionPackageResponse createPackage(SubscriptionPackageRequest request) {
        SubscriptionPackage plan = new SubscriptionPackage();
        applyPackageRequest(plan, request);
        SubscriptionPackage saved = packageRepository.save(plan);
        if (auditLogService != null) {
            auditLogService.logSystemEvent("PACKAGE_CREATED", "PACKAGE", saved.getId(), "Package created: " + saved.getPackageName(), null);
        }
        return SubscriptionPackageResponse.from(saved);
    }

    @Transactional
    public SubscriptionPackageResponse updatePackage(Long id, SubscriptionPackageRequest request) {
        SubscriptionPackage plan = packageRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Package not found"));
        applyPackageRequest(plan, request);
        SubscriptionPackage saved = packageRepository.save(plan);
        if (auditLogService != null) {
            auditLogService.logSystemEvent("PACKAGE_UPDATED", "PACKAGE", saved.getId(), "Package updated: " + saved.getPackageName(), null);
        }
        return SubscriptionPackageResponse.from(saved);
    }

    @Transactional
    public SubscriptionPackageResponse activatePackage(Long id) {
        SubscriptionPackage plan = packageRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Package not found"));
        plan.setActive(true);
        SubscriptionPackage saved = packageRepository.save(plan);
        if (auditLogService != null) {
            auditLogService.logSystemEvent("PACKAGE_ACTIVATED", "PACKAGE", saved.getId(), "Package activated: " + saved.getPackageName(), null);
        }
        return SubscriptionPackageResponse.from(saved);
    }

    @Transactional
    public SubscriptionPackageResponse deactivatePackage(Long id) {
        SubscriptionPackage plan = packageRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Package not found"));
        plan.setActive(false);
        SubscriptionPackage saved = packageRepository.save(plan);
        if (auditLogService != null) {
            auditLogService.logSystemEvent("PACKAGE_DEACTIVATED", "PACKAGE", saved.getId(), "Package deactivated: " + saved.getPackageName(), null);
        }
        return SubscriptionPackageResponse.from(saved);
    }

    private void applyPackageRequest(SubscriptionPackage plan, SubscriptionPackageRequest request) {
        plan.setPackageName(request.getPackageName());
        plan.setCode(request.getCode());
        plan.setDescription(request.getDescription());
        plan.setPrice(request.getPrice());
        plan.setCurrency(request.getCurrency());
        plan.setBillingInterval(request.getBillingInterval());
        plan.setDurationDays(request.getDurationDays());
        plan.setMaxInvitations(request.getMaxInvitations());
        plan.setMaxGuests(request.getMaxGuests());
        plan.setMaxGuestsPerInvitation(request.getMaxGuestsPerInvitation());
        plan.setMaxTeamMembers(request.getMaxTeamMembers());
        plan.setFeaturesJson(request.getFeaturesJson());
        plan.setPremiumTemplatesEnabled(request.isPremiumTemplatesEnabled());
        plan.setQrInvitationsEnabled(request.isQrInvitationsEnabled());
        plan.setQrCheckInEnabled(request.isQrCheckInEnabled());
        plan.setSeatingEnabled(request.isSeatingEnabled());
        plan.setAdvancedAnalyticsEnabled(request.isAdvancedAnalyticsEnabled());
        plan.setCustomBrandingEnabled(request.isCustomBrandingEnabled());
        plan.setTeamMembersEnabled(request.isTeamMembersEnabled());
        plan.setAiAssistantEnabled(request.isAiAssistantEnabled());
        plan.setActive(request.isActive());
        plan.setSortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0);
    }
}
