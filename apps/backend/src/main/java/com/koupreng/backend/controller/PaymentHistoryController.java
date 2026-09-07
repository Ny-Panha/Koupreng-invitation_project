package com.koupreng.backend.controller;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.koupreng.backend.dto.ApiResponse;
import com.koupreng.backend.dto.payments.PaymentHistoryResponse;
import com.koupreng.backend.dto.payments.PaymentReceiptResponse;
import com.koupreng.backend.service.PaymentHistoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@Validated
@RequestMapping("/api/v1/me/payments")
@Tag(name = "Payment History", description = "Current-user payment orders and receipts with ownership enforcement.")
@SecurityRequirement(name = "bearerAuth")
public class PaymentHistoryController {

    private final PaymentHistoryService paymentHistoryService;

    public PaymentHistoryController(PaymentHistoryService paymentHistoryService) {
        this.paymentHistoryService = paymentHistoryService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PaymentHistoryResponse>>> listMine(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(
                "Payment history fetched successfully",
                paymentHistoryService.listMine(authentication)
        ));
    }

    @GetMapping("/{orderCode}")
    public ResponseEntity<ApiResponse<PaymentHistoryResponse>> get(
            Authentication authentication,
            @PathVariable String orderCode
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Payment order fetched successfully",
                paymentHistoryService.get(authentication, orderCode)
        ));
    }

    @GetMapping("/{orderCode}/receipt")
    public ResponseEntity<ApiResponse<PaymentReceiptResponse>> receipt(
            Authentication authentication,
            @PathVariable String orderCode
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Payment receipt fetched successfully",
                paymentHistoryService.receipt(authentication, orderCode)
        ));
    }
}
