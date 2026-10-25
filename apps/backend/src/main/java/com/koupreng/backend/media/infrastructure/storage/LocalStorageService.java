package com.koupreng.backend.media.infrastructure.storage;

import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.media.infrastructure.config.StorageProperties;
import com.koupreng.backend.media.application.port.StorageService;
import com.koupreng.backend.media.application.port.StorageUploadResult;
import com.koupreng.backend.media.domain.MediaType;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.UUID;

@Service
@ConditionalOnProperty(name = "app.storage.provider", havingValue = "local", matchIfMissing = true)
public class LocalStorageService implements StorageService {

    private final Path uploadRoot;
    private final Path privateRoot;
    private final String publicBaseUrl;

    public LocalStorageService(StorageProperties storageProperties) {
        this.uploadRoot = Path.of(storageProperties.getLocal().getUploadDir()).toAbsolutePath().normalize();
        String configured = storageProperties.getLocal().getPrivateUploadDir();
        this.privateRoot = configured == null || configured.isBlank() ? uploadRoot.resolveSibling(uploadRoot.getFileName() + "-private")
                : Path.of(configured).toAbsolutePath().normalize();
        if (privateRoot.startsWith(uploadRoot) || uploadRoot.startsWith(privateRoot))
            throw new IllegalStateException("Private media storage must be separate from public uploads");
        this.publicBaseUrl = trimTrailingSlash(storageProperties.getLocal().getPublicBaseUrl());
    }

    @Override
    public StorageUploadResult upload(MultipartFile file, MediaType mediaType, Long invitationId) {
        String extension = extension(file.getOriginalFilename());
        String typeFolder = mediaType.name().toLowerCase(Locale.ROOT);
        String filename = UUID.randomUUID() + extension;
        String publicId = "invitations/%d/%s/%s".formatted(invitationId, typeFolder, filename);
        if (mediaType == MediaType.PRE_WEDDING_VIDEO) publicId = ".private/" + publicId;
        Path target = storagePath(publicId);

        try {
            Files.createDirectories(target.getParent());
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, target, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException exception) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Uploaded file could not be stored");
        }

        return new StorageUploadResult(mediaType == MediaType.PRE_WEDDING_VIDEO ? null : publicBaseUrl + "/" + publicId, publicId, providerName());
    }

    @Override
    public void delete(String publicId, MediaType mediaType) {
        if (publicId == null || publicId.isBlank()) {
            return;
        }

        Path target = storagePath(publicId);

        try {
            Files.deleteIfExists(target);
        } catch (IOException exception) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Stored file could not be deleted");
        }
    }

    @Override
    public String providerName() {
        return "local";
    }

    @Override
    public org.springframework.core.io.Resource readPrivate(String publicId) {
        if (publicId == null || !publicId.startsWith(".private/invitations/"))
            throw new ApiException(HttpStatus.NOT_FOUND, "Media file not found");
        Path file = storagePath(publicId);
        if (!Files.isRegularFile(file))
            throw new ApiException(HttpStatus.NOT_FOUND, "Media file not found");
        return new org.springframework.core.io.FileSystemResource(file);
    }

    private Path storagePath(String publicId) {
        boolean hidden = publicId.startsWith(".private/");
        Path root = hidden ? privateRoot : uploadRoot;
        String relative = hidden ? publicId.substring(".private/".length()) : publicId;
        Path target = root.resolve(relative.replace("/", java.io.File.separator)).normalize();
        if (!target.startsWith(root)) throw new ApiException(HttpStatus.BAD_REQUEST, "Stored file path is invalid");
        return target;
    }

    private String extension(String filename) {
        if (filename == null) {
            return "";
        }
        int index = filename.lastIndexOf('.');
        return index < 0 ? "" : filename.substring(index).toLowerCase(Locale.ROOT);
    }

    private String trimTrailingSlash(String value) {
        if (value == null || value.isBlank()) {
            return "/uploads";
        }
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }
}
