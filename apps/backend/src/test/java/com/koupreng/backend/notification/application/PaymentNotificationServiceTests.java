package com.koupreng.backend.notification.application;

import com.koupreng.backend.notification.domain.Notification;
import com.koupreng.backend.notification.infrastructure.persistence.NotificationRepository;
import com.koupreng.backend.payment.infrastructure.config.PaymentProperties;
import com.koupreng.backend.subscription.domain.Subscription;
import com.koupreng.backend.subscription.domain.SubscriptionPackage;
import com.koupreng.backend.user.domain.AppUser;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import java.math.BigDecimal;
import java.time.Instant;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PaymentNotificationServiceTests {
    @Test
    void pendingNotificationIsPersistedAndContainsOnlyMaskedPayerDetails() {
        var repository = mock(NotificationRepository.class);
        var properties = new PaymentProperties();
        properties.setTelegramGroupIds("-1001");
        var service = new PaymentNotificationService(repository, properties);
        var user = new AppUser(); user.setId(7L);
        var plan = new SubscriptionPackage(); plan.setCode("BASIC");
        var order = new Subscription();
        order.setUser(user); order.setSubscriptionPackage(plan); order.setOrderCode("SUB2610131234");
        order.setAmount(new BigDecimal("0.01")); order.setPayerName("FIXTURE USER"); order.setPayerAccountLast3("247");
        order.setCreatedAt(Instant.now()); order.setPaymentExpiresAt(Instant.now().plusSeconds(1800));
        service.subscriptionPending(order);
        var notification = ArgumentCaptor.forClass(Notification.class);
        verify(repository).save(notification.capture());
        assertTrue(notification.getValue().getMessage().contains("***247"));
        assertTrue(notification.getValue().getMessage().contains("Payment Status: PENDING"));
        assertEquals("subscription-pending:SUB2610131234", notification.getValue().getPaymentDeliveryKey());
        assertFalse(order.isActive());
        assertNull(order.getPaywayTransactionId());
    }
}
