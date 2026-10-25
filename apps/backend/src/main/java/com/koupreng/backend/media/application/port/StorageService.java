package com.koupreng.backend.media.application.port;

import com.koupreng.backend.media.domain.MediaType;
import org.springframework.web.multipart.MultipartFile;

public interface StorageService {

    StorageUploadResult upload(MultipartFile file, MediaType mediaType, Long invitationId);

    void delete(String publicId, MediaType mediaType);

    String providerName();

    default org.springframework.core.io.Resource readPrivate(String publicId) {
        throw new com.koupreng.backend.shared.exception.ApiException(org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE,
                "Private cinematic storage is not configured for this provider");
    }

    default org.springframework.core.io.Resource readPrivate(String publicId, String mimeType) {
        return readPrivate(publicId);
    }
}
