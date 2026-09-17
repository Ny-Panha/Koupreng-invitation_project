package com.koupreng.backend.audit.application;

import com.koupreng.backend.user.application.CurrentUserService;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.koupreng.backend.audit.api.dto.SystemAuditLogResponse;
import com.koupreng.backend.audit.domain.SystemAuditLog;
import com.koupreng.backend.user.domain.AppUser;
import com.koupreng.backend.audit.infrastructure.persistence.SystemAuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AuditLogService {

    private final SystemAuditLogRepository auditLogRepository;
    private final CurrentUserService currentUserService;
    private final ObjectMapper objectMapper;
    private final boolean trustForwardedHeaders;

    public AuditLogService(
            SystemAuditLogRepository auditLogRepository,
            CurrentUserService currentUserService,
            ObjectMapper objectMapper,
            @org.springframework.beans.factory.annotation.Value("${app.audit.trust-forwarded-headers:false}") boolean trustForwardedHeaders
    ) {
        this.auditLogRepository = auditLogRepository;
        this.currentUserService = currentUserService;
        this.objectMapper = objectMapper;
        this.trustForwardedHeaders = trustForwardedHeaders;
    }

    @Transactional
    public void logAdminAction(
            Authentication authentication,
            String action,
            String resourceType,
            Long resourceId,
            String description,
            HttpServletRequest request,
            Object metadata
    ) {
        AppUser actor = currentUserService.currentUser(authentication);
        SystemAuditLog log = baseLog(action, resourceType, resourceId, description, request, metadata);
        log.setActorUserId(actor.getId());
        log.setActorEmail(actor.getEmail());
        auditLogRepository.save(log);
    }

    @Transactional
    public void logSystemEvent(
            String action,
            String resourceType,
            Long resourceId,
            String description,
            Object metadata
    ) {
        auditLogRepository.save(baseLog(action, resourceType, resourceId, description, null, metadata));
    }

    @Transactional(readOnly = true)
    public List<SystemAuditLogResponse> listLogs() {
        return auditLogRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(SystemAuditLogResponse::from)
                .toList();
    }

    private SystemAuditLog baseLog(
            String action,
            String resourceType,
            Long resourceId,
            String description,
            HttpServletRequest request,
            Object metadata
    ) {
        SystemAuditLog log = new SystemAuditLog();
        log.setAction(action);
        log.setResourceType(resourceType);
        log.setResourceId(resourceId);
        log.setDescription(description);
        if (request != null) {
            log.setIpAddress(clientIp(request));
            log.setUserAgent(trimToLength(request.getHeader("User-Agent"), 500));
        }
        log.setMetadataJson(toJson(metadata));
        return log;
    }

    private String clientIp(HttpServletRequest request) {
        if (trustForwardedHeaders) {
            String forwardedFor = request.getHeader("X-Forwarded-For");
            if (forwardedFor != null && !forwardedFor.isBlank()) {
                return forwardedFor.split(",")[0].trim();
            }
        }
        return request.getRemoteAddr();
    }

    private String toJson(Object value) {
        if (value == null) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException exception) {
            return "{\"error\":\"metadata serialization failed\"}";
        }
    }

    private String trimToLength(String value, int maxLength) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.length() <= maxLength ? trimmed : trimmed.substring(0, maxLength);
    }
}
