package com.koupreng.backend.template.infrastructure.persistence;

import com.koupreng.backend.template.domain.InvitationTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InvitationTemplateRepository extends JpaRepository<InvitationTemplate, Long> {

    List<InvitationTemplate> findAllByOrderByCreatedAtDesc();

    List<InvitationTemplate> findAllByCodeIgnoreCaseOrderByCreatedAtDesc(String code);

    List<InvitationTemplate> findAllByStatusIgnoreCaseOrderBySortOrderAscCreatedAtDesc(String status);

    List<InvitationTemplate> findAllByCodeIgnoreCaseAndStatusIgnoreCaseOrderBySortOrderAscCreatedAtDesc(String code, String status);

    Optional<InvitationTemplate> findByIdAndStatusIgnoreCase(Long id, String status);

    Optional<InvitationTemplate> findByCodeIgnoreCaseAndStatusIgnoreCase(String code, String status);

    long countByStatusIgnoreCase(String status);

    long countByIsPremiumTrue();
}
