package com.koupreng.backend.repository;

import com.koupreng.backend.entity.subscription.Subscription;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    List<Subscription> findByUserIdOrderByCreatedAtDesc(Long userId);

    boolean existsByOrderCode(String orderCode);

    @Query("""
            select s
            from Subscription s
            where s.user.id = :userId
              and s.isActive = true
              and (s.endDate is null or s.endDate > :now)
            order by s.endDate desc
            """)
    List<Subscription> findActiveForUser(@Param("userId") Long userId, @Param("now") Instant now);

    Optional<Subscription> findByOrderCode(String orderCode);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from Subscription s where s.orderCode = :orderCode")
    Optional<Subscription> findForUpdateByOrderCode(@Param("orderCode") String orderCode);
}
