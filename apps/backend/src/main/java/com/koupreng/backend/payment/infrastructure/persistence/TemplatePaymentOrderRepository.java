package com.koupreng.backend.payment.infrastructure.persistence;

import com.koupreng.backend.payment.domain.TemplatePaymentOrder;
import com.koupreng.backend.payment.domain.PaymentStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface TemplatePaymentOrderRepository extends JpaRepository<TemplatePaymentOrder, Long> {

    Optional<TemplatePaymentOrder> findByOrderCode(String orderCode);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select paymentOrder from TemplatePaymentOrder paymentOrder "
            + "where paymentOrder.orderCode = :orderCode")
    Optional<TemplatePaymentOrder> findForUpdateByOrderCode(@Param("orderCode") String orderCode);

    Optional<TemplatePaymentOrder> findByTransactionId(String transactionId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select paymentOrder from TemplatePaymentOrder paymentOrder "
            + "where paymentOrder.transactionId = :transactionId")
    Optional<TemplatePaymentOrder> findForUpdateByTransactionId(@Param("transactionId") String transactionId);

    boolean existsByOrderCode(String orderCode);

    boolean existsByTransactionId(String transactionId);

    boolean existsByPaywayTransactionId(String paywayTransactionId);

    List<TemplatePaymentOrder> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<TemplatePaymentOrder> findTop5ByUserIdOrderByCreatedAtDesc(Long userId);

    List<TemplatePaymentOrder> findByStatusInOrderByCreatedAtDesc(Collection<PaymentStatus> statuses);

    List<TemplatePaymentOrder> findByStatusInAndExpiresAtBefore(
            Collection<PaymentStatus> statuses,
            Instant expiresAt
    );
}
