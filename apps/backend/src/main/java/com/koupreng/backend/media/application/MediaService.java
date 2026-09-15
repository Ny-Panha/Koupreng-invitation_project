package com.koupreng.backend.media.application;

import com.koupreng.backend.invitation.application.InvitationService;
import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.media.api.dto.MediaListResponse;
import com.koupreng.backend.media.api.dto.MediaResponse;
import com.koupreng.backend.media.domain.MediaFile;
import com.koupreng.backend.invitation.domain.UserInvitation;
import com.koupreng.backend.media.domain.MediaType;
import com.koupreng.backend.media.infrastructure.persistence.MediaFileRepository;
import com.koupreng.backend.media.application.port.StorageService;
import com.koupreng.backend.media.application.port.StorageUploadResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
public class MediaService {

    private static final Logger log = LoggerFactory.getLogger(MediaService.class);

    private static final long MB = 1024L * 1024L;
    private static final Map<MediaType, Set<String>> ALLOWED_CONTENT_TYPES = Map.of(
            MediaType.COVER_IMAGE, Set.of("image/jpeg", "image/png", "image/webp"),
            MediaType.GALLERY_IMAGE, Set.of("image/jpeg", "image/png", "image/webp"),
            MediaType.VIDEO, Set.of("video/mp4", "video/webm"),
            MediaType.BACKGROUND_MUSIC, Set.of("audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg")
    );
    private static final Map<MediaType, Set<String>> ALLOWED_EXTENSIONS = Map.of(
            MediaType.COVER_IMAGE, Set.of(".jpg", ".jpeg", ".png", ".webp"),
            MediaType.GALLERY_IMAGE, Set.of(".jpg", ".jpeg", ".png", ".webp"),
            MediaType.VIDEO, Set.of(".mp4", ".webm"),
            MediaType.BACKGROUND_MUSIC, Set.of(".mp3", ".wav", ".ogg")
    );
    private static final Map<String, Set<String>> CONTENT_TYPES_BY_EXTENSION = Map.of(
            ".jpg", Set.of("image/jpeg"),
            ".jpeg", Set.of("image/jpeg"),
            ".png", Set.of("image/png"),
            ".webp", Set.of("image/webp"),
            ".mp4", Set.of("video/mp4"),
            ".webm", Set.of("video/webm"),
            ".mp3", Set.of("audio/mpeg", "audio/mp3"),
            ".wav", Set.of("audio/wav"),
            ".ogg", Set.of("audio/ogg")
    );
    private static final Map<MediaType, Long> MAX_FILE_SIZES = Map.of(
            MediaType.COVER_IMAGE, 5L * MB,
            MediaType.GALLERY_IMAGE, 5L * MB,
            MediaType.VIDEO, 50L * MB,
            MediaType.BACKGROUND_MUSIC, 15L * MB
    );
    private static final Set<String> EXECUTABLE_EXTENSIONS = Set.of(
            ".exe",
            ".bat",
            ".cmd",
            ".com",
            ".js",
            ".jar",
            ".msi",
            ".ps1",
            ".scr",
            ".sh"
    );

    private final MediaFileRepository mediaFileRepository;
    private final InvitationService invitationService;
    private final StorageService storageService;

    public MediaService(
            MediaFileRepository mediaFileRepository,
            InvitationService invitationService,
            StorageService storageService
    ) {
        this.mediaFileRepository = mediaFileRepository;
        this.invitationService = invitationService;
        this.storageService = storageService;
    }

    @Transactional
    public MediaResponse uploadCover(Authentication authentication, Long invitationId, MultipartFile file) {
        UserInvitation invitation = invitationService.requireOwnedInvitationEntity(authentication, invitationId);
        validateFile(file, MediaType.COVER_IMAGE);
        deleteExistingSingleton(invitationId, MediaType.COVER_IMAGE);
        MediaFile mediaFile = store(invitation, file, MediaType.COVER_IMAGE, 0, true);
        return MediaResponse.from(mediaFileRepository.save(mediaFile));
    }

    @Transactional
    public List<MediaResponse> uploadGallery(
            Authentication authentication,
            Long invitationId,
            List<MultipartFile> files,
            Integer sortOrder
    ) {
        UserInvitation invitation = invitationService.requireOwnedInvitationEntity(authentication, invitationId);
        if (files == null || files.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "At least one gallery image is required");
        }

        int nextSortOrder = sortOrder == null
                ? Math.toIntExact(mediaFileRepository.countByInvitationIdAndMediaType(invitationId, MediaType.GALLERY_IMAGE))
                : sortOrder;
        List<MediaResponse> responses = new ArrayList<>();
        for (MultipartFile file : files) {
            validateFile(file, MediaType.GALLERY_IMAGE);
            MediaFile mediaFile = store(invitation, file, MediaType.GALLERY_IMAGE, nextSortOrder++, false);
            responses.add(MediaResponse.from(mediaFileRepository.save(mediaFile)));
        }
        return responses;
    }

    @Transactional
    public MediaResponse uploadVideo(Authentication authentication, Long invitationId, MultipartFile file) {
        UserInvitation invitation = invitationService.requireOwnedInvitationEntity(authentication, invitationId);
        validateFile(file, MediaType.VIDEO);
        deleteExistingSingleton(invitationId, MediaType.VIDEO);
        MediaFile mediaFile = store(invitation, file, MediaType.VIDEO, 0, false);
        return MediaResponse.from(mediaFileRepository.save(mediaFile));
    }

    @Transactional
    public MediaResponse uploadMusic(Authentication authentication, Long invitationId, MultipartFile file) {
        UserInvitation invitation = invitationService.requireOwnedInvitationEntity(authentication, invitationId);
        validateFile(file, MediaType.BACKGROUND_MUSIC);
        deleteExistingSingleton(invitationId, MediaType.BACKGROUND_MUSIC);
        MediaFile mediaFile = store(invitation, file, MediaType.BACKGROUND_MUSIC, 0, false);
        return MediaResponse.from(mediaFileRepository.save(mediaFile));
    }

    @Transactional(readOnly = true)
    public MediaListResponse list(Authentication authentication, Long invitationId) {
        invitationService.requireOwnedInvitationEntity(authentication, invitationId);
        return MediaListResponse.from(mediaFileRepository.findByInvitationIdOrderBySortOrderAscCreatedAtAsc(invitationId));
    }

    @Transactional(readOnly = true)
    public MediaListResponse listPublic(String slug, String token) {
        UserInvitation invitation = invitationService.requirePublicInvitationForView(slug, token);
        return MediaListResponse.from(mediaFileRepository.findByInvitationIdOrderBySortOrderAscCreatedAtAsc(invitation.getId()));
    }

    @Transactional(readOnly = true)
    public MediaListResponse listPublic(String slug, String accessToken, String inviteToken) {
        UserInvitation invitation = invitationService.requirePublishedInvitationForRsvp(
                slug,
                false,
                accessToken,
                inviteToken
        );
        return MediaListResponse.from(mediaFileRepository.findByInvitationIdOrderBySortOrderAscCreatedAtAsc(invitation.getId()));
    }

    @Transactional
    public MediaResponse replace(
            Authentication authentication,
            Long invitationId,
            Long mediaId,
            MultipartFile file
    ) {
        invitationService.requireOwnedInvitationEntity(authentication, invitationId);
        MediaFile mediaFile = requireMedia(invitationId, mediaId);
        validateFile(file, mediaFile.getMediaType());
        StorageUploadResult upload = storageService.upload(file, mediaFile.getMediaType(), invitationId);
        deleteStorageBestEffort(mediaFile);
        applyUpload(mediaFile, file, upload);
        return MediaResponse.from(mediaFileRepository.save(mediaFile));
    }

    @Transactional
    public void delete(Authentication authentication, Long invitationId, Long mediaId) {
        invitationService.requireOwnedInvitationEntity(authentication, invitationId);
        MediaFile mediaFile = requireMedia(invitationId, mediaId);
        deleteStorageBestEffort(mediaFile);
        mediaFileRepository.delete(mediaFile);
    }

    private MediaFile requireMedia(Long invitationId, Long mediaId) {
        return mediaFileRepository.findByIdAndInvitationId(mediaId, invitationId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Media file not found"));
    }

    private void deleteExistingSingleton(Long invitationId, MediaType mediaType) {
        List<MediaFile> existing = mediaFileRepository.findAllByInvitationIdAndMediaType(invitationId, mediaType);
        for (MediaFile mediaFile : existing) {
            deleteStorageBestEffort(mediaFile);
            mediaFileRepository.delete(mediaFile);
        }
    }

    private MediaFile store(
            UserInvitation invitation,
            MultipartFile file,
            MediaType mediaType,
            Integer sortOrder,
            boolean cover
    ) {
        StorageUploadResult upload = storageService.upload(file, mediaType, invitation.getId());
        MediaFile mediaFile = new MediaFile();
        mediaFile.setInvitation(invitation);
        mediaFile.setMediaType(mediaType);
        mediaFile.setSortOrder(sortOrder);
        mediaFile.setCover(cover);
        applyUpload(mediaFile, file, upload);
        return mediaFile;
    }

    private void applyUpload(MediaFile mediaFile, MultipartFile file, StorageUploadResult upload) {
        mediaFile.setFileUrl(upload.fileUrl());
        mediaFile.setPublicId(upload.publicId());
        mediaFile.setStorageProvider(upload.storageProvider());
        mediaFile.setFileSize(file.getSize());
        mediaFile.setMimeType(normalizedContentType(file));
        mediaFile.setOriginalFilename(safeOriginalFilename(file.getOriginalFilename()));
    }

    private void validateFile(MultipartFile file, MediaType mediaType) {
        if (file == null || file.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Uploaded file is empty");
        }

        Long maxSize = MAX_FILE_SIZES.get(mediaType);
        if (maxSize != null && file.getSize() > maxSize) {
            throw new ApiException(HttpStatus.CONTENT_TOO_LARGE, maxSizeMessage(mediaType));
        }

        String originalFilename = safeOriginalFilename(file.getOriginalFilename());
        String extension = extension(originalFilename);
        if (EXECUTABLE_EXTENSIONS.contains(extension)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Executable files are not allowed");
        }
        if (!ALLOWED_EXTENSIONS.get(mediaType).contains(extension)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Uploaded file extension is not allowed for " + mediaType.name());
        }

        String contentType = normalizedContentType(file);
        if (!ALLOWED_CONTENT_TYPES.get(mediaType).contains(contentType)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Uploaded file type is not allowed for " + mediaType.name());
        }
        if (!CONTENT_TYPES_BY_EXTENSION.getOrDefault(extension, Set.of()).contains(contentType)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Uploaded file extension does not match its content type");
        }
    }

    private String maxSizeMessage(MediaType mediaType) {
        return switch (mediaType) {
            case COVER_IMAGE, GALLERY_IMAGE, PROFILE_IMAGE -> "Image file must be 5MB or smaller";
            case VIDEO -> "Video file must be 50MB or smaller";
            case BACKGROUND_MUSIC -> "Background music file must be 15MB or smaller";
        };
    }

    private String safeOriginalFilename(String originalFilename) {
        if (originalFilename == null || originalFilename.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Uploaded file name is required");
        }
        String filename = originalFilename.trim();
        if (filename.contains("/") || filename.contains("\\") || filename.contains("..")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Uploaded file name is invalid");
        }
        if (filename.length() > 255 || filename.chars().anyMatch(Character::isISOControl)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Uploaded file name is invalid");
        }
        return filename;
    }

    private String normalizedContentType(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType == null || contentType.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Uploaded file content type is required");
        }
        return contentType.trim().toLowerCase(Locale.ROOT);
    }

    private String extension(String filename) {
        int index = filename.lastIndexOf('.');
        if (index < 0 || index == filename.length() - 1) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Uploaded file extension is required");
        }
        return filename.substring(index).toLowerCase(Locale.ROOT);
    }

    private void deleteStorageBestEffort(MediaFile mediaFile) {
        try {
            storageService.delete(mediaFile.getPublicId(), mediaFile.getMediaType());
        } catch (RuntimeException exception) {
            log.warn("Could not delete stored media publicId={}", mediaFile.getPublicId(), exception);
        }
    }
}
