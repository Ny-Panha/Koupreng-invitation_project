package com.koupreng.backend.invitation.infrastructure.persistence;

import com.koupreng.backend.invitation.domain.InvitationStatus;
import com.koupreng.backend.invitation.domain.InvitationModerationStatus;
import com.koupreng.backend.invitation.domain.EventType;
import com.koupreng.backend.invitation.domain.UserInvitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;

import java.util.List;
import java.util.Optional;
import java.time.Instant;

public interface UserInvitationRepository extends JpaRepository<UserInvitation, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select i from UserInvitation i where i.id = :id and i.user.id = :userId and i.deleted = false")
    Optional<UserInvitation> findForUpdateByIdAndUserId(@Param("id") Long id, @Param("userId") Long userId);

    Optional<UserInvitation> findByIdAndDeletedFalse(Long id);

    Optional<UserInvitation> findByIdAndUserIdAndDeletedFalse(Long id, Long userId);

    Optional<UserInvitation> findBySlugAndDeletedFalse(String slug);

    Optional<UserInvitation> findBySlugAndStatusAndDeletedFalse(String slug, InvitationStatus status);

    Optional<UserInvitation> findFirstByTitleIgnoreCaseAndDeletedFalse(String title);

    List<UserInvitation> findAllByDeletedFalseOrderByCreatedAtDesc();

    List<UserInvitation> findTop5ByUserIdAndDeletedFalseOrderByCreatedAtDesc(Long userId);

    @EntityGraph(attributePaths = "template")
    List<UserInvitation> findAllByUserIdAndDeletedFalseOrderByCreatedAtDesc(Long userId);

    @EntityGraph(attributePaths = "template")
    List<UserInvitation> findAllByUserIdAndStatusAndDeletedFalseOrderByCreatedAtDesc(
            Long userId,
            InvitationStatus status
    );

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);

    boolean existsByAccessToken(String accessToken);

    long countByUserIdAndDeletedFalse(Long userId);

    long countByUserIdAndStatusAndDeletedFalse(Long userId, InvitationStatus status);

    long countByStatusAndDeletedFalse(InvitationStatus status);

    long countByTemplateIdAndDeletedFalse(Long templateId);

    @EntityGraph(attributePaths = {"user", "template"})
    List<UserInvitation> findTop5ByDeletedFalseOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = {"user", "template"})
    List<UserInvitation> findTop10ByDeletedFalseOrderByCreatedAtDesc();

    @Query("""
            select count(i) as total,
              coalesce(sum(case when i.status = com.koupreng.backend.invitation.domain.InvitationStatus.PUBLISHED then 1 else 0 end), 0) as published
            from UserInvitation i where i.deleted = false
            """)
    DashboardCounts dashboardCounts();

    @Query("""
            select i.createdAt as createdAt,
              i.eventType as eventType,
              i.status as status,
              i.moderationStatus as moderationStatus
            from UserInvitation i where i.deleted = false
            """)
    List<PlatformMetricsRow> findPlatformMetrics();

    interface PlatformMetricsRow {
        Instant getCreatedAt();
        EventType getEventType();
        InvitationStatus getStatus();
        InvitationModerationStatus getModerationStatus();
    }

    interface DashboardCounts {
        long getTotal();
        long getPublished();
    }
}
