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
import com.koupreng.backend.auth.domain.UserExternalIdentity;
import com.koupreng.backend.auth.infrastructure.persistence.UserExternalIdentityRepository;
import com.koupreng.backend.auth.infrastructure.identity.GoogleIdentityVerifier;
import com.koupreng.backend.auth.infrastructure.identity.TelegramIdentityVerifier;
import com.koupreng.backend.auth.infrastructure.session.UserAuthCacheService;
import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.shared.config.AppProperties;
import com.koupreng.backend.user.api.dto.UserResponse;
import com.koupreng.backend.user.domain.AppUser;
import com.koupreng.backend.user.domain.Role;
import com.koupreng.backend.user.domain.AuthProvider;
import com.koupreng.backend.user.infrastructure.persistence.AppUserRepository;
import com.koupreng.backend.audit.application.AuditLogService;
import com.koupreng.backend.shared.i18n.MessageService;

import org.springframework.http.HttpStatus;
import org.springframework.dao.DataIntegrityViolationException;
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
    private final UserExternalIdentityRepository externalIdentityRepository;

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
            UserAuthCacheService userAuthCacheService,
            UserExternalIdentityRepository externalIdentityRepository
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
        this.externalIdentityRepository = externalIdentityRepository;
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
                googleIdentityVerifier, telegramIdentityVerifier, msg, null, null, null);
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String fullName = request.fullName().trim();
        String email = normalizeEmail(request.email());
        String phone = normalizePhone(request.phone());

        if (email == null && phone == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, msg.get("auth.phone-or-email-required"));
        }
        String syntheticDomain = appProperties.getOauth().getTelegram().getEmailDomain();
        if (email != null && syntheticDomain != null
                && email.endsWith("@" + syntheticDomain.trim().toLowerCase(Locale.ROOT))) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "AUTH_RESERVED_EMAIL_DOMAIN",
                    "This email domain is reserved for verified Telegram identities");
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
                            auditLogService.logAuthenticationFailure(null, "USER_NOT_FOUND");
                        }
                        return new BadCredentialsException(msg.get("auth.invalid-credentials"));
                    });

            if (!user.isActive() || AppUser.STATUS_DISABLED.equalsIgnoreCase(user.getStatus())) {
                if (auditLogService != null) {
                    auditLogService.logAuthenticationFailure(user.getId(), "ACCOUNT_DISABLED");
                }
                throw new BadCredentialsException(msg.get("auth.account-disabled"));
            }
            if (user.getPasswordHash() == null
                    || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
                if (auditLogService != null) {
                    auditLogService.logAuthenticationFailure(user.getId(), "BAD_CREDENTIALS");
                }
                throw new BadCredentialsException(msg.get("auth.invalid-credentials"));
            }

            return issueToken(user);
        } catch (BadCredentialsException ex) {
            throw ex;
        } catch (Exception ex) {
            if (auditLogService != null) {
                auditLogService.logAuthenticationFailure(null, "UNEXPECTED_ERROR");
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
    public UserResponse linkGoogle(Authentication authentication, GoogleLoginRequest request) {
        return linkExternalIdentity(authentication, googleIdentityVerifier.verify(request.idToken()));
    }

    @Transactional
    public UserResponse linkTelegram(Authentication authentication, TelegramLoginRequest request) {
        return linkExternalIdentity(authentication, telegramIdentityVerifier.verify(request));
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
        validateExternalIdentity(identity);
        Optional<UserExternalIdentity> linked = externalIdentityRepository
                .findByProviderAndProviderSubject(identity.provider(), identity.providerId());
        if (linked.isPresent()) {
            return requireActiveExternalUser(linked.get().getUser());
        }
        String email = normalizeEmail(identity.email());
        if (email != null && userRepository.findByEmailIgnoreCase(email).isPresent()) {
            throw new ApiException(HttpStatus.CONFLICT, "ACCOUNT_LINK_REQUIRED",
                    "Sign in to your existing account or recover it, then link this provider in your profile");
        }
        AppUser user = new AppUser();
        user.setRole(shouldPromoteFirstUser() ? Role.ADMIN : Role.USER);
        user.setStatus(AppUser.STATUS_ACTIVE);
        user.setEmail(email);
        user.setFullName(identity.fullName().trim());
        try {
            user = userRepository.save(user);
            persistExternalIdentity(user, identity);
            return user;
        } catch (DataIntegrityViolationException exception) {
            throw new ApiException(HttpStatus.CONFLICT, "IDENTITY_ALREADY_LINKED",
                    "This identity is already registered; sign in or recover the existing account");
        }
    }

    private UserResponse linkExternalIdentity(Authentication authentication, ExternalAuthIdentity identity) {
        validateExternalIdentity(identity);
        AppUser authenticatedUser = currentUser(authentication);
        AppUser user = userRepository.findForUpdateById(authenticatedUser.getId())
                .orElseThrow(() -> new BadCredentialsException("Authentication required"));
        requireActiveExternalUser(user);
        Optional<UserExternalIdentity> existing = externalIdentityRepository
                .findByProviderAndProviderSubject(identity.provider(), identity.providerId());
        if (existing.isPresent()) {
            if (!existing.get().getUser().getId().equals(user.getId())) {
                throw new ApiException(HttpStatus.CONFLICT, "IDENTITY_ALREADY_LINKED",
                        "This provider identity is linked to another account");
            }
            return UserResponse.from(user);
        }
        if (externalIdentityRepository.findByUserIdAndProvider(user.getId(), identity.provider()).isPresent()) {
            throw new ApiException(HttpStatus.CONFLICT, "IDENTITY_PROVIDER_MISMATCH",
                    "Your account is already linked to a different identity for this provider");
        }
        try {
            persistExternalIdentity(user, identity);
        } catch (DataIntegrityViolationException exception) {
            throw new ApiException(HttpStatus.CONFLICT, "IDENTITY_ALREADY_LINKED",
                    "This provider identity is already linked");
        }
        return UserResponse.from(user);
    }

    private void persistExternalIdentity(AppUser user, ExternalAuthIdentity identity) {
        UserExternalIdentity linked = new UserExternalIdentity();
        linked.setUser(user);
        linked.setProvider(identity.provider());
        linked.setProviderSubject(identity.providerId());
        externalIdentityRepository.saveAndFlush(linked);
    }

    private void validateExternalIdentity(ExternalAuthIdentity identity) {
        if (externalIdentityRepository == null) {
            throw new IllegalStateException("Verified provider identity persistence is unavailable");
        }
        if (identity == null || (identity.provider() != AuthProvider.GOOGLE && identity.provider() != AuthProvider.TELEGRAM)
                || identity.providerId() == null || identity.providerId().isBlank() || identity.providerId().length() > 255
                || identity.fullName() == null || identity.fullName().isBlank() || identity.fullName().trim().length() > 120) {
            throw new BadCredentialsException("Invalid provider identity");
        }
    }

    private AppUser requireActiveExternalUser(AppUser user) {
        if (user == null || !user.isActive() || user.isDeleted()) {
            throw new BadCredentialsException("Account is disabled");
        }
        return user;
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
