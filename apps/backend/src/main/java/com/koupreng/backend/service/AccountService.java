package com.koupreng.backend.service;

import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.dto.ChangePasswordRequest;
import com.koupreng.backend.dto.ForgotPasswordRequest;
import com.koupreng.backend.dto.ResetPasswordRequest;
import com.koupreng.backend.entity.user.AppUser;
import com.koupreng.backend.entity.user.PasswordResetToken;
import com.koupreng.backend.repository.AppUserRepository;
import com.koupreng.backend.repository.PasswordResetTokenRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Locale;

@Service
public class AccountService {

    private static final Logger log = LoggerFactory.getLogger(AccountService.class);
    private static final int RESET_TOKEN_BYTES = 32;
    private static final long RESET_TOKEN_MINUTES = 30;

    private final AppUserRepository userRepository;
    private final PasswordResetTokenRepository resetTokenRepository;
    private final CurrentUserService currentUserService;
    private final PasswordEncoder passwordEncoder;
    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final Environment environment;
    private final UserAuthCacheService userAuthCacheService;
    private final SecureRandom secureRandom = new SecureRandom();

    public AccountService(
            AppUserRepository userRepository,
            PasswordResetTokenRepository resetTokenRepository,
            CurrentUserService currentUserService,
            PasswordEncoder passwordEncoder,
            ObjectProvider<JavaMailSender> mailSenderProvider,
            Environment environment,
            UserAuthCacheService userAuthCacheService
    ) {
        this.userRepository = userRepository;
        this.resetTokenRepository = resetTokenRepository;
        this.currentUserService = currentUserService;
        this.passwordEncoder = passwordEncoder;
        this.mailSenderProvider = mailSenderProvider;
        this.environment = environment;
        this.userAuthCacheService = userAuthCacheService;
    }

    @Transactional
    public void changePassword(Authentication authentication, ChangePasswordRequest request) {
        AppUser user = currentUserService.currentUser(authentication);
        if (user.getPasswordHash() == null
                || !passwordEncoder.matches(request.oldPassword(), user.getPasswordHash())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Old password is incorrect");
        }

        requirePasswordPolicy(request.newPassword());
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        user.incrementTokenVersion();
        userAuthCacheService.evict(user.getId());
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        String email = normalizeEmail(request.email());
        userRepository.findByEmailIgnoreCase(email)
                .filter(AppUser::isActive)
                .ifPresent(user -> createAndSendResetToken(user, email));
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        requirePasswordPolicy(request.newPassword());
        PasswordResetToken resetToken = resetTokenRepository.findByTokenHash(hashToken(request.token()))
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Password reset token is invalid"));

        Instant now = Instant.now();
        if (resetToken.getUsedAt() != null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Password reset token has already been used");
        }
        if (!resetToken.getExpiresAt().isAfter(now)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Password reset token has expired");
        }

        AppUser user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        user.incrementTokenVersion();
        resetToken.setUsedAt(now);
        userAuthCacheService.evict(user.getId());
    }

    private void createAndSendResetToken(AppUser user, String email) {
        String rawToken = newResetToken();
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setUser(user);
        resetToken.setTokenHash(hashToken(rawToken));
        resetToken.setExpiresAt(Instant.now().plus(RESET_TOKEN_MINUTES, ChronoUnit.MINUTES));
        resetTokenRepository.save(resetToken);

        if (isMailConfigured()) {
            sendResetEmail(email, rawToken, user.getId());
            return;
        }

        if (isProductionProfile()) {
            log.warn("Password reset requested for user {} but mail is not configured", user.getId());
            return;
        }
        log.info("Password reset token created for user {} but mail is not configured; token was not logged",
                user.getId());
    }

    private void sendResetEmail(String email, String rawToken, Long userId) {
        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null) {
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Koupreng password reset");
        message.setText("""
                We received a request to reset your Koupreng password.

                Use this reset token within 30 minutes:
                %s

                If you did not request this, ignore this email.
                """.formatted(rawToken));
        try {
            mailSender.send(message);
        } catch (RuntimeException exception) {
            log.warn("Password reset email could not be sent for user {}", userId, exception);
        }
    }

    private boolean isMailConfigured() {
        return mailSenderProvider.getIfAvailable() != null
                && environment.getProperty("spring.mail.host") != null
                && !environment.getProperty("spring.mail.host", "").isBlank();
    }

    private boolean isProductionProfile() {
        return Arrays.stream(environment.getActiveProfiles())
                .anyMatch(profile -> "prod".equalsIgnoreCase(profile)
                        || "production".equalsIgnoreCase(profile));
    }

    private String newResetToken() {
        byte[] bytes = new byte[RESET_TOKEN_BYTES];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is not available", exception);
        }
    }

    private void requirePasswordPolicy(String password) {
        if (password == null || password.length() < 8) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Password must be at least 8 characters");
        }
        if (!password.chars().anyMatch(Character::isLetter)
                || !password.chars().anyMatch(Character::isDigit)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Password must contain at least one letter and one number");
        }
    }

    private String normalizeEmail(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }
}
