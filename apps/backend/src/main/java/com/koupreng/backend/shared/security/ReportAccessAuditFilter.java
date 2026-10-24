package com.koupreng.backend.shared.security;

import com.koupreng.backend.audit.application.AuditLogService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Map;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/** Runs inside the security chain so denials before controller dispatch are recorded too. */
@Component
public class ReportAccessAuditFilter extends OncePerRequestFilter {
    private final AuditLogService audit;
    public ReportAccessAuditFilter(AuditLogService audit) { this.audit = audit; }
    @Override protected boolean shouldNotFilter(HttpServletRequest request) {
        return !request.getRequestURI().startsWith("/api/v1/admin/reports/");
    }
    @Override protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws ServletException, IOException {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String actor = authentication == null ? "anonymous" : authentication.getName();
        try { chain.doFilter(request, response); }
        finally {
            if (response.getStatus() == 403 || response.getStatus() == 401) {
                String path = request.getRequestURI();
                try { audit.logSystemEvent("REPORT_ACCESS_DENIED", "REPORT", null, "Administrative report permission denied",
                    Map.of("actor",actor,"path",path.substring(0,Math.min(180,path.length())),"status",response.getStatus())); }
                catch (RuntimeException unavailable) { logger.warn("Could not persist report denial audit event"); }
            }
        }
    }
}
