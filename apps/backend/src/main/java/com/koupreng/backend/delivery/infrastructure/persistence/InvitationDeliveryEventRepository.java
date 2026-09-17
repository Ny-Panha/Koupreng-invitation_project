package com.koupreng.backend.delivery.infrastructure.persistence;

import com.koupreng.backend.delivery.domain.InvitationDeliveryEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InvitationDeliveryEventRepository extends JpaRepository<InvitationDeliveryEvent, Long> {
    // NOTE: Used by delivery audit trail API.
    List<InvitationDeliveryEvent> findByInvitationIdOrderByCreatedAtDesc(Long invitationId);

    List<InvitationDeliveryEvent> findByEventType(String eventType);

    List<InvitationDeliveryEvent> findByGuestId(Long guestId);

    void deleteByInvitationId(Long invitationId);
}
