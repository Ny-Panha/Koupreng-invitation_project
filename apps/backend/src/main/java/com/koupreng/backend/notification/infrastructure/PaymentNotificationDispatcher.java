package com.koupreng.backend.notification.infrastructure;

import com.koupreng.backend.notification.domain.NotificationStatus;
import com.koupreng.backend.notification.infrastructure.persistence.NotificationRepository;
import com.koupreng.backend.payment.infrastructure.config.PaymentProperties;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
@EnableScheduling
public class PaymentNotificationDispatcher {
    private static final Logger log = LoggerFactory.getLogger(PaymentNotificationDispatcher.class);
    private final NotificationRepository repository;
    private final PaymentProperties properties;
    private final TransactionTemplate transaction;
    private final ObjectMapper mapper;
    private final HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();

    public PaymentNotificationDispatcher(NotificationRepository repository, PaymentProperties properties,
            PlatformTransactionManager manager, ObjectMapper mapper) {
        this.repository = repository;
        this.properties = properties;
        this.transaction = new TransactionTemplate(manager);
        this.mapper = mapper;
    }

    @Scheduled(fixedDelay = 15000, initialDelay = 15000)
    public void dispatch() {
        if (properties.getTelegramBotUrl().isBlank()) return;
        var ids = repository.paymentDeliveries(Instant.now(), PageRequest.of(0, 10));
        for (Long id : ids) {
            Delivery delivery = transaction.execute(status -> {
                var n = repository.lock(id).orElseThrow();
                if (n.getStatus() != NotificationStatus.PENDING || n.getNextDeliveryAt().isAfter(Instant.now())) return null;
                n.setDeliveryAttempts(n.getDeliveryAttempts() + 1);
                n.setNextDeliveryAt(Instant.now().plusSeconds(60)); // short lease, crash-recoverable
                return new Delivery(n.getRecipientTelegramId(), n.getTitle() + "\n\n" + n.getMessage());
            });
            if (delivery == null) continue;
            boolean sent = false;
            try {
                HttpRequest request = HttpRequest.newBuilder(URI.create(properties.getTelegramBotUrl()
                                + "/internal/payment-notifications"))
                        .timeout(Duration.ofSeconds(15)).header("Content-Type", "application/json")
                        .header("X-ADMIN-PAYMENT-SECRET", properties.getAdminSecret())
                        .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(
                                Map.of("notificationId", id.toString(), "chatId", delivery.chatId(), "text", delivery.text()))))
                        .build();
                sent = client.send(request, HttpResponse.BodyHandlers.discarding()).statusCode() == 200;
            } catch (InterruptedException exception) {
                Thread.currentThread().interrupt();
            } catch (java.io.IOException | IllegalArgumentException exception) {
                log.warn("Payment notification delivery failed id={} type={}", id, exception.getClass().getSimpleName());
            }
            boolean delivered = sent;
            transaction.executeWithoutResult(status -> {
                var n = repository.lock(id).orElseThrow();
                n.setStatus(delivered ? NotificationStatus.SENT
                        : n.getDeliveryAttempts() >= 3 ? NotificationStatus.FAILED : NotificationStatus.PENDING);
                if (delivered) n.setSentAt(Instant.now());
                else n.setErrorMessage("Telegram delivery unavailable; operator retry required after three attempts");
            });
        }
    }

    private record Delivery(String chatId, String text) {}
}
