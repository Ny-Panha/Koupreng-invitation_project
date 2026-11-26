package com.koupreng.backend.notification.infrastructure;

import com.koupreng.backend.notification.domain.NotificationStatus;
import com.koupreng.backend.notification.infrastructure.persistence.NotificationRepository;
import com.koupreng.backend.notification.infrastructure.persistence.TelegramOwnerRepository;
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
    private final TelegramUserBotProperties userBot;
    private final TelegramOwnerRepository owners;
    private final HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();

    public PaymentNotificationDispatcher(NotificationRepository repository, PaymentProperties properties,
            PlatformTransactionManager manager, ObjectMapper mapper,
            TelegramUserBotProperties userBot, TelegramOwnerRepository owners) {
        this.repository = repository;
        this.properties = properties;
        this.transaction = new TransactionTemplate(manager);
        this.mapper = mapper;
        this.userBot = userBot;
        this.owners = owners;
    }

    @Scheduled(fixedDelay = 15000, initialDelay = 15000)
    public void dispatch() {
        boolean adminEnabled = !properties.getTelegramBotUrl().isBlank();
        if (!adminEnabled && !userBot.enabled()) return;
        var ids = repository.paymentDeliveries(Instant.now(), userBot.enabled(), adminEnabled, PageRequest.of(0, 10));
        for (Long id : ids) {
            Delivery delivery = transaction.execute(status -> {
                var n = repository.lock(id).orElseThrow();
                if (n.getStatus() != NotificationStatus.PENDING || n.getNextDeliveryAt().isAfter(Instant.now())) return null;
                boolean ownerDelivery = n.getPaymentDeliveryKey().startsWith("owner:");
                if (ownerDelivery && owners.activeOwner(Long.parseLong(n.getRecipientTelegramId()))
                        .filter(userId -> n.getUser() != null && userId.equals(n.getUser().getId())).isEmpty()) {
                    n.setStatus(NotificationStatus.CANCELLED);
                    return null;
                }
                n.setDeliveryAttempts(n.getDeliveryAttempts() + 1);
                n.setNextDeliveryAt(Instant.now().plusSeconds(60)); // short lease, crash-recoverable
                return new Delivery(n.getRecipientTelegramId(), n.getTitle() + "\n\n" + n.getMessage(),
                        ownerDelivery, n.getDeliveryAttempts());
            });
            if (delivery == null) continue;
            boolean sent = false;
            try {
                HttpRequest request = request(id, delivery);
                sent = client.send(request, HttpResponse.BodyHandlers.discarding()).statusCode() == 200;
            } catch (InterruptedException exception) {
                Thread.currentThread().interrupt();
            } catch (java.io.IOException | IllegalArgumentException exception) {
                log.warn("Payment notification delivery failed id={} type={}", id, exception.getClass().getSimpleName());
            }
            boolean delivered = sent;
            transaction.executeWithoutResult(status -> {
                var n = repository.lock(id).orElseThrow();
                if (n.getDeliveryAttempts() != delivery.attempt() || n.getStatus() != NotificationStatus.PENDING) return;
                n.setStatus(delivered ? NotificationStatus.SENT
                        : n.getDeliveryAttempts() >= 3 ? NotificationStatus.FAILED : NotificationStatus.PENDING);
                if (delivered) n.setSentAt(Instant.now());
                else n.setErrorMessage("Telegram delivery unavailable; operator retry required after three attempts");
            });
        }
    }

    private HttpRequest request(Long id, Delivery delivery) throws java.io.IOException {
        String url = delivery.owner()
                ? "https://api.telegram.org/bot" + userBot.token() + "/sendMessage"
                : properties.getTelegramBotUrl() + "/internal/payment-notifications";
        var request = HttpRequest.newBuilder(URI.create(url))
                .timeout(Duration.ofSeconds(15)).header("Content-Type", "application/json");
        var body = delivery.owner()
                ? Map.of("chat_id", delivery.chatId(), "text", delivery.text())
                : Map.of("notificationId", id.toString(), "chatId", delivery.chatId(), "text", delivery.text());
        if (!delivery.owner()) request.header("X-ADMIN-PAYMENT-SECRET", properties.getAdminSecret());
        return request.POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(body))).build();
    }

    private record Delivery(String chatId, String text, boolean owner, int attempt) {}
}
