package com.koupreng.backend.audit.infrastructure.aspect;

import java.lang.reflect.Method;
import java.util.Map;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.koupreng.backend.audit.api.annotation.LogActivity;
import com.koupreng.backend.audit.domain.AuditLog;
import com.koupreng.backend.audit.infrastructure.persistence.AuditLogRepository;
import com.koupreng.backend.user.domain.AppUser;
import com.koupreng.backend.user.infrastructure.persistence.AppUserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Aspect
@Component
public class AuditActivityAspect {

    private final AuditLogRepository auditLogRepository;
    private final AppUserRepository appUserRepository;
    private final ObjectMapper objectMapper;

    public AuditActivityAspect(
            AuditLogRepository auditLogRepository,
            AppUserRepository appUserRepository,
            ObjectMapper objectMapper
    ) {
        this.auditLogRepository = auditLogRepository;
        this.appUserRepository = appUserRepository;
        this.objectMapper = objectMapper;
    }

    @AfterReturning(pointcut = "@annotation(com.koupreng.backend.audit.api.annotation.LogActivity)", returning = "result")
    public void logAnnotatedActivity(JoinPoint joinPoint, Object result) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        LogActivity annotation = method.getAnnotation(LogActivity.class);

        if (annotation == null) {
            return;
        }

        saveAuditLog(joinPoint, annotation.action(), annotation.targetEntity(), annotation.captureRequestBody(), result);
    }

    private void saveAuditLog(JoinPoint joinPoint, String action, String targetEntity, boolean captureRequestBody, Object result) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return;
        }

        String principalName = authentication.getName();
        Long adminId = parseAdminId(principalName);
        if (adminId == null) {
            return;
        }

        String ipAddress = resolveIpAddress();
        String requestBody = captureRequestBody ? serializeRequestBody(joinPoint) : null;
        String responsePayload = result == null ? null : safeJson(result);

        AuditLog log = AuditLog.builder()
                .adminId(adminId)
                .action(action)
                .targetEntity(targetEntity.isBlank() ? resolveTargetEntity(joinPoint) : targetEntity)
                .targetId(resolveTargetId(joinPoint, result))
                .oldValues(null)
                .newValues(responsePayload != null ? responsePayload : requestBody)
                .ipAddress(ipAddress)
                .build();

        auditLogRepository.save(log);
    }

    private String serializeRequestBody(JoinPoint joinPoint) {
        Object[] args = joinPoint.getArgs();
        for (Object arg : args) {
            if (arg != null && !(arg instanceof HttpServletRequest) && !(arg instanceof jakarta.servlet.http.HttpServletResponse)) {
                return safeJson(arg);
            }
        }
        return null;
    }

    private String resolveIpAddress() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes == null) {
            return null;
        }
        HttpServletRequest request = attributes.getRequest();
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private Long parseAdminId(String principalName) {
        try {
            return Long.parseLong(principalName);
        } catch (NumberFormatException ex) {
            return appUserRepository.findByEmailIgnoreCase(principalName)
                    .map(AppUser::getId)
                    .orElse(null);
        }
    }

    private String resolveTargetEntity(JoinPoint joinPoint) {
        String className = joinPoint.getTarget().getClass().getSimpleName();
        return className.endsWith("Controller") ? className.replace("Controller", "") : className;
    }

    private Long resolveTargetId(JoinPoint joinPoint, Object result) {
        Object[] args = joinPoint.getArgs();
        for (Object arg : args) {
            if (arg != null && arg.getClass().getSimpleName().endsWith("Id")) {
                return Long.valueOf(String.valueOf(arg));
            }
        }
        if (result != null) {
            try {
                java.lang.reflect.Field field = result.getClass().getDeclaredField("id");
                field.setAccessible(true);
                Object id = field.get(result);
                if (id instanceof Number number) {
                    return number.longValue();
                }
            } catch (Exception ignored) {
                // ignore if result has no id field
            }
        }
        return null;
    }

    private String safeJson(Object value) {
        try {
            if (value == null) {
                return null;
            }
            return objectMapper.writeValueAsString(value);
        } catch (Exception ex) {
            return Map.of("error", "serialization_failed", "message", ex.getMessage()).toString();
        }
    }
}
