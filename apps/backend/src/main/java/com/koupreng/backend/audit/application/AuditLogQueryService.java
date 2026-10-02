package com.koupreng.backend.audit.application;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import com.koupreng.backend.audit.api.dto.AuditLogResponse;
import com.koupreng.backend.audit.domain.AuditLog;
import com.koupreng.backend.audit.infrastructure.persistence.AuditLogRepository;
import com.koupreng.backend.user.domain.AppUser;
import com.koupreng.backend.user.infrastructure.persistence.AppUserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditLogQueryService {

    private final AuditLogRepository auditLogRepository;
    private final AppUserRepository appUserRepository;

    public AuditLogQueryService(
            AuditLogRepository auditLogRepository,
            AppUserRepository appUserRepository
    ) {
        this.auditLogRepository = auditLogRepository;
        this.appUserRepository = appUserRepository;
    }

    @Transactional(readOnly = true)
    public List<AuditLogResponse> listLogs() {
        List<AuditLog> logs = auditLogRepository.findAllByOrderByCreatedAtDesc();
        Map<Long, AppUser> usersById = appUserRepository.findAllById(logs.stream()
                        .map(AuditLog::getAdminId)
                        .filter(Objects::nonNull)
                        .distinct()
                        .toList())
                .stream()
                .collect(Collectors.toMap(AppUser::getId, user -> user));

        return logs.stream()
                .map(log -> {
                    AppUser admin = usersById.get(log.getAdminId());
                    return AuditLogResponse.from(log, admin, admin != null ? admin.getEmail() : null);
                })
                .toList();
    }
}
