package com.koupreng.backend.user.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import com.koupreng.backend.auth.infrastructure.session.UserAuthCacheService;
import com.koupreng.backend.user.domain.AppUser;
import com.koupreng.backend.user.domain.Role;
import com.koupreng.backend.user.infrastructure.persistence.AppUserRepository;
import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.shared.i18n.MessageService;
import com.koupreng.backend.user.api.dto.UpdateProfileRequest;
import com.koupreng.backend.user.api.dto.UserResponse;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;

class UserServiceTests {

    private final AppUserRepository userRepository = mock(AppUserRepository.class);
    private final MessageService messageService = mock(MessageService.class);
    private final UserAuthCacheService userAuthCacheService = mock(UserAuthCacheService.class);
    private final CurrentUserService currentUserService = mock(CurrentUserService.class);
    private final Authentication authentication = mock(Authentication.class);
    private final UserService service = new UserService(
            userRepository,
            messageService,
            userAuthCacheService,
            currentUserService
    );

    private AppUser user;

    @BeforeEach
    void setUp() {
        user = new AppUser();
        user.setId(7L);
        user.setFullName("Existing Name");
        user.setPhone("012345678");
        user.setRole(Role.USER);
        when(currentUserService.currentUser(authentication)).thenReturn(user);
    }

    @Test
    void profileUpdateNormalizesUserControlledFields() {
        UserResponse response = service.updateProfile(
                authentication,
                new UpdateProfileRequest("  New Name  ", " 012 345 678 ", "  /profile.jpg  ")
        );

        assertEquals("New Name", response.fullName());
        assertEquals("012345678", response.phone());
        assertEquals("/profile.jpg", response.profileImage());
    }

    @Test
    void blankOptionalProfileFieldsNormalizeToNull() {
        UserResponse response = service.updateProfile(
                authentication,
                new UpdateProfileRequest("Name", "  ", "  ")
        );

        assertNull(response.phone());
        assertNull(response.profileImage());
    }

    @Test
    void duplicateChangedPhoneIsRejected() {
        when(userRepository.existsByPhone("099999999")).thenReturn(true);

        ApiException exception = assertThrows(ApiException.class, () -> service.updateProfile(
                authentication,
                new UpdateProfileRequest("Name", "099 999 999", null)
        ));

        assertEquals(HttpStatus.CONFLICT, exception.getStatus());
    }

    @Test
    void lastAdminCannotBeDemoted() {
        user.setRole(Role.ADMIN);
        when(userRepository.findById(7L)).thenReturn(Optional.of(user));
        when(userRepository.countByRole(Role.ADMIN)).thenReturn(1L);

        ApiException exception = assertThrows(
                ApiException.class,
                () -> service.updateRole(7L, Role.USER)
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
        verify(userAuthCacheService, never()).evict(7L);
    }

    @Test
    void roleChangeInvalidatesExistingAuthenticationState() {
        when(userRepository.findById(7L)).thenReturn(Optional.of(user));

        UserResponse response = service.updateRole(7L, Role.ADMIN);

        assertEquals(Role.ADMIN, response.role());
        assertEquals(1, user.getTokenVersion());
        verify(userAuthCacheService).evict(7L);
    }
}
