package com.koupreng.backend.payment.application;

import com.koupreng.backend.user.application.CurrentUserService;
import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.payment.api.dto.PaymentHistoryResponse;
import com.koupreng.backend.payment.api.dto.PaymentReceiptResponse;
import com.koupreng.backend.payment.api.dto.PaymentConfirmResponse;
import com.koupreng.backend.payment.domain.TemplatePaymentOrder;
import com.koupreng.backend.payment.domain.PaymentStatus;
import com.koupreng.backend.subscription.domain.Subscription;
import com.koupreng.backend.user.domain.AppUser;
import com.koupreng.backend.user.domain.Role;
import com.koupreng.backend.payment.infrastructure.persistence.TemplatePaymentOrderRepository;
import com.koupreng.backend.subscription.infrastructure.persistence.SubscriptionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Objects;

@Service
public class PaymentHistoryService {

    private final TemplatePaymentOrderRepository orderRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final CurrentUserService currentUserService;

    public PaymentHistoryService(
            TemplatePaymentOrderRepository orderRepository,
            SubscriptionRepository subscriptionRepository,
            CurrentUserService currentUserService
    ) {
        this.orderRepository = orderRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
    public List<PaymentHistoryResponse> listMine(Authentication authentication) {
        AppUser user = currentUserService.currentUser(authentication);
        List<PaymentHistoryResponse> templates = orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(PaymentHistoryResponse::from)
                .toList();
        List<PaymentHistoryResponse> subscriptions = subscriptionRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(PaymentHistoryResponse::from)
                .toList();

        List<PaymentHistoryResponse> combined = new java.util.ArrayList<>();
        combined.addAll(templates);
        combined.addAll(subscriptions);

        combined.sort((a, b) -> {
            if (a.getCreatedAt() == null && b.getCreatedAt() == null) return 0;
            if (a.getCreatedAt() == null) return 1;
            if (b.getCreatedAt() == null) return -1;
            return b.getCreatedAt().compareTo(a.getCreatedAt());
        });

        return combined;
    }

    @Transactional(readOnly = true)
    public PaymentHistoryResponse get(Authentication authentication, String orderCode) {
        AppUser user = currentUserService.currentUser(authentication);
        String code = normalizeOrderCode(orderCode);

        java.util.Optional<TemplatePaymentOrder> optOrder = orderRepository.findByOrderCode(code);
        if (optOrder.isPresent()) {
            TemplatePaymentOrder order = optOrder.get();
            if (user.getRole() != Role.ADMIN
                    && (order.getUser() == null || !Objects.equals(order.getUser().getId(), user.getId()))) {
                throw new ApiException(HttpStatus.FORBIDDEN, "You do not have access to this payment order");
            }
            return PaymentHistoryResponse.from(order);
        }

        java.util.Optional<Subscription> optSub = subscriptionRepository.findByOrderCode(code);
        if (optSub.isPresent()) {
            Subscription sub = optSub.get();
            if (user.getRole() != Role.ADMIN
                    && (sub.getUser() == null || !Objects.equals(sub.getUser().getId(), user.getId()))) {
                throw new ApiException(HttpStatus.FORBIDDEN, "You do not have access to this payment order");
            }
            return PaymentHistoryResponse.from(sub);
        }

        throw new ApiException(HttpStatus.NOT_FOUND, "Payment order not found");
    }

    @Transactional(readOnly = true)
    public PaymentReceiptResponse receipt(Authentication authentication, String orderCode) {
        AppUser user = currentUserService.currentUser(authentication);
        String code = normalizeOrderCode(orderCode);

        java.util.Optional<TemplatePaymentOrder> optOrder = orderRepository.findByOrderCode(code);
        if (optOrder.isPresent()) {
            TemplatePaymentOrder order = optOrder.get();
            if (user.getRole() != Role.ADMIN
                    && (order.getUser() == null || !Objects.equals(order.getUser().getId(), user.getId()))) {
                throw new ApiException(HttpStatus.FORBIDDEN, "You do not have access to this payment order");
            }
            return PaymentReceiptResponse.from(order);
        }

        java.util.Optional<Subscription> optSub = subscriptionRepository.findByOrderCode(code);
        if (optSub.isPresent()) {
            Subscription sub = optSub.get();
            if (user.getRole() != Role.ADMIN
                    && (sub.getUser() == null || !Objects.equals(sub.getUser().getId(), user.getId()))) {
                throw new ApiException(HttpStatus.FORBIDDEN, "You do not have access to this payment order");
            }
            return PaymentReceiptResponse.from(sub);
        }

        throw new ApiException(HttpStatus.NOT_FOUND, "Payment order not found");
    }

    @Transactional(readOnly = true)
    public List<PaymentHistoryResponse> listAll() {
        List<PaymentHistoryResponse> templates = orderRepository.findAll().stream()
                .map(PaymentHistoryResponse::from)
                .toList();
        List<PaymentHistoryResponse> subscriptions = subscriptionRepository.findAll().stream()
                .map(PaymentHistoryResponse::from)
                .toList();

        List<PaymentHistoryResponse> combined = new java.util.ArrayList<>();
        combined.addAll(templates);
        combined.addAll(subscriptions);

        combined.sort((a, b) -> {
            if (a.getCreatedAt() == null && b.getCreatedAt() == null) return 0;
            if (a.getCreatedAt() == null) return 1;
            if (b.getCreatedAt() == null) return -1;
            return b.getCreatedAt().compareTo(a.getCreatedAt());
        });

        return combined;
    }

    @Transactional
    public PaymentConfirmResponse confirmPayment(String orderCode, BigDecimal amount, String confirmedBy) {
        String code = normalizeOrderCode(orderCode);
        java.util.Optional<TemplatePaymentOrder> optOrder = orderRepository.findByOrderCode(code);
        if (optOrder.isPresent()) {
            TemplatePaymentOrder order = optOrder.get();
            order.setStatus(PaymentStatus.PAID);
            if (amount != null) {
                order.setPaidAmount(amount);
            } else if (order.getPaidAmount() == null || order.getPaidAmount().compareTo(BigDecimal.ZERO) == 0) {
                order.setPaidAmount(order.getAmount());
            }
            order.setPaidAt(Instant.now());
            order.setConfirmedBy(confirmedBy != null && !confirmedBy.isBlank() ? confirmedBy : "admin");
            order.setConfirmSource(TemplatePaymentOrder.CONFIRM_SOURCE_MANUAL_ADMIN);
            orderRepository.save(order);
            return PaymentConfirmResponse.builder()
                    .message("Template payment confirmed successfully.")
                    .orderCode(order.getOrderCode())
                    .status(PaymentStatus.PAID)
                    .build();
        }

        java.util.Optional<Subscription> optSub = subscriptionRepository.findByOrderCode(code);
        if (optSub.isPresent()) {
            Subscription sub = optSub.get();
            sub.setPaymentStatus("PAID");
            sub.setStatus("ACTIVE");
            sub.setActive(true);
            Instant now = Instant.now();
            sub.setStartDate(now);
            if (sub.getSubscriptionPackage() != null && sub.getSubscriptionPackage().getDurationDays() != null && sub.getSubscriptionPackage().getDurationDays() > 0) {
                sub.setEndDate(now.plusSeconds(sub.getSubscriptionPackage().getDurationDays().longValue() * 86400L));
            }
            subscriptionRepository.save(sub);
            return PaymentConfirmResponse.builder()
                    .message("Subscription payment confirmed successfully.")
                    .orderCode(sub.getOrderCode())
                    .status(PaymentStatus.PAID)
                    .build();
        }

        throw new ApiException(HttpStatus.NOT_FOUND, "Payment order not found");
    }

    private String normalizeOrderCode(String orderCode) {
        if (orderCode == null || orderCode.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Order code is required");
        }
        return orderCode.trim().toUpperCase();
    }
}
