package com.koupreng.backend.payment.infrastructure.persistence;

import com.koupreng.backend.payment.domain.TemplateOrder;
import com.koupreng.backend.payment.domain.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface TemplateOrderRepository extends JpaRepository<TemplateOrder, Long> {

    Optional<TemplateOrder> findByOrderCode(String orderCode);

    boolean existsByOrderCode(String orderCode);

    List<TemplateOrder> findByUserId(Long userId);

    List<TemplateOrder> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<TemplateOrder> findByUserIdAndStatus(Long userId, PaymentStatus status);

    List<TemplateOrder> findByUserIdAndStatusIn(Long userId, Collection<PaymentStatus> statuses);

    List<TemplateOrder> findByStatusInOrderByCreatedAtDesc(Collection<PaymentStatus> statuses);

    List<TemplateOrder> findByStatusAndExpiresAtBefore(PaymentStatus status, Instant expiresAt);
}
