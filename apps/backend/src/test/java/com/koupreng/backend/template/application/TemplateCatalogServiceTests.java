package com.koupreng.backend.template.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.template.api.dto.PublicTemplateResponse;
import com.koupreng.backend.template.api.dto.TemplateResponse;
import com.koupreng.backend.template.domain.InvitationTemplate;
import com.koupreng.backend.template.domain.TemplateCategory;
import com.koupreng.backend.template.infrastructure.persistence.InvitationTemplateRepository;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

class TemplateCatalogServiceTests {

    private static final String ACTIVE = "ACTIVE";

    @Test
    void listActiveTemplatesUsesCatalogOrderingAndMapsPublicContract() {
        InvitationTemplateRepository repository = mock(InvitationTemplateRepository.class);
        InvitationTemplate template = template(7L, "royal-khmer", true);
        when(repository.findAllByStatusIgnoreCaseOrderBySortOrderAscCreatedAtDesc(ACTIVE))
                .thenReturn(List.of(template));

        List<PublicTemplateResponse> result = new TemplateCatalogService(repository).listActiveTemplates();

        assertEquals(1, result.size());
        assertEquals(7L, result.getFirst().getId());
        assertEquals("royal-khmer", result.getFirst().getCode());
        assertEquals("royal-khmer", result.getFirst().getSlug());
        assertEquals(TemplateCategory.TRADITIONAL, result.getFirst().getCategory());
        assertEquals(new BigDecimal("25.00"), result.getFirst().getPrice());
        verify(repository).findAllByStatusIgnoreCaseOrderBySortOrderAscCreatedAtDesc(ACTIVE);
    }

    @Test
    void getActiveTemplateRejectsMissingOrInactiveTemplate() {
        InvitationTemplateRepository repository = mock(InvitationTemplateRepository.class);
        when(repository.findByIdAndStatusIgnoreCase(99L, ACTIVE)).thenReturn(Optional.empty());

        ApiException exception = assertThrows(
                ApiException.class,
                () -> new TemplateCatalogService(repository).getActiveTemplate(99L)
        );

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatus());
        assertEquals("RESOURCE_NOT_FOUND", exception.getCode());
        assertEquals("Template not found", exception.getMessage());
    }

    @Test
    void getActiveTemplateByCodeUsesCaseInsensitiveActiveLookup() {
        InvitationTemplateRepository repository = mock(InvitationTemplateRepository.class);
        InvitationTemplate template = template(8L, "garden", false);
        when(repository.findByCodeIgnoreCaseAndStatusIgnoreCase("GARDEN", ACTIVE))
                .thenReturn(Optional.of(template));

        PublicTemplateResponse result = new TemplateCatalogService(repository)
                .getActiveTemplateByCode("GARDEN");

        assertEquals(8L, result.getId());
        assertEquals("garden", result.getSlug());
        verify(repository).findByCodeIgnoreCaseAndStatusIgnoreCase("GARDEN", ACTIVE);
    }

    @Test
    void internalListPreservesLegacyTemplateResponseShape() {
        InvitationTemplateRepository repository = mock(InvitationTemplateRepository.class);
        InvitationTemplate template = template(9L, "minimal", false);
        when(repository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(template));

        List<TemplateResponse> result = new TemplateCatalogService(repository).list();

        assertEquals(1, result.size());
        assertEquals("TRADITIONAL", result.getFirst().getCategory());
        assertEquals(ACTIVE, result.getFirst().getStatus());
        assertEquals(template.getCreatedAt(), result.getFirst().getCreatedAt());
    }

    private InvitationTemplate template(Long id, String code, boolean premium) {
        InvitationTemplate template = new InvitationTemplate();
        template.setId(id);
        template.setCode(code);
        template.setName("Royal Khmer");
        template.setCategory(TemplateCategory.TRADITIONAL);
        template.setDescription("Traditional invitation");
        template.setThumbnailUrl("https://cdn.example/template.jpg");
        template.setPreviewUrl("https://preview.example/" + code);
        template.setPremium(premium);
        template.setPrice(new BigDecimal("25.00"));
        template.setCurrency("USD");
        template.setStatus(ACTIVE);
        template.setCreatedAt(Instant.parse("2026-01-01T00:00:00Z"));
        return template;
    }
}
