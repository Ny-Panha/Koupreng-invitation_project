package com.koupreng.backend.payment.api.dto;

import com.koupreng.backend.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentConfirmResponse {

    private String message;
    private String orderCode;
    private PaymentStatus status;
}
