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
    private boolean trustedMerchantAlert;
    private java.time.Instant merchantMessageAt;
    @jakarta.validation.constraints.Size(max = 120) private String transactionDateText;
    @jakarta.validation.constraints.Size(max = 120) private String payerName;
    @jakarta.validation.constraints.Size(max = 3) private String payerAccountLast3;
    @jakarta.validation.constraints.Size(max = 120) private String remark;
}
