package com.koupreng.backend.gift.infrastructure.persistence;

import com.koupreng.backend.gift.domain.WeddingGift;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface WeddingGiftRepository extends JpaRepository<WeddingGift, Long> {

    @Query("""
            select gift from WeddingGift gift
            where gift.invitation.id = :invitationId
            order by gift.id desc
            """)
    List<WeddingGift> findAllByInvitationId(@Param("invitationId") Long invitationId);

    @Query("""
            select gift from WeddingGift gift
            where gift.id = :giftId and gift.invitation.id = :invitationId
            """)
    Optional<WeddingGift> findByIdAndInvitationId(
            @Param("giftId") Long giftId,
            @Param("invitationId") Long invitationId
    );

    void deleteByInvitationId(Long invitationId);
}
