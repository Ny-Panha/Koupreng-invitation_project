package com.koupreng.backend.budget.infrastructure.persistence;

import com.koupreng.backend.budget.domain.BudgetItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BudgetItemRepository extends JpaRepository<BudgetItem, Long> {

    List<BudgetItem> findByBudgetIdOrderByIdDesc(Long budgetId);

    @Query("""
            select item
            from BudgetItem item
            where item.budget.invitation.id = :invitationId
            """)
    List<BudgetItem> findByBudgetInvitationId(@Param("invitationId") Long invitationId);

    Optional<BudgetItem> findByIdAndBudgetId(Long id, Long budgetId);

    @Query("""
            select item from BudgetItem item
            where item.budget.invitation.id = :invitationId
            order by item.id desc
            """)
    List<BudgetItem> findAllByInvitationId(@Param("invitationId") Long invitationId);

    @Query("""
            select item from BudgetItem item
            where item.id = :itemId and item.budget.invitation.id = :invitationId
            """)
    Optional<BudgetItem> findByIdAndInvitationId(
            @Param("itemId") Long itemId,
            @Param("invitationId") Long invitationId
    );

    void deleteByBudget_Invitation_Id(Long invitationId);
}
