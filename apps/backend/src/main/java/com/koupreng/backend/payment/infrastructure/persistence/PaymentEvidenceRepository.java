package com.koupreng.backend.payment.infrastructure.persistence;

import com.koupreng.backend.payment.domain.PaymentEvidence;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;

public interface PaymentEvidenceRepository extends JpaRepository<PaymentEvidence, String> {
    @Modifying
    @Query(value = """
            INSERT INTO payment_evidence (transaction_id, amount, currency, received_at)
            VALUES (:id, :amount, :currency, :now)
            ON DUPLICATE KEY UPDATE transaction_id = transaction_id
            """, nativeQuery = true)
    void reserve(@Param("id") String id, @Param("amount") BigDecimal amount,
                 @Param("currency") String currency, @Param("now") Instant now);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select e from PaymentEvidence e where e.transactionId = :id")
    Optional<PaymentEvidence> lock(@Param("id") String id);
}
