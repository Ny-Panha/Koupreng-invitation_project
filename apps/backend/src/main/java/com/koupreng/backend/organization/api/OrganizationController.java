package com.koupreng.backend.organization.api;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.koupreng.backend.shared.response.ApiResponse;
import com.koupreng.backend.organization.api.dto.OrganizationMemberRequest;
import com.koupreng.backend.organization.api.dto.OrganizationMemberResponse;
import com.koupreng.backend.organization.api.dto.OrganizationMemberRoleRequest;
import com.koupreng.backend.organization.api.dto.OrganizationRequest;
import com.koupreng.backend.organization.api.dto.OrganizationResponse;
import com.koupreng.backend.organization.application.OrganizationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@Validated
@RequestMapping("/api/v1/organizations")
@Tag(name = "Organizations", description = "Authenticated organization membership and owner-managed member access.")
@SecurityRequirement(name = "bearerAuth")
public class OrganizationController {

    private final OrganizationService organizationService;

    public OrganizationController(OrganizationService organizationService) {
        this.organizationService = organizationService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<OrganizationResponse>>> listMine(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(
                "Organizations fetched successfully",
                organizationService.listMine(authentication)
        ));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<OrganizationResponse>> create(
            Authentication authentication,
            @Valid @RequestBody OrganizationRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(
                "Organization created successfully",
                organizationService.create(authentication, request.getName())
        ));
    }

    @GetMapping("/{organizationId}")
    public ResponseEntity<ApiResponse<OrganizationResponse>> get(
            Authentication authentication,
            @PathVariable Long organizationId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Organization fetched successfully",
                organizationService.get(authentication, organizationId)
        ));
    }

    @PostMapping("/{organizationId}/members")
    public ResponseEntity<ApiResponse<OrganizationMemberResponse>> addMember(
            Authentication authentication,
            @PathVariable Long organizationId,
            @Valid @RequestBody OrganizationMemberRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(
                "Organization member saved successfully",
                organizationService.addMember(authentication, organizationId, request)
        ));
    }

    @DeleteMapping("/{organizationId}/members/{memberId}")
    public ResponseEntity<ApiResponse<Void>> removeMember(
            Authentication authentication,
            @PathVariable Long organizationId,
            @PathVariable Long memberId
    ) {
        organizationService.removeMember(authentication, organizationId, memberId);
        return ResponseEntity.ok(ApiResponse.success("Organization member removed successfully", null));
    }

    @org.springframework.web.bind.annotation.PatchMapping("/{organizationId}/members/{memberId}/role")
    public ResponseEntity<ApiResponse<OrganizationMemberResponse>> updateMemberRole(
            Authentication authentication,
            @PathVariable Long organizationId,
            @PathVariable Long memberId,
            @Valid @RequestBody OrganizationMemberRoleRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Organization member role updated successfully",
                organizationService.updateRole(authentication, organizationId, memberId, request.getRole())
        ));
    }
}
