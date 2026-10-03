package com.koupreng.backend.rsvp.infrastructure.persistence;

import com.koupreng.backend.rsvp.domain.Rsvp;
import com.koupreng.backend.rsvp.domain.RsvpStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RsvpRepository extends JpaRepository<Rsvp, Long> {

    @org.springframework.data.jpa.repository.Modifying(clearAutomatically = true)
    @Query("update Rsvp r set r.message = null where r.id = :rsvpId and r.invitation.id = :invitationId")
    int clearWishByIdAndInvitationId(@Param("rsvpId") Long rsvpId, @Param("invitationId") Long invitationId);

    List<Rsvp> findByInvitationIdOrderByRespondedAtDesc(Long invitationId);

    @EntityGraph(attributePaths = "guest")
    List<Rsvp> findByInvitationIdInOrderByRespondedAtDesc(List<Long> invitationIds);

    @Query("select count(g) from Guest g where g.invitation.id in :invitationIds "
            + "and not exists (select 1 from Rsvp r where r.guest = g)")
    long countPendingGuestsForInvitations(@Param("invitationIds") List<Long> invitationIds);

    List<Rsvp> findByInvitationIdAndMessageIsNotNullOrderByRespondedAtDesc(Long invitationId);

    Optional<Rsvp> findByIdAndInvitationId(Long id, Long invitationId);

    Optional<Rsvp> findByInvitationIdAndGuestId(Long invitationId, Long guestId);

    long countByInvitationIdAndResponseStatus(Long invitationId, RsvpStatus responseStatus);

    @Query("select count(c) from GuestCheckIn c "
            + "where c.invitation.id = :invitationId and c.active = true "
            + "and exists (select 1 from Rsvp r where r.invitation.id = :invitationId "
            + "and r.guest.id = c.guest.id and r.responseStatus = :status)")
    long countActiveCheckedInGuestsByInvitationIdAndResponseStatus(
            @Param("invitationId") Long invitationId, @Param("status") RsvpStatus status);

    long countByInvitationId(Long invitationId);

    long countByInvitationUserId(Long userId);

    @Query("select coalesce(sum(r.attendeeCount), 0) "
            + "from Rsvp r "
            + "where r.invitation.id = :invitationId "
            + "and r.responseStatus = :status")
    long sumAttendeeCountByInvitationIdAndStatus(
            @Param("invitationId") Long invitationId,
            @Param("status") RsvpStatus status
    );

    @Query("select count(g) "
            + "from Guest g "
            + "where g.invitation.id = :invitationId "
            + "and not exists ("
            + "select 1 "
            + "from Rsvp r "
            + "where r.guest = g"
            + ")")
    long countPendingGuests(@Param("invitationId") Long invitationId);

    void deleteByInvitationId(Long invitationId);
}
