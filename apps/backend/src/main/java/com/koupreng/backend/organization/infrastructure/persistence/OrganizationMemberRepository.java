package com.koupreng.backend.organization.infrastructure.persistence;

import com.koupreng.backend.organization.domain.OrganizationMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrganizationMemberRepository extends JpaRepository<OrganizationMember, Long> {

    List<OrganizationMember> findByOrganizationIdOrderByCreatedAtAsc(Long organizationId);

    List<OrganizationMember> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<OrganizationMember> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, String status);

    Optional<OrganizationMember> findByIdAndOrganizationId(Long id, Long organizationId);

    Optional<OrganizationMember> findByOrganizationIdAndEmailIgnoreCase(Long organizationId, String email);

    boolean existsByOrganizationIdAndUserId(Long organizationId, Long userId);

    boolean existsByOrganizationIdAndUserIdAndStatus(Long organizationId, Long userId, String status);
}
