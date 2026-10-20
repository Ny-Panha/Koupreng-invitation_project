package com.koupreng.backend.ticket.infrastructure.persistence;

import com.koupreng.backend.ticket.domain.InvitationTicketDesign;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InvitationTicketDesignRepository extends JpaRepository<InvitationTicketDesign, Long> {}
