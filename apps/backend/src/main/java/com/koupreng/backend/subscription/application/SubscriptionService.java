package com.koupreng.backend.subscription.application;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import com.koupreng.backend.payment.infrastructure.config.PaymentProperties;
import com.koupreng.backend.payment.infrastructure.persistence.TemplatePaymentOrderRepository;
import com.koupreng.backend.payment.api.dto.PaymentConfirmResponse;
import com.koupreng.backend.payment.domain.PaymentStatus;
import com.koupreng.backend.payment.api.dto.ConfirmPaymentRequest;
import com.koupreng.backend.audit.application.AuditLogService;
import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.subscription.api.dto.SubscriptionPackageResponse;
import com.koupreng.backend.subscription.api.dto.SubscriptionPackageRequest;
import com.koupreng.backend.subscription.api.dto.SubscriptionPaymentDetectionResponse;
import com.koupreng.backend.subscription.api.dto.SubscriptionPurchaseRequest;
import com.koupreng.backend.subscription.api.dto.SubscriptionResponse;
import com.koupreng.backend.subscription.api.dto.TelegramDetectSubscriptionPaymentRequest;
import com.koupreng.backend.subscription.domain.Subscription;
import com.koupreng.backend.subscription.domain.SubscriptionPackage;
import com.koupreng.backend.subscription.domain.SubscriptionPaymentDetectionStatus;
import com.koupreng.backend.subscription.infrastructure.persistence.SubscriptionPackageRepository;
import com.koupreng.backend.subscription.infrastructure.persistence.SubscriptionRepository;
import com.koupreng.backend.subscription.infrastructure.payment.SubscriptionPaymentPlanResolver;
import com.koupreng.backend.subscription.infrastructure.payment.SubscriptionPaymentPlanResolver.SubscriptionPaymentPlan;
import com.koupreng.backend.user.application.CurrentUserService;
import com.koupreng.backend.user.domain.AppUser;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SubscriptionService {

    private static final String PAYMENT_STATUS_PAID = "PAID";
    private static final String PAYMENT_STATUS_PENDING = "PENDING";
    private static final String STATUS_ACTIVE = "ACTIVE";
    private static final String STATUS_PENDING_PAYMENT = "PENDING_PAYMENT";
    private static final String STATUS_EXPIRED = "EXPIRED";
    private static final String STATUS_REVIEW_REQUIRED = "REVIEW_REQUIRED";
    private static final String CONFIRM_SOURCE_MANUAL_ADMIN = "MANUAL_ADMIN";
    private static final String CONFIRM_SOURCE_TELEGRAM_ADMIN = "TELEGRAM_ADMIN_DETECT";
    private static final ZoneId BUSINESS_ZONE = ZoneId.of("Asia/Phnom_Penh");
    private static final DateTimeFormatter ORDER_DATE_FORMAT = DateTimeFormatter.ofPattern("yyMMdd")
            .withZone(BUSINESS_ZONE);

    private final SubscriptionPackageRepository packageRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final CurrentUserService currentUserService;
    private final PaymentProperties paymentProperties;
    private final AuditLogService auditLogService;
    private final SubscriptionPaymentPlanResolver paymentPlanResolver;
    private final TemplatePaymentOrderRepository templatePaymentOrderRepository;
    private final SecureRandom random = new SecureRandom();

    public SubscriptionService(
            SubscriptionPackageRepository packageRepository,
            SubscriptionRepository subscriptionRepository,
            CurrentUserService currentUserService,
            PaymentProperties paymentProperties,
            AuditLogService auditLogService,
            SubscriptionPaymentPlanResolver paymentPlanResolver,
            TemplatePaymentOrderRepository templatePaymentOrderRepository
    ) {
        this.packageRepository = packageRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.currentUserService = currentUserService;
        this.paymentProperties = paymentProperties;
        this.auditLogService = auditLogService;
        this.paymentPlanResolver = paymentPlanResolver;
        this.templatePaymentOrderRepository = templatePaymentOrderRepository;
    }

    @Transactional(readOnly = true)
    public List<SubscriptionPackageResponse> listPackages() {
        return packageRepository.findByActiveTrueOrderBySortOrderAscPriceAsc().stream()
                .filter(plan -> paymentPlanResolver.supports(plan.getCode()))
                .map(this::publicPackageResponse)
                .toList();
    }

    private SubscriptionPackageResponse publicPackageResponse(SubscriptionPackage plan) {
        SubscriptionPaymentPlan paymentPlan = paymentPlanResolver.resolve(plan.getCode());
        SubscriptionPackageResponse response = SubscriptionPackageResponse.from(plan);
        response.setPrice(paymentPlan.amount());
        response.setCurrency(paymentPlan.currency());
        return response;
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
    public SubscriptionResponse getOrder(Authentication authentication, String orderCode) {
        AppUser user = currentUserService.currentUser(authentication);
        Subscription subscription = subscriptionRepository.findForUpdateByOrderCode(normalizeOrderCode(orderCode))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Subscription payment order not found"));
        if (subscription.getUser() == null || !user.getId().equals(subscription.getUser().getId())) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Subscription payment order not found");
        }
        expireIfNeeded(subscription, Instant.now());
        return SubscriptionResponse.from(subscription, statusMessage(subscription));
    }

    @Transactional
    public SubscriptionResponse purchase(Authentication authentication, SubscriptionPurchaseRequest request) {
        AppUser user = currentUserService.currentUser(authentication);
        SubscriptionPackage plan = packageRepository.findByIdAndActiveTrue(request.getPackageId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Package not found"));
        SubscriptionPaymentPlan paymentPlan = paymentPlanResolver.resolve(plan.getCode());
        BigDecimal price = paymentPlan.amount();
        Instant now = Instant.now();

        Subscription subscription = baseSubscription(user, plan, price);
        subscription.setOrderCode(uniqueOrderCode());
        subscription.setPaymentStatus(PAYMENT_STATUS_PENDING);
        subscription.setStatus(STATUS_PENDING_PAYMENT);
        subscription.setActive(false);
        subscription.setProvider("ABA_PAYWAY_STATIC_TELEGRAM");
        subscription.setPaymentLink(paymentPlan.paymentUrl());
        subscription.setPaymentNote(subscription.getOrderCode());
        subscription.setPayerName(normalizePayerName(request.getPayerName()));
        subscription.setPayerAccountLast3(requireLast3(request.getPayerAccountLast3()));
        subscription.setPaymentExpiresAt(now.plusSeconds(paymentProperties.getOrderExpiryMinutes() * 60L));
        Subscription saved = subscriptionRepository.save(subscription);
        if (auditLogService != null) {
            auditLogService.logSystemEvent("SUBSCRIPTION_CREATED", "SUBSCRIPTION", saved.getId(), "Subscription payment order created for package: " + plan.getPackageName() + ", code: " + saved.getOrderCode(), Map.of("userId", user.getId(), "packageId", plan.getId()));
        }
        return SubscriptionResponse.from(
                saved,
                "Subscription payment order created. Continue to ABA PayWay and wait for confirmation."
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
        List<Subscription> activeSubscriptions = subscriptionRepository.findActiveForUser(userId, now);
        for (Subscription subscription : activeSubscriptions) {
            subscription.setActive(false);
            subscription.setStatus("REPLACED");
        }
        if (!activeSubscriptions.isEmpty()) {
            subscriptionRepository.flush();
        }
    }

    /**
     * Reconciles static-link subscription payments using trusted merchant Telegram evidence.
     * Official PayWay API verification can replace this evidence boundary without changing
     * the subscription activation transaction.
     */
    @Transactional
    public SubscriptionPaymentDetectionResponse detectTelegramPayment(
            TelegramDetectSubscriptionPaymentRequest request
    ) {
        Instant now = Instant.now();
        String transactionId = requireText(request.getPaywayTransactionId(), "PayWay transaction ID is required");
        BigDecimal detectedAmount = money(request.getDetectedAmount(), request.getDetectedCurrency());
        String currency = normalizeCurrency(request.getDetectedCurrency());
        String payerLast3 = requireLast3(request.getPayerAccountLast3());

        Subscription alreadyProcessed = subscriptionRepository.findForUpdateByPaywayTransactionId(transactionId)
                .orElse(null);
        if (alreadyProcessed != null) {
            return detectionResponse(
                    alreadyProcessed,
                    SubscriptionPaymentDetectionStatus.ALREADY_PROCESSED,
                    "Payment transaction was already processed."
            );
        }
        if (templatePaymentOrderRepository.existsByPaywayTransactionId(transactionId)) {
            auditDetection("SUBSCRIPTION_PAYMENT_DUPLICATE_TRANSACTION", null, request, detectedAmount, currency);
            return unmatchedDetectionResponse(
                    request,
                    detectedAmount,
                    currency,
                    SubscriptionPaymentDetectionStatus.ALREADY_PROCESSED,
                    "Payment transaction was already processed for another payment."
            );
        }

        List<Subscription> matches = subscriptionRepository.findPendingMatchesForUpdate(
                currency,
                detectedAmount,
                payerLast3,
                now
        );
        if (matches.isEmpty()) {
            auditDetection("SUBSCRIPTION_PAYMENT_UNMATCHED", null, request, detectedAmount, currency);
            return unmatchedDetectionResponse(
                    request,
                    detectedAmount,
                    currency,
                    SubscriptionPaymentDetectionStatus.UNMATCHED,
                    "No pending subscription matched this payment."
            );
        }
        if (matches.size() > 1) {
            for (Subscription match : matches) {
                match.setStatus(STATUS_REVIEW_REQUIRED);
                applyTelegramEvidence(match, request, now, false);
            }
            subscriptionRepository.saveAll(matches);
            auditDetection(
                    "SUBSCRIPTION_PAYMENT_REVIEW_REQUIRED",
                    matches.getFirst().getId(),
                    request,
                    detectedAmount,
                    currency
            );
            return unmatchedDetectionResponse(
                    request,
                    detectedAmount,
                    currency,
                    SubscriptionPaymentDetectionStatus.REVIEW_REQUIRED,
                    "Multiple pending subscriptions matched. Manual review required."
            );
        }

        Subscription subscription = matches.getFirst();
        requirePendingMatch(subscription, detectedAmount, currency, payerLast3, now);
        deactivateActiveSubscriptions(subscription.getUser().getId(), now);
        applyTelegramEvidence(subscription, request, now, true);
        subscription.setPaidAmount(detectedAmount);
        subscription.setPaymentStatus(PAYMENT_STATUS_PAID);
        subscription.setPaidAt(now);
        subscription.setConfirmedAt(now);
        subscription.setStartDate(now);
        subscription.setEndDate(endDate(now, subscription.getSubscriptionPackage().getDurationDays()));
        subscription.setStatus(STATUS_ACTIVE);
        subscription.setActive(true);
        Subscription saved = subscriptionRepository.save(subscription);

        if (auditLogService != null) {
            auditLogService.logSystemEvent(
                    "SUBSCRIPTION_PAYMENT_CONFIRMED",
                    "SUBSCRIPTION",
                    saved.getId(),
                    "Subscription payment confirmed from trusted Telegram evidence",
                    Map.of(
                            "orderCode", saved.getOrderCode(),
                            "transactionId", transactionId,
                            "amount", detectedAmount,
                            "currency", currency,
                            "payerAccountLast3", payerLast3
                    )
            );
        }
        return detectionResponse(
                saved,
                SubscriptionPaymentDetectionStatus.PAID,
                "Subscription payment confirmed and package activated."
        );
    }

    private void requirePendingMatch(
            Subscription subscription,
            BigDecimal amount,
            String currency,
            String payerLast3,
            Instant now
    ) {
        boolean pending = PAYMENT_STATUS_PENDING.equalsIgnoreCase(subscription.getPaymentStatus())
                && STATUS_PENDING_PAYMENT.equalsIgnoreCase(subscription.getStatus());
        boolean unexpired = subscription.getPaymentExpiresAt() != null
                && subscription.getPaymentExpiresAt().isAfter(now);
        boolean exactAmount = money(subscription.getAmount(), subscription.getCurrency()).compareTo(amount) == 0;
        boolean exactCurrency = normalizeCurrency(subscription.getCurrency()).equals(currency);
        boolean exactSuffix = payerLast3.equals(subscription.getPayerAccountLast3());
        if (!pending || !unexpired || !exactAmount || !exactCurrency || !exactSuffix) {
            throw new ApiException(
                    HttpStatus.CONFLICT,
                    "SUBSCRIPTION_PAYMENT_MATCH_CHANGED",
                    "Pending subscription no longer matches this payment"
            );
        }
    }

    private void applyTelegramEvidence(
            Subscription subscription,
            TelegramDetectSubscriptionPaymentRequest request,
            Instant now,
            boolean claimTransaction
    ) {
        subscription.setPaywayTransactionId(claimTransaction
                ? requireText(request.getPaywayTransactionId(), "PayWay transaction ID is required")
                : null);
        subscription.setPaywayApprovalCode(blankToNull(request.getPaywayApprovalCode()));
        subscription.setPaywayPayerName(blankToNull(request.getPayerName()));
        subscription.setPaymentDetectedAt(now);
        subscription.setPaymentRawSource(requireText(request.getRawMessage(), "Raw message is required"));
        subscription.setPaymentEvidenceReference(evidenceReference(request));
        subscription.setPaymentRemark(blankToNull(request.getRemark()));
        subscription.setConfirmSource(CONFIRM_SOURCE_TELEGRAM_ADMIN);
        subscription.setConfirmedBy(requireText(request.getDetectedBy(), "Detected by is required"));
    }

    private String evidenceReference(TelegramDetectSubscriptionPaymentRequest request) {
        String chatId = blankToNull(request.getTelegramChatId());
        String messageId = blankToNull(request.getTelegramMessageId());
        if (chatId == null && messageId == null) {
            return "telegram";
        }
        return "telegram:" + (chatId == null ? "unknown" : chatId)
                + ":" + (messageId == null ? "unknown" : messageId);
    }

    private void auditDetection(
            String action,
            Long subscriptionId,
            TelegramDetectSubscriptionPaymentRequest request,
            BigDecimal amount,
            String currency
    ) {
        if (auditLogService == null) {
            return;
        }
        auditLogService.logSystemEvent(
                action,
                "SUBSCRIPTION",
                subscriptionId,
                "Static subscription payment reconciliation result",
                Map.of(
                        "amount", amount,
                        "currency", currency,
                        "payerAccountLast3", requireLast3(request.getPayerAccountLast3()),
                        "transactionId", requireText(request.getPaywayTransactionId(), "PayWay transaction ID is required")
                )
        );
    }

    private SubscriptionPaymentDetectionResponse unmatchedDetectionResponse(
            TelegramDetectSubscriptionPaymentRequest request,
            BigDecimal amount,
            String currency,
            SubscriptionPaymentDetectionStatus status,
            String message
    ) {
        return SubscriptionPaymentDetectionResponse.builder()
                .status(status)
                .message(message)
                .amount(amount)
                .currency(currency)
                .payerAccountLast3(requireLast3(request.getPayerAccountLast3()))
                .paywayTransactionId(request.getPaywayTransactionId())
                .paywayApprovalCode(request.getPaywayApprovalCode())
                .active(false)
                .build();
    }

    private SubscriptionPaymentDetectionResponse detectionResponse(
            Subscription subscription,
            SubscriptionPaymentDetectionStatus status,
            String message
    ) {
        return SubscriptionPaymentDetectionResponse.builder()
                .status(status)
                .message(message)
                .orderCode(subscription.getOrderCode())
                .packageCode(subscription.getSubscriptionPackage().getCode())
                .amount(subscription.getAmount())
                .currency(subscription.getCurrency())
                .payerAccountLast3(subscription.getPayerAccountLast3())
                .paywayTransactionId(subscription.getPaywayTransactionId())
                .paywayApprovalCode(subscription.getPaywayApprovalCode())
                .active(subscription.isActive())
                .build();
    }

    @Transactional
    public PaymentConfirmResponse confirmManualPayment(ConfirmPaymentRequest request) {
        String orderCode = normalizeOrderCode(request.orderCode());
        Subscription subscription = subscriptionRepository.findForUpdateByOrderCode(orderCode)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Subscription payment order not found"));

        if (PAYMENT_STATUS_PAID.equalsIgnoreCase(subscription.getPaymentStatus())) {
            return confirmationResponse(subscription, "Subscription payment is already confirmed.");
        }
        if ((!STATUS_PENDING_PAYMENT.equalsIgnoreCase(subscription.getStatus())
                && !STATUS_REVIEW_REQUIRED.equalsIgnoreCase(subscription.getStatus()))
                || !PAYMENT_STATUS_PENDING.equalsIgnoreCase(subscription.getPaymentStatus())) {
            throw new ApiException(
                    HttpStatus.CONFLICT,
                    "SUBSCRIPTION_NOT_PENDING",
                    "Subscription is not pending payment"
            );
        }

        BigDecimal expectedAmount = money(subscription.getAmount(), subscription.getCurrency());
        BigDecimal paidAmount = money(request.amount(), subscription.getCurrency());
        if (expectedAmount.compareTo(paidAmount) != 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "PAYMENT_AMOUNT_MISMATCH", "Amount mismatch");
        }

        Instant now = Instant.now();
        deactivateActiveSubscriptions(subscription.getUser().getId(), now);
        subscription.setPaidAmount(paidAmount);
        subscription.setPaymentStatus(PAYMENT_STATUS_PAID);
        subscription.setPaidAt(now);
        subscription.setConfirmSource(CONFIRM_SOURCE_MANUAL_ADMIN);
        subscription.setConfirmedBy(requireText(request.confirmedBy(), "Confirmed by is required"));
        subscription.setConfirmedAt(now);
        subscription.setStartDate(now);
        subscription.setEndDate(endDate(now, subscription.getSubscriptionPackage().getDurationDays()));
        subscription.setStatus(STATUS_ACTIVE);
        subscription.setActive(true);
        subscriptionRepository.save(subscription);

        if (auditLogService != null) {
            auditLogService.logSystemEvent(
                    "SUBSCRIPTION_PAYMENT_CONFIRMED",
                    "SUBSCRIPTION",
                    subscription.getId(),
                    "Subscription payment confirmed manually",
                    Map.of(
                            "orderCode", subscription.getOrderCode(),
                            "confirmedBy", subscription.getConfirmedBy()
                    )
            );
        }
        return confirmationResponse(subscription, "Subscription payment confirmed and package activated.");
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

    private String normalizeOrderCode(String orderCode) {
        return requireText(orderCode, "Order code is required").toUpperCase(Locale.ROOT);
    }

    private String requireText(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, message);
        }
        return value.trim();
    }

    private String normalizePayerName(String payerName) {
        String normalized = requireText(payerName, "ABA account holder name is required")
                .replaceAll("\\s+", " ");
        if (normalized.length() > 120) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "ABA account holder name is too long");
        }
        return normalized;
    }

    private String requireLast3(String payerAccountLast3) {
        String normalized = requireText(payerAccountLast3, "Payer account suffix is required");
        if (!normalized.matches("^[0-9]{3}$")) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "PAYER_ACCOUNT_LAST3_INVALID",
                    "Payer account suffix must be exactly 3 numeric digits"
            );
        }
        return normalized;
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private void expireIfNeeded(Subscription subscription, Instant now) {
        if (PAYMENT_STATUS_PENDING.equalsIgnoreCase(subscription.getPaymentStatus())
                && STATUS_PENDING_PAYMENT.equalsIgnoreCase(subscription.getStatus())
                && subscription.getPaymentExpiresAt() != null
                && !subscription.getPaymentExpiresAt().isAfter(now)) {
            subscription.setPaymentStatus(STATUS_EXPIRED);
            subscription.setStatus(STATUS_EXPIRED);
            subscription.setActive(false);
            subscriptionRepository.save(subscription);
        }
    }

    private BigDecimal money(BigDecimal amount, String currency) {
        if (amount == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Payment amount is required");
        }
        normalizeCurrency(currency);
        try {
            return amount.setScale(2, RoundingMode.UNNECESSARY);
        } catch (ArithmeticException exception) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Payment amount must have at most two decimal places");
        }
    }

    private PaymentConfirmResponse confirmationResponse(Subscription subscription, String message) {
        return PaymentConfirmResponse.builder()
                .message(message)
                .orderCode(subscription.getOrderCode())
                .status(PaymentStatus.PAID)
                .build();
    }

    private String statusMessage(Subscription subscription) {
        return switch (subscription.getStatus() == null ? "" : subscription.getStatus()) {
            case STATUS_ACTIVE -> "Subscription is active.";
            case "REPLACED" -> "Subscription was replaced by a newer package.";
            case STATUS_PENDING_PAYMENT -> "Waiting for payment confirmation.";
            case STATUS_REVIEW_REQUIRED -> "Payment received but needs administrator review.";
            case STATUS_EXPIRED -> "Payment session expired. Please start again.";
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
