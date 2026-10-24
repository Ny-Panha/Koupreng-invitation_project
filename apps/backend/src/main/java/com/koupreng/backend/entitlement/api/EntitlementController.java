package com.koupreng.backend.entitlement.api;

import com.koupreng.backend.user.application.CurrentUserService;
import com.koupreng.backend.entitlement.application.EntitlementService;
import com.koupreng.backend.entitlement.api.dto.CurrentEntitlementsResponse;
import com.koupreng.backend.shared.response.ApiResponse;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = "bearerAuth")
@io.swagger.v3.oas.annotations.tags.Tag(name = "Entitlements", description = "Backend-resolved current plan, immutable purchased benefits and remaining quotas; independent of administrative roles.")
@RequestMapping("/api/v1/me/entitlements")
public class EntitlementController {
    private final EntitlementService entitlements;
    private final CurrentUserService currentUsers;
    public EntitlementController(EntitlementService entitlements, CurrentUserService currentUsers) {
        this.entitlements = entitlements; this.currentUsers = currentUsers;
    }
    @GetMapping
    public ResponseEntity<ApiResponse<CurrentEntitlementsResponse>> current(Authentication authentication) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(ApiResponse.success("Current entitlements", entitlements.current(currentUsers.currentUser(authentication))));
    }
}
