package com.koupreng.backend.media.application.port;

import com.koupreng.backend.media.domain.MediaType;
import org.springframework.web.multipart.MultipartFile;

public interface StorageService {

    StorageUploadResult upload(MultipartFile file, MediaType mediaType, Long invitationId);

    void delete(String publicId, MediaType mediaType);

    String providerName();
}
