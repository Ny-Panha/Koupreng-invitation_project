package com.koupreng.backend.payment.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import java.math.BigDecimal;
import java.time.Instant;

@Data
@Entity
@Table(name = "payment_evidence")
public class PaymentEvidence {
    @Id @Column(name = "transaction_id", length = 100)
    private String transactionId;
    private BigDecimal amount;
    private String currency;
    @Column(name = "payer_name") private String payerName;
    @Column(name = "payer_last3") private String payerLast3;
    @Column(name = "approval_code") private String approvalCode;
    private String remark;
    @Column(name = "chat_id") private String chatId;
    @Column(name = "message_id") private String messageId;
    @Column(name = "sender_id") private String senderId;
    @Column(name = "merchant_message_at") private Instant merchantMessageAt;
    @Column(name = "transaction_date_text", length = 120) private String transactionDateText;
    @Column(name = "received_at") private Instant receivedAt;
    private boolean trusted;
    @Column(name = "order_code") private String orderCode;
    private String outcome = "RECEIVED";
}
