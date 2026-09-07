package com.koupreng.backend.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import com.koupreng.backend.dto.ApiResponse;
import com.koupreng.backend.dto.template.PublicTemplateResponse;
import com.koupreng.backend.service.TemplateCatalogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/templates")
@Tag(name = "Templates", description = "Public active invitation template catalog.")
public class TemplateCatalogController {

    private final TemplateCatalogService templateCatalogService;

    public TemplateCatalogController(TemplateCatalogService templateCatalogService) {
        this.templateCatalogService = templateCatalogService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PublicTemplateResponse>>> listTemplates() {
        return ResponseEntity.ok(ApiResponse.success(
                "Templates fetched successfully",
                templateCatalogService.listActiveTemplates()
        ));
    }

    @GetMapping("/{templateId}")
    public ResponseEntity<ApiResponse<PublicTemplateResponse>> getTemplate(@PathVariable Long templateId) {
        return ResponseEntity.ok(ApiResponse.success(
                "Template fetched successfully",
                templateCatalogService.getActiveTemplate(templateId)
        ));
    }

    @GetMapping("/slug/{code}")
    public ResponseEntity<ApiResponse<PublicTemplateResponse>> getTemplateByCode(@PathVariable String code) {
        return ResponseEntity.ok(ApiResponse.success(
                "Template fetched successfully",
                templateCatalogService.getActiveTemplateByCode(code)
        ));
    }
}
