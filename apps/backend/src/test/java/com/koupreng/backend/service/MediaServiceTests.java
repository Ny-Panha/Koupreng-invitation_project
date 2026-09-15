package com.koupreng.backend.service;

import com.koupreng.backend.invitation.application.InvitationService;
import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.dto.media.MediaListResponse;
import com.koupreng.backend.dto.media.MediaResponse;
import com.koupreng.backend.entity.invitation.MediaFile;
import com.koupreng.backend.invitation.domain.UserInvitation;
import com.koupreng.backend.user.domain.AppUser;
import com.koupreng.backend.enums.MediaType;
import com.koupreng.backend.repository.MediaFileRepository;
import com.koupreng.backend.service.storage.StorageService;
import com.koupreng.backend.service.storage.StorageUploadResult;
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
