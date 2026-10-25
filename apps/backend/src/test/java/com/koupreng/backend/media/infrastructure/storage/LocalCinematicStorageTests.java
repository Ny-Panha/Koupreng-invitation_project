package com.koupreng.backend.media.infrastructure.storage;

import com.koupreng.backend.media.domain.MediaType;
import com.koupreng.backend.media.infrastructure.config.StorageProperties;
import com.koupreng.backend.shared.exception.ApiException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;
import java.nio.file.*;
import static org.junit.jupiter.api.Assertions.*;

class LocalCinematicStorageTests {
    @TempDir Path root;

    @Test void privateBytesSurviveAnAdapterRestartOutsideTheStaticUploadRoot() throws Exception {
        var properties = properties(); var storage = new LocalStorageService(properties);
        byte[] bytes = "0000ftyp-fixture".getBytes();
        var saved = storage.upload(new MockMultipartFile("file", "film.mp4", "video/mp4", bytes), MediaType.PRE_WEDDING_VIDEO, 7L);
        assertNull(saved.fileUrl()); assertTrue(saved.publicId().startsWith(".private/invitations/7/"));
        assertFalse(Files.exists(Path.of(properties.getLocal().getUploadDir()).resolve(saved.publicId())));
        var reopened = new LocalStorageService(properties);
        try (var input = reopened.readPrivate(saved.publicId()).getInputStream()) { assertArrayEquals(bytes, input.readAllBytes()); }
    }

    @Test void deletingPrivateVideoKeepsOrdinaryCoverVideoBytesAndUrl() throws Exception {
        var storage = new LocalStorageService(properties());
        var file = new MockMultipartFile("file", "film.webm", "video/webm", new byte[]{1,2,3});
        var cover = storage.upload(file, MediaType.VIDEO, 7L);
        var cinematic = storage.upload(file, MediaType.PRE_WEDDING_VIDEO, 7L);
        storage.delete(cinematic.publicId(), MediaType.PRE_WEDDING_VIDEO);
        assertTrue(cover.fileUrl().startsWith("/uploads/invitations/7/video/"));
        assertTrue(Files.isRegularFile(root.resolve("public").resolve(cover.publicId())));
        assertThrows(ApiException.class, () -> storage.readPrivate(cinematic.publicId()));
    }

    @Test void overlappingPrivateAndPublicDirectoriesAreRejected() {
        var properties = properties(); properties.getLocal().setPrivateUploadDir(root.resolve("public/private").toString());
        assertThrows(IllegalStateException.class, () -> new LocalStorageService(properties));
        properties.getLocal().setPrivateUploadDir(root.toString());
        assertThrows(IllegalStateException.class, () -> new LocalStorageService(properties));
    }

    private StorageProperties properties() {
        var value = new StorageProperties(); value.getLocal().setUploadDir(root.resolve("public").toString());
        value.getLocal().setPrivateUploadDir(root.resolve("private").toString()); return value;
    }
}
