package com.koupreng.backend.shared.security;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Locale;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/** Redaction for diagnostics only; never use the result to route or authorize a request. */
final class DiagnosticRequestTarget {
    private static final Pattern GUEST_CREDENTIAL = Pattern.compile(
            "(?i)(/public/invitations/[^/]+/guests/)[^/]+(?=/|$)");

    private DiagnosticRequestTarget() { }

    static String path(String path) {
        String decoded = path;
        for (int i = 0; i < 3; i++) {
            try {
                String next = URLDecoder.decode(decoded.replace("+", "%2B"), StandardCharsets.UTF_8);
                if (next.equals(decoded)) break;
                decoded = next;
            } catch (IllegalArgumentException malformed) {
                return "[INVALID_REQUEST_PATH]";
            }
        }
        return GUEST_CREDENTIAL.matcher(decoded).replaceAll("$1[REDACTED]").replaceAll("[\\r\\n\\t]", "_");
    }

    static String query(String query) {
        return Arrays.stream(query.split("&", -1)).map(part -> {
            int separator = part.indexOf('=');
            String key = separator < 0 ? part : part.substring(0, separator);
            return sensitive(key) ? key + "=[REDACTED]" : part;
        }).collect(Collectors.joining("&"));
    }

    private static boolean sensitive(String key) {
        String decoded = key;
        // Encoded and double-encoded keys must receive the same treatment as literal keys.
        for (int i = 0; i < 3; i++) {
            try {
                String next = URLDecoder.decode(decoded, StandardCharsets.UTF_8);
                if (next.equals(decoded)) break;
                decoded = next;
            } catch (IllegalArgumentException ignored) {
                return true;
            }
        }
        String normalized = decoded.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]", "");
        return normalized.contains("token") || normalized.contains("password")
                || normalized.contains("secret") || normalized.contains("authorization")
                || normalized.contains("cookie") || normalized.contains("reference")
                || normalized.equals("code") || normalized.equals("key") || normalized.equals("apikey");
    }
}
