package com.koupreng.backend.payment.application;

import com.koupreng.backend.audit.application.AuditLogService;

import com.koupreng.backend.user.application.CurrentUserService;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.payment.infrastructure.config.PaymentProperties;
import com.koupreng.backend.payment.api.dto.ConfirmTemplatePaymentRequest;
import com.koupreng.backend.payment.api.dto.CreateTemplatePaymentRequest;
import com.koupreng.backend.payment.api.dto.CreateTemplatePaymentResponse;
import com.koupreng.backend.payment.api.dto.PayWayCallbackResponse;
import com.koupreng.backend.payment.api.dto.PaymentConfirmResponse;
import com.koupreng.backend.payment.api.dto.TemplateAccessCheckResponse;
import com.koupreng.backend.payment.api.dto.TemplatePaymentStatusResponse;
import com.koupreng.backend.payment.api.dto.TelegramDetectPaymentRequest;
import com.koupreng.backend.payment.api.dto.UserTemplateAccessResponse;
import com.koupreng.backend.payment.domain.TemplatePaymentOrder;
import com.koupreng.backend.payment.domain.UserTemplateAccess;
import com.koupreng.backend.user.domain.AppUser;
import com.koupreng.backend.user.domain.Role;
import com.koupreng.backend.payment.domain.PaymentStatus;
import com.koupreng.backend.template.infrastructure.persistence.InvitationTemplateRepository;
import com.koupreng.backend.payment.infrastructure.persistence.TemplatePaymentOrderRepository;
import com.koupreng.backend.payment.infrastructure.persistence.UserTemplateAccessRepository;
import com.koupreng.backend.payment.infrastructure.aba.AbaPayWayService;
import com.koupreng.backend.payment.infrastructure.aba.PayWayTransactionVerification;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Collection;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class TemplatePaymentService {

    private static final ZoneId BUSINESS_ZONE = ZoneId.of("Asia/Phnom_Penh");
    private static final DateTimeFormatter ORDER_DATE_FORMAT = DateTimeFormatter.ofPattern("yyMMdd")
            .withZone(BUSINESS_ZONE);
    private static final DateTimeFormatter TRANSACTION_DATE_FORMAT = DateTimeFormatter.ofPattern("yyMMddHHmmss")
            .withZone(BUSINESS_ZONE);
    private static final Pattern ORDER_CODE_PATTERN = Pattern.compile("\\bEVT\\d{9,10}\\b", Pattern.CASE_INSENSITIVE);
    private static final String STATIC_ABA_PAYMENT_LINK = "https://link.payway.com.kh/ABAPAYrD450560q";
    private static final String STATIC_ABA_PAYMENT_CURRENCY = "USD";
    private static final BigDecimal STATIC_ABA_PAYMENT_AMOUNT = new BigDecimal("0.01");
    private static final String KEEP_TEMPLATE_CODE = "garden-royal-khmer-wedding";
    private static final String TEMPLATE_STATUS_ACTIVE = "ACTIVE";
    private static final List<TelegramAmountPattern> TELEGRAM_AMOUNT_PATTERNS = List.of(
            new TelegramAmountPattern(
                    Pattern.compile("\\b(USD|KHR)\\s*([0-9]+(?:\\.[0-9]{1,2})?)\\b", Pattern.CASE_INSENSITIVE),
                    2,
                    1,
                    null
            ),
            new TelegramAmountPattern(
                    Pattern.compile("\\b([0-9]+(?:\\.[0-9]{1,2})?)\\s*(USD|KHR)\\b", Pattern.CASE_INSENSITIVE),
                    1,
                    2,
                    null
            ),
            new TelegramAmountPattern(
                    Pattern.compile("\\$\\s*([0-9]+(?:\\.[0-9]{1,2})?)\\b"),
                    1,
                    0,
                    "USD"
            ),
            new TelegramAmountPattern(
                    Pattern.compile(
                            "\\b(?:Amount|Paid|Total|Received)\\s*[:=]?\\s*(USD|KHR|US\\$|\\$)\\s*([0-9]+(?:\\.[0-9]{1,2})?)\\b",
                            Pattern.CASE_INSENSITIVE
                    ),
                    2,
                    1,
                    null
            ),
            new TelegramAmountPattern(
                    Pattern.compile(
                            "\\b(?:Amount|Paid|Total|Received)\\s*[:=]?\\s*([0-9]+(?:\\.[0-9]{1,2})?)\\s*(USD|KHR)\\b",
                            Pattern.CASE_INSENSITIVE
                    ),
                    1,
                    2,
                    null
            )
    );
    private static final Collection<PaymentStatus> EXPIRABLE_STATUSES = List.of(
            PaymentStatus.PENDING,
            PaymentStatus.PAID_PENDING_REVIEW,
            PaymentStatus.QR_CREATED,
            PaymentStatus.CHECKOUT_CREATED
    );
    private static final Collection<PaymentStatus> ADMIN_LIST_STATUSES = List.of(
            PaymentStatus.PENDING,
            PaymentStatus.PAID_PENDING_REVIEW,
            PaymentStatus.QR_CREATED,
            PaymentStatus.CHECKOUT_CREATED,
            PaymentStatus.PAID,
            PaymentStatus.FAILED,
            PaymentStatus.CANCELLED,
            PaymentStatus.EXPIRED,
            PaymentStatus.REJECTED
    );
    private static final Logger log = LoggerFactory.getLogger(TemplatePaymentService.class);

    private final TemplatePaymentOrderRepository orderRepository;
    private final UserTemplateAccessRepository accessRepository;
    private final InvitationTemplateRepository templateRepository;
    private final CurrentUserService currentUserService;
    private final PaymentProperties paymentProperties;
    private final AbaPayWayService abaPayWayService;
    private final ObjectMapper objectMapper;
    private final AuditLogService auditLogService;
    private final SecureRandom random = new SecureRandom();

    @org.springframework.beans.factory.annotation.Autowired
    public TemplatePaymentService(
            TemplatePaymentOrderRepository orderRepository,
            UserTemplateAccessRepository accessRepository,
            InvitationTemplateRepository templateRepository,
            CurrentUserService currentUserService,
            PaymentProperties paymentProperties,
            AbaPayWayService abaPayWayService,
            ObjectMapper objectMapper,
            AuditLogService auditLogService
    ) {
        this.orderRepository = orderRepository;
        this.accessRepository = accessRepository;
        this.templateRepository = templateRepository;
        this.currentUserService = currentUserService;
        this.paymentProperties = paymentProperties;
        this.abaPayWayService = abaPayWayService;
        this.objectMapper = objectMapper;
        this.auditLogService = auditLogService;
    }

    public TemplatePaymentService(
            TemplatePaymentOrderRepository orderRepository,
            UserTemplateAccessRepository accessRepository,
            InvitationTemplateRepository templateRepository,
            CurrentUserService currentUserService,
            PaymentProperties paymentProperties,
            AbaPayWayService abaPayWayService,
            ObjectMapper objectMapper
    ) {
        this(orderRepository, accessRepository, templateRepository, currentUserService, paymentProperties, abaPayWayService, objectMapper, null);
    }

    @Transactional
    public CreateTemplatePaymentResponse createPaywayQrCheckout(
            Authentication authentication,
            CreateTemplatePaymentRequest request
    ) {
        return createStaticPaymentOrder(authentication, request);
    }

    public CreateTemplatePaymentResponse createPaywayCheckout(
            Authentication authentication,
            CreateTemplatePaymentRequest request
    ) {
        return createPaywayQrCheckout(authentication, request);
    }

    @Transactional
    public CreateTemplatePaymentResponse createPayment(
            Authentication authentication,
            CreateTemplatePaymentRequest request
    ) {
        return createStaticPaymentOrder(authentication, request);
    }

    @Transactional
    public CreateTemplatePaymentResponse createStaticPaymentOrder(
            Authentication authentication,
            CreateTemplatePaymentRequest request
    ) {
        TemplatePaymentOrder saved = createStaticPaymentOrderInternal(authentication, request);
        return CreateTemplatePaymentResponse.from(
                saved,
                "Static ABA payment order created. Copy the order code into the ABA note before paying."
        );
    }

    private TemplatePaymentOrder createStaticPaymentOrderInternal(
            Authentication authentication,
            CreateTemplatePaymentRequest request
    ) {
        AppUser user = currentUserService.currentUser(authentication);
        Long templateId = requirePositiveTemplateId(request.getTemplateId());
        validateTemplateIfCatalogExists(templateId);
        String currency = normalizeCurrency(request.getCurrency());
        BigDecimal amount = money(request.getAmount(), currency);
        requireStaticAbaAmount(currency, amount);
        String templateName = requireText(request.getTemplateName(), "Template name is required");
        String packageName = requireText(request.getPackageName(), "Package name is required");

        if (accessRepository.existsByUserIdAndTemplateIdAndActiveTrue(user.getId(), templateId)) {
            throw new ApiException(HttpStatus.CONFLICT, "Template already unlocked");
        }

        TemplatePaymentOrder order = new TemplatePaymentOrder();
        String orderCode = uniqueOrderCode();
        String staticLink = paymentProperties.getAba().getStaticLink();
        if (staticLink == null || staticLink.isBlank()) {
            staticLink = STATIC_ABA_PAYMENT_LINK;
        }

        order.setOrderCode(orderCode);
        order.setTransactionId(uniqueTransactionId());
        order.setUser(user);
        order.setTemplateId(templateId);
        order.setTemplateName(templateName);
        order.setPackageName(packageName);
        order.setAmount(amount);
        order.setCurrency(currency);
        order.setPaymentLink(staticLink);
        order.setCheckoutUrl(staticLink);
        order.setPaymentNote(orderCode);
        order.setProvider(TemplatePaymentOrder.PROVIDER_ABA_PAYWAY_STATIC_TELEGRAM);
        order.setStatus(PaymentStatus.PENDING);
        order.setExpiresAt(Instant.now().plusSeconds(paymentProperties.getOrderExpiryMinutes() * 60));

        TemplatePaymentOrder saved = orderRepository.save(order);
        log.info("Created static template payment order code={} amount={} provider={} paymentLink={}",
                orderCode, amount, order.getProvider(), maskLink(staticLink));
        return saved;
    }

    @Transactional(readOnly = true)
    public TemplatePaymentStatusResponse getOrderStatus(Authentication authentication, String orderCode) {
        AppUser user = currentUserService.currentUser(authentication);
        TemplatePaymentOrder order = requireOrder(orderCode);
        if (!isOwnerOrAdmin(order, user)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You do not have access to this payment order");
        }
        return TemplatePaymentStatusResponse.from(markExpiredInMemory(order), statusMessage(order.getStatus()));
    }

    @Transactional
    public PayWayCallbackResponse handlePaywayCallback(Map<String, Object> payload, String signatureHeader) {
        if (payload == null || payload.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid PayWay callback");
        }

        String transactionId = callbackText(payload, "tran_id", "transaction_id");
        if (transactionId == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid PayWay callback");
        }

        TemplatePaymentOrder order = orderRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Order not found"));
        order.setCallbackRawJson(toJson(payload));
        order.setPaywayStatus(callbackText(payload, "status"));

        boolean hasCallbackSignature = hasCallbackSignature(payload, signatureHeader);
        if (hasCallbackSignature && !abaPayWayService.verifyCallbackSignature(payload, signatureHeader)) {
            orderRepository.save(order);
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Callback signature/hash verification failed");
        }

        PaymentStatus callbackStatus = mapCallbackStatus(payload.get("status"));
        if (callbackStatus != PaymentStatus.PAID) {
            if (hasCallbackSignature
                    && callbackStatus != PaymentStatus.QR_CREATED
                    && callbackStatus != PaymentStatus.CHECKOUT_CREATED) {
                order.setStatus(callbackStatus);
            }
            orderRepository.save(order);
            return PayWayCallbackResponse.builder()
                    .message(hasCallbackSignature
                            ? "Payment callback received"
                            : "Payment callback received. Waiting for PayWay verification.")
                    .orderCode(order.getOrderCode())
                    .status(order.getStatus())
                    .build();
        }

        PayWayTransactionVerification verification = abaPayWayService.checkTransaction(order.getTransactionId());
        order.setPaywayResponseJson(verification.rawResponseJson());
        order.setPaywayStatus(verification.paywayStatus());
        order.setPaywayTransactionId(verification.paywayTransactionId());

        if (!verification.approved()) {
            order.setStatus(verification.mappedStatus());
            orderRepository.save(order);
            return PayWayCallbackResponse.builder()
                    .message("Payment not approved by PayWay verification")
                    .orderCode(order.getOrderCode())
                    .status(order.getStatus())
                    .build();
        }

        markPaidAfterVerification(order, verification);
        return PayWayCallbackResponse.builder()
                .message("Payment verified. Template unlocked.")
                .orderCode(order.getOrderCode())
                .status(order.getStatus())
                .build();
    }

    public void markPaidAfterVerification(
            TemplatePaymentOrder order,
            PayWayTransactionVerification verification
    ) {
        if (verification.paidAmount() == null) {
            order.setStatus(PaymentStatus.REJECTED);
            orderRepository.save(order);
            throw new ApiException(HttpStatus.BAD_GATEWAY, "ABA PayWay verification failed");
        }
        BigDecimal verifiedAmount = money(verification.paidAmount(), order.getCurrency());
        if (order.getAmount().compareTo(verifiedAmount) != 0) {
            order.setStatus(PaymentStatus.REJECTED);
            orderRepository.save(order);
            throw new ApiException(HttpStatus.BAD_REQUEST, "Amount mismatch");
        }
        if (verification.currency() == null
                || !normalizeCurrency(order.getCurrency()).equals(normalizeCurrency(verification.currency()))) {
            order.setStatus(PaymentStatus.REJECTED);
            orderRepository.save(order);
            throw new ApiException(HttpStatus.BAD_REQUEST, "Currency mismatch");
        }

        markOrderPaid(
                order,
                verifiedAmount,
                TemplatePaymentOrder.CONFIRM_SOURCE_PAYWAY_CALLBACK,
                "aba-payway"
        );
    }

    @Transactional
    public PaymentConfirmResponse detectPaymentFromTelegram(TelegramDetectPaymentRequest request) {
        String rawMessage = requireText(request.getRawMessage(), "Raw Telegram message is required");
        String orderCode = detectOrderCode(rawMessage);
        String botDetectedOrderCode = blankToNull(request.getDetectedOrderCode());
        if (orderCode == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Order code not found in Telegram message");
        }
        if (botDetectedOrderCode == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Detected order code is required");
        }
        if (!orderCode.equalsIgnoreCase(botDetectedOrderCode)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Order code mismatch");
        }

        TelegramAmount detectedPayment = resolveTelegramAmount(rawMessage, request);
        String detectedCurrency = normalizeCurrency(detectedPayment.currency());
        BigDecimal paidAmount = money(detectedPayment.amount(), detectedCurrency);
        requireStaticAbaAmount(detectedCurrency, paidAmount);

        TemplatePaymentOrder order = requireOrderForUpdate(orderCode);

        if (order.getStatus() == PaymentStatus.PAID) {
            throw new ApiException(HttpStatus.CONFLICT, "Order is already paid");
        }

        if (isExpired(order)) {
            order.setStatus(PaymentStatus.EXPIRED);
            orderRepository.save(order);
            return PaymentConfirmResponse.builder()
                    .message("Payment order expired")
                    .orderCode(order.getOrderCode())
                    .status(order.getStatus())
                    .build();
        }

        if (order.getStatus() != PaymentStatus.PENDING
                && order.getStatus() != PaymentStatus.PAID_PENDING_REVIEW) {
            throw new ApiException(HttpStatus.CONFLICT, "Order is not pending payment");
        }

        if (!normalizeCurrency(order.getCurrency()).equals(detectedCurrency)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Currency mismatch");
        }

        requireStaticAbaAmount(order.getCurrency(), order.getAmount());
        if (order.getAmount().compareTo(paidAmount) != 0) {
            order.setStatus(PaymentStatus.REJECTED);
            orderRepository.save(order);
            throw new ApiException(HttpStatus.BAD_REQUEST, "Amount mismatch");
        }

        applyTelegramMetadata(order, request, paidAmount);

        if (!paymentProperties.isAutoConfirmTelegramDetected()) {
            order.setStatus(PaymentStatus.PAID_PENDING_REVIEW);
            orderRepository.save(order);
            return PaymentConfirmResponse.builder()
                    .message("Telegram payment detected. Waiting for admin review.")
                    .orderCode(order.getOrderCode())
                    .status(order.getStatus())
                    .build();
        }

        markOrderPaid(
                order,
                paidAmount,
                TemplatePaymentOrder.CONFIRM_SOURCE_TELEGRAM_ABA_ALERT,
                requireText(request.getDetectedBy(), "Detected by is required")
        );
        return PaymentConfirmResponse.builder()
                .message("Telegram payment verified. Template unlocked.")
                .orderCode(order.getOrderCode())
                .status(order.getStatus())
                .build();
    }

    @Transactional
    public PaymentConfirmResponse confirmManualPayment(ConfirmTemplatePaymentRequest request) {
        TemplatePaymentOrder order = requireOrderForUpdate(request.getOrderCode());
        BigDecimal paidAmount = money(request.getAmount(), order.getCurrency());

        if (order.getStatus() == PaymentStatus.PAID) {
            return PaymentConfirmResponse.builder()
                    .message("Order is already paid")
                    .orderCode(order.getOrderCode())
                    .status(order.getStatus())
                    .build();
        }

        if (isExpired(order)) {
            order.setStatus(PaymentStatus.EXPIRED);
            orderRepository.save(order);
            return PaymentConfirmResponse.builder()
                    .message("Payment order expired")
                    .orderCode(order.getOrderCode())
                    .status(order.getStatus())
                    .build();
        }

        if (order.getAmount().compareTo(paidAmount) != 0) {
            order.setStatus(PaymentStatus.REJECTED);
            orderRepository.save(order);
            throw new ApiException(HttpStatus.BAD_REQUEST, "Amount mismatch");
        }

        markOrderPaid(
                order,
                paidAmount,
                TemplatePaymentOrder.CONFIRM_SOURCE_MANUAL_ADMIN,
                requireText(request.getConfirmedBy(), "Confirmed by is required")
        );
        return PaymentConfirmResponse.builder()
                .message("Payment confirmed manually. Template unlocked.")
                .orderCode(order.getOrderCode())
                .status(order.getStatus())
                .build();
    }

    @Transactional(readOnly = true)
    public List<UserTemplateAccessResponse> getPaidTemplates(Authentication authentication) {
        AppUser user = currentUserService.currentUser(authentication);
        return accessRepository.findByUserIdAndActiveTrue(user.getId()).stream()
                .map(UserTemplateAccessResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public TemplateAccessCheckResponse hasTemplateAccess(Authentication authentication, Long templateId) {
        AppUser user = currentUserService.currentUser(authentication);
        Long validTemplateId = requirePositiveTemplateId(templateId);
        boolean hasAccess = accessRepository.existsByUserIdAndTemplateIdAndActiveTrue(user.getId(), validTemplateId);
        return TemplateAccessCheckResponse.builder()
                .templateId(validTemplateId)
                .hasAccess(hasAccess)
                .build();
    }

    @Transactional
    public void expireOldOrdersIfNeeded() {
        List<TemplatePaymentOrder> expired = orderRepository.findByStatusInAndExpiresAtBefore(
                EXPIRABLE_STATUSES,
                Instant.now()
        );
        for (TemplatePaymentOrder order : expired) {
            order.setStatus(PaymentStatus.EXPIRED);
        }
        orderRepository.saveAll(expired);
    }

    @Transactional(readOnly = true)
    public List<TemplatePaymentStatusResponse> listOrdersForAdmin() {
        return orderRepository.findByStatusInOrderByCreatedAtDesc(ADMIN_LIST_STATUSES).stream()
                .map(order -> TemplatePaymentStatusResponse.from(order, statusMessage(order.getStatus())))
                .toList();
    }

    private void unlockTemplate(TemplatePaymentOrder order) {
        Long userId = order.getUser().getId();
        if (accessRepository.existsByUserIdAndTemplateIdAndActiveTrue(userId, order.getTemplateId())) {
            return;
        }

        UserTemplateAccess access = new UserTemplateAccess();
        access.setUser(order.getUser());
        access.setTemplateId(order.getTemplateId());
        access.setOrder(order);
        access.setAccessType(UserTemplateAccess.ACCESS_TYPE_PURCHASED);
        access.setActive(true);
        accessRepository.save(access);
    }

    private void markOrderPaid(
            TemplatePaymentOrder order,
            BigDecimal paidAmount,
            String confirmSource,
            String confirmedBy
    ) {
        Instant now = Instant.now();
        order.setStatus(PaymentStatus.PAID);
        order.setPaidAmount(paidAmount);
        order.setConfirmSource(confirmSource);
        order.setConfirmedBy(confirmedBy);
        order.setConfirmedAt(now);
        order.setPaidAt(now);
        orderRepository.save(order);
        unlockTemplate(order);
        if (auditLogService != null) {
            auditLogService.logSystemEvent(
                    "PAYMENT_CONFIRMED",
                    "PAYMENT",
                    order.getId(),
                    "Payment confirmed via " + confirmSource + " by " + confirmedBy + " for amount: " + paidAmount + " " + order.getCurrency(),
                    Map.of("orderCode", order.getOrderCode(), "confirmSource", confirmSource, "confirmedBy", confirmedBy)
            );
        }
    }

    private void applyTelegramMetadata(
            TemplatePaymentOrder order,
            TelegramDetectPaymentRequest request,
            BigDecimal detectedAmount
    ) {
        order.setPaidAmount(detectedAmount);
        order.setConfirmSource(TemplatePaymentOrder.CONFIRM_SOURCE_TELEGRAM_ABA_ALERT);
        order.setConfirmedBy(requireText(request.getDetectedBy(), "Detected by is required"));
        order.setRawTelegramMessage(request.getRawMessage());
        order.setTelegramChatId(blankToNull(request.getTelegramChatId()));
        order.setTelegramMessageId(blankToNull(request.getTelegramMessageId()));
        order.setTelegramSenderUsername(blankToNull(request.getTelegramSenderUsername()));
        order.setTelegramSenderId(blankToNull(request.getTelegramSenderId()));
        order.setPaywayTransactionId(blankToNull(request.getPaywayTransactionId()));
        order.setPaywayApprovalCode(blankToNull(request.getPaywayApprovalCode()));
        order.setPaywayStatus(paywayStatusFromTelegram(request));
    }

    private String paywayStatusFromTelegram(TelegramDetectPaymentRequest request) {
        String approvalCode = blankToNull(request.getPaywayApprovalCode());
        if (approvalCode == null) {
            return "TELEGRAM_ABA_ALERT";
        }
        return "TELEGRAM_ABA_ALERT_APV_" + approvalCode;
    }

    private String detectOrderCode(String rawMessage) {
        Matcher matcher = ORDER_CODE_PATTERN.matcher(rawMessage);
        return matcher.find() ? matcher.group().toUpperCase(Locale.ROOT) : null;
    }

    private TelegramAmount resolveTelegramAmount(String rawMessage, TelegramDetectPaymentRequest request) {
        TelegramAmount rawDetectedAmount = detectAmount(rawMessage);
        if (rawDetectedAmount == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Amount not found in Telegram message");
        }
        if (request.getDetectedAmount() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Detected amount is required");
        }

        String rawCurrency = normalizeCurrency(rawDetectedAmount.currency());
        String requestCurrency = normalizeCurrency(request.getDetectedCurrency());
        if (!rawCurrency.equals(requestCurrency)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Currency mismatch");
        }

        BigDecimal normalizedRawAmount = money(rawDetectedAmount.amount(), rawCurrency);
        BigDecimal requestDetectedAmount = money(request.getDetectedAmount(), requestCurrency);
        if (requestDetectedAmount.compareTo(normalizedRawAmount) != 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Amount mismatch");
        }
        return new TelegramAmount(normalizedRawAmount, rawCurrency);
    }

    private TelegramAmount detectAmount(String rawMessage) {
        for (TelegramAmountPattern amountPattern : TELEGRAM_AMOUNT_PATTERNS) {
            Matcher matcher = amountPattern.pattern().matcher(rawMessage);
            if (matcher.find()) {
                try {
                    String currency = amountPattern.fixedCurrency() != null
                            ? amountPattern.fixedCurrency()
                            : matcher.group(amountPattern.currencyGroup());
                    return new TelegramAmount(
                            new BigDecimal(matcher.group(amountPattern.amountGroup())),
                            normalizeCurrency(currency)
                    );
                } catch (NumberFormatException exception) {
                    return null;
                }
            }
        }
        return null;
    }

    private boolean isExpired(TemplatePaymentOrder order) {
        return order.getExpiresAt() != null && Instant.now().isAfter(order.getExpiresAt());
    }

    private TemplatePaymentOrder markExpiredInMemory(TemplatePaymentOrder order) {
        if (EXPIRABLE_STATUSES.contains(order.getStatus())
                && order.getExpiresAt() != null
                && Instant.now().isAfter(order.getExpiresAt())) {
            order.setStatus(PaymentStatus.EXPIRED);
        }
        return order;
    }

    private TemplatePaymentOrder requireOrder(String orderCode) {
        String normalized = requireText(orderCode, "Order code is required").toUpperCase(Locale.ROOT);
        return orderRepository.findByOrderCode(normalized)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Order not found"));
    }

    private TemplatePaymentOrder requireOrderForUpdate(String orderCode) {
        String normalized = requireText(orderCode, "Order code is required").toUpperCase(Locale.ROOT);
        return orderRepository.findForUpdateByOrderCode(normalized)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Order not found"));
    }

    private boolean isOwnerOrAdmin(TemplatePaymentOrder order, AppUser user) {
        return user.getRole() == Role.ADMIN
                || (order.getUser() != null && order.getUser().getId().equals(user.getId()));
    }

    private void validateTemplateIfCatalogExists(Long templateId) {
        if (templateRepository.count() == 0) {
            return;
        }
        boolean purchasable = templateRepository.findById(templateId)
                .map(template -> KEEP_TEMPLATE_CODE.equalsIgnoreCase(template.getCode())
                        && TEMPLATE_STATUS_ACTIVE.equalsIgnoreCase(template.getStatus()))
                .orElse(false);
        if (!purchasable) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Template not found");
        }
    }

    private String uniqueOrderCode() {
        String date = ORDER_DATE_FORMAT.format(Instant.now());
        for (int attempt = 0; attempt < 80; attempt++) {
            int randomSuffix = attempt < 40 ? random.nextInt(900) + 100 : random.nextInt(9000) + 1000;
            String candidate = "EVT" + date + randomSuffix;
            if (!orderRepository.existsByOrderCode(candidate)) {
                return candidate;
            }
        }
        throw new ApiException(HttpStatus.CONFLICT, "Could not generate unique order code");
    }

    private String uniqueTransactionId() {
        String date = TRANSACTION_DATE_FORMAT.format(Instant.now());
        for (int attempt = 0; attempt < 80; attempt++) {
            String candidate = "PW" + date + (random.nextInt(90) + 10);
            if (!orderRepository.existsByTransactionId(candidate)) {
                return candidate;
            }
        }
        throw new ApiException(HttpStatus.CONFLICT, "Could not generate unique transaction ID");
    }

    private Long requirePositiveTemplateId(Long templateId) {
        if (templateId == null || templateId <= 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Template ID is required");
        }
        return templateId;
    }

    private String normalizeCurrency(String currency) {
        String normalized = currency == null || currency.isBlank()
                ? "USD"
                : currency.trim().toUpperCase(Locale.ROOT);
        if ("$".equals(normalized) || "US$".equals(normalized)) {
            normalized = "USD";
        }
        if (!"USD".equals(normalized) && !"KHR".equals(normalized)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Currency mismatch");
        }
        return normalized;
    }

    private BigDecimal money(BigDecimal amount, String currency) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid amount");
        }
        try {
            if ("KHR".equalsIgnoreCase(currency)) {
                return amount.setScale(0, RoundingMode.UNNECESSARY);
            }
            return amount.setScale(2, RoundingMode.UNNECESSARY);
        } catch (ArithmeticException exception) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Amount must have at most two decimal places");
        }
    }

    private void requireStaticAbaAmount(String currency, BigDecimal amount) {
        String normalizedCurrency = normalizeCurrency(currency);
        if (!STATIC_ABA_PAYMENT_CURRENCY.equals(normalizedCurrency)
                || amount == null
                || STATIC_ABA_PAYMENT_AMOUNT.compareTo(amount) != 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Static ABA payment amount must be USD 0.01");
        }
    }

    private String requireText(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, message);
        }
        return value.trim();
    }

    private String blankToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private PaymentStatus mapCallbackStatus(Object value) {
        String status = value == null ? "" : String.valueOf(value).trim();
        return switch (status.toLowerCase(Locale.ROOT)) {
            case "0", "approved", "success", "paid" -> PaymentStatus.PAID;
            case "1", "2", "created", "pending" -> PaymentStatus.QR_CREATED;
            case "3", "declined", "failed", "fail" -> PaymentStatus.FAILED;
            case "4", "cancelled", "canceled" -> PaymentStatus.CANCELLED;
            default -> PaymentStatus.REJECTED;
        };
    }

    private String callbackText(Map<String, Object> payload, String... keys) {
        for (String key : keys) {
            Object value = payload.get(key);
            if (value != null && !String.valueOf(value).isBlank()) {
                return String.valueOf(value).trim();
            }
        }
        return null;
    }

    private boolean hasCallbackSignature(Map<String, Object> payload, String signatureHeader) {
        return (signatureHeader != null && !signatureHeader.isBlank())
                || callbackText(payload, "hash", "signature", "hmac") != null;
    }

    private String statusMessage(PaymentStatus status) {
        return switch (status) {
            case PENDING -> "Payment order created.";
            case PAID_PENDING_REVIEW -> "Payment detected. Waiting for admin review.";
            case QR_CREATED -> "QR created. Waiting for PayWay payment callback.";
            case CHECKOUT_CREATED -> "Checkout created. Waiting for PayWay payment callback.";
            case PAID -> "Payment verified. Template unlocked.";
            case FAILED -> "Payment failed.";
            case CANCELLED -> "Payment was cancelled.";
            case EXPIRED -> "Payment order expired.";
            case REJECTED -> "Payment was rejected during verification.";
        };
    }

    private String toJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException exception) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not serialize PayWay callback");
        }
    }

    private String maskLink(String link) {
        if (link == null || link.length() <= 12) {
            return "***";
        }
        return link.substring(0, 12) + "..." + link.substring(link.length() - 4);
    }

    private record TelegramAmount(BigDecimal amount, String currency) {
    }

    private record TelegramAmountPattern(Pattern pattern, int amountGroup, int currencyGroup, String fixedCurrency) {
    }
}
