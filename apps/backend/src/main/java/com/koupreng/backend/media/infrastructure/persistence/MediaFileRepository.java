package com.koupreng.backend.media.infrastructure.persistence;

import com.koupreng.backend.media.domain.MediaFile;
import com.koupreng.backend.media.domain.MediaType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MediaFileRepository extends JpaRepository<MediaFile, Long> {

    List<MediaFile> findByInvitationIdOrderBySortOrderAscCreatedAtAsc(Long invitationId);

    List<MediaFile> findAllByInvitationIdAndMediaType(Long invitationId, MediaType mediaType);

    Optional<MediaFile> findByIdAndInvitationId(Long id, Long invitationId);

    long countByInvitationIdAndMediaType(Long invitationId, MediaType mediaType);

    @Query("select m.invitation.id as invitationId, m.fileUrl as fileUrl from MediaFile m "
            + "where m.invitation.id in :invitationIds and m.mediaType = :mediaType "
            + "order by m.sortOrder asc, m.createdAt asc, m.id asc")
    List<CoverProjection> findCoversForInvitations(
            @Param("invitationIds") List<Long> invitationIds,
            @Param("mediaType") MediaType mediaType
    );

    interface CoverProjection {
        Long getInvitationId();
        String getFileUrl();
    }

    void deleteByInvitationId(Long invitationId);
}
