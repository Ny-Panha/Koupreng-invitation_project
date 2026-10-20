package com.koupreng.backend.auth.infrastructure.security;

import com.koupreng.backend.shared.config.SecurityConfig;
import com.koupreng.backend.user.domain.AppUser;
import com.koupreng.backend.user.domain.Role;
import com.koupreng.backend.user.infrastructure.persistence.AppUserRepository;
import org.junit.jupiter.api.Test;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

class PasswordRoleAuthorityTests {
    @Test
    void passwordAuthenticationPreservesEachGlobalRole() {
        var repository = mock(AppUserRepository.class);
        var service = new SecurityConfig().userDetailsService(repository);
        for (Role role : Role.values()) {
            var user = new AppUser();
            user.setEmail("role@example.test");
            user.setPasswordHash("hash");
            user.setRole(role);
            when(repository.findByEmailIgnoreCase(user.getEmail())).thenReturn(Optional.of(user));
            assertEquals("ROLE_" + role.name(), service.loadUserByUsername(user.getEmail())
                    .getAuthorities().iterator().next().getAuthority());
        }
    }
}
