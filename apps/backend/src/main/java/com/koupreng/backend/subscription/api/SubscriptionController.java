package com.koupreng.backend.subscription.api;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import com.koupreng.backend.shared.response.ApiResponse;
import com.koupreng.backend.subscription.api.dto.SubscriptionPackageResponse;
import com.koupreng.backend.subscription.api.dto.SubscriptionPurchaseRequest;
import com.koupreng.backend.subscription.api.dto.SubscriptionResponse;
import com.koupreng.backend.subscription.api.dto.SubscriptionPaymentDetectionResponse;
import com.koupreng.backend.subscription.api.dto.TelegramDetectSubscriptionPaymentRequest;
import com.koupreng.backend.subscription.application.SubscriptionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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

    @GetMapping("/me/subscriptions/orders/{orderCode}")
    @Operation(summary = "Poll a pending subscription payment order")
    public ResponseEntity<ApiResponse<SubscriptionResponse>> order(
            Authentication authentication,
            @PathVariable String orderCode
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Subscription payment order fetched successfully",
                subscriptionService.getOrder(authentication, orderCode)
        ));
    }

    @PostMapping({"/me/subscriptions/purchase", "/packages/{packageId}/purchase"})
    @Operation(summary = "Create a pending fixed-link subscription checkout")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<ApiResponse<SubscriptionResponse>> purchase(
            Authentication authentication,
            @PathVariable(required = false) Long packageId,
            @Valid @RequestBody SubscriptionPurchaseRequest request
    ) {
        Long resolvedPackageId = packageId;
        if (resolvedPackageId == null) {
            resolvedPackageId = request.getPackageId();
        }
        if (resolvedPackageId == null) {
            throw new com.koupreng.backend.shared.exception.ApiException(HttpStatus.BAD_REQUEST, "Package ID is required");
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(
                "Subscription purchase created successfully",
                subscriptionService.purchase(authentication, withPackageId(request, resolvedPackageId))
        ));
    }

    @PostMapping("/internal/subscription-payments/telegram-detect")
    @Operation(summary = "Reconcile trusted Telegram evidence for a subscription payment")
    public ResponseEntity<ApiResponse<SubscriptionPaymentDetectionResponse>> detectInternalTelegramPayment(
            @Valid @RequestBody TelegramDetectSubscriptionPaymentRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Subscription payment detection processed",
                subscriptionService.detectTelegramPayment(request)
        ));
    }

    private SubscriptionPurchaseRequest withPackageId(SubscriptionPurchaseRequest request, Long packageId) {
        request.setPackageId(packageId);
        return request;
    }
}
