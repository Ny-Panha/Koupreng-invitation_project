package com.koupreng.backend.payment.application;

import com.koupreng.backend.payment.api.dto.BankRecordVerification;
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

    private void claim(PaymentEvidence evidence, String orderCode, BigDecimal amount, String currency) {
        if (evidence.getVerificationMethod() == null || "PAID".equals(evidence.getOutcome())
                || evidence.getAmount().compareTo(amount) != 0 || !currency.equals(evidence.getCurrency())
                || (evidence.getOrderCode() != null && !orderCode.equals(evidence.getOrderCode()))) {
            throw new ApiException(HttpStatus.CONFLICT, "PAYMENT_EVIDENCE_CONFLICT",
                    "Merchant evidence is unavailable, conflicts with this order, or was already used");
        }
        evidence.setOrderCode(orderCode);
        evidence.setOutcome("PAID");
        repository.saveAndFlush(evidence);
    }

    public PaymentEvidence claimReviewedBankRecord(String transactionId, String orderCode, BigDecimal amount,
            String currency, String reviewer, BankRecordVerification bankRecord) {
        if (bankRecord == null || !bankRecord.successfulAndUnreversed() || !currency.equals(bankRecord.currency())
                || bankRecord.merchant() == null || bankRecord.merchant().length() > 120
                || !properties.getAba().getExpectedMerchant().equalsIgnoreCase(bankRecord.merchant().strip())
                || bankRecord.notes() == null || bankRecord.notes().isBlank() || bankRecord.notes().length() > 280
                || reviewer == null || reviewer.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "BANK_RECORD_VERIFICATION_REQUIRED",
                    "Verify the official bank record, merchant, currency and settlement status before confirming");
        }
        String id = requireTransactionId(transactionId);
        repository.reserve(id, amount, currency, Instant.now());
        PaymentEvidence evidence = repository.lock(id).orElseThrow();
        if ("REVIEW_REQUIRED".equals(evidence.getOutcome()) && evidence.getChatId() == null) {
            throw new ApiException(HttpStatus.CONFLICT, "Historical transaction collision requires investigation");
        }
        evidence.setVerificationMethod("ADMIN_BANK_RECORD");
        evidence.setVerifiedAt(Instant.now());
        evidence.setVerifiedBy(reviewer);
        evidence.setVerifiedMerchant(properties.getAba().getExpectedMerchant());
        evidence.setVerificationNotes(bankRecord.notes().strip());
        claim(evidence, orderCode, amount, currency);
        return evidence;
    }

    public void claimVerifiedProviderTransaction(String transactionId, String orderCode, BigDecimal amount, String currency) {
        String id = requireTransactionId(transactionId);
        repository.reserve(id, amount, currency, Instant.now());
        PaymentEvidence evidence = repository.lock(id).orElseThrow();
        evidence.setVerificationMethod("ABA_API");
        evidence.setVerifiedAt(Instant.now());
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
