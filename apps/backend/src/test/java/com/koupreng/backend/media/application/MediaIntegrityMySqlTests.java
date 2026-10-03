package com.koupreng.backend.media.application;

import com.koupreng.backend.media.application.port.StorageService;
import com.koupreng.backend.media.application.port.StorageUploadResult;
import com.koupreng.backend.media.domain.MediaFile;
import com.koupreng.backend.media.domain.MediaType;
import com.koupreng.backend.media.infrastructure.persistence.MediaFileRepository;
import com.koupreng.backend.invitation.domain.UserInvitation;
import com.koupreng.backend.invitation.infrastructure.persistence.UserInvitationRepository;
import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.user.domain.AppUser;
import com.koupreng.backend.user.domain.Role;
import com.koupreng.backend.user.infrastructure.persistence.AppUserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@SpringBootTest(properties = "app.security.upload.max-gallery-files-per-invitation=1")
@ActiveProfiles("test")
@EnabledIfEnvironmentVariable(named = "RUN_FLYWAY_INTEGRATION", matches = "true")
class MediaIntegrityMySqlTests {
    @Autowired private MediaService mediaService;
    @Autowired private MediaFileRepository mediaFiles;
    @Autowired private UserInvitationRepository invitations;
    @Autowired private AppUserRepository users;
    @Autowired private PlatformTransactionManager transactions;
    @MockitoBean private StorageService storage;
    private final Map<String, byte[]> objects = new ConcurrentHashMap<>();

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

    @BeforeEach
    void mockedExternalStorage() {
        when(storage.upload(any(), any(), any())).thenAnswer(invocation -> {
            org.springframework.web.multipart.MultipartFile file = invocation.getArgument(0);
            String id = "staged-" + UUID.randomUUID();
            objects.put(id, file.getBytes());
            return new StorageUploadResult("https://fixture.invalid/" + id, id, "fixture");
        });
        doAnswer(invocation -> { objects.remove(invocation.getArgument(0)); return null; }).when(storage).delete(any(), any());
    }

    @Test
    void sqlRollbackKeepsOriginalReferenceAndBytesThenSuccessfulCommitCleansOldObject() {
        Fixture fixture = fixture();
        MediaFile old = new MediaFile();
        old.setInvitation(fixture.invitation);
        old.setMediaType(MediaType.COVER_IMAGE);
        old.setPublicId("original-" + UUID.randomUUID());
        old.setFileUrl("https://fixture.invalid/" + old.getPublicId());
        old.setCover(true);
        mediaFiles.saveAndFlush(old);
        objects.put(old.getPublicId(), new byte[]{1, 2, 3});
        String[] staged = new String[1];
        new TransactionTemplate(transactions).executeWithoutResult(status -> {
            mediaService.replace(authentication(fixture.owner), fixture.invitation.getId(), old.getId(), image());
            staged[0] = mediaFiles.findById(old.getId()).orElseThrow().getPublicId();
            assertTrue(objects.containsKey(old.getPublicId()));
            assertTrue(objects.containsKey(staged[0]));
            status.setRollbackOnly();
        });
        assertEquals(old.getPublicId(), mediaFiles.findById(old.getId()).orElseThrow().getPublicId());
        assertTrue(objects.containsKey(old.getPublicId()));
        assertFalse(objects.containsKey(staged[0]));
        var replacement = mediaService.replace(authentication(fixture.owner), fixture.invitation.getId(), old.getId(), image());
        MediaFile committed = mediaFiles.findById(old.getId()).orElseThrow();
        assertEquals(replacement.getFileUrl(), committed.getFileUrl());
        assertTrue(objects.containsKey(committed.getPublicId()));
        assertFalse(objects.containsKey(old.getPublicId()));
    }

    @Test
    void concurrentGalleryUploadsCannotExceedConfiguredInvitationQuota() throws Exception {
        Fixture fixture = fixture();
        CountDownLatch ready = new CountDownLatch(2);
        CountDownLatch start = new CountDownLatch(1);
        try (var executor = Executors.newFixedThreadPool(2)) {
            var first = executor.submit(() -> uploadTogether(fixture, ready, start));
            var second = executor.submit(() -> uploadTogether(fixture, ready, start));
            assertTrue(ready.await(5, TimeUnit.SECONDS));
            start.countDown();
            assertEquals(1, first.get(20, TimeUnit.SECONDS) + second.get(20, TimeUnit.SECONDS));
        }
        assertEquals(1, mediaFiles.countByInvitationIdAndMediaType(fixture.invitation.getId(), MediaType.GALLERY_IMAGE));
        assertEquals(1, objects.size());
        verify(storage, times(1)).upload(any(), any(), any());
    }

    private int uploadTogether(Fixture fixture, CountDownLatch ready, CountDownLatch start) throws Exception {
        ready.countDown();
        if (!start.await(5, TimeUnit.SECONDS)) { throw new IllegalStateException("Gallery start timed out"); }
        try {
            mediaService.uploadGallery(authentication(fixture.owner), fixture.invitation.getId(), List.of(image()), null);
            return 1;
        } catch (ApiException exception) {
            assertEquals(409, exception.getStatus().value());
            return 0;
        }
    }

    private MockMultipartFile image() {
        return new MockMultipartFile("file", "fixture.png", "image/png", new byte[]{(byte) 0x89, 0x50, 0x4e, 0x47});
    }

    private Fixture fixture() {
        AppUser owner = new AppUser();
        owner.setFullName("Media integrity fixture");
        owner.setEmail("media-" + UUID.randomUUID() + "@example.com");
        owner.setRole(Role.USER);
        users.saveAndFlush(owner);
        UserInvitation invitation = new UserInvitation();
        invitation.setUser(owner);
        invitation.setTitle("Media fixture");
        invitation.setSlug("media-" + UUID.randomUUID());
        invitations.saveAndFlush(invitation);
        return new Fixture(owner, invitation);
    }

    private UsernamePasswordAuthenticationToken authentication(AppUser user) {
        return new UsernamePasswordAuthenticationToken(user.getId().toString(), null, List.of(new SimpleGrantedAuthority("ROLE_USER")));
    }

    private record Fixture(AppUser owner, UserInvitation invitation) { }

    private static String required(String name) {
        String value = System.getenv(name);
        if (value == null || value.isBlank()) { throw new IllegalStateException(name + " is required"); }
        return value;
    }
}
