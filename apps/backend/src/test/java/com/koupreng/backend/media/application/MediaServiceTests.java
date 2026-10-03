package com.koupreng.backend.media.application;

import com.koupreng.backend.invitation.application.InvitationService;
import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.media.api.dto.MediaListResponse;
import com.koupreng.backend.media.api.dto.MediaResponse;
import com.koupreng.backend.media.domain.MediaFile;
import com.koupreng.backend.invitation.domain.UserInvitation;
import com.koupreng.backend.user.domain.AppUser;
import com.koupreng.backend.media.domain.MediaType;
import com.koupreng.backend.media.infrastructure.persistence.MediaFileRepository;
import com.koupreng.backend.media.application.port.StorageService;
import com.koupreng.backend.media.application.port.StorageUploadResult;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class MediaServiceTests {

    @org.junit.jupiter.params.ParameterizedTest
    @org.junit.jupiter.params.provider.MethodSource("supportedFormats")
    void supportedMediaFormatsRemainAccepted(MediaType type, String filename, String contentType, byte[] bytes) {
        Fixture fixture = fixture();
        MockMultipartFile file = new MockMultipartFile("file", filename, contentType, bytes);
        MediaResponse response = switch (type) {
            case COVER_IMAGE -> fixture.service.uploadCover(fixture.authentication, 10L, file);
            case VIDEO -> fixture.service.uploadVideo(fixture.authentication, 10L, file);
            case BACKGROUND_MUSIC -> fixture.service.uploadMusic(fixture.authentication, 10L, file);
            default -> throw new IllegalArgumentException("Unexpected fixture type");
        };
        assertEquals(contentType, response.getMimeType());
    }

    private static java.util.stream.Stream<org.junit.jupiter.params.provider.Arguments> supportedFormats() {
        return java.util.stream.Stream.of(
                org.junit.jupiter.params.provider.Arguments.of(MediaType.COVER_IMAGE, "image.jpg", "image/jpeg", new byte[]{(byte) 0xff, (byte) 0xd8, (byte) 0xff}),
                org.junit.jupiter.params.provider.Arguments.of(MediaType.COVER_IMAGE, "image.png", "image/png", new byte[]{(byte) 0x89, 0x50, 0x4e, 0x47}),
                org.junit.jupiter.params.provider.Arguments.of(MediaType.COVER_IMAGE, "image.webp", "image/webp", "RIFF0000WEBP".getBytes(java.nio.charset.StandardCharsets.US_ASCII)),
                org.junit.jupiter.params.provider.Arguments.of(MediaType.VIDEO, "video.mp4", "video/mp4", "0000ftyp".getBytes(java.nio.charset.StandardCharsets.US_ASCII)),
                org.junit.jupiter.params.provider.Arguments.of(MediaType.VIDEO, "video.webm", "video/webm", new byte[]{0x1a, 0x45, (byte) 0xdf, (byte) 0xa3}),
                org.junit.jupiter.params.provider.Arguments.of(MediaType.BACKGROUND_MUSIC, "music.mp3", "audio/mpeg", "ID3".getBytes(java.nio.charset.StandardCharsets.US_ASCII)),
                org.junit.jupiter.params.provider.Arguments.of(MediaType.BACKGROUND_MUSIC, "music.mp3", "audio/mp3", "ID3".getBytes(java.nio.charset.StandardCharsets.US_ASCII)),
                org.junit.jupiter.params.provider.Arguments.of(MediaType.BACKGROUND_MUSIC, "music.wav", "audio/wav", "RIFF0000WAVE".getBytes(java.nio.charset.StandardCharsets.US_ASCII)),
                org.junit.jupiter.params.provider.Arguments.of(MediaType.BACKGROUND_MUSIC, "music.ogg", "audio/ogg", "OggS".getBytes(java.nio.charset.StandardCharsets.US_ASCII))
        );
    }

    @Test
    void singletonUploadFailureDoesNotDeleteExistingFileOrReference() {
        Fixture fixture = fixture();
        MediaFile old = media(fixture.invitation, MediaType.COVER_IMAGE, "old-cover");
        when(fixture.mediaFileRepository.findAllByInvitationIdAndMediaType(10L, MediaType.COVER_IMAGE)).thenReturn(List.of(old));
        when(fixture.storageService.upload(any(), any(), eq(10L))).thenThrow(new IllegalStateException("Storage unavailable"));
        assertThrows(IllegalStateException.class,
                () -> fixture.service.uploadCover(fixture.authentication, 10L, imageFile("cover.png")));
        verify(fixture.storageService, never()).delete("old-cover", MediaType.COVER_IMAGE);
        verify(fixture.mediaFileRepository, never()).delete(old);
    }

    @Test
    void databaseSaveFailureCompensatesNewObjectAndKeepsOldBytes() {
        Fixture fixture = fixture();
        MediaFile old = media(fixture.invitation, MediaType.GALLERY_IMAGE, "old-gallery");
        when(fixture.mediaFileRepository.findByIdAndInvitationId(20L, 10L)).thenReturn(Optional.of(old));
        when(fixture.mediaFileRepository.save(any())).thenThrow(new IllegalStateException("Database unavailable"));
        assertThrows(IllegalStateException.class,
                () -> fixture.service.replace(fixture.authentication, 10L, 20L, imageFile("updated.png")));
        verify(fixture.storageService).delete("new-public-id", MediaType.GALLERY_IMAGE);
        verify(fixture.storageService, never()).delete("old-gallery", MediaType.GALLERY_IMAGE);
    }

    @Test
    void replacementDeletesOldBytesOnlyAfterCommit() {
        Fixture fixture = fixture();
        MediaFile old = media(fixture.invitation, MediaType.GALLERY_IMAGE, "old-gallery");
        when(fixture.mediaFileRepository.findByIdAndInvitationId(20L, 10L)).thenReturn(Optional.of(old));
        transaction().executeWithoutResult(status -> {
            fixture.service.replace(fixture.authentication, 10L, 20L, imageFile("updated.png"));
            verify(fixture.storageService, never()).delete("old-gallery", MediaType.GALLERY_IMAGE);
        });
        verify(fixture.storageService).delete("old-gallery", MediaType.GALLERY_IMAGE);
        verify(fixture.storageService, never()).delete("new-public-id", MediaType.GALLERY_IMAGE);
    }

    @Test
    void transactionRollbackRemovesStagedFileAndPreservesOldBytes() {
        Fixture fixture = fixture();
        MediaFile old = media(fixture.invitation, MediaType.GALLERY_IMAGE, "old-gallery");
        when(fixture.mediaFileRepository.findByIdAndInvitationId(20L, 10L)).thenReturn(Optional.of(old));
        transaction().executeWithoutResult(status -> {
            fixture.service.replace(fixture.authentication, 10L, 20L, imageFile("updated.png"));
            status.setRollbackOnly();
        });
        verify(fixture.storageService).delete("new-public-id", MediaType.GALLERY_IMAGE);
        verify(fixture.storageService, never()).delete("old-gallery", MediaType.GALLERY_IMAGE);
    }

    @Test
    void cleanupFailureDoesNotUndoCommittedReplacement() {
        Fixture fixture = fixture();
        MediaFile old = media(fixture.invitation, MediaType.GALLERY_IMAGE, "old-gallery");
        when(fixture.mediaFileRepository.findByIdAndInvitationId(20L, 10L)).thenReturn(Optional.of(old));
        org.mockito.Mockito.doThrow(new IllegalStateException("Cleanup failed"))
                .when(fixture.storageService).delete("old-gallery", MediaType.GALLERY_IMAGE);
        transaction().executeWithoutResult(status ->
                fixture.service.replace(fixture.authentication, 10L, 20L, imageFile("updated.png")));
        assertEquals("https://cdn.example/media.png", old.getFileUrl());
    }

    @Test
    void galleryValidatesAllBytesBeforeAnyUpload() {
        Fixture fixture = fixture();
        MockMultipartFile forged = new MockMultipartFile("file", "forged.png", "image/png", "<svg/>".getBytes());
        assertThrows(ApiException.class, () -> fixture.service.uploadGallery(fixture.authentication, 10L,
                List.of(imageFile("valid.png"), forged), null));
        verify(fixture.storageService, never()).upload(any(), any(), any());
    }

    @Test
    void galleryRejectsBatchAboveConfiguredFileCount() {
        Fixture fixture = fixture();
        assertThrows(ApiException.class, () -> fixture.service.uploadGallery(fixture.authentication, 10L,
                java.util.Collections.nCopies(6, imageFile("photo.png")), null));
        verify(fixture.storageService, never()).upload(any(), any(), any());
    }

    @Test
    void configuredInvitationQuotaPreventsFurtherGrowthWithoutRemovingExistingMedia() {
        Fixture fixture = fixture();
        var properties = new com.koupreng.backend.shared.security.ApiSecurityProperties();
        properties.getUpload().setMaxGalleryFilesPerInvitation(3);
        MediaService service = new MediaService(fixture.mediaFileRepository, fixture.invitationService,
                fixture.storageService, null, new com.koupreng.backend.shared.security.FileUploadValidator(properties), properties);
        when(fixture.mediaFileRepository.countByInvitationIdAndMediaType(10L, MediaType.GALLERY_IMAGE)).thenReturn(3L);
        assertThrows(ApiException.class, () -> service.uploadGallery(fixture.authentication, 10L,
                List.of(imageFile("photo.png")), null));
        verify(fixture.storageService, never()).upload(any(), any(), any());
        verify(fixture.mediaFileRepository, never()).delete(any());
    }

    @Test
    void galleryPreservesKhmerFilenames() {
        Fixture fixture = fixture();
        List<MediaResponse> responses = fixture.service.uploadGallery(fixture.authentication, 10L,
                List.of(imageFile("រូបអាពាហ៍ពិពាហ៍.png")), null);
        assertEquals("រូបអាពាហ៍ពិពាហ៍.png", responses.getFirst().getOriginalFilename());
    }

    private org.springframework.transaction.support.TransactionTemplate transaction() {
        return new org.springframework.transaction.support.TransactionTemplate(
                new org.springframework.transaction.support.AbstractPlatformTransactionManager() {
                    @Override protected Object doGetTransaction() { return new Object(); }
                    @Override protected void doBegin(Object transaction, org.springframework.transaction.TransactionDefinition definition) { }
                    @Override protected void doCommit(org.springframework.transaction.support.DefaultTransactionStatus status) { }
                    @Override protected void doRollback(org.springframework.transaction.support.DefaultTransactionStatus status) { }
                });
    }

    @Test
    void uploadCoverReplacesExistingCoverAndStoresMetadata() {
        Fixture fixture = fixture();
        MediaFile oldCover = media(fixture.invitation, MediaType.COVER_IMAGE, "old-cover");
        when(fixture.mediaFileRepository.findAllByInvitationIdAndMediaType(10L, MediaType.COVER_IMAGE))
                .thenReturn(List.of(oldCover));

        MediaResponse response = fixture.service.uploadCover(fixture.authentication, 10L, imageFile("cover.png"));

        assertEquals(MediaType.COVER_IMAGE, response.getMediaType());
        assertTrue(response.isCover());
        assertEquals("image/png", response.getMimeType());
        assertEquals("https://cdn.example/media.png", response.getFileUrl());
        verify(fixture.storageService).delete("old-cover", MediaType.COVER_IMAGE);
        verify(fixture.mediaFileRepository).delete(oldCover);
    }

    @Test
    void uploadGalleryStoresMultipleImages() {
        Fixture fixture = fixture();
        when(fixture.mediaFileRepository.countByInvitationIdAndMediaType(10L, MediaType.GALLERY_IMAGE)).thenReturn(2L);

        List<MediaResponse> responses = fixture.service.uploadGallery(
                fixture.authentication,
                10L,
                List.of(imageFile("first.png"), imageFile("second.png")),
                null
        );

        assertEquals(2, responses.size());
        assertEquals(2, responses.get(0).getSortOrder());
        assertEquals(3, responses.get(1).getSortOrder());
    }

    @Test
    void replaceKeepsMediaIdAndDeletesOldStorageObject() {
        Fixture fixture = fixture();
        MediaFile existing = media(fixture.invitation, MediaType.GALLERY_IMAGE, "old-gallery");
        existing.setId(55L);
        when(fixture.mediaFileRepository.findByIdAndInvitationId(55L, 10L)).thenReturn(Optional.of(existing));

        MediaResponse response = fixture.service.replace(fixture.authentication, 10L, 55L, imageFile("updated.png"));

        assertEquals(55L, response.getId());
        assertEquals("https://cdn.example/media.png", response.getFileUrl());
        verify(fixture.storageService).delete("old-gallery", MediaType.GALLERY_IMAGE);
    }

    @Test
    void invalidFileTypeIsRejected() {
        Fixture fixture = fixture();
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "cover.txt",
                "text/plain",
                "bad".getBytes()
        );

        ApiException exception = assertThrows(
                ApiException.class,
                () -> fixture.service.uploadCover(fixture.authentication, 10L, file)
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
    }

    @Test
    void ownerAuthorizationRunsBeforeUpload() {
        Fixture fixture = fixture();
        when(fixture.invitationService.requireOwnedInvitationEntity(fixture.authentication, 10L))
                .thenThrow(new ApiException(HttpStatus.FORBIDDEN, "Forbidden"));

        ApiException exception = assertThrows(
                ApiException.class,
                () -> fixture.service.uploadCover(fixture.authentication, 10L, imageFile("cover.png"))
        );

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatus());
        verify(fixture.storageService, never()).upload(any(), any(), any());
    }

    @Test
    void tooLargeImageIsRejected() {
        Fixture fixture = fixture();
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "cover.png",
                "image/png",
                new byte[(int) (5L * 1024L * 1024L + 1L)]
        );

        ApiException exception = assertThrows(
                ApiException.class,
                () -> fixture.service.uploadCover(fixture.authentication, 10L, file)
        );

        assertEquals(HttpStatus.CONTENT_TOO_LARGE, exception.getStatus());
    }

    @Test
    void listPublicUsesPublishedPublicInvitationCheck() {
        Fixture fixture = fixture();
        when(fixture.invitationService.requirePublicInvitationForView("samnang-sreyneang", "token"))
                .thenReturn(fixture.invitation);
        when(fixture.mediaFileRepository.findByInvitationIdOrderBySortOrderAscCreatedAtAsc(10L))
                .thenReturn(List.of(media(fixture.invitation, MediaType.GALLERY_IMAGE, "gallery")));

        MediaListResponse response = fixture.service.listPublic("samnang-sreyneang", "token");

        assertEquals(1, response.getGalleryImages().size());
    }

    @Test
    void listPublicReturnsCoverVideoGalleryAndMusicInTheirCanonicalFields() {
        Fixture fixture = fixture();
        when(fixture.invitationService.requirePublicInvitationForView("samnang-sreyneang", "token"))
                .thenReturn(fixture.invitation);
        when(fixture.mediaFileRepository.findByInvitationIdOrderBySortOrderAscCreatedAtAsc(10L))
                .thenReturn(List.of(
                        media(fixture.invitation, MediaType.COVER_IMAGE, "cover"),
                        media(fixture.invitation, MediaType.VIDEO, "video"),
                        media(fixture.invitation, MediaType.GALLERY_IMAGE, "gallery-one"),
                        media(fixture.invitation, MediaType.GALLERY_IMAGE, "gallery-two"),
                        media(fixture.invitation, MediaType.BACKGROUND_MUSIC, "music")
                ));

        MediaListResponse response = fixture.service.listPublic("samnang-sreyneang", "token");

        assertNotNull(response.getCoverImage());
        assertNotNull(response.getVideo());
        assertNotNull(response.getBackgroundMusic());
        assertEquals(2, response.getGalleryImages().size());
        assertEquals(5, response.getAll().size());
    }

    private Fixture fixture() {
        MediaFileRepository mediaFileRepository = mock(MediaFileRepository.class);
        InvitationService invitationService = mock(InvitationService.class);
        StorageService storageService = mock(StorageService.class);
        Authentication authentication = mock(Authentication.class);
        UserInvitation invitation = invitation();
        MediaService service = new MediaService(mediaFileRepository, invitationService, storageService);

        when(invitationService.requireOwnedInvitationEntity(authentication, 10L)).thenReturn(invitation);
        when(storageService.upload(any(), any(), eq(10L)))
                .thenReturn(new StorageUploadResult("https://cdn.example/media.png", "new-public-id", "test"));
        when(mediaFileRepository.save(any(MediaFile.class))).thenAnswer(invocation -> {
            MediaFile mediaFile = invocation.getArgument(0);
            if (mediaFile.getId() == null) {
                mediaFile.setId(99L);
            }
            return mediaFile;
        });

        return new Fixture(service, mediaFileRepository, invitationService, storageService, authentication, invitation);
    }

    private MockMultipartFile imageFile(String filename) {
        return new MockMultipartFile(
                "file",
                filename,
                "image/png",
                new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47}
        );
    }

    private UserInvitation invitation() {
        AppUser user = new AppUser();
        user.setId(1L);

        UserInvitation invitation = new UserInvitation();
        invitation.setId(10L);
        invitation.setUser(user);
        invitation.setTitle("Wedding");
        invitation.setSlug("samnang-sreyneang");
        return invitation;
    }

    private MediaFile media(UserInvitation invitation, MediaType mediaType, String publicId) {
        MediaFile mediaFile = new MediaFile();
        mediaFile.setId(20L);
        mediaFile.setInvitation(invitation);
        mediaFile.setMediaType(mediaType);
        mediaFile.setPublicId(publicId);
        mediaFile.setFileUrl("https://cdn.example/old.png");
        mediaFile.setMimeType("image/png");
        mediaFile.setOriginalFilename("old.png");
        return mediaFile;
    }

    private record Fixture(
            MediaService service,
            MediaFileRepository mediaFileRepository,
            InvitationService invitationService,
            StorageService storageService,
            Authentication authentication,
            UserInvitation invitation
    ) {
    }
}
