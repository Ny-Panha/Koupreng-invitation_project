package com.koupreng.backend.payment.infrastructure;

import com.koupreng.backend.payment.infrastructure.persistence.TemplatePaymentOrderRepository;
import com.koupreng.backend.subscription.infrastructure.persistence.SubscriptionRepository;
import java.time.Instant;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class PaymentExpirationWorker {
    private final TemplatePaymentOrderRepository templates;
    private final SubscriptionRepository subscriptions;

    public PaymentExpirationWorker(TemplatePaymentOrderRepository templates, SubscriptionRepository subscriptions) {
        this.templates = templates;
        this.subscriptions = subscriptions;
    }

    @Scheduled(fixedDelayString = "${app.payment.expiration-sweep-ms:60000}", initialDelay = 60000)
    @Transactional
    public void expirePendingOrders() {
        Instant now = Instant.now();
        subscriptions.expirePendingPayments(now);
        templates.expirePendingPayments(now);
    }
}
