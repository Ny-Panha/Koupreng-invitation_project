package com.koupreng.backend.notification.application;

import com.koupreng.backend.notification.domain.*;
import com.koupreng.backend.notification.infrastructure.persistence.NotificationRepository;
import com.koupreng.backend.payment.infrastructure.config.PaymentProperties;
import com.koupreng.backend.subscription.domain.Subscription;
import com.koupreng.backend.payment.domain.TemplatePaymentOrder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;

@Service
@Transactional(propagation = Propagation.MANDATORY)
public class PaymentNotificationService {
    private final NotificationRepository repository;
    private final PaymentProperties properties;
    public PaymentNotificationService(NotificationRepository repository, PaymentProperties properties) {
        this.repository = repository;
        this.properties = properties;
    }

    public void subscriptionPending(Subscription order) {
        enqueue("subscription-pending:" + order.getOrderCode(), "NEW SUBSCRIPTION PAYMENT",
                "Order: " + order.getOrderCode() + "\nUser: " + order.getUser().getId()
                + "\nPackage: " + order.getSubscriptionPackage().getCode()
                + "\nExpected: " + order.getCurrency() + " " + order.getAmount()
                + "\nPayer: " + order.getPayerName() + "\nABA Account: ***" + order.getPayerAccountLast3()
                + "\nMethod: ABA PayWay Static Link\nOrder Status: PENDING_PAYMENT\nPayment Status: PENDING"
                + "\nCreated: " + order.getCreatedAt() + "\nExpires: " + order.getPaymentExpiresAt()
                + "\nAwaiting genuine ABA merchant payment notification.");
    }

    public void templateReview(TemplatePaymentOrder order) {
        enqueue("template-review:" + order.getOrderCode(), "TEMPLATE PAYMENT REVIEW REQUEST",
                "Order: " + order.getOrderCode() + "\nUser: " + order.getUser().getId()
                + "\nTemplate: " + order.getTemplateName() + "\nExpected: " + order.getCurrency() + " " + order.getAmount()
                + "\nStatus: PENDING REVIEW\nBuyer request is not payment evidence. Template remains locked.");
    }

    public void subscriptionConfirmed(Subscription order) {
        enqueue("subscription-paid:" + order.getOrderCode(), "SUBSCRIPTION CONFIRMED",
                "Order: " + order.getOrderCode() + "\nPackage: " + order.getSubscriptionPackage().getCode()
                + "\nAmount: " + order.getCurrency() + " " + order.getPaidAmount()
                + "\nABA Transaction: " + order.getPaywayTransactionId()
                + "\nSource: " + order.getConfirmSource() + "\nStatus: ACTIVE\nSubscription activated successfully.");
    }

    private void enqueue(String key, String title, String message) {
        if (repository.existsByPaymentDeliveryKey(key)) return;
        Notification notification = new Notification();
        notification.setPaymentDeliveryKey(key);
        notification.setChannel(NotificationChannel.TELEGRAM);
        notification.setStatus(NotificationStatus.PENDING);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setRecipientTelegramId(properties.getTelegramGroupIds().split(",")[0].trim());
        notification.setNextDeliveryAt(Instant.now());
        // Stored in the order's transaction. The dispatcher can only read committed rows.
        repository.save(notification);
    }
}
