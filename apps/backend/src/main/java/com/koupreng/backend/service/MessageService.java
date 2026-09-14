package com.koupreng.backend.service;

import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Service;

/**
 * Thin helper to resolve i18n messages from the current request locale.
 *
 * Usage:
 *   msg.get("auth.login-success")
 *   msg.get("validation.min-length", 8)
 */
@Service
public class MessageService {

    private final MessageSource messageSource;

    public MessageService(MessageSource messageSource) {
        this.messageSource = messageSource;
    }

    /** Resolve a key with no parameters. */
    public String get(String key) {
        return messageSource.getMessage(key, null, key, LocaleContextHolder.getLocale());
    }

    /** Resolve a key with an explicit locale and no parameters. */
    public String get(String key, java.util.Locale locale) {
        return messageSource.getMessage(key, null, key, locale != null ? locale : LocaleContextHolder.getLocale());
    }

    /** Resolve a key with positional parameters (used with {0}, {1} placeholders). */
    public String get(String key, Object... args) {
        return messageSource.getMessage(key, args, key, LocaleContextHolder.getLocale());
    }

    /** Resolve a key with an explicit locale and positional parameters. */
    public String get(String key, java.util.Locale locale, Object... args) {
        return messageSource.getMessage(key, args, key, locale != null ? locale : LocaleContextHolder.getLocale());
    }
}
