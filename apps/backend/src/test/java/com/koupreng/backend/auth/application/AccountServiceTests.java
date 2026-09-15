package com.koupreng.backend.auth.application;

import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.auth.api.dto.ChangePasswordRequest;
import com.koupreng.backend.auth.api.dto.ForgotPasswordRequest;
import com.koupreng.backend.auth.infrastructure.persistence.PasswordResetTokenRepository;
import com.koupreng.backend.auth.infrastructure.session.UserAuthCacheService;
import com.koupreng.backend.entity.user.AppUser;
import com.koupreng.backend.repository.AppUserRepository;
import com.koupreng.backend.service.CurrentUserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AccountServiceTests {

    @Test
    void changePasswordRejectsWrongOldPassword() {
        Fixture fixture = fixture();
        Authentication authentication = mock(Authentication.class);
        AppUser user = new AppUser();
        user.setPasswordHash(fixture.passwordEncoder.encode("Correct123"));
        when(fixture.currentUserService.currentUser(authentication)).thenReturn(user);

        ApiException exception = assertThrows(
                ApiException.class,
                () -> fixture.service.changePassword(
                        authentication,
                        new ChangePasswordRequest("Wrong123", null, "Newpass123")
                )
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
        assertEquals("Old password is incorrect", exception.getMessage());
        assertEquals(0, user.getTokenVersion());
    }

    @Test
    void forgotPasswordDoesNotRevealUnknownEmail() {
        Fixture fixture = fixture();
        when(fixture.userRepository.findByEmailIgnoreCase("missing@example.com")).thenReturn(Optional.empty());

        fixture.service.forgotPassword(new ForgotPasswordRequest("missing@example.com"));

        verify(fixture.resetTokenRepository, never()).save(org.mockito.ArgumentMatchers.any());
    }

    @SuppressWarnings("unchecked")
    private Fixture fixture() {
        AppUserRepository userRepository = mock(AppUserRepository.class);
        PasswordResetTokenRepository resetTokenRepository = mock(PasswordResetTokenRepository.class);
        CurrentUserService currentUserService = mock(CurrentUserService.class);
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        ObjectProvider<JavaMailSender> mailSenderProvider = mock(ObjectProvider.class);
        Environment environment = mock(Environment.class);
        when(environment.getActiveProfiles()).thenReturn(new String[0]);

        UserAuthCacheService userAuthCacheService = mock(UserAuthCacheService.class);

        return new Fixture(
                new AccountService(
                        userRepository,
                        resetTokenRepository,
                        currentUserService,
                        passwordEncoder,
                        mailSenderProvider,
                        environment,
                        userAuthCacheService
                ),
                userRepository,
                resetTokenRepository,
                currentUserService,
                passwordEncoder
        );
    }

    private record Fixture(
            AccountService service,
            AppUserRepository userRepository,
            PasswordResetTokenRepository resetTokenRepository,
            CurrentUserService currentUserService,
            PasswordEncoder passwordEncoder
    ) {
    }
}
