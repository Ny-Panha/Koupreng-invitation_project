package com.koupreng.backend.service;

import com.koupreng.backend.user.application.CurrentUserService;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.koupreng.backend.entity.audit.SystemAuditLog;
import com.koupreng.backend.user.domain.AppUser;
import com.koupreng.backend.repository.SystemAuditLogRepository;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.core.Authentication;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AuditLogServiceTests {

    @Test
    public void defaultIgnoresSpoofedForwardedFor() {
        SystemAuditLogRepository repo = mock(SystemAuditLogRepository.class);
        CurrentUserService curUserService = mock(CurrentUserService.class);
        AppUser mockUser = new AppUser();
        mockUser.setId(1L);
        when(curUserService.currentUser(any())).thenReturn(mockUser);
        
        AuditLogService service = new AuditLogService(repo, curUserService, new ObjectMapper(), false);
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("X-Forwarded-For", "203.0.113.5");
        request.setRemoteAddr("192.168.1.100");
        
        service.logAdminAction(mock(Authentication.class), "ACT", "RES", 1L, "desc", request, null);
        
        ArgumentCaptor<SystemAuditLog> captor = ArgumentCaptor.forClass(SystemAuditLog.class);
        verify(repo).save(captor.capture());
        assertEquals("192.168.1.100", captor.getValue().getIpAddress());
    }

    @Test
    public void usesForwardedForWhenTrusted() {
        SystemAuditLogRepository repo = mock(SystemAuditLogRepository.class);
        CurrentUserService curUserService = mock(CurrentUserService.class);
        AppUser mockUser = new AppUser();
        mockUser.setId(1L);
        when(curUserService.currentUser(any())).thenReturn(mockUser);
        
        AuditLogService service = new AuditLogService(repo, curUserService, new ObjectMapper(), true);
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("X-Forwarded-For", "203.0.113.5, 10.0.0.1");
        request.setRemoteAddr("192.168.1.100");
        
        service.logAdminAction(mock(Authentication.class), "ACT", "RES", 1L, "desc", request, null);
        
        ArgumentCaptor<SystemAuditLog> captor = ArgumentCaptor.forClass(SystemAuditLog.class);
        verify(repo).save(captor.capture());
        assertEquals("203.0.113.5", captor.getValue().getIpAddress());
    }
}
