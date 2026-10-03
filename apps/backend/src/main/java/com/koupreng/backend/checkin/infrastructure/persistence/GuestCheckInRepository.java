package com.koupreng.backend.checkin.infrastructure.persistence;

import com.koupreng.backend.checkin.domain.GuestCheckIn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface GuestCheckInRepository extends JpaRepository<GuestCheckIn, Long> {

    Optional<GuestCheckIn> findByInvitationIdAndGuestId(Long invitationId, Long guestId);

    boolean existsByInvitationIdAndGuestId(Long invitationId, Long guestId);

    @Query("select count(c) from GuestCheckIn c where c.invitation.id = :invitationId and c.active = true")
    long countByInvitationId(@Param("invitationId") Long invitationId);

    @Query("select c from GuestCheckIn c where c.invitation.id = :invitationId and c.active = true order by c.checkedInAt desc")
    List<GuestCheckIn> findByInvitationIdOrderByCheckedInAtDesc(@Param("invitationId") Long invitationId);

    void deleteByInvitationId(Long invitationId);
}
