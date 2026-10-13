package com.koupreng.backend.devmonitor.api;

import java.util.Map;

import com.koupreng.backend.devmonitor.api.dto.ClientTelemetryRequest;
import com.koupreng.backend.devmonitor.application.ApiMonitorService;

import io.swagger.v3.oas.annotations.Hidden;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Hidden
@RestController
@RequestMapping("/api/v1/dev-monitor")
public class DevTelemetryController {

    private final ApiMonitorService apiMonitorService;

    public DevTelemetryController(ApiMonitorService apiMonitorService) {
        this.apiMonitorService = apiMonitorService;
    }

    @PostMapping("/telemetry")
    public ResponseEntity<Map<String, Object>> recordTelemetry(
            @Valid @RequestBody ClientTelemetryRequest request,
            HttpServletRequest httpRequest
    ) {
        if (!apiMonitorService.isEnabled()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        apiMonitorService.recordClientTelemetry(request, httpRequest.getRemoteAddr());
        return ResponseEntity.ok(Map.of("recorded", true));
    }
}
