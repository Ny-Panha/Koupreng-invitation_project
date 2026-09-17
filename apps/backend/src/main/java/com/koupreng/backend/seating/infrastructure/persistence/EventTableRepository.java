package com.koupreng.backend.seating.infrastructure.persistence;

import com.koupreng.backend.seating.domain.EventTable;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EventTableRepository extends JpaRepository<EventTable, Long> {

    List<EventTable> findByInvitationIdOrderBySortOrderAscTableNameAsc(Long invitationId);

    Optional<EventTable> findByIdAndInvitationId(Long id, Long invitationId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select t from EventTable t where t.id = :id and t.invitation.id = :invitationId")
    Optional<EventTable> findForUpdateByIdAndInvitationId(
            @Param("id") Long id,
            @Param("invitationId") Long invitationId
    );

    boolean existsByInvitationIdAndTableNameIgnoreCase(Long invitationId, String tableName);

    void deleteByInvitationId(Long invitationId);
}
