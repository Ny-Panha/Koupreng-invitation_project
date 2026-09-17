package com.koupreng.backend.payment.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class TelegramDetectPaymentRequest {

    @NotBlank(message = "Raw message is required")
    private String rawMessage;

    @NotBlank(message = "Detected by is required")
    private String detectedBy;

    private String telegramChatId;
    private String telegramMessageId;
    private String telegramSenderUsername;
    private String telegramSenderId;
    private String detectedOrderCode;
    private BigDecimal detectedAmount;
    private String detectedCurrency;
    private String paywayTransactionId;
    private String paywayApprovalCode;
}
