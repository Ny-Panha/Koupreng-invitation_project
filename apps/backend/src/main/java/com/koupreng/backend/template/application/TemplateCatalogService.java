package com.koupreng.backend.template.application;

import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.template.api.dto.PublicTemplateResponse;
import com.koupreng.backend.template.api.dto.TemplateResponse;
import com.koupreng.backend.template.infrastructure.persistence.InvitationTemplateRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
public class TemplateCatalogService {

    private static final String STATUS_ACTIVE = "ACTIVE";
    private static final Set<String> RETIRED_CODES = Set.of(
            "garden-royal-khmer-wedding",
            "khmer-royal-lotus"
    );
    private final InvitationTemplateRepository templateRepository;

    public TemplateCatalogService(InvitationTemplateRepository templateRepository) {
        this.templateRepository = templateRepository;
    }

    @Transactional(readOnly = true)
    public List<PublicTemplateResponse> listActiveTemplates() {
        return templateRepository.findAllByStatusIgnoreCaseOrderBySortOrderAscCreatedAtDesc(STATUS_ACTIVE).stream()
                .filter(t -> t.getCode() == null || !RETIRED_CODES.contains(t.getCode().toLowerCase()))
                .map(PublicTemplateResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public PublicTemplateResponse getActiveTemplate(Long templateId) {
        return templateRepository.findByIdAndStatusIgnoreCase(templateId, STATUS_ACTIVE)
                .filter(t -> t.getCode() == null || !RETIRED_CODES.contains(t.getCode().toLowerCase()))
                .map(PublicTemplateResponse::from)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Template not found"));
    }

    @Transactional(readOnly = true)
    public PublicTemplateResponse getActiveTemplateByCode(String code) {
        if (code != null && RETIRED_CODES.contains(code.toLowerCase())) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Template not found");
        }
        return templateRepository.findByCodeIgnoreCaseAndStatusIgnoreCase(code, STATUS_ACTIVE)
                .filter(t -> t.getCode() == null || !RETIRED_CODES.contains(t.getCode().toLowerCase()))
                .map(PublicTemplateResponse::from)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Template not found"));
    }

    @Transactional(readOnly = true)
    public List<TemplateResponse> list() {
        return templateRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(TemplateResponse::from)
                .toList();
    }
}
