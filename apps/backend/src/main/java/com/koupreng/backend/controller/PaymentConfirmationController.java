package com.koupreng.backend.controller;

import com.koupreng.backend.dto.ApiResponse;
import com.koupreng.backend.dto.payment.ConfirmPaymentRequest;
import com.koupreng.backend.dto.payment.PaymentConfirmResponse;
import com.koupreng.backend.service.PaymentConfirmationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Validated
@RequestMapping("/api/v1/admin/payments")
@Tag(name = "Payments", description = "Administrative payment verification and fulfillment.")
@SecurityRequirement(name = "bearerAuth")
public class PaymentConfirmationController {

    private final PaymentConfirmationService paymentConfirmationService;

    public PaymentConfirmationController(PaymentConfirmationService paymentConfirmationService) {
        this.paymentConfirmationService = paymentConfirmationService;
    }

    @PostMapping("/confirm")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Confirm and fulfill a payment manually",
            description = "Confirms a server-priced template or subscription order. Requires ADMIN authority.")
    public ResponseEntity<ApiResponse<PaymentConfirmResponse>> confirm(
            @Valid @RequestBody ConfirmPaymentRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Payment confirmed successfully",
                paymentConfirmationService.confirm(request)
        ));
    }
}
