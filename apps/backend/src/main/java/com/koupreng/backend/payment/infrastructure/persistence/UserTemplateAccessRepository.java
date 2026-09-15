package com.koupreng.backend.payment.infrastructure.persistence;

import com.koupreng.backend.payment.domain.UserTemplateAccess;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserTemplateAccessRepository extends JpaRepository<UserTemplateAccess, Long> {

    boolean existsByUserIdAndTemplateIdAndActiveTrue(Long userId, Long templateId);

    boolean existsByUserIdAndTemplateIdAndOrderIdAndActiveTrue(Long userId, Long templateId, Long orderId);

    Optional<UserTemplateAccess> findByUserIdAndTemplateIdAndActiveTrue(Long userId, Long templateId);

    List<UserTemplateAccess> findByUserIdAndActiveTrue(Long userId);
}
