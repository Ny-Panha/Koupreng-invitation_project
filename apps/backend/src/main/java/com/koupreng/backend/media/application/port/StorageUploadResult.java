package com.koupreng.backend.media.application.port;

public record StorageUploadResult(
        String fileUrl,
        String publicId,
        String storageProvider
) {
}
