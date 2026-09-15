package com.koupreng.backend.payment.application;

import com.koupreng.backend.user.application.CurrentUserService;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.config.PaymentProperties;
import com.koupreng.backend.payment.api.dto.CreateTemplatePaymentRequest;
import com.koupreng.backend.payment.api.dto.CreateTemplatePaymentResponse;
import com.koupreng.backend.payment.api.dto.PayWayCallbackResponse;
import com.koupreng.backend.payment.api.dto.PaymentConfirmResponse;
import com.koupreng.backend.payment.api.dto.TelegramDetectPaymentRequest;
import com.koupreng.backend.payment.domain.TemplatePaymentOrder;
import com.koupreng.backend.payment.domain.UserTemplateAccess;
import com.koupreng.backend.user.domain.AppUser;
import com.koupreng.backend.user.domain.Role;
import com.koupreng.backend.enums.PaymentStatus;
import com.koupreng.backend.template.infrastructure.persistence.InvitationTemplateRepository;
import com.koupreng.backend.payment.infrastructure.persistence.TemplatePaymentOrderRepository;
import com.koupreng.backend.payment.infrastructure.persistence.UserTemplateAccessRepository;
import com.koupreng.backend.payment.infrastructure.aba.AbaPayWayService;
import com.koupreng.backend.payment.infrastructure.aba.PayWayTransactionVerification;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class TemplatePaymentServiceTests {

    private static final String STATIC_PAYMENT_LINK = "https://link.payway.com.kh/ABAPAYrD450560q";

    @Test
    void telegramDetectionRequiresExplicitAutoConfirmOptIn() {
        assertFalse(new PaymentProperties().isAutoConfirmTelegramDetected());
    }

    @Test
    void createPaywayCheckoutKeepsStaticFlowEvenWhenProviderModeIsNonStatic() {
        Fixture fixture = fixture();
        fixture.paymentProperties.setProviderMode("dynamic");

        CreateTemplatePaymentResponse response = fixture.service.createPaywayCheckout(
                fixture.authentication,
                createStaticRequest()
        );

        assertTrue(response.getOrderCode().matches("EVT\\d{9,10}"));
        assertNotNull(response.getTransactionId());
        assertEquals(10L, response.getTemplateId());
        assertEquals(new BigDecimal("0.01"), response.getAmount());
        assertEquals(STATIC_PAYMENT_LINK, response.getPaymentLink());
        assertEquals(PaymentStatus.PENDING, response.getStatus());
        assertEquals(TemplatePaymentOrder.PROVIDER_ABA_PAYWAY_STATIC_TELEGRAM, response.getProvider());
        verify(fixture.abaPayWayService, never()).createCheckout(any(), any(), any());
    }

    @Test
    void createStaticPaymentOrderCreatesPendingOrderWithAbaLinkAndPaymentNote() {
        Fixture fixture = fixture();

        CreateTemplatePaymentResponse response = fixture.service.createStaticPaymentOrder(
                fixture.authentication,
                createStaticRequest()
        );

        assertTrue(response.getOrderCode().matches("EVT\\d{9,10}"));
        assertEquals(10L, response.getTemplateId());
        assertEquals(new BigDecimal("0.01"), response.getAmount());
        assertEquals(STATIC_PAYMENT_LINK, response.getPaymentLink());
        assertEquals(STATIC_PAYMENT_LINK, response.getCheckoutUrl());
        assertEquals(response.getOrderCode(), response.getPaymentNote());
        assertEquals(TemplatePaymentOrder.PROVIDER_ABA_PAYWAY_STATIC_TELEGRAM, response.getProvider());
        assertEquals(PaymentStatus.PENDING, response.getStatus());
    }

    @Test
    void createPaymentDelegatesToStaticPaymentFlow() {
        Fixture fixture = fixture();

        CreateTemplatePaymentResponse response = fixture.service.createPayment(
                fixture.authentication,
                createStaticRequest()
        );

        assertTrue(response.getOrderCode().matches("EVT\\d{9,10}"));
        assertEquals(new BigDecimal("0.01"), response.getAmount());
        assertEquals(STATIC_PAYMENT_LINK, response.getPaymentLink());
        assertEquals(TemplatePaymentOrder.PROVIDER_ABA_PAYWAY_STATIC_TELEGRAM, response.getProvider());
        assertEquals(PaymentStatus.PENDING, response.getStatus());
    }

    @Test
    void createPaywayCheckoutUsesStaticPaymentFlowWhenProviderModeIsStatic() {
        Fixture fixture = fixture();

        CreateTemplatePaymentResponse response = fixture.service.createPaywayCheckout(
                fixture.authentication,
                createStaticRequest()
        );

        assertEquals(new BigDecimal("0.01"), response.getAmount());
        assertEquals(STATIC_PAYMENT_LINK, response.getPaymentLink());
        assertEquals(TemplatePaymentOrder.PROVIDER_ABA_PAYWAY_STATIC_TELEGRAM, response.getProvider());
        assertEquals(PaymentStatus.PENDING, response.getStatus());
        verify(fixture.abaPayWayService, never()).createCheckout(any(), any(), any());
    }

    @Test
    void createPaywayCheckoutRejectsAlreadyUnlockedTemplate() {
        Fixture fixture = fixture();
        fixture.paymentProperties.setProviderMode("dynamic");
        when(fixture.accessRepository.existsByUserIdAndTemplateIdAndActiveTrue(1L, 10L)).thenReturn(true);

        ApiException exception = assertThrows(
                ApiException.class,
                () -> fixture.service.createPaywayCheckout(fixture.authentication, createStaticRequest())
        );

        assertEquals(HttpStatus.CONFLICT, exception.getStatus());
    }

    @Test
    void createStaticPaymentOrderRejectsAmountOtherThanStaticAbaAmount() {
        Fixture fixture = fixture();
        CreateTemplatePaymentRequest request = createStaticRequest();
        request.setAmount(new BigDecimal("1.00"));

        ApiException exception = assertThrows(
                ApiException.class,
                () -> fixture.service.createStaticPaymentOrder(fixture.authentication, request)
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
        assertEquals("Static ABA payment amount must be USD 0.01", exception.getMessage());
    }

    @Test
    void createStaticPaymentOrderRejectsUnknownTemplateWhenCatalogExists() {
        Fixture fixture = fixture();
        when(fixture.templateRepository.count()).thenReturn(1L);
        when(fixture.templateRepository.existsById(10L)).thenReturn(false);

        ApiException exception = assertThrows(
                ApiException.class,
                () -> fixture.service.createStaticPaymentOrder(fixture.authentication, createStaticRequest())
        );

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatus());
        assertEquals("Template not found", exception.getMessage());
    }

    @Test
    void telegramDetectMarksMatchingStaticOrderPaidAndUnlocksTemplate() {
        Fixture fixture = fixture();
        TemplatePaymentOrder order = order(fixture.owner, PaymentStatus.PENDING, new BigDecimal("0.01"));
        when(fixture.orderRepository.findForUpdateByOrderCode(order.getOrderCode())).thenReturn(Optional.of(order));

        TelegramDetectPaymentRequest request = new TelegramDetectPaymentRequest();
        request.setRawMessage("Received: USD0.01 Note: " + order.getOrderCode() + " Trx. ID: 178002414241549 APV: 704787");
        request.setDetectedBy("telegram-bot");
        request.setTelegramChatId("-100123");
        request.setTelegramMessageId("77");
        request.setTelegramSenderUsername("PayWayByABA_bot");
        request.setTelegramSenderId("123456");
        request.setDetectedOrderCode(order.getOrderCode());
        request.setDetectedAmount(new BigDecimal("0.01"));
        request.setDetectedCurrency("USD");
        request.setPaywayTransactionId("178002414241549");
        request.setPaywayApprovalCode("704787");

        PaymentConfirmResponse response = fixture.service.detectPaymentFromTelegram(request);

        assertEquals(PaymentStatus.PAID, response.getStatus());
        assertEquals(new BigDecimal("0.01"), order.getPaidAmount());
        assertEquals(TemplatePaymentOrder.CONFIRM_SOURCE_TELEGRAM_ABA_ALERT, order.getConfirmSource());
        assertEquals("telegram-bot", order.getConfirmedBy());
        assertEquals("PayWayByABA_bot", order.getTelegramSenderUsername());
        assertEquals("123456", order.getTelegramSenderId());
        assertEquals("178002414241549", order.getPaywayTransactionId());
        assertEquals("704787", order.getPaywayApprovalCode());
        assertNotNull(order.getPaidAt());
        verify(fixture.accessRepository).save(any(UserTemplateAccess.class));
    }

    @Test
    void telegramDetectWithoutOrderCodeRejectsWithoutUnlockingTemplate() {
        Fixture fixture = fixture();

        TelegramDetectPaymentRequest request = new TelegramDetectPaymentRequest();
        request.setRawMessage("$0.01 paid by RAN NARATH via ABA PAY at KOEURNG VIREAK. Trx. ID: 178002414241549");
        request.setDetectedBy("telegram-bot");
        request.setDetectedAmount(new BigDecimal("0.01"));
        request.setDetectedCurrency("USD");
        request.setPaywayTransactionId("178002414241549");

        ApiException exception = assertThrows(
                ApiException.class,
                () -> fixture.service.detectPaymentFromTelegram(request)
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
        assertEquals("Order code not found in Telegram message", exception.getMessage());
        verify(fixture.orderRepository, never()).findForUpdateByOrderCode(any());
        verify(fixture.accessRepository, never()).save(any(UserTemplateAccess.class));
    }

    @Test
    void telegramDetectRejectsWhenDetectedOrderCodeDoesNotMatchRawMessage() {
        Fixture fixture = fixture();
        TemplatePaymentOrder order = order(fixture.owner, PaymentStatus.PENDING, new BigDecimal("0.01"));

        TelegramDetectPaymentRequest request = new TelegramDetectPaymentRequest();
        request.setRawMessage("ABA payment received USD 0.01 Note: " + order.getOrderCode());
        request.setDetectedBy("telegram-bot");
        request.setDetectedOrderCode("EVT260526999");
        request.setDetectedAmount(new BigDecimal("0.01"));
        request.setDetectedCurrency("USD");

        ApiException exception = assertThrows(
                ApiException.class,
                () -> fixture.service.detectPaymentFromTelegram(request)
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
        assertEquals("Order code mismatch", exception.getMessage());
        verify(fixture.orderRepository, never()).findForUpdateByOrderCode(any());
        verify(fixture.accessRepository, never()).save(any(UserTemplateAccess.class));
    }

    @Test
    void telegramDetectRejectsAmountMismatch() {
        Fixture fixture = fixture();
        TemplatePaymentOrder order = order(fixture.owner, PaymentStatus.PENDING, new BigDecimal("0.01"));
        when(fixture.orderRepository.findForUpdateByOrderCode(order.getOrderCode())).thenReturn(Optional.of(order));

        TelegramDetectPaymentRequest request = new TelegramDetectPaymentRequest();
        request.setRawMessage("ABA payment received USD 0.02 Note: " + order.getOrderCode());
        request.setDetectedBy("telegram-bot");
        request.setDetectedOrderCode(order.getOrderCode());
        request.setDetectedAmount(new BigDecimal("0.02"));
        request.setDetectedCurrency("USD");

        ApiException exception = assertThrows(
                ApiException.class,
                () -> fixture.service.detectPaymentFromTelegram(request)
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
        assertEquals("Static ABA payment amount must be USD 0.01", exception.getMessage());
        assertEquals(PaymentStatus.PENDING, order.getStatus());
        verify(fixture.accessRepository, never()).save(any(UserTemplateAccess.class));
    }

    @Test
    void telegramDetectRejectsUnknownOrderWithoutUnlockingTemplate() {
        Fixture fixture = fixture();
        when(fixture.orderRepository.findForUpdateByOrderCode("EVT260526001")).thenReturn(Optional.empty());

        TelegramDetectPaymentRequest request = telegramDetectRequest("EVT260526001");

        ApiException exception = assertThrows(
                ApiException.class,
                () -> fixture.service.detectPaymentFromTelegram(request)
        );

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatus());
        assertEquals("Order not found", exception.getMessage());
        verify(fixture.accessRepository, never()).save(any(UserTemplateAccess.class));
    }

    @Test
    void telegramDetectExpiresExpiredOrderWithoutUnlockingTemplate() {
        Fixture fixture = fixture();
        TemplatePaymentOrder order = order(fixture.owner, PaymentStatus.PENDING, new BigDecimal("0.01"));
        order.setExpiresAt(Instant.now().minusSeconds(1));
        when(fixture.orderRepository.findForUpdateByOrderCode(order.getOrderCode())).thenReturn(Optional.of(order));

        PaymentConfirmResponse response = fixture.service.detectPaymentFromTelegram(
                telegramDetectRequest(order.getOrderCode())
        );

        assertEquals(PaymentStatus.EXPIRED, response.getStatus());
        assertEquals(PaymentStatus.EXPIRED, order.getStatus());
        verify(fixture.accessRepository, never()).save(any(UserTemplateAccess.class));
    }

    @Test
    void telegramDetectRejectsAlreadyPaidDuplicateWithoutUnlockingAgain() {
        Fixture fixture = fixture();
        TemplatePaymentOrder order = order(fixture.owner, PaymentStatus.PAID, new BigDecimal("0.01"));
        when(fixture.orderRepository.findForUpdateByOrderCode(order.getOrderCode())).thenReturn(Optional.of(order));

        ApiException exception = assertThrows(
                ApiException.class,
                () -> fixture.service.detectPaymentFromTelegram(telegramDetectRequest(order.getOrderCode()))
        );

        assertEquals(HttpStatus.CONFLICT, exception.getStatus());
        assertEquals("Order is already paid", exception.getMessage());
        verify(fixture.accessRepository, never()).save(any(UserTemplateAccess.class));
    }

    @Test
    void telegramDetectWithAutoConfirmDisabledKeepsOrderPendingReview() {
        Fixture fixture = fixture();
        fixture.paymentProperties.setAutoConfirmTelegramDetected(false);
        TemplatePaymentOrder order = order(fixture.owner, PaymentStatus.PENDING, new BigDecimal("0.01"));
        when(fixture.orderRepository.findForUpdateByOrderCode(order.getOrderCode())).thenReturn(Optional.of(order));

        TelegramDetectPaymentRequest request = new TelegramDetectPaymentRequest();
        request.setRawMessage("ABA payment received 0.01 USD Note: " + order.getOrderCode());
        request.setDetectedBy("telegram-bot");
        request.setDetectedOrderCode(order.getOrderCode());
        request.setDetectedAmount(new BigDecimal("0.01"));
        request.setDetectedCurrency("USD");

        PaymentConfirmResponse response = fixture.service.detectPaymentFromTelegram(request);

        assertEquals(PaymentStatus.PAID_PENDING_REVIEW, response.getStatus());
        assertEquals(PaymentStatus.PAID_PENDING_REVIEW, order.getStatus());
        verify(fixture.accessRepository, never()).save(any(UserTemplateAccess.class));
    }

    @Test
    void callbackVerifiesWithPayWayBeforeMarkingPaidAndUnlockingTemplate() {
        Fixture fixture = fixture();
        TemplatePaymentOrder order = order(fixture.owner, PaymentStatus.QR_CREATED, new BigDecimal("5.00"));
        Map<String, Object> payload = Map.of("tran_id", order.getTransactionId(), "status", "0", "apv", "123456");
        when(fixture.orderRepository.findByTransactionId(order.getTransactionId())).thenReturn(Optional.of(order));
        when(fixture.abaPayWayService.verifyCallbackSignature(payload, "sig")).thenReturn(true);
        when(fixture.abaPayWayService.checkTransaction(order.getTransactionId()))
                .thenReturn(new PayWayTransactionVerification(
                        true,
                        PaymentStatus.PAID,
                        new BigDecimal("5.00"),
                        "USD",
                        "APPROVED",
                        order.getTransactionId(),
                        "{\"data\":{\"payment_status\":\"APPROVED\"}}"
                ));

        PayWayCallbackResponse response = fixture.service.handlePaywayCallback(payload, "sig");

        assertEquals(PaymentStatus.PAID, response.getStatus());
        assertEquals(new BigDecimal("5.00"), order.getPaidAmount());
        assertEquals(TemplatePaymentOrder.CONFIRM_SOURCE_PAYWAY_CALLBACK, order.getConfirmSource());
        assertNotNull(order.getPaidAt());
        verify(fixture.accessRepository).save(any(UserTemplateAccess.class));
    }

    @Test
    void unsignedSuccessCallbackStillRequiresPayWayCheckTransactionBeforeUnlockingTemplate() {
        Fixture fixture = fixture();
        TemplatePaymentOrder order = order(fixture.owner, PaymentStatus.QR_CREATED, new BigDecimal("5.00"));
        Map<String, Object> payload = Map.of("tran_id", order.getTransactionId(), "status", "0", "apv", "123456");
        when(fixture.orderRepository.findByTransactionId(order.getTransactionId())).thenReturn(Optional.of(order));
        when(fixture.abaPayWayService.checkTransaction(order.getTransactionId()))
                .thenReturn(new PayWayTransactionVerification(
                        true,
                        PaymentStatus.PAID,
                        new BigDecimal("5.00"),
                        "USD",
                        "APPROVED",
                        order.getTransactionId(),
                        "{\"status\":0,\"description\":\"approved\"}"
                ));

        PayWayCallbackResponse response = fixture.service.handlePaywayCallback(payload, null);

        assertEquals(PaymentStatus.PAID, response.getStatus());
        verify(fixture.abaPayWayService, never()).verifyCallbackSignature(any(), any());
        verify(fixture.abaPayWayService).checkTransaction(order.getTransactionId());
        verify(fixture.accessRepository).save(any(UserTemplateAccess.class));
    }

    @Test
    void callbackRejectsInvalidSignatureWithoutUnlockingTemplate() {
        Fixture fixture = fixture();
        TemplatePaymentOrder order = order(fixture.owner, PaymentStatus.QR_CREATED, new BigDecimal("5.00"));
        Map<String, Object> payload = Map.of("tran_id", order.getTransactionId(), "status", "0");
        when(fixture.orderRepository.findByTransactionId(order.getTransactionId())).thenReturn(Optional.of(order));
        when(fixture.abaPayWayService.verifyCallbackSignature(payload, "bad")).thenReturn(false);

        ApiException exception = assertThrows(
                ApiException.class,
                () -> fixture.service.handlePaywayCallback(payload, "bad")
        );

        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatus());
        assertEquals(PaymentStatus.QR_CREATED, order.getStatus());
        verify(fixture.accessRepository, never()).save(any(UserTemplateAccess.class));
    }

    @Test
    void callbackRejectsAmountMismatch() {
        Fixture fixture = fixture();
        TemplatePaymentOrder order = order(fixture.owner, PaymentStatus.QR_CREATED, new BigDecimal("5.00"));
        Map<String, Object> payload = Map.of("tran_id", order.getTransactionId(), "status", "0");
        when(fixture.orderRepository.findByTransactionId(order.getTransactionId())).thenReturn(Optional.of(order));
        when(fixture.abaPayWayService.verifyCallbackSignature(payload, "sig")).thenReturn(true);
        when(fixture.abaPayWayService.checkTransaction(order.getTransactionId()))
                .thenReturn(new PayWayTransactionVerification(
                        true,
                        PaymentStatus.PAID,
                        new BigDecimal("4.00"),
                        "USD",
                        "APPROVED",
                        order.getTransactionId(),
                        "{}"
                ));

        ApiException exception = assertThrows(
                ApiException.class,
                () -> fixture.service.handlePaywayCallback(payload, "sig")
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
        assertEquals("Amount mismatch", exception.getMessage());
        assertEquals(PaymentStatus.REJECTED, order.getStatus());
        verify(fixture.accessRepository, never()).save(any(UserTemplateAccess.class));
    }

    @Test
    void nonOwnerCannotViewOrder() {
        Fixture fixture = fixture();
        TemplatePaymentOrder order = order(fixture.owner, PaymentStatus.QR_CREATED, new BigDecimal("5.00"));
        when(fixture.orderRepository.findByOrderCode("EVT260526001")).thenReturn(Optional.of(order));
        AppUser other = user(2L, Role.USER);
        when(fixture.currentUserService.currentUser(fixture.authentication)).thenReturn(other);

        ApiException exception = assertThrows(
                ApiException.class,
                () -> fixture.service.getOrderStatus(fixture.authentication, "EVT260526001")
        );

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatus());
    }

    private Fixture fixture() {
        TemplatePaymentOrderRepository orderRepository = mock(TemplatePaymentOrderRepository.class);
        UserTemplateAccessRepository accessRepository = mock(UserTemplateAccessRepository.class);
        InvitationTemplateRepository templateRepository = mock(InvitationTemplateRepository.class);
        CurrentUserService currentUserService = mock(CurrentUserService.class);
        AbaPayWayService abaPayWayService = mock(AbaPayWayService.class);
        PaymentProperties paymentProperties = new PaymentProperties();
        paymentProperties.setAutoConfirmTelegramDetected(true);
        paymentProperties.setOrderExpiryMinutes(60);
        paymentProperties.getAba().setStaticLink(STATIC_PAYMENT_LINK);
        Authentication authentication = mock(Authentication.class);
        AppUser owner = user(1L, Role.USER);
        TemplatePaymentService service = new TemplatePaymentService(
                orderRepository,
                accessRepository,
                templateRepository,
                currentUserService,
                paymentProperties,
                abaPayWayService,
                new ObjectMapper()
        );

        when(currentUserService.currentUser(authentication)).thenReturn(owner);
        when(templateRepository.count()).thenReturn(0L);
        when(orderRepository.existsByOrderCode(any())).thenReturn(false);
        when(orderRepository.existsByTransactionId(any())).thenReturn(false);
        when(orderRepository.save(any(TemplatePaymentOrder.class))).thenAnswer(invocation -> {
            TemplatePaymentOrder order = invocation.getArgument(0);
            if (order.getId() == null) {
                order.setId(99L);
            }
            return order;
        });
        when(accessRepository.existsByUserIdAndTemplateIdAndActiveTrue(any(), any())).thenReturn(false);

        return new Fixture(
                service,
                orderRepository,
                accessRepository,
                templateRepository,
                currentUserService,
                abaPayWayService,
                paymentProperties,
                authentication,
                owner
        );
    }

    private CreateTemplatePaymentRequest createStaticRequest() {
        CreateTemplatePaymentRequest request = new CreateTemplatePaymentRequest();
        request.setTemplateId(10L);
        request.setTemplateName("Khmer Wedding Gold");
        request.setPackageName("Premium");
        request.setAmount(new BigDecimal("0.01"));
        request.setCurrency("USD");
        return request;
    }

    private TelegramDetectPaymentRequest telegramDetectRequest(String orderCode) {
        TelegramDetectPaymentRequest request = new TelegramDetectPaymentRequest();
        request.setRawMessage("ABA PayWay payment received USD 0.01 Note: " + orderCode);
        request.setDetectedBy("telegram-payway-bot:PayWayByABA_bot");
        request.setDetectedOrderCode(orderCode);
        request.setDetectedAmount(new BigDecimal("0.01"));
        request.setDetectedCurrency("USD");
        request.setTelegramSenderUsername("PayWayByABA_bot");
        request.setTelegramSenderId("123456");
        return request;
    }

    private TemplatePaymentOrder order(AppUser user, PaymentStatus status, BigDecimal amount) {
        TemplatePaymentOrder order = new TemplatePaymentOrder();
        order.setId(99L);
        order.setOrderCode("EVT260526001");
        order.setTransactionId("PW26052612000011");
        order.setUser(user);
        order.setTemplateId(10L);
        order.setTemplateName("Khmer Wedding Gold");
        order.setPackageName("Premium");
        order.setAmount(amount);
        order.setCurrency("USD");
        order.setProvider(TemplatePaymentOrder.PROVIDER_ABA_PAYWAY_STATIC_TELEGRAM);
        order.setStatus(status);
        order.setExpiresAt(Instant.now().plusSeconds(3600));
        return order;
    }

    private AppUser user(Long id, Role role) {
        AppUser user = new AppUser();
        user.setId(id);
        user.setFullName("User " + id);
        user.setRole(role);
        return user;
    }

    private record Fixture(
            TemplatePaymentService service,
            TemplatePaymentOrderRepository orderRepository,
            UserTemplateAccessRepository accessRepository,
            InvitationTemplateRepository templateRepository,
            CurrentUserService currentUserService,
            AbaPayWayService abaPayWayService,
            PaymentProperties paymentProperties,
            Authentication authentication,
            AppUser owner
    ) {
    }
}
