package com.koupreng.backend.user.infrastructure.persistence;

import java.util.Optional;
import java.util.List;

import com.koupreng.backend.user.domain.AppUser;
import com.koupreng.backend.user.domain.Role;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select u from AppUser u where u.id = :userId")
    Optional<AppUser> findForUpdateById(@Param("userId") Long userId);

    Optional<AppUser> findByEmailIgnoreCase(String email);

    Optional<AppUser> findByPhone(String phone);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByPhone(String phone);

    long countByRole(Role role);

    long countByStatus(String status);

    List<AppUser> findAllByOrderByCreatedAtDesc();

    List<AppUser> findTop5ByOrderByCreatedAtDesc();

    @Query("select count(u) as total, coalesce(sum(case when upper(u.status) = 'ACTIVE' and length(u.status) = 6 then 1 else 0 end), 0) as active from AppUser u")
    DashboardCounts dashboardCounts();

    interface DashboardCounts {
        long getTotal();
        long getActive();
    }
}
