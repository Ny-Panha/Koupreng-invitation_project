package com.koupreng.backend.user.application;

import java.util.List;
import java.util.Objects;

import com.koupreng.backend.auth.infrastructure.session.UserAuthCacheService;
import com.koupreng.backend.user.domain.AppUser;
import com.koupreng.backend.user.domain.Role;
import com.koupreng.backend.user.infrastructure.persistence.AppUserRepository;
import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.shared.i18n.MessageService;
import com.koupreng.backend.user.api.dto.UpdateProfileRequest;
import com.koupreng.backend.user.api.dto.UserResponse;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final AppUserRepository userRepository;
    private final MessageService msg;
    private final UserAuthCacheService userAuthCacheService;
    private final CurrentUserService currentUserService;

    public UserService(
            AppUserRepository userRepository,
            MessageService msg,
            UserAuthCacheService userAuthCacheService,
            CurrentUserService currentUserService
    ) {
        this.userRepository = userRepository;
        this.msg = msg;
        this.userAuthCacheService = userAuthCacheService;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
    public UserResponse getProfile(Authentication authentication) {
        return UserResponse.from(currentUserService.currentUser(authentication));
    }

    @Transactional
    public UserResponse updateProfile(Authentication authentication, UpdateProfileRequest request) {
        AppUser user = currentUserService.currentUser(authentication);
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
