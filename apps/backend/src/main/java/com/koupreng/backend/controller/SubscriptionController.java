package com.koupreng.backend.controller;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.koupreng.backend.dto.ApiResponse;
import com.koupreng.backend.dto.subscription.SubscriptionPackageResponse;
import com.koupreng.backend.dto.subscription.SubscriptionPurchaseRequest;
import com.koupreng.backend.dto.subscription.SubscriptionResponse;
import com.koupreng.backend.service.SubscriptionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@Validated
@RequestMapping("/api/v1")
@Tag(name = "Subscriptions", description = "Authenticated package catalog, subscription history, and purchase creation.")
@SecurityRequirement(name = "bearerAuth")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    public SubscriptionController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    @GetMapping("/packages")
    public ResponseEntity<ApiResponse<List<SubscriptionPackageResponse>>> packages() {
        return ResponseEntity.ok(ApiResponse.success(
                "Packages fetched successfully",
                subscriptionService.listPackages()
        ));
    }

    @GetMapping({"/me/subscriptions/current", "/me/subscription"})
    public ResponseEntity<ApiResponse<SubscriptionResponse>> current(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(
                "Current subscription fetched successfully",
                subscriptionService.current(authentication)
        ));
    }

    @GetMapping("/me/subscriptions")
    public ResponseEntity<ApiResponse<List<SubscriptionResponse>>> history(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(
                "Subscription history fetched successfully",
                subscriptionService.history(authentication)
        ));
    }

    @PostMapping({"/me/subscriptions/purchase", "/packages/{packageId}/purchase"})
    public ResponseEntity<ApiResponse<SubscriptionResponse>> purchase(
            Authentication authentication,
            @org.springframework.web.bind.annotation.PathVariable(required = false) Long packageId,
            @Valid @RequestBody(required = false) SubscriptionPurchaseRequest request
    ) {
        Long resolvedPackageId = packageId;
        if (resolvedPackageId == null && request != null) {
            resolvedPackageId = request.getPackageId();
        }
        if (resolvedPackageId == null) {
            throw new com.koupreng.backend.common.ApiException(HttpStatus.BAD_REQUEST, "Package ID is required");
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(
                "Subscription purchase created successfully",
                subscriptionService.purchase(authentication, resolvedPackageId)
        ));
    }
}
