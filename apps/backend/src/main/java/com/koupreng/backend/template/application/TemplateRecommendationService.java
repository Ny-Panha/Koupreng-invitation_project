package com.koupreng.backend.template.application;

import com.koupreng.backend.invitation.domain.EventType;
import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.template.api.dto.PublicTemplateResponse;
import com.koupreng.backend.template.api.dto.TemplateRecommendationResponse;
import com.koupreng.backend.template.domain.InvitationTemplate;
import com.koupreng.backend.template.domain.TemplateCategory;
import com.koupreng.backend.template.infrastructure.persistence.InvitationTemplateRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class TemplateRecommendationService {
    private static final Set<String> RETIRED_CODES = Set.of(
            "garden-royal-khmer-wedding",
            "khmer-royal-lotus"
    );
    private static final Set<String> RETIRED_NAMES = Set.of(
            "garden royal khmer wedding",
            "khmer royal lotus"
    );

    private static boolean isRetired(InvitationTemplate t) {
        if (t == null) return false;
        if (t.getCode() != null && RETIRED_CODES.contains(t.getCode().toLowerCase())) return true;
        if (t.getName() != null && RETIRED_NAMES.contains(t.getName().toLowerCase())) return true;
        return false;
    }

    private final InvitationTemplateRepository repository;
    public TemplateRecommendationService(InvitationTemplateRepository repository) { this.repository = repository; }

    @Transactional(readOnly = true)
    public List<TemplateRecommendationResponse> recommend(String eventType, String style, String language, String pricePreference) {
        EventType type = parse(EventType.class, eventType);
        TemplateCategory category = style == null || style.isBlank() ? null : parse(TemplateCategory.class, style);
        String mode = normalize(language);
        String price = normalize(pricePreference);
        if (!Set.of("KH", "EN", "BOTH").contains(mode) || !Set.of("ALL", "FREE", "PREMIUM").contains(price)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid language or price preference");
        }
        return repository.findAllByStatusIgnoreCaseOrderBySortOrderAscCreatedAtDesc("ACTIVE").stream()
                .filter(t -> "ACTIVE".equalsIgnoreCase(t.getStatus()))
                .filter(t -> !isRetired(t))
                .filter(t -> t.getSupportedEventTypes().contains(type) && t.getSupportedLanguages().contains(mode))
                .filter(t -> price.equals("ALL") || (price.equals("PREMIUM") == (t.isPremium()
                        || t.getPrice() != null && t.getPrice().signum() > 0)))
                .map(t -> new TemplateRecommendationResponse(PublicTemplateResponse.from(t),
                        category == null || category == t.getCategory() ? 100 : 0,
                        category == null || category == t.getCategory()))
                .sorted(Comparator.comparingInt(TemplateRecommendationResponse::score).reversed()
                        .thenComparing(r -> r.template().getId()))
                .toList();
    }

    private String normalize(String value) { return value == null ? "" : value.trim().toUpperCase(Locale.ROOT); }
    private <E extends Enum<E>> E parse(Class<E> type, String value) {
        try { return Enum.valueOf(type, normalize(value)); }
        catch (IllegalArgumentException ex) { throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid " + type.getSimpleName()); }
    }
}
