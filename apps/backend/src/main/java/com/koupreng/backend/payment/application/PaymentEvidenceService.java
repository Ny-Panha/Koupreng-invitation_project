package com.koupreng.backend.payment.application;

import com.koupreng.backend.payment.domain.PaymentEvidence;
import com.koupreng.backend.payment.infrastructure.config.PaymentProperties;
import com.koupreng.backend.payment.infrastructure.persistence.PaymentEvidenceRepository;
import com.koupreng.backend.shared.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Arrays;

@Service
@Transactional(propagation = Propagation.MANDATORY)
public class PaymentEvidenceService {
    private final PaymentEvidenceRepository repository;
    private final PaymentProperties properties;

    public PaymentEvidenceService(PaymentEvidenceRepository repository, PaymentProperties properties) {
        this.repository = repository;
        this.properties = properties;
    }

    public PaymentEvidence record(String transactionId, BigDecimal amount, String currency,
            String chatId, String messageId, String senderId, boolean original,
            Instant messageAt, String payerName, String last3, String approval, String remark) {
        String id = requireTransactionId(transactionId);
        repository.reserve(id, amount, currency, Instant.now());
        PaymentEvidence evidence = repository.lock(id).orElseThrow();
        if (!"RECEIVED".equals(evidence.getOutcome())) return evidence;
        evidence.setChatId(chatId);
        evidence.setMessageId(messageId);
        evidence.setSenderId(senderId);
        evidence.setMerchantMessageAt(messageAt);
        evidence.setPayerName(payerName);
        evidence.setPayerLast3(last3);
        evidence.setApprovalCode(approval);
        evidence.setRemark(remark);
        evidence.setTrusted(original && allowed(properties.getTelegramGroupIds(), chatId)
                && allowed(properties.getTelegramPaymentBotIds(), senderId)
                && messageId != null && messageId.matches("[0-9]+"));
        // Flush metadata now: the message unique key also rejects an altered replay.
        return repository.saveAndFlush(evidence);
    }

    public void claim(PaymentEvidence evidence, String orderCode, BigDecimal amount, String currency) {
        if (!evidence.isTrusted() || "PAID".equals(evidence.getOutcome())
                || evidence.getAmount().compareTo(amount) != 0 || !currency.equals(evidence.getCurrency())
                || (evidence.getOrderCode() != null && !orderCode.equals(evidence.getOrderCode()))) {
            throw new ApiException(HttpStatus.CONFLICT, "PAYMENT_EVIDENCE_CONFLICT",
                    "Merchant evidence is unavailable, conflicts with this order, or was already used");
        }
        evidence.setOrderCode(orderCode);
        evidence.setOutcome("PAID");
        repository.saveAndFlush(evidence);
    }

    public PaymentEvidence manualEvidence(String transactionId, String orderCode) {
        PaymentEvidence evidence = repository.lock(requireTransactionId(transactionId))
                .orElseThrow(() -> new ApiException(HttpStatus.CONFLICT, "Trusted merchant evidence is required"));
        if ("REVIEW_REQUIRED".equals(evidence.getOutcome()) && evidence.getChatId() == null) {
            throw new ApiException(HttpStatus.CONFLICT, "Historical transaction collision requires investigation");
        }
        if (evidence.getOrderCode() != null && !orderCode.equals(evidence.getOrderCode())) {
            throw new ApiException(HttpStatus.CONFLICT, "Transaction belongs to another order");
        }
        return evidence;
    }

    public void claimVerifiedProviderTransaction(String transactionId, String orderCode, BigDecimal amount, String currency) {
        String id = requireTransactionId(transactionId);
        repository.reserve(id, amount, currency, Instant.now());
        PaymentEvidence evidence = repository.lock(id).orElseThrow();
        if ("RECEIVED".equals(evidence.getOutcome())) evidence.setTrusted(true);
        claim(evidence, orderCode, amount, currency);
    }

    public static String requireTransactionId(String value) {
        if (value == null || !value.trim().matches("[A-Za-z0-9_-]{1,100}")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Real ABA transaction ID is required");
        }
        return value.trim();
    }

    private boolean allowed(String configured, String value) {
        return value != null && Arrays.stream(configured.split(",")).map(String::trim).anyMatch(value::equals);
    }
}
