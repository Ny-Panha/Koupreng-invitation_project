package com.koupreng.backend.seating.infrastructure.persistence;

import com.koupreng.backend.seating.domain.GuestSeatAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GuestSeatAssignmentRepository extends JpaRepository<GuestSeatAssignment, Long> {

    List<GuestSeatAssignment> findByInvitationIdOrderByAssignedAtDesc(Long invitationId);

    List<GuestSeatAssignment> findByTableId(Long tableId);

    Optional<GuestSeatAssignment> findByIdAndInvitationId(Long id, Long invitationId);

    Optional<GuestSeatAssignment> findByInvitationIdAndGuestId(Long invitationId, Long guestId);

    boolean existsByTableId(Long tableId);

    void deleteByInvitationId(Long invitationId);
}
