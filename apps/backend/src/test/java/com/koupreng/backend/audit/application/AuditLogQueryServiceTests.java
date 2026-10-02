package com.koupreng.backend.audit.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.List;

import com.koupreng.backend.audit.domain.AuditLog;
import com.koupreng.backend.audit.infrastructure.persistence.AuditLogRepository;
import com.koupreng.backend.user.domain.AppUser;
import com.koupreng.backend.user.infrastructure.persistence.AppUserRepository;
import org.junit.jupiter.api.Test;

class AuditLogQueryServiceTests {

    @Test
    void preservesOrderAndAuditFieldsWithBulkUserLookupAndMissingAdminFallback() {
        AuditLogRepository logs = mock(AuditLogRepository.class);
        AppUserRepository users = mock(AppUserRepository.class);
        AuditLog newest = AuditLog.builder()
                .id(3L).adminId(1L).action("UPDATE").targetEntity("INVITATION").targetId(9L)
                .oldValues("before").newValues("after").ipAddress("127.0.0.1")
                .createdAt(Instant.parse("2026-01-03T00:00:00Z")).build();
        AuditLog missingAdmin = AuditLog.builder().id(2L).adminId(2L).action("DELETE").build();
        AuditLog oldest = AuditLog.builder().id(1L).adminId(1L).action("CREATE").build();
        AppUser admin = new AppUser();
        admin.setId(1L);
        admin.setEmail("admin@example.test");
        admin.setFullName("Admin Name");
        when(logs.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(newest, missingAdmin, oldest));
        when(users.findAllById(List.of(1L, 2L))).thenReturn(List.of(admin));

        var result = new AuditLogQueryService(logs, users).listLogs();

        assertEquals(List.of(3L, 2L, 1L), result.stream().map(log -> log.getId()).toList());
        assertEquals("Admin Name", result.getFirst().getAdminName());
        assertEquals("admin@example.test", result.getFirst().getAdminEmail());
        assertEquals("UPDATE", result.getFirst().getAction());
        assertEquals("INVITATION", result.getFirst().getTargetEntity());
        assertEquals(9L, result.getFirst().getTargetId());
        assertEquals("before", result.getFirst().getOldValues());
        assertEquals("after", result.getFirst().getNewValues());
        assertEquals("127.0.0.1", result.getFirst().getIpAddress());
        assertEquals(newest.getCreatedAt(), result.getFirst().getCreatedAt());
        assertEquals("Admin #2", result.get(1).getAdminName());
        assertNull(result.get(1).getAdminEmail());
        verify(users).findAllById(List.of(1L, 2L));
    }
}
