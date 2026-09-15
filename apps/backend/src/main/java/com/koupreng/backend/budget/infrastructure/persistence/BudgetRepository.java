package com.koupreng.backend.budget.infrastructure.persistence;

import com.koupreng.backend.budget.domain.Budget;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, Long> {

    Optional<Budget> findByInvitationId(Long invitationId);

    boolean existsByInvitationId(Long invitationId);

    void deleteByInvitationId(Long invitationId);
}
