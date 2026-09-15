package com.koupreng.backend.audit.infrastructure.persistence;

import com.koupreng.backend.audit.domain.SystemAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SystemAuditLogRepository extends JpaRepository<SystemAuditLog, Long> {

    List<SystemAuditLog> findAllByOrderByCreatedAtDesc();

    List<SystemAuditLog> findTop100ByOrderByCreatedAtDesc();
}
