package com.koupreng.backend.guest.infrastructure.persistence;

import com.koupreng.backend.guest.domain.GuestImportBatch;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GuestImportBatchRepository extends JpaRepository<GuestImportBatch, String> {}
