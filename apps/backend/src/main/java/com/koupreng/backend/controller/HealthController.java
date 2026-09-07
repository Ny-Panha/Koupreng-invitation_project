package com.koupreng.backend.controller;

import java.util.Map;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Tag(name = "Health", description = "Public application liveness endpoint.")
public class HealthController {
    @Operation(summary = "Check API health", description = "Return a lightweight public liveness response.")
    @GetMapping({"/", "/api/health"})
    public Map<String, String> health() {
        return Map.of(
                "status", "OK",
                "service", "Spring Boot Backend"
        );
    }
}
