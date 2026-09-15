package com.koupreng.backend.invitation.infrastructure.persistence;

import com.koupreng.backend.invitation.domain.InvitationStatus;
import com.koupreng.backend.invitation.domain.UserInvitation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserInvitationRepository extends JpaRepository<UserInvitation, Long> {

    Optional<UserInvitation> findByIdAndDeletedFalse(Long id);

    Optional<UserInvitation> findByIdAndUserIdAndDeletedFalse(Long id, Long userId);

    Optional<UserInvitation> findBySlugAndDeletedFalse(String slug);

    Optional<UserInvitation> findBySlugAndStatusAndDeletedFalse(String slug, InvitationStatus status);

    List<UserInvitation> findAllByDeletedFalseOrderByCreatedAtDesc();

    List<UserInvitation> findTop5ByUserIdAndDeletedFalseOrderByCreatedAtDesc(Long userId);

    List<UserInvitation> findAllByUserIdAndDeletedFalseOrderByCreatedAtDesc(Long userId);

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
}
