package com.koupreng.backend.notification.application;

import com.koupreng.backend.guest.infrastructure.persistence.GuestRepository;
import com.koupreng.backend.notification.infrastructure.TelegramUserBotProperties;
import com.koupreng.backend.notification.infrastructure.persistence.TelegramOwnerRepository;
import com.koupreng.backend.notification.infrastructure.persistence.TelegramOwnerRepository.UpcomingInvitation;
import com.koupreng.backend.rsvp.infrastructure.persistence.RsvpRepository;
import com.koupreng.backend.shared.config.AppProperties;
import java.time.DateTimeException;
import java.time.Instant;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.Set;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class TelegramEventSchedule {
    private static final ZoneId DEFAULT_ZONE = ZoneId.of("Asia/Phnom_Penh");
    private static final Set<Long> COUNTDOWN_DAYS = Set.of(7L, 3L, 1L);
    private final TelegramUserBotProperties bot;
    private final TelegramOwnerRepository owners;
    private final GuestRepository guests;
    private final RsvpRepository rsvps;
    private final String baseUrl;
    private final LocalTime deliveryTime;
    private final boolean dailyReports;

    public TelegramEventSchedule(TelegramUserBotProperties bot, TelegramOwnerRepository owners,
            GuestRepository guests, RsvpRepository rsvps, AppProperties app,
            @Value("${app.telegram.user.daily-report-time:08:00}") String deliveryTime,
            @Value("${app.telegram.user.daily-report-enabled:true}") boolean dailyReports) {
        this.bot = bot;
        this.owners = owners;
        this.guests = guests;
        this.rsvps = rsvps;
        this.baseUrl = app.getInvitation().getPublicBaseUrl().replaceAll("/+$", "");
        this.deliveryTime = LocalTime.parse(deliveryTime);
        this.dailyReports = dailyReports;
    }

    @Scheduled(fixedDelay = 60000, initialDelay = 65000)
    public void enqueueDue() {
        if (!bot.enabled()) return;
        Instant now = Instant.now();
        var utcDate = now.atZone(ZoneOffset.UTC).toLocalDate();
        long cursor = 0;
        while (true) {
            var events = owners.upcoming(cursor, utcDate.minusDays(1), utcDate.plusDays(31));
            if (events.isEmpty()) return;
            for (UpcomingInvitation event : events) enqueue(event, now);
            cursor = events.getLast().id();
        }
    }

    @Scheduled(fixedDelay = 3600000, initialDelay = 120000)
    public void expireWebhookUpdates() {
        if (bot.enabled()) owners.expireUpdates(Instant.now().minus(7, ChronoUnit.DAYS));
    }

    void enqueue(UpcomingInvitation event, Instant now) {
        var local = now.atZone(eventZone(event.timezone()));
        var today = local.toLocalDate();
        var due = today.atTime(deliveryTime).atZone(local.getZone());
        if (now.isBefore(due.toInstant()) || !now.isBefore(due.plusMinutes(15).toInstant())
                || event.date().isBefore(today)) return;
        String link = baseUrl + "/app/events/" + event.id();
        long days = ChronoUnit.DAYS.between(today, event.date());
        if (COUNTDOWN_DAYS.contains(days)) {
            owners.enqueue(event.userId(), "countdown:" + event.id() + ":" + event.date() + ":" + days,
                    "រាប់ថ្ងៃថយក្រោយ / Event countdown",
                    event.title() + "\n" + days + " ថ្ងៃ / days · " + event.date() + "\n" + link);
        }
        if (dailyReports && days <= 30) {
            var counts = rsvps.summarizeByInvitationId(event.id());
            String summary = "ភ្ញៀវ / Invited " + guests.countByInvitationId(event.id())
                    + " · ចូលរួម / Yes " + counts.getAttending()
                    + " · មិនចូលរួម / No " + counts.getNotAttending()
                    + " · មិនទាន់ឆ្លើយ / Pending " + rsvps.countPendingGuests(event.id())
                    + " · ប្រហែល / Maybe " + counts.getMaybe()
                    + "\nចំនួនអ្នកចូលរួម / Expected attendance " + counts.getTotalAttendeeCount();
            owners.enqueue(event.userId(), "rsvp-daily:" + event.id() + ":" + today,
                    "របាយការណ៍ការចូលរួម / Daily RSVP report",
                    event.title() + "\n" + today + " · " + local.getZone() + "\n" + summary + "\n" + link + "/rsvp");
        }
    }

    private ZoneId eventZone(String value) {
        if (value == null) return DEFAULT_ZONE;
        try {
            return ZoneId.of(value);
        } catch (DateTimeException invalidLegacyTimezone) {
            return DEFAULT_ZONE;
        }
    }
}
