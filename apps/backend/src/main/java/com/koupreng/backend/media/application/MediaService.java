package com.koupreng.backend.media.application;

import com.koupreng.backend.invitation.application.EventAccessPolicy.Permission;
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
import com.koupreng.backend.invitation.infrastructure.persistence.UserInvitationRepository;
import com.koupreng.backend.shared.security.ApiSecurityProperties;
import com.koupreng.backend.shared.security.FileUploadValidator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;

@Service
public class MediaService {

    private static final Logger log = LoggerFactory.getLogger(MediaService.class);

    private static final long MB = 1024L * 1024L;
    private static final Map<MediaType, Set<String>> ALLOWED_CONTENT_TYPES = Map.of(
            MediaType.COVER_IMAGE, Set.of("image/jpeg", "image/png", "image/webp"),
            MediaType.GALLERY_IMAGE, Set.of("image/jpeg", "image/png", "image/webp"),
            MediaType.TICKET_IMAGE, Set.of("image/jpeg", "image/png", "image/webp"),
            MediaType.PRE_WEDDING_VIDEO, Set.of("video/mp4", "video/webm"),
            MediaType.VIDEO, Set.of("video/mp4", "video/webm"),
            MediaType.BACKGROUND_MUSIC, Set.of("audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg")
    );
    private static final Map<MediaType, Set<String>> ALLOWED_EXTENSIONS = Map.of(
            MediaType.COVER_IMAGE, Set.of(".jpg", ".jpeg", ".png", ".webp"),
            MediaType.GALLERY_IMAGE, Set.of(".jpg", ".jpeg", ".png", ".webp"),
            MediaType.TICKET_IMAGE, Set.of(".jpg", ".jpeg", ".png", ".webp"),
            MediaType.PRE_WEDDING_VIDEO, Set.of(".mp4", ".webm"),
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
            MediaType.TICKET_IMAGE, 5L * MB,
            MediaType.PRE_WEDDING_VIDEO, 50L * MB,
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

    @org.springframework.beans.factory.annotation.Autowired
    private com.koupreng.backend.entitlement.application.EntitlementService entitlements;
    @org.springframework.beans.factory.annotation.Autowired
    private com.koupreng.backend.invitation.application.PreWeddingVideoPolicy cinematic;
    @org.springframework.beans.factory.annotation.Autowired
    private com.koupreng.backend.ticket.infrastructure.persistence.InvitationTicketDesignRepository ticketDesigns;

    private final MediaFileRepository mediaFileRepository;
    private final InvitationService invitationService;
    private final StorageService storageService;
    private final UserInvitationRepository invitationRepository;
    private final FileUploadValidator fileUploadValidator;
    private final ApiSecurityProperties.Upload uploadProperties;

    @org.springframework.beans.factory.annotation.Autowired
    public MediaService(
            MediaFileRepository mediaFileRepository,
            InvitationService invitationService,
            StorageService storageService,
            UserInvitationRepository invitationRepository,
            FileUploadValidator fileUploadValidator,
            ApiSecurityProperties apiSecurityProperties
    ) {
        this.mediaFileRepository = mediaFileRepository;
        this.invitationService = invitationService;
        this.storageService = storageService;
        this.invitationRepository = invitationRepository;
        this.fileUploadValidator = fileUploadValidator;
        this.uploadProperties = apiSecurityProperties.getUpload();
    }

    public MediaService(MediaFileRepository mediaFileRepository, InvitationService invitationService, StorageService storageService) {
        this(mediaFileRepository, invitationService, storageService, null,
                new FileUploadValidator(new ApiSecurityProperties()), new ApiSecurityProperties());
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public MediaResponse uploadCover(Authentication authentication, Long invitationId, MultipartFile file) {
        return uploadSingleton(authentication, invitationId, file, MediaType.COVER_IMAGE, true);
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public List<MediaResponse> uploadGallery(
            Authentication authentication,
            Long invitationId,
            List<MultipartFile> files,
            Integer sortOrder
    ) {
        UserInvitation invitation = requireMutableInvitation(authentication, invitationId);
        if (files == null || files.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "At least one gallery image is required");
        }
        if (uploadProperties.isEnabled() && files.size() > uploadProperties.getMaxFiles()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Too many files in one upload");
        }
        long existingCount = mediaFileRepository.countByInvitationIdAndMediaType(invitationId, MediaType.GALLERY_IMAGE);
        int galleryLimit = uploadProperties.getMaxGalleryFilesPerInvitation();
        if (galleryLimit > 0 && existingCount + files.size() > galleryLimit) {
            throw new ApiException(HttpStatus.CONFLICT, "Invitation gallery limit reached");
        }
        // Validate the whole batch before any external upload can occur.
        files.forEach(file -> validateFile(file, MediaType.GALLERY_IMAGE));

        int nextSortOrder = sortOrder == null
                ? Math.toIntExact(existingCount)
                : sortOrder;
        return storageMutation(changes -> {
            List<MediaResponse> responses = new ArrayList<>();
            int index = nextSortOrder;
            for (MultipartFile file : files) {
                MediaFile mediaFile = store(invitation, file, MediaType.GALLERY_IMAGE, index++, false, changes);
                responses.add(MediaResponse.from(mediaFileRepository.save(mediaFile)));
            }
            return responses;
        });
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public MediaResponse uploadTicketImage(Authentication authentication, Long invitationId, MultipartFile file) {
        UserInvitation ownerEvent = invitationService.requireOwnedInvitationEntity(authentication, invitationId);
        entitlements.requireFeature(ownerEvent.getUser(), com.koupreng.backend.entitlement.application.EntitlementService.Feature.QR_INVITATIONS);
        return uploadPurpose(authentication, invitationId, file, MediaType.TICKET_IMAGE, 12);
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public MediaResponse uploadPreWeddingVideo(Authentication authentication, Long invitationId, MultipartFile file) {
        UserInvitation event = invitationService.requireEventPermission(authentication, invitationId, Permission.MANAGE_INVITATION);
        entitlements.requireFeature(event.getUser(), com.koupreng.backend.entitlement.application.EntitlementService.Feature.PRE_WEDDING_VIDEO);
        return uploadPurpose(authentication, invitationId, file, MediaType.PRE_WEDDING_VIDEO, 3);
    }

    private MediaResponse uploadPurpose(Authentication authentication, Long invitationId, MultipartFile file, MediaType type, int limit) {
        UserInvitation event = requireMutableInvitation(authentication, invitationId);
        validateFile(file, type);
        if (mediaFileRepository.countByInvitationIdAndMediaType(invitationId, type) >= limit)
            throw new ApiException(HttpStatus.CONFLICT, "Remove an unused asset before uploading another");
        return storageMutation(changes -> MediaResponse.from(mediaFileRepository.save(store(event, file, type, 0, false, changes))));
    }

    public record PrivateContent(org.springframework.core.io.Resource resource, String mimeType) { }

    @Transactional(readOnly = true)
    public PrivateContent ownerCinematicContent(Authentication auth, Long invitationId, Long mediaId) {
        var event = invitationService.requireEventPermission(auth, invitationId, Permission.MANAGE_INVITATION);
        entitlements.requireFeature(event.getUser(), com.koupreng.backend.entitlement.application.EntitlementService.Feature.PRE_WEDDING_VIDEO);
        return privateContent(invitationId, mediaId);
    }

    @Transactional(readOnly = true)
    public PrivateContent publicCinematicContent(String slug, String accessToken, String inviteToken, Long mediaId) {
        UserInvitation event = invitationService.requirePublicInvitationForView(slug, inviteToken, accessToken);
        var authorized = cinematic.playback(event);
        if (authorized == null || !authorized.videoMediaId().equals(mediaId))
            throw new ApiException(HttpStatus.NOT_FOUND, "Media file not found");
        return privateContent(event.getId(), mediaId);
    }

    private PrivateContent privateContent(Long invitationId, Long mediaId) {
        var file = requireMedia(invitationId, mediaId);
        if (file.getMediaType() != MediaType.PRE_WEDDING_VIDEO) throw new ApiException(HttpStatus.NOT_FOUND, "Media file not found");
        return new PrivateContent(storageService.readPrivate(file.getPublicId(), file.getMimeType()), file.getMimeType());
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public MediaResponse uploadVideo(Authentication authentication, Long invitationId, MultipartFile file) {
        return uploadSingleton(authentication, invitationId, file, MediaType.VIDEO, false);
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public MediaResponse uploadMusic(Authentication authentication, Long invitationId, MultipartFile file) {
        return uploadSingleton(authentication, invitationId, file, MediaType.BACKGROUND_MUSIC, false);
    }

    @Transactional(readOnly = true)
    public MediaListResponse list(Authentication authentication, Long invitationId) {
        invitationService.requireEventPermission(authentication, invitationId, Permission.VIEW_EVENT);
        return MediaListResponse.from(mediaFileRepository.findByInvitationIdOrderBySortOrderAscCreatedAtAsc(invitationId));
    }

    @Transactional(readOnly = true)
    public MediaListResponse listPublic(String slug, String token) {
        UserInvitation invitation = invitationService.requirePublicInvitationForView(slug, token);
        return MediaListResponse.from(mediaFileRepository.findByInvitationIdOrderBySortOrderAscCreatedAtAsc(invitation.getId()).stream()
                .filter(file -> file.getMediaType() != MediaType.PRE_WEDDING_VIDEO && file.getMediaType() != MediaType.TICKET_IMAGE).toList());
    }

    @Transactional(readOnly = true)
    public MediaListResponse listPublic(String slug, String accessToken, String inviteToken) {
        UserInvitation invitation = invitationService.requirePublishedInvitationForRsvp(
                slug,
                false,
                accessToken,
                inviteToken
        );
        return MediaListResponse.from(mediaFileRepository.findByInvitationIdOrderBySortOrderAscCreatedAtAsc(invitation.getId()).stream()
                .filter(file -> file.getMediaType() != MediaType.PRE_WEDDING_VIDEO && file.getMediaType() != MediaType.TICKET_IMAGE).toList());
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public MediaResponse replace(
            Authentication authentication,
            Long invitationId,
            Long mediaId,
            MultipartFile file
    ) {
        UserInvitation event = requireMutableInvitation(authentication, invitationId);
        MediaFile mediaFile = requireMedia(invitationId, mediaId);
        if (mediaFile.getMediaType() == MediaType.TICKET_IMAGE) invitationService.requireOwnedInvitationEntity(authentication, invitationId);
        if (mediaFile.getMediaType() == MediaType.PRE_WEDDING_VIDEO)
            entitlements.requireFeature(event.getUser(), com.koupreng.backend.entitlement.application.EntitlementService.Feature.PRE_WEDDING_VIDEO);
        if (mediaFile.getMediaType() == MediaType.TICKET_IMAGE)
            entitlements.requireFeature(event.getUser(), com.koupreng.backend.entitlement.application.EntitlementService.Feature.QR_INVITATIONS);
        validateFile(file, mediaFile.getMediaType());
        return storageMutation(changes -> {
            StorageUploadResult upload = changes.upload(file, mediaFile.getMediaType(), invitationId);
            changes.removeAfterCommit(mediaFile);
            applyUpload(mediaFile, file, upload);
            return MediaResponse.from(mediaFileRepository.save(mediaFile));
        });
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void delete(Authentication authentication, Long invitationId, Long mediaId) {
        UserInvitation event = requireMutableInvitation(authentication, invitationId);
        MediaFile mediaFile = requireMedia(invitationId, mediaId);
        if (mediaFile.getMediaType() == MediaType.TICKET_IMAGE) invitationService.requireOwnedInvitationEntity(authentication, invitationId);
        if (mediaFile.getMediaType() == MediaType.TICKET_IMAGE && ticketDesigns != null) {
            ticketDesigns.findById(invitationId).ifPresent(design -> requireUnreferenced(design.getDesignJson(), mediaId, "coverMediaId", "backgroundMediaId"));
        }
        if (mediaFile.getMediaType() == MediaType.PRE_WEDDING_VIDEO)
            requireUnreferenced(event.getContentJson(), mediaId, "preWeddingVideo.videoMediaId");
        storageMutation(changes -> {
            changes.removeAfterCommit(mediaFile);
            mediaFileRepository.delete(mediaFile);
            return null;
        });
    }

    private MediaFile requireMedia(Long invitationId, Long mediaId) {
        return mediaFileRepository.findByIdAndInvitationId(mediaId, invitationId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Media file not found"));
    }

    private void requireUnreferenced(String content, Long mediaId, String... paths) {
        if (content == null || content.isBlank()) return;
        try {
            var json = new com.fasterxml.jackson.databind.ObjectMapper().readTree(content);
            for (String path : paths) {
                var value = json;
                for (String key : path.split("\\.")) value = value.path(key);
                if (value.isIntegralNumber() && value.asLong() == mediaId)
                    throw new ApiException(HttpStatus.CONFLICT, "Remove this asset from the saved design before deleting it");
            }
        } catch (com.fasterxml.jackson.core.JsonProcessingException malformed) {
            throw new ApiException(HttpStatus.CONFLICT, "The saved design must be repaired before deleting media");
        }
    }

    private MediaResponse uploadSingleton(Authentication authentication, Long invitationId, MultipartFile file,
            MediaType mediaType, boolean cover) {
        UserInvitation invitation = requireMutableInvitation(authentication, invitationId);
        validateFile(file, mediaType);
        return storageMutation(changes -> {
            MediaFile mediaFile = store(invitation, file, mediaType, 0, cover, changes);
            deleteExistingSingleton(invitationId, mediaType, changes);
            return MediaResponse.from(mediaFileRepository.save(mediaFile));
        });
    }

    private UserInvitation requireMutableInvitation(Authentication authentication, Long invitationId) {
        UserInvitation invitation = invitationService.requireEventPermission(authentication, invitationId, Permission.MANAGE_INVITATION);
        if (invitationRepository == null) {
            return invitation;
        }
        return invitationRepository.findForUpdateByIdAndUserId(invitationId, invitation.getUser().getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Invitation not found"));
    }

    private void deleteExistingSingleton(Long invitationId, MediaType mediaType, StorageChanges changes) {
        List<MediaFile> existing = mediaFileRepository.findAllByInvitationIdAndMediaType(invitationId, mediaType);
        for (MediaFile mediaFile : existing) {
            changes.removeAfterCommit(mediaFile);
            mediaFileRepository.delete(mediaFile);
        }
    }

    private MediaFile store(
            UserInvitation invitation,
            MultipartFile file,
            MediaType mediaType,
            Integer sortOrder,
            boolean cover,
            StorageChanges changes
    ) {
        StorageUploadResult upload = changes.upload(file, mediaType, invitation.getId());
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
        fileUploadValidator.validateMedia(file);
    }

    private String maxSizeMessage(MediaType mediaType) {
        return switch (mediaType) {
            case COVER_IMAGE, GALLERY_IMAGE, TICKET_IMAGE, PROFILE_IMAGE -> "Image file must be 5MB or smaller";
            case VIDEO, PRE_WEDDING_VIDEO -> "Video file must be 50MB or smaller";
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

    private void deleteStorageBestEffort(StorageObject object) {
        try {
            storageService.delete(object.publicId(), object.mediaType());
        } catch (RuntimeException exception) {
            log.warn("Could not delete stored media publicId={}", object.publicId(), exception);
        }
    }

    private <T> T storageMutation(Function<StorageChanges, T> mutation) {
        StorageChanges changes = new StorageChanges();
        boolean transactional = TransactionSynchronizationManager.isActualTransactionActive()
                && TransactionSynchronizationManager.isSynchronizationActive();
        if (transactional) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override public void afterCommit() { changes.oldObjects.forEach(MediaService.this::deleteStorageBestEffort); }
                @Override public void afterCompletion(int status) {
                    if (status == STATUS_ROLLED_BACK) {
                        changes.stagedObjects.forEach(MediaService.this::deleteStorageBestEffort);
                    } else if (status == STATUS_UNKNOWN) {
                        log.warn("Media transaction completion is unknown; staged objects retained for reconciliation");
                    }
                }
            });
        }
        try {
            T response = mutation.apply(changes);
            if (!transactional) { changes.oldObjects.forEach(this::deleteStorageBestEffort); }
            return response;
        } catch (RuntimeException exception) {
            if (!transactional) { changes.stagedObjects.forEach(this::deleteStorageBestEffort); }
            throw exception;
        }
    }

    private record StorageObject(String publicId, MediaType mediaType) { }

    private class StorageChanges {
        private final List<StorageObject> stagedObjects = new ArrayList<>();
        private final List<StorageObject> oldObjects = new ArrayList<>();

        StorageUploadResult upload(MultipartFile file, MediaType type, Long invitationId) {
            StorageUploadResult upload = storageService.upload(file, type, invitationId);
            if (upload != null && upload.publicId() != null && !upload.publicId().isBlank()) {
                stagedObjects.add(new StorageObject(upload.publicId(), type));
            }
            if (upload == null || (type != MediaType.PRE_WEDDING_VIDEO && (upload.fileUrl() == null || upload.fileUrl().isBlank()))
                    || upload.publicId() == null || upload.publicId().isBlank()
                    || upload.storageProvider() == null || upload.storageProvider().isBlank()) {
                throw new ApiException(HttpStatus.BAD_GATEWAY, "Storage upload did not return a usable media object");
            }
            return upload;
        }

        void removeAfterCommit(MediaFile file) {
            StorageObject old = new StorageObject(file.getPublicId(), file.getMediaType());
            if (!stagedObjects.contains(old)) {
                oldObjects.add(old);
            }
        }
    }
}
