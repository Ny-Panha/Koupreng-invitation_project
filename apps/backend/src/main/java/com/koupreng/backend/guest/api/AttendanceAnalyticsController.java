package com.koupreng.backend.guest.api;

import com.koupreng.backend.guest.api.dto.AttendanceAnalyticsResponse;
import com.koupreng.backend.guest.application.AttendanceAnalyticsService;
import com.koupreng.backend.shared.response.ApiResponse;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.format.annotation.DateTimeFormat;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/invitations/{invitationId}/analytics")
@io.swagger.v3.oas.annotations.security.SecurityRequirement(name="bearerAuth")
@io.swagger.v3.oas.annotations.tags.Tag(name="Attendance analytics",description="Owner-entitled, permission-checked attendance facts in bounded Cambodian calendar dates.")
public class AttendanceAnalyticsController {
    private final AttendanceAnalyticsService service;
    public AttendanceAnalyticsController(AttendanceAnalyticsService service) { this.service=service; }
    @GetMapping
    public ResponseEntity<ApiResponse<AttendanceAnalyticsResponse>> report(Authentication auth,@PathVariable Long invitationId,
            @RequestParam @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(ApiResponse.success("Attendance analytics",service.report(auth,invitationId,from,to)));
    }
}
