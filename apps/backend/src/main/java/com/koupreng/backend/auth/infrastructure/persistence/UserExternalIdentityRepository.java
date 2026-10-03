package com.koupreng.backend.auth.infrastructure.persistence;

import com.koupreng.backend.auth.domain.UserExternalIdentity;
import com.koupreng.backend.user.domain.AuthProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserExternalIdentityRepository extends JpaRepository<UserExternalIdentity, Long> {
    Optional<UserExternalIdentity> findByProviderAndProviderSubject(AuthProvider provider, String providerSubject);
    Optional<UserExternalIdentity> findByUserIdAndProvider(Long userId, AuthProvider provider);
}
