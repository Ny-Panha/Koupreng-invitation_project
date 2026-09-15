package com.koupreng.backend.user.application;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import com.koupreng.backend.entity.user.AppUser;
import com.koupreng.backend.repository.AppUserRepository;

import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;

class CurrentUserServiceTests {

    private final AppUserRepository userRepository = mock(AppUserRepository.class);
    private final CurrentUserService service = new CurrentUserService(userRepository);

    @Test
    void resolvesNumericJwtSubjectByUserId() {
        Authentication authentication = authenticatedAs("42");
        AppUser user = new AppUser();
        when(userRepository.findById(42L)).thenReturn(Optional.of(user));

        assertSame(user, service.currentUser(authentication));
        verify(userRepository).findById(42L);
    }

    @Test
    void retainsEmailPrincipalCompatibility() {
        Authentication authentication = authenticatedAs("User@Example.test");
        AppUser user = new AppUser();
        when(userRepository.findByEmailIgnoreCase("User@Example.test"))
                .thenReturn(Optional.of(user));

        assertSame(user, service.currentUser(authentication));
        verify(userRepository).findByEmailIgnoreCase("User@Example.test");
    }

    @Test
    void rejectsMissingAuthentication() {
        assertThrows(BadCredentialsException.class, () -> service.currentUser(null));
    }

    private Authentication authenticatedAs(String principal) {
        Authentication authentication = mock(Authentication.class);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn(principal);
        return authentication;
    }
}
