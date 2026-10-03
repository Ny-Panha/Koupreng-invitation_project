package com.koupreng.backend.checkin.infrastructure.persistence;

import com.koupreng.backend.checkin.domain.GuestCheckInEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface GuestCheckInEventRepository extends JpaRepository<GuestCheckInEvent, Long> {
    List<GuestCheckInEvent> findByCheckInIdOrderByOccurredAtAscIdAsc(Long checkInId);
}
