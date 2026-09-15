package com.koupreng.backend.service;

import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.dto.template.PublicTemplateResponse;
import com.koupreng.backend.dto.template.TemplateResponse;
import com.koupreng.backend.repository.InvitationTemplateRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TemplateCatalogService {

    private static final String STATUS_ACTIVE = "ACTIVE";
    private static final String KEEP_TEMPLATE_CODE = "garden-royal-khmer-wedding";

    private final InvitationTemplateRepository templateRepository;

    public TemplateCatalogService(InvitationTemplateRepository templateRepository) {
        this.templateRepository = templateRepository;
    }

    @Transactional(readOnly = true)
    public List<PublicTemplateResponse> listActiveTemplates() {
        return templateRepository.findAllByStatusIgnoreCaseOrderBySortOrderAscCreatedAtDesc(STATUS_ACTIVE).stream()
                .map(PublicTemplateResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public PublicTemplateResponse getActiveTemplate(Long templateId) {
        return templateRepository.findByIdAndStatusIgnoreCase(templateId, STATUS_ACTIVE)
                .map(PublicTemplateResponse::from)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Template not found"));
    }

    @Transactional(readOnly = true)
    public PublicTemplateResponse getActiveTemplateByCode(String code) {
        return templateRepository.findByCodeIgnoreCaseAndStatusIgnoreCase(code, STATUS_ACTIVE)
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
