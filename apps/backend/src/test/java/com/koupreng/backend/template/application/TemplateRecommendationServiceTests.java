package com.koupreng.backend.template.application;

import com.koupreng.backend.invitation.domain.EventType;
import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.template.domain.InvitationTemplate;
import com.koupreng.backend.template.domain.TemplateCategory;
import com.koupreng.backend.template.infrastructure.persistence.InvitationTemplateRepository;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.util.List;
import java.util.Set;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class TemplateRecommendationServiceTests {
    @Test
    void hardFiltersTypeLanguagePriceAndStatusThenRanksStyleWithStableTies() {
        var repository = mock(InvitationTemplateRepository.class);
        var floral = template(1L, TemplateCategory.FLORAL);
        var traditional = template(2L, TemplateCategory.TRADITIONAL);
        var paid = template(3L, TemplateCategory.TRADITIONAL);
        paid.setPrice(BigDecimal.TEN);
        var inactive = template(4L, TemplateCategory.TRADITIONAL);
        inactive.setStatus("INACTIVE");
        var wrongType = template(5L, TemplateCategory.TRADITIONAL);
        wrongType.setSupportedEventTypes(Set.of(EventType.BIRTHDAY));
        var wrongLanguage = template(6L, TemplateCategory.TRADITIONAL);
        wrongLanguage.setSupportedLanguages(Set.of("EN"));
        when(repository.findAllByStatusIgnoreCaseOrderBySortOrderAscCreatedAtDesc("ACTIVE"))
                .thenReturn(List.of(floral, traditional, paid, inactive, wrongType, wrongLanguage));
        var service = new TemplateRecommendationService(repository);
        var result = service.recommend("WEDDING", "TRADITIONAL", "KH", "FREE");
        assertEquals(List.of(2L, 1L), result.stream().map(r -> r.template().getId()).toList());
        assertEquals(100, result.getFirst().score());
        assertEquals(0, result.getLast().score());
        assertEquals(List.of(3L), service.recommend("WEDDING", null, "KH", "PREMIUM").stream()
                .map(r -> r.template().getId()).toList());
        assertTrue(service.recommend("CORPORATE", null, "KH", "ALL").isEmpty());
    }

    @Test
    void rejectsInvalidFilters() {
        var service = new TemplateRecommendationService(mock(InvitationTemplateRepository.class));
        assertThrows(ApiException.class, () -> service.recommend("unknown", null, "KH", "ALL"));
        assertThrows(ApiException.class, () -> service.recommend("WEDDING", "unknown", "KH", "ALL"));
        assertThrows(ApiException.class, () -> service.recommend("WEDDING", null, "unknown", "ALL"));
        assertThrows(ApiException.class, () -> service.recommend("WEDDING", null, "KH", "unknown"));
    }

    private InvitationTemplate template(Long id, TemplateCategory category) {
        var template = new InvitationTemplate();
        template.setId(id);
        template.setCategory(category);
        template.setPrice(BigDecimal.ZERO);
        template.setSupportedEventTypes(Set.of(EventType.WEDDING));
        template.setSupportedLanguages(Set.of("KH"));
        return template;
    }
}
