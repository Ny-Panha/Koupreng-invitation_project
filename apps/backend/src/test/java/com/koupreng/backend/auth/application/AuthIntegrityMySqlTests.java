package com.koupreng.backend.auth.application;

import com.koupreng.backend.audit.infrastructure.persistence.SystemAuditLogRepository;
import com.koupreng.backend.auth.api.dto.LoginRequest;
import com.koupreng.backend.auth.api.dto.ResetPasswordRequest;
import com.koupreng.backend.auth.domain.PasswordResetToken;
import com.koupreng.backend.auth.domain.UserExternalIdentity;
import com.koupreng.backend.auth.infrastructure.persistence.PasswordResetTokenRepository;
import com.koupreng.backend.auth.infrastructure.persistence.UserExternalIdentityRepository;
import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.user.domain.AppUser;
import com.koupreng.backend.user.domain.AuthProvider;
import com.koupreng.backend.user.domain.Role;
import com.koupreng.backend.user.infrastructure.persistence.AppUserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.HexFormat;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import static org.junit.jupiter.api.Assertions.*;

/** Run only against a task-owned disposable MySQL schema, as for the Flyway gate. */
@SpringBootTest
@ActiveProfiles("test")
@EnabledIfEnvironmentVariable(named = "RUN_FLYWAY_INTEGRATION", matches = "true")
class AuthIntegrityMySqlTests {
    @Autowired private AuthService authService;
    @Autowired private AccountService accountService;
    @Autowired private AppUserRepository users;
    @Autowired private PasswordResetTokenRepository resetTokens;
    @Autowired private UserExternalIdentityRepository identities;
    @Autowired private SystemAuditLogRepository auditLogs;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private com.koupreng.backend.admin.application.AdminManagementService adminManagement;
    @Autowired private com.koupreng.backend.auth.infrastructure.security.AppJwtAuthenticationConverter jwtConverter;

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", () -> required("FLYWAY_TEST_DB_URL"));
        registry.add("spring.datasource.username", () -> required("FLYWAY_TEST_DB_USERNAME"));
        registry.add("spring.datasource.password", () -> required("FLYWAY_TEST_DB_PASSWORD"));
        registry.add("spring.datasource.driver-class-name", () -> "com.mysql.cj.jdbc.Driver");
        registry.add("spring.flyway.enabled", () -> true);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "validate");
        registry.add("spring.jpa.database-platform", () -> "org.hibernate.dialect.MySQLDialect");
        registry.add("spring.jpa.properties.hibernate.boot.allow_jdbc_metadata_access", () -> true);
    }

    @Test
    void rejectedLoginPersistsRedactedAuditOutsideItsRollback() {
        AppUser user = user();
        String rejectedPassword = "RejectedPassword123";
        assertThrows(BadCredentialsException.class,
                () -> authService.login(new LoginRequest(user.getEmail(), rejectedPassword)));
        var logs = auditLogs.findAllByOrderByCreatedAtDesc().stream()
                .filter(log -> user.getId().equals(log.getResourceId()) && "LOGIN_FAILED".equals(log.getAction())).toList();
        assertEquals(1, logs.size());
        assertTrue(logs.getFirst().getMetadataJson().contains("BAD_CREDENTIALS"));
        assertFalse(logs.getFirst().getMetadataJson().contains(rejectedPassword));
        assertFalse(logs.getFirst().getDescription().contains(user.getEmail()));
    }

    @Test
    void simultaneousResetRedemptionsHaveExactlyOneWinner() throws Exception {
        AppUser user = user();
        String token = UUID.randomUUID().toString();
        PasswordResetToken reset = new PasswordResetToken();
        reset.setUser(user);
        reset.setTokenHash(HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                .digest(token.getBytes(StandardCharsets.UTF_8))));
        reset.setExpiresAt(Instant.now().plusSeconds(600));
        resetTokens.saveAndFlush(reset);
        CountDownLatch ready = new CountDownLatch(2);
        CountDownLatch start = new CountDownLatch(1);
        try (var executor = Executors.newFixedThreadPool(2)) {
            var first = executor.submit(() -> redeem(ready, start, token, "FirstNewPassword123"));
            var second = executor.submit(() -> redeem(ready, start, token, "SecondNewPassword123"));
            assertTrue(ready.await(5, TimeUnit.SECONDS));
            start.countDown();
            assertEquals(1, first.get(20, TimeUnit.SECONDS) + second.get(20, TimeUnit.SECONDS));
        }
        AppUser reloaded = users.findById(user.getId()).orElseThrow();
        assertEquals(1, reloaded.getTokenVersion());
        assertNotNull(resetTokens.findById(reset.getId()).orElseThrow().getUsedAt());
        assertTrue(passwordEncoder.matches("FirstNewPassword123", reloaded.getPasswordHash())
                ^ passwordEncoder.matches("SecondNewPassword123", reloaded.getPasswordHash()));
    }

    @Test
    void providerSubjectConstraintsAreCaseSensitiveAndRejectDuplicateOwnership() {
        AppUser first = user();
        AppUser second = user();
        String subject = "Subject-" + UUID.randomUUID();
        identities.saveAndFlush(identity(first, subject));
        identities.saveAndFlush(identity(second, subject.toLowerCase(java.util.Locale.ROOT)));
        assertThrows(DataIntegrityViolationException.class,
                () -> identities.saveAndFlush(identity(user(), subject)));
        assertThrows(DataIntegrityViolationException.class,
                () -> identities.saveAndFlush(identity(first, "another-" + UUID.randomUUID())));
    }

    @Test
    void staffCreationAndRoleUpdatePersistAndKeepExistingAdminAuthorityMapping() {
        AppUser admin = user();
        admin.setRole(Role.ADMIN);
        users.saveAndFlush(admin);
        var authentication = new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                admin.getId().toString(), null, java.util.List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_ADMIN")));
        var request = new com.koupreng.backend.admin.api.dto.AdminCreateUserRequest("Staff fixture",
                "staff-" + UUID.randomUUID() + "@example.com", "StaffFixturePassword123", Role.STAFF);
        var created = adminManagement.createUser(authentication, request, new org.springframework.mock.web.MockHttpServletRequest());
        assertEquals(Role.STAFF, users.findById(created.getId()).orElseThrow().getRole());
        AppUser updated = user();
        adminManagement.updateUserRole(authentication, updated.getId(), Role.STAFF, new org.springframework.mock.web.MockHttpServletRequest());
        updated = users.findById(updated.getId()).orElseThrow();
        assertEquals(Role.STAFF, updated.getRole());
        var jwt = org.springframework.security.oauth2.jwt.Jwt.withTokenValue("fixture-jwt").header("alg", "HS256")
                .subject(updated.getId().toString()).claim("token_version", updated.getTokenVersion()).build();
        assertEquals("ROLE_ADMIN", jwtConverter.convert(jwt).getAuthorities().iterator().next().getAuthority());
    }

    private int redeem(CountDownLatch ready, CountDownLatch start, String token, String password) throws Exception {
        ready.countDown();
        if (!start.await(5, TimeUnit.SECONDS)) { throw new IllegalStateException("Reset test start timed out"); }
        try {
            accountService.resetPassword(new ResetPasswordRequest(token, password));
            return 1;
        } catch (ApiException exception) {
            assertTrue(exception.getMessage().contains("already been used"));
            return 0;
        }
    }

    private AppUser user() {
        AppUser user = new AppUser();
        user.setFullName("Integrity fixture");
        user.setEmail("integrity-" + UUID.randomUUID() + "@example.com");
        user.setRole(Role.USER);
        user.setPasswordHash(passwordEncoder.encode("OriginalPassword123"));
        return users.saveAndFlush(user);
    }

    private UserExternalIdentity identity(AppUser user, String subject) {
        UserExternalIdentity identity = new UserExternalIdentity();
        identity.setUser(user);
        identity.setProvider(AuthProvider.GOOGLE);
        identity.setProviderSubject(subject);
        return identity;
    }

    private static String required(String name) {
        String value = System.getenv(name);
        if (value == null || value.isBlank()) { throw new IllegalStateException(name + " is required"); }
        return value;
    }
}
