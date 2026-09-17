package com.koupreng.backend.guest.infrastructure.persistence;

import com.koupreng.backend.guest.domain.Guest;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface GuestRepository extends JpaRepository<Guest, Long> {

    List<Guest> findByInvitationIdOrderByCreatedAtDesc(Long invitationId);

    List<Guest> findByInvitationIdOrderByGuestGroupAscTableNumberAscGuestNameAsc(Long invitationId);

    Optional<Guest> findByIdAndInvitationId(Long id, Long invitationId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select g from Guest g where g.id = :id and g.invitation.id = :invitationId")
    Optional<Guest> findForUpdateByIdAndInvitationId(
            @Param("id") Long id,
            @Param("invitationId") Long invitationId
    );

    Optional<Guest> findByInvitationIdAndInviteToken(Long invitationId, String inviteToken);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select g from Guest g where g.invitation.id = :invitationId and g.inviteToken = :inviteToken")
    Optional<Guest> findForUpdateByInvitationIdAndInviteToken(
            @Param("invitationId") Long invitationId,
            @Param("inviteToken") String inviteToken
    );

    Optional<Guest> findByInviteToken(String inviteToken);

    Optional<Guest> findByInvitationIdAndEmailIgnoreCase(Long invitationId, String email);

    Optional<Guest> findByInvitationIdAndPhone(Long invitationId, String phone);

    boolean existsByInviteToken(String inviteToken);

    long countByInvitationId(Long invitationId);

    long countByInvitationUserId(Long userId);

    long countByInvitationIdAndSendStatusIgnoreCase(Long invitationId, String sendStatus);

    long countByInvitationIdAndInvitationViewedAtIsNotNull(Long invitationId);

    @Query("""
            select g
            from Guest g
            where g.invitation.id = :invitationId
              and (
                lower(g.guestName) like lower(concat('%', :keyword, '%'))
                or lower(coalesce(g.phone, '')) like lower(concat('%', :keyword, '%'))
                or lower(coalesce(g.email, '')) like lower(concat('%', :keyword, '%'))
              )
            order by g.createdAt desc
            """)
    List<Guest> search(
            @Param("invitationId") Long invitationId,
            @Param("keyword") String keyword
    );
    void deleteByInvitationId(Long invitationId);
}
