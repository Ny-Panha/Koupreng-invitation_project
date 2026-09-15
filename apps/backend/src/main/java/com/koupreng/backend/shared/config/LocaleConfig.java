package com.koupreng.backend.shared.config;

import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.support.ReloadableResourceBundleMessageSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.i18n.AcceptHeaderLocaleResolver;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;

/**
 * /api/config/messages/guests?lang=en
 * Wire Spring i18n so the locale is resolved from the Accept-Language header.
 * Supported: km (Khmer, default) and en (English).
 */
@Configuration
public class LocaleConfig {

    private final Locale defaultLocale;
    private final List<Locale> supportedLocales;
    private final String[] messageBasenames;

    public LocaleConfig(
            @Value("${app.i18n.default-locale:km}") String defaultLocaleTag,
            @Value("${app.i18n.supported-locales:km,en}") String supportedLocaleTags,
            @Value("${spring.messages.basename:messages}") String messageBasename
    ) {
        this.defaultLocale = resolveDefaultLocale(defaultLocaleTag);
        this.supportedLocales = parseSupportedLocales(supportedLocaleTags, defaultLocale);
        this.messageBasenames = parseMessageBasenames(messageBasename);
    }

    @Bean
    public LocaleResolver localeResolver() {
        AcceptHeaderLocaleResolver resolver = new AcceptHeaderLocaleResolver();
        resolver.setDefaultLocale(defaultLocale);
        resolver.setSupportedLocales(supportedLocales);
        return resolver;
    }

    @Bean
    public MessageSource messageSource() {
        ReloadableResourceBundleMessageSource ms = new ReloadableResourceBundleMessageSource();
        ms.setBasenames(messageBasenames);             // -> messages_en.properties / messages_km.properties
        ms.setDefaultEncoding(StandardCharsets.UTF_8.name());
        ms.setDefaultLocale(defaultLocale);
        ms.setFallbackToSystemLocale(false);
        ms.setCacheSeconds(3600);
        return ms;
    }

    /**
     * Resolve the default locale using a switch on the known supported tags.
     * Falls back to Khmer for any unknown/blank value.
     */
    private static Locale resolveDefaultLocale(String tag) {
        if (tag == null || tag.isBlank()) {
            return Locale.forLanguageTag("km");
        }
        return switch (tag.trim().toLowerCase()) {
            case "en" -> Locale.ENGLISH;
            case "km" -> Locale.forLanguageTag("km");
            default -> {
                Locale locale = Locale.forLanguageTag(tag.trim());
                yield "und".equals(locale.toLanguageTag()) ? Locale.forLanguageTag("km") : locale;
            }
        };
    }

    private static List<Locale> parseSupportedLocales(String tags, Locale defaultLocale) {
        String source = tags == null || tags.isBlank() ? "km,en" : tags;
        List<Locale> locales = new ArrayList<>();
        for (String tag : source.split(",")) {
            Locale locale = resolveLocaleTag(tag.trim());
            if (locale != null && !locales.contains(locale)) {
                locales.add(locale);
            }
        }
        if (!locales.contains(defaultLocale)) {
            locales.add(defaultLocale);
        }
        if (locales.isEmpty()) {
            locales.add(Locale.forLanguageTag("km"));
            locales.add(Locale.ENGLISH);
        }
        return List.copyOf(locales);
    }

    /**
     * Resolve a single locale tag using switch for the known supported values.
     */
    private static Locale resolveLocaleTag(String tag) {
        if (tag == null || tag.isBlank()) {
            return null;
        }
        return switch (tag.toLowerCase()) {
            case "en" -> Locale.ENGLISH;
            case "km" -> Locale.forLanguageTag("km");
            default -> {
                Locale locale = Locale.forLanguageTag(tag);
                yield "und".equals(locale.toLanguageTag()) ? null : locale;
            }
        };
    }

    private static String[] parseMessageBasenames(String basename) {
        String source = basename == null || basename.isBlank() ? "messages" : basename;
        String[] basenames = Arrays.stream(source.split(","))
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .map(LocaleConfig::toMessageBasename)
                .toArray(String[]::new);
        return basenames.length == 0 ? new String[] { "classpath:messages" } : basenames;
    }

    private static String toMessageBasename(String basename) {
        if (basename.startsWith("classpath:") || basename.startsWith("file:")) {
            return basename;
        }
        return "classpath:" + basename;
    }
}
