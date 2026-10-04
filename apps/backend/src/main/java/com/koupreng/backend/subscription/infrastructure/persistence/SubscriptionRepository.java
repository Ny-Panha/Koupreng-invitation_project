package com.koupreng.backend.subscription.infrastructure.persistence;

import com.koupreng.backend.subscription.domain.Subscription;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.math.BigDecimal;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    List<Subscription> findByUserIdOrderByCreatedAtDesc(Long userId);

    boolean existsByOrderCode(String orderCode);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = "subscriptionPackage")
    @Query("""
            select s
            from Subscription s
            where s.user.id = :userId
              and s.isActive = true
              and (s.endDate is null or s.endDate > :now)
            order by s.endDate desc
            """)
    List<Subscription> findActiveForUser(@Param("userId") Long userId, @Param("now") Instant now);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from Subscription s where s.user.id = :userId and s.activeSlot = 1 order by s.id")
    List<Subscription> findActiveFlagForUserForUpdate(@Param("userId") Long userId);

    Optional<Subscription> findByOrderCode(String orderCode);

    Optional<Subscription> findByOrderCodeAndUserId(String orderCode, Long userId);

    Optional<Subscription> findByPaywayTransactionId(String paywayTransactionId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from Subscription s where s.orderCode = :orderCode")
    Optional<Subscription> findForUpdateByOrderCode(@Param("orderCode") String orderCode);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from Subscription s where s.paywayTransactionId = :transactionId")
    Optional<Subscription> findForUpdateByPaywayTransactionId(@Param("transactionId") String transactionId);

                @Query("""
                                                select s.user.id as userId,
                                                        s.createdAt as createdAt,
                                                        s.endDate as endDate,
                                                        s.isActive as active,
                                                        s.status as status,
                                                        s.paymentStatus as paymentStatus,
                                                        s.orderCode as reference,
                                                        s.amount as amount,
                                                        s.paidAmount as paidAmount,
                                                        s.currency as currency,
                                                        s.provider as provider,
                                                        s.subscriptionPackage.packageName as packageName,
                                                        s.subscriptionPackage.code as packageCode,
                                                        s.subscriptionPackage.price as packagePrice
                                                from Subscription s
                                                order by s.user.id, s.createdAt
                                                """)
                List<PlatformMetricsRow> findPlatformMetrics();

                interface PlatformMetricsRow {
                                Long getUserId();
                                Instant getCreatedAt();
                                Instant getEndDate();
                                Boolean getActive();
                                String getStatus();
                                String getPaymentStatus();
                                String getReference();
                                BigDecimal getAmount();
                                BigDecimal getPaidAmount();
                                String getCurrency();
                                String getProvider();
                                String getPackageName();
                                String getPackageCode();
                                BigDecimal getPackagePrice();
                }

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select s
            from Subscription s
            where s.paymentStatus = 'PENDING'
              and s.status = 'PENDING_PAYMENT'
              and s.currency = :currency
              and s.amount = :amount
              and s.payerAccountLast3 = :payerAccountLast3
              and s.paymentExpiresAt > :now
            order by s.id asc
            """)
    List<Subscription> findPendingMatchesForUpdate(
            @Param("currency") String currency,
            @Param("amount") BigDecimal amount,
            @Param("payerAccountLast3") String payerAccountLast3,
            @Param("now") Instant now
    );
}
