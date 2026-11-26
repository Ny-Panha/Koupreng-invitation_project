package com.koupreng.backend.notification.infrastructure;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("app.telegram.user")
public record TelegramUserBotProperties(String token, String username, String webhookSecret) {
    public boolean enabled() {
        return token != null && token.matches("[0-9]+:[A-Za-z0-9_-]{25,}")
                && username != null && username.matches("[A-Za-z0-9_]{5,32}")
                && webhookSecret != null && webhookSecret.matches("[A-Za-z0-9_-]{32,256}");
    }
}
