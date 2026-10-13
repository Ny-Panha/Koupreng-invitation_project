package com.koupreng.backend.notification.infrastructure.persistence;

import com.koupreng.backend.notification.domain.Notification;
import com.koupreng.backend.notification.domain.NotificationStatus;
import com.koupreng.backend.notification.domain.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findAllByOrderByCreatedAtDesc();

    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Notification> findTop5ByUserIdOrderByCreatedAtDesc(Long userId);

    List<Notification> findByInvitationIdOrderByCreatedAtDesc(Long invitationId);

    List<Notification> findByGuestIdOrderByCreatedAtDesc(Long guestId);

    long countByUserIdAndStatus(Long userId, NotificationStatus status);

    long countByInvitationIdAndStatus(Long invitationId, NotificationStatus status);

    long countByUserIdAndReadAtIsNull(Long userId);

    long countByStatus(NotificationStatus status);

    boolean existsByGuestIdAndTypeAndCreatedAtAfter(
            Long guestId,
            NotificationType type,
            Instant createdAt
    );

    void deleteByInvitationId(Long invitationId);
    boolean existsByPaymentDeliveryKey(String paymentDeliveryKey);

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select n from Notification n where n.id = :id")
    java.util.Optional<Notification> lock(@org.springframework.data.repository.query.Param("id") Long id);

    @org.springframework.data.jpa.repository.Query("""
            select n.id from Notification n where n.paymentDeliveryKey is not null
            and n.status = com.koupreng.backend.notification.domain.NotificationStatus.PENDING
            and n.deliveryAttempts < 3 and n.nextDeliveryAt <= :now order by n.id
            """)
    List<Long> paymentDeliveries(@org.springframework.data.repository.query.Param("now") Instant now,
                                org.springframework.data.domain.Pageable limit);
}
