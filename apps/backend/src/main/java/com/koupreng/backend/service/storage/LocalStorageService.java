package com.koupreng.backend.service.storage;

import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.config.StorageProperties;
import com.koupreng.backend.enums.MediaType;
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
    private final String publicBaseUrl;

    public LocalStorageService(StorageProperties storageProperties) {
        this.uploadRoot = Path.of(storageProperties.getLocal().getUploadDir()).toAbsolutePath().normalize();
        this.publicBaseUrl = trimTrailingSlash(storageProperties.getLocal().getPublicBaseUrl());
    }

    @Override
    public StorageUploadResult upload(MultipartFile file, MediaType mediaType, Long invitationId) {
        String extension = extension(file.getOriginalFilename());
        String typeFolder = mediaType.name().toLowerCase(Locale.ROOT);
        String filename = UUID.randomUUID() + extension;
        String publicId = "invitations/%d/%s/%s".formatted(invitationId, typeFolder, filename);
        Path target = uploadRoot.resolve(publicId.replace("/", java.io.File.separator)).normalize();

        if (!target.startsWith(uploadRoot)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Upload path is invalid");
        }

        try {
            Files.createDirectories(target.getParent());
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, target, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException exception) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Uploaded file could not be stored");
        }

        return new StorageUploadResult(publicBaseUrl + "/" + publicId, publicId, providerName());
    }

    @Override
    public void delete(String publicId, MediaType mediaType) {
        if (publicId == null || publicId.isBlank()) {
            return;
        }

        Path target = uploadRoot.resolve(publicId.replace("/", java.io.File.separator)).normalize();
        if (!target.startsWith(uploadRoot)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Stored file path is invalid");
        }

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
