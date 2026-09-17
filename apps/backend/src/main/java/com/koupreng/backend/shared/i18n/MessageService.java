package com.koupreng.backend.shared.i18n;

import java.util.Locale;

import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Service;

/** Resolves localized application messages using the current request locale. */
@Service
public class MessageService {

    private final MessageSource messageSource;

    public MessageService(MessageSource messageSource) {
        this.messageSource = messageSource;
    }

    public String get(String key) {
        return messageSource.getMessage(key, null, key, LocaleContextHolder.getLocale());
    }

    public String get(String key, Locale locale) {
        return messageSource.getMessage(key, null, key, effectiveLocale(locale));
    }

    public String get(String key, Object... args) {
        return messageSource.getMessage(key, args, key, LocaleContextHolder.getLocale());
    }

    public String get(String key, Locale locale, Object... args) {
        return messageSource.getMessage(key, args, key, effectiveLocale(locale));
    }

    private Locale effectiveLocale(Locale locale) {
        return locale != null ? locale : LocaleContextHolder.getLocale();
    }
}
