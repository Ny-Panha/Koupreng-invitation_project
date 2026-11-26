package com.koupreng.backend.notification.application;

import com.koupreng.backend.invitation.domain.UserInvitation;
import com.koupreng.backend.notification.infrastructure.TelegramUserBotProperties;
import com.koupreng.backend.notification.infrastructure.persistence.TelegramOwnerRepository;
import com.koupreng.backend.rsvp.domain.Rsvp;
import com.koupreng.backend.shared.config.AppProperties;
import com.koupreng.backend.subscription.domain.Subscription;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class TelegramOwnerNotifications {
    private final TelegramUserBotProperties bot;
    private final TelegramOwnerRepository owners;
    private final String baseUrl;

    public TelegramOwnerNotifications(TelegramUserBotProperties bot, TelegramOwnerRepository owners, AppProperties app) {
        this.bot = bot;
        this.owners = owners;
        this.baseUrl = app.getInvitation().getPublicBaseUrl().replaceAll("/+$", "");
    }

    public void published(UserInvitation invitation) {
        if (!bot.enabled()) return;
        owners.enqueue(invitation.getUser().getId(), "published:" + invitation.getId(),
                "បានផ្សាយការអញ្ជើញ / Invitation published",
                invitation.getTitle() + "\n" + invitation.getEventDate() + "\n" + eventLink(invitation));
    }

    public void rsvp(Rsvp rsvp) {
        if (!bot.enabled()) return;
        var invitation = rsvp.getInvitation();
        owners.enqueue(invitation.getUser().getId(), "rsvp:" + rsvp.getId() + ":" + UUID.randomUUID(),
                "ចម្លើយចូលរួម / RSVP updated",
                invitation.getTitle() + "\n" + rsvp.getResponseStatus() + " · " + rsvp.getAttendeeCount()
                        + "\n" + eventLink(invitation) + "/rsvp");
    }

    public void subscription(Subscription order, String stage, String title) {
        if (!bot.enabled()) return;
        owners.enqueue(order.getUser().getId(), "subscription:" + order.getOrderCode() + ":" + stage, title,
                order.getOrderCode() + " · " + order.getCurrency() + " " + order.getAmount()
                        + "\n" + baseUrl + "/app/payments");
    }

    private String eventLink(UserInvitation invitation) {
        return baseUrl + "/app/events/" + invitation.getId();
    }
}
