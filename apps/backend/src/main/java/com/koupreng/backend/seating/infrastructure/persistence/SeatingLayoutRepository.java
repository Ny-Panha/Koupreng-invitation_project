package com.koupreng.backend.seating.infrastructure.persistence;

import com.koupreng.backend.seating.domain.SeatingLayout;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SeatingLayoutRepository extends JpaRepository<SeatingLayout, Long> {}
