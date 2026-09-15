package com.koupreng.backend.auth.application;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Locale;
import java.util.Optional;

import com.koupreng.backend.auth.api.dto.AuthResponse;
import com.koupreng.backend.auth.api.dto.GoogleLoginRequest;
import com.koupreng.backend.auth.api.dto.LoginRequest;
import com.koupreng.backend.auth.api.dto.RegisterRequest;
import com.koupreng.backend.auth.api.dto.TelegramLoginRequest;
import com.koupreng.backend.auth.domain.ExternalAuthIdentity;
import com.koupreng.backend.auth.infrastructure.identity.GoogleIdentityVerifier;
import com.koupreng.backend.auth.infrastructure.identity.TelegramIdentityVerifier;
import com.koupreng.backend.auth.infrastructure.session.UserAuthCacheService;
import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.config.AppProperties;
import com.koupreng.backend.user.api.dto.UserResponse;
import com.koupreng.backend.user.domain.AppUser;
import com.koupreng.backend.user.domain.Role;
import com.koupreng.backend.user.infrastructure.persistence.AppUserRepository;
import com.koupreng.backend.service.AuditLogService;
import com.koupreng.backend.shared.i18n.MessageService;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtEncoder jwtEncoder;
    private final AppProperties appProperties;
    private final GoogleIdentityVerifier googleIdentityVerifier;
    private final TelegramIdentityVerifier telegramIdentityVerifier;
    private final AuditLogService auditLogService;
    private final MessageService msg;
    private final UserAuthCacheService userAuthCacheService;

    @org.springframework.beans.factory.annotation.Autowired
    public AuthService(
            AppUserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtEncoder jwtEncoder,
            AppProperties appProperties,
            GoogleIdentityVerifier googleIdentityVerifier,
            TelegramIdentityVerifier telegramIdentityVerifier,
            MessageService msg,
            AuditLogService auditLogService,
            UserAuthCacheService userAuthCacheService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtEncoder = jwtEncoder;
        this.appProperties = appProperties;
        this.googleIdentityVerifier = googleIdentityVerifier;
        this.telegramIdentityVerifier = telegramIdentityVerifier;
        this.msg = msg;
        this.auditLogService = auditLogService;
        this.userAuthCacheService = userAuthCacheService;
    }

    public AuthService(
            AppUserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtEncoder jwtEncoder,
            AppProperties appProperties,
            GoogleIdentityVerifier googleIdentityVerifier,
            TelegramIdentityVerifier telegramIdentityVerifier,
            MessageService msg
    ) {
        this(userRepository, passwordEncoder, jwtEncoder, appProperties,
                googleIdentityVerifier, telegramIdentityVerifier, msg, null, null);
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String fullName = request.fullName().trim();
        String email = normalizeEmail(request.email());
        String phone = normalizePhone(request.phone());

        if (email == null && phone == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, msg.get("auth.phone-or-email-required"));
        }
        if (email != null && userRepository.existsByEmailIgnoreCase(email)) {
            throw new ApiException(HttpStatus.CONFLICT, msg.get("auth.email-taken"));
        }
        if (phone != null && userRepository.existsByPhone(phone)) {
            throw new ApiException(HttpStatus.CONFLICT, msg.get("auth.phone-taken"));
        }
        requirePasswordPolicy(request.password());

        AppUser user = new AppUser();
        user.setEmail(email);
        user.setPhone(phone);
        user.setFullName(fullName);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(shouldPromoteFirstUser() ? Role.ADMIN : Role.USER);
        user.setStatus(AppUser.STATUS_ACTIVE);

        return issueToken(userRepository.save(user));
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        try {
            AppUser user = findByIdentifier(request.identifier())
                    .orElseThrow(() -> {
                        if (auditLogService != null) {
                            auditLogService.logSystemEvent("LOGIN_FAILED", "USER", null, "Failed login attempt: user not found for identifier: " + request.identifier(), java.util.Map.of("identifier", request.identifier(), "reason", "USER_NOT_FOUND"));
                        }
                        return new BadCredentialsException(msg.get("auth.invalid-credentials"));
                    });

            if (!user.isActive()) {
                if (auditLogService != null) {
                    auditLogService.logSystemEvent("LOGIN_FAILED", "USER", user.getId(), "Failed login attempt: account is disabled for identifier: " + request.identifier(), java.util.Map.of("identifier", request.identifier(), "userId", user.getId(), "reason", "ACCOUNT_DISABLED"));
                }
                throw new BadCredentialsException(msg.get("auth.account-disabled"));
            }
            if (user.getPasswordHash() == null
                    || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
                if (auditLogService != null) {
                    auditLogService.logSystemEvent("LOGIN_FAILED", "USER", user.getId(), "Failed login attempt: password mismatch for identifier: " + request.identifier(), java.util.Map.of("identifier", request.identifier(), "userId", user.getId(), "reason", "BAD_CREDENTIALS"));
                }
                throw new BadCredentialsException(msg.get("auth.invalid-credentials"));
            }

            return issueToken(user);
        } catch (BadCredentialsException ex) {
            throw ex;
        } catch (Exception ex) {
            if (auditLogService != null) {
                auditLogService.logSystemEvent("LOGIN_FAILED", "USER", null, "Failed login attempt due to unexpected error: " + ex.getMessage(), java.util.Map.of("identifier", request.identifier(), "reason", "UNEXPECTED_ERROR"));
            }
            throw ex;
        }
    }

    @Transactional
    public AuthResponse loginWithGoogle(GoogleLoginRequest request) {
        return issueToken(upsertExternalUser(googleIdentityVerifier.verify(request.idToken())));
    }

    @Transactional
    public AuthResponse loginWithTelegram(TelegramLoginRequest request) {
        return issueToken(upsertExternalUser(telegramIdentityVerifier.verify(request)));
    }

    @Transactional
    public void logout(Authentication authentication) {
        AppUser user = currentUser(authentication);
        user.incrementTokenVersion();
        if (userAuthCacheService != null) {
            userAuthCacheService.evict(user.getId());
        }
    }

    private Optional<AppUser> findByIdentifier(String rawIdentifier) {
        String identifier = rawIdentifier == null ? "" : rawIdentifier.trim();
        String email = normalizeEmail(identifier);
        String phone = normalizePhone(identifier);

        Optional<AppUser> byEmail = email == null
                ? Optional.empty()
                : userRepository.findByEmailIgnoreCase(email);
        if (byEmail.isPresent()) {
            return byEmail;
        }
        return phone == null ? Optional.empty() : userRepository.findByPhone(phone);
    }

    private AuthResponse issueToken(AppUser user) {
        Instant issuedAt = Instant.now();
        Instant expiresAt = issuedAt.plus(appProperties.getJwt().getAccessTokenMinutes(), ChronoUnit.MINUTES);

        JwtClaimsSet.Builder claims = JwtClaimsSet.builder()
                .issuer(appProperties.getJwt().getIssuer())
                .issuedAt(issuedAt)
                .expiresAt(expiresAt)
                .subject(user.getId().toString())
                .claim("full_name", user.getFullName())
                .claim("role", user.getRole().name())
                .claim("status", user.getStatus())
                .claim("token_version", user.getTokenVersion());

        if (user.getEmail() != null) {
            claims.claim("email", user.getEmail());
        }
        if (user.getPhone() != null) {
            claims.claim("phone", user.getPhone());
        }

        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).type("JWT").build();
        String token = jwtEncoder.encode(JwtEncoderParameters.from(header, claims.build())).getTokenValue();
        return AuthResponse.bearer(token, expiresAt, UserResponse.from(user));
    }

    private boolean shouldPromoteFirstUser() {
        return appProperties.getAuth().isFirstUserAdminEnabled() && userRepository.count() == 0;
    }

    private AppUser upsertExternalUser(ExternalAuthIdentity identity) {
        String email = normalizeEmail(identity.email());
        AppUser user = userRepository.findByEmailIgnoreCase(email)
                .orElseGet(() -> {
                    AppUser newUser = new AppUser();
                    newUser.setRole(shouldPromoteFirstUser() ? Role.ADMIN : Role.USER);
                    newUser.setStatus(AppUser.STATUS_ACTIVE);
                    return newUser;
                });

        user.setEmail(email);
        user.setFullName(identity.fullName().trim());
        return userRepository.save(user);
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

    private String normalizeEmail(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizePhone(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.replaceAll("\\s+", "");
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
}
