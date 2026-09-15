package com.koupreng.backend.service;

import java.util.List;
import java.util.Objects;

import com.koupreng.backend.auth.infrastructure.session.UserAuthCacheService;
import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.dto.UpdateProfileRequest;
import com.koupreng.backend.dto.UserResponse;
import com.koupreng.backend.entity.user.AppUser;
import com.koupreng.backend.entity.user.Role;
import com.koupreng.backend.repository.AppUserRepository;
import com.koupreng.backend.shared.i18n.MessageService;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final MessageService msg;
    private final UserAuthCacheService userAuthCacheService;

    public UserService(
            AppUserRepository userRepository,
            PasswordEncoder passwordEncoder,
            MessageService msg,
            UserAuthCacheService userAuthCacheService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.msg = msg;
        this.userAuthCacheService = userAuthCacheService;
    }

    @Transactional(readOnly = true)
    public UserResponse getProfile(Authentication authentication) {
        return UserResponse.from(currentUser(authentication));
    }

    @Transactional
    public UserResponse updateProfile(Authentication authentication, UpdateProfileRequest request) {
        AppUser user = currentUser(authentication);
        user.setFullName(request.fullName().trim());
        String phone = normalizePhone(request.phone());
        if (!Objects.equals(user.getPhone(), phone)) {
            if (phone != null && userRepository.existsByPhone(phone)) {
                throw new ApiException(HttpStatus.CONFLICT, "Phone number is already registered");
            }
            user.setPhone(phone);
        }
        if (request.profileImage() != null) {
            user.setProfileImage(normalizeProfileImage(request.profileImage()));
        }
        return UserResponse.from(user);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> listUsers() {
        return userRepository.findAll().stream()
                .map(UserResponse::from)
                .toList();
    }

    @Transactional
    public UserResponse updateRole(Long userId, Role role) {
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, msg.get("user.not-found")));

        if (user.getRole() == Role.ADMIN
                && role != Role.ADMIN
                && userRepository.countByRole(Role.ADMIN) <= 1) {
            throw new ApiException(HttpStatus.BAD_REQUEST, msg.get("user.role-last-admin"));
        }

        user.setRole(role);
        user.incrementTokenVersion();
        userAuthCacheService.evict(userId);
        return UserResponse.from(user);
    }

    private AppUser currentUser(Authentication authentication) {
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

    private String normalizePhone(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.replaceAll("\\s+", "");
    }

    private String normalizeProfileImage(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
