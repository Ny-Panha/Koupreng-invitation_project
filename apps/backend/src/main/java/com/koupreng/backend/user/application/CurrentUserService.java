package com.koupreng.backend.user.application;

import com.koupreng.backend.user.domain.AppUser;
import com.koupreng.backend.user.infrastructure.persistence.AppUserRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class CurrentUserService {

    private final AppUserRepository userRepository;

    public CurrentUserService(AppUserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public AppUser currentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BadCredentialsException("Authentication required");
        }

        String principal = authentication.getName();
        try {
            return userRepository.findById(Long.valueOf(principal))
                    .orElseThrow(() -> new BadCredentialsException("Authentication required"));
        } catch (NumberFormatException ex) {
            return userRepository.findByEmailIgnoreCase(principal)
                    .orElseThrow(() -> new BadCredentialsException("Authentication required"));
        }
    }
}
