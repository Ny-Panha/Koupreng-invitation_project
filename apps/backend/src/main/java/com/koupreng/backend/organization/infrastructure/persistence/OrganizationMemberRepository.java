package com.koupreng.backend.organization.infrastructure.persistence;

import com.koupreng.backend.organization.domain.OrganizationMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrganizationMemberRepository extends JpaRepository<OrganizationMember, Long> {
    Optional<OrganizationMember> findByInviteTokenHash(String inviteTokenHash);

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select m from OrganizationMember m where m.inviteTokenHash = :hash")
    Optional<OrganizationMember> findForUpdateByInviteTokenHash(@org.springframework.data.repository.query.Param("hash") String hash);

    Optional<OrganizationMember> findByOrganizationIdAndUserIdAndStatus(Long organizationId, Long userId, String status);
    long countByOrganizationOwnerIdAndStatusIn(Long ownerId, List<String> statuses);

    List<OrganizationMember> findByOrganizationIdOrderByCreatedAtAsc(Long organizationId);

    List<OrganizationMember> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<OrganizationMember> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, String status);

    Optional<OrganizationMember> findByIdAndOrganizationId(Long id, Long organizationId);

    Optional<OrganizationMember> findByOrganizationIdAndEmailIgnoreCase(Long organizationId, String email);

    boolean existsByOrganizationIdAndUserId(Long organizationId, Long userId);

    boolean existsByOrganizationIdAndUserIdAndStatus(Long organizationId, Long userId, String status);
}
