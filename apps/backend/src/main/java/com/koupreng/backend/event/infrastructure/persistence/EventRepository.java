package com.koupreng.backend.event.infrastructure.persistence;

import com.koupreng.backend.event.domain.Event;
import com.koupreng.backend.event.domain.EventStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EventRepository extends JpaRepository<Event, Long> {

    // Only non-deleted events
    List<Event> findAllByDeletedFalse();

    Optional<Event> findByIdAndDeletedFalse(Long id);

    List<Event> findAllByStatusAndDeletedFalse(EventStatus status);

    boolean existsByIdAndDeletedFalse(Long id);
}
