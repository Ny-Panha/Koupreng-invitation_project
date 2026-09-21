package com.koupreng.backend.subscription.api.dto;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class TelegramDetectSubscriptionPaymentRequest {

    @NotBlank(message = "Raw message is required")
    @Size(max = 5000, message = "Raw message is too long")
    private String rawMessage;

    @NotBlank(message = "Detected by is required")
    @Size(max = 120, message = "Detected by is too long")
    private String detectedBy;

    private String telegramChatId;
    private String telegramMessageId;
    private String telegramSenderId;
    private String telegramSenderUsername;

    @NotNull(message = "Detected amount is required")
    @Positive(message = "Detected amount must be positive")
    @Digits(integer = 10, fraction = 2, message = "Detected amount must have at most two decimal places")
    private BigDecimal detectedAmount;

    @NotBlank(message = "Detected currency is required")
    private String detectedCurrency;

    @Size(max = 120, message = "Payer name is too long")
    private String payerName;

    @NotBlank(message = "Payer account suffix is required")
    @Pattern(regexp = "^[0-9]{3}$", message = "Payer account suffix must be exactly 3 numeric digits")
    private String payerAccountLast3;

    @NotBlank(message = "PayWay transaction ID is required")
    @Size(max = 100, message = "PayWay transaction ID is too long")
    private String paywayTransactionId;

    @Size(max = 100, message = "PayWay approval code is too long")
    private String paywayApprovalCode;

    @Size(max = 120, message = "Remark is too long")
    private String remark;
}
