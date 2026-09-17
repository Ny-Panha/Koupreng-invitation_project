package com.koupreng.backend.organization.infrastructure.persistence;

import com.koupreng.backend.organization.domain.Organization;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrganizationRepository extends JpaRepository<Organization, Long> {

    List<Organization> findByOwnerIdOrderByCreatedAtDesc(Long ownerId);

    Optional<Organization> findBySlug(String slug);

    boolean existsBySlug(String slug);
}
