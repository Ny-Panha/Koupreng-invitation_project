package com.koupreng.backend.guest.domain;

import jakarta.persistence.*;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter @Entity @Table(name = "guest_import_batches")
public class GuestImportBatch {
    @Id @Column(name = "batch_id", length = 36) private String batchId;
    @Column(name = "invitation_id", nullable = false) private Long invitationId;
    @Column(name = "request_hash", nullable = false, length = 64) private String requestHash;
    @Column(name = "result_json", nullable = false, columnDefinition = "MEDIUMTEXT") private String resultJson;
    @Column(name = "created_at", nullable = false) private Instant createdAt;
}
