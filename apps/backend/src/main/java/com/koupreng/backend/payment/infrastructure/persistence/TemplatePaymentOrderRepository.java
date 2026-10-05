package com.koupreng.backend.payment.infrastructure.persistence;

import com.koupreng.backend.payment.domain.TemplatePaymentOrder;
import com.koupreng.backend.payment.domain.PaymentStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Pageable;

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

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = "user")
    @Query("select p from TemplatePaymentOrder p order by case when p.createdAt is null then 0 else 1 end, p.createdAt desc")
    List<TemplatePaymentOrder> findRecent(Pageable pageable);

    @Query("""
            select count(p) as total,
              coalesce(sum(case when p.status in (com.koupreng.backend.payment.domain.PaymentStatus.FAILED,
                com.koupreng.backend.payment.domain.PaymentStatus.REJECTED) then 1 else 0 end), 0) as failed,
              coalesce(sum(case when p.status in (com.koupreng.backend.payment.domain.PaymentStatus.PENDING,
                com.koupreng.backend.payment.domain.PaymentStatus.PAID_PENDING_REVIEW) then 1 else 0 end), 0) as pending,
              coalesce(sum(case when p.status = com.koupreng.backend.payment.domain.PaymentStatus.PAID_PENDING_REVIEW then 1 else 0 end), 0) as review
            from TemplatePaymentOrder p
            """)
    DashboardCounts dashboardCounts();

    interface DashboardCounts {
        long getTotal();
        long getFailed();
        long getPending();
        long getReview();
    }

    @Query("""
            select coalesce(nullif(upper(trim(p.currency)), ''), 'USD') as currency,
              sum(coalesce(p.paidAmount, p.amount)) as total
            from TemplatePaymentOrder p where p.status = com.koupreng.backend.payment.domain.PaymentStatus.PAID
            group by coalesce(nullif(upper(trim(p.currency)), ''), 'USD')
            """)
    List<RevenueByCurrency> revenueByCurrency();

                @Query("""
                                                select p.orderCode as reference,
                                                        p.packageName as packageName,
                                                        coalesce(p.paidAmount, p.amount) as amount,
                                                        p.currency as currency,
                                                        p.status as status,
                                                        p.provider as provider,
                                                        p.createdAt as createdAt
                                                from TemplatePaymentOrder p
                                                order by p.createdAt desc
                                                """)
                List<PlatformPaymentRow> findRecentPlatformPayments(Pageable pageable);

                interface PlatformPaymentRow {
                                String getReference();
                                String getPackageName();
                                java.math.BigDecimal getAmount();
                                String getCurrency();
                                PaymentStatus getStatus();
                                String getProvider();
                                Instant getCreatedAt();
                }

    interface RevenueByCurrency extends com.koupreng.backend.reporting.domain.RevenueTotals.AmountInCurrency { }
}
