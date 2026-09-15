package com.koupreng.backend.security;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

import com.koupreng.backend.shared.exception.ApiException;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

@Component
public class FileUploadValidator {

    private static final long MB = 1024L * 1024L;
    private static final Set<String> IMAGE_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );
    private static final Set<String> IMAGE_EXTENSIONS = Set.of(".jpg", ".jpeg", ".png", ".webp");
    private static final Pattern SAFE_FILENAME = Pattern.compile("[\\p{Alnum}][\\p{Alnum} ._-]{0,180}");
    private static final Map<String, byte[][]> SIGNATURES = Map.of(
            "image/jpeg", new byte[][]{{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF}},
            "image/png", new byte[][]{{(byte) 0x89, 0x50, 0x4E, 0x47}},
            "application/pdf", new byte[][]{{0x25, 0x50, 0x44, 0x46}}
    );
    private static final Map<String, Set<String>> EXTENSION_CONTENT_TYPES = Map.ofEntries(
            Map.entry(".jpg", Set.of("image/jpeg")),
            Map.entry(".jpeg", Set.of("image/jpeg")),
            Map.entry(".png", Set.of("image/png")),
            Map.entry(".webp", Set.of("image/webp")),
            Map.entry(".pdf", Set.of("application/pdf")),
            Map.entry(".mp4", Set.of("video/mp4")),
            Map.entry(".webm", Set.of("video/webm")),
            Map.entry(".mp3", Set.of("audio/mpeg", "audio/mp3")),
            Map.entry(".wav", Set.of("audio/wav")),
            Map.entry(".ogg", Set.of("audio/ogg")),
            Map.entry(".csv", Set.of("text/csv", "application/csv", "application/vnd.ms-excel")),
            Map.entry(".xlsx", Set.of(
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    "application/octet-stream"
            ))
    );
    private static final Map<String, Long> CONTENT_TYPE_MAX_SIZES = Map.ofEntries(
            Map.entry("image/jpeg", 5L * MB),
            Map.entry("image/png", 5L * MB),
            Map.entry("image/webp", 5L * MB),
            Map.entry("application/pdf", 5L * MB),
            Map.entry("video/mp4", 50L * MB),
            Map.entry("video/webm", 50L * MB),
            Map.entry("audio/mpeg", 15L * MB),
            Map.entry("audio/mp3", 15L * MB),
            Map.entry("audio/wav", 15L * MB),
            Map.entry("audio/ogg", 15L * MB),
            Map.entry("text/csv", 5L * MB),
            Map.entry("application/csv", 5L * MB),
            Map.entry("application/vnd.ms-excel", 5L * MB),
            Map.entry("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 5L * MB),
            Map.entry("application/octet-stream", 5L * MB)
    );

    private final ApiSecurityProperties.Upload properties;

    public FileUploadValidator(ApiSecurityProperties apiSecurityProperties) {
        this.properties = apiSecurityProperties.getUpload();
    }

    public void validate(MultipartFile file) {
        if (!properties.isEnabled()) {
            return;
        }

        if (file == null || file.isEmpty()) {
            throw badRequest("Uploaded file is empty");
        }

        String filename = safeFilename(file.getOriginalFilename());
        String extension = extension(filename);
        if (".svg".equalsIgnoreCase(extension)) {
            throw badRequest("SVG uploads are not permitted");
        }
        if (!properties.getAllowedExtensions().contains(extension)) {
            throw badRequest("Uploaded file extension is not allowed");
        }

        String contentType = normalizedContentType(file.getContentType());
        if (contentType.contains("svg")) {
            throw badRequest("SVG uploads are not permitted");
        }
        if (!properties.getAllowedContentTypes().contains(contentType)) {
            throw badRequest("Uploaded file type is not allowed");
        }

        long contentTypeLimit = CONTENT_TYPE_MAX_SIZES.getOrDefault(
                contentType,
                properties.getMaxFileSizeBytes()
        );
        long effectiveLimit = Math.min(properties.getMaxFileSizeBytes(), contentTypeLimit);
        if (file.getSize() > effectiveLimit) {
            throw new ApiException(HttpStatus.CONTENT_TOO_LARGE, "Uploaded file is too large");
        }

        if (!contentTypeMatchesExtension(extension, contentType)) {
            throw badRequest("Uploaded file extension does not match its content type");
        }

        byte[] header = readHeader(file);
        if (looksLikeSvg(header)) {
            throw badRequest("SVG uploads are not permitted");
        }

        if (properties.isVerifySignatures() && !hasExpectedSignature(header, contentType)) {
            throw badRequest("Uploaded file content does not match its declared type");
        }
    }

    public void requireImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw badRequest("Uploaded file is empty");
        }
        String filename = safeFilename(file.getOriginalFilename());
        String extension = extension(filename);
        String contentType = normalizedContentType(file.getContentType());
        if (".svg".equalsIgnoreCase(extension) || contentType.contains("svg")) {
            throw badRequest("SVG uploads are not permitted");
        }
        if (!IMAGE_EXTENSIONS.contains(extension) || !IMAGE_CONTENT_TYPES.contains(contentType)) {
            throw badRequest("Profile image must be a JPEG, PNG, or WebP image");
        }
        byte[] header = readHeader(file);
        if (looksLikeSvg(header)) {
            throw badRequest("SVG uploads are not permitted");
        }
        if (properties.isVerifySignatures() && !hasExpectedSignature(header, contentType)) {
            throw badRequest("Uploaded file content does not match its declared type");
        }
    }

    private String safeFilename(String originalFilename) {
        if (originalFilename == null || originalFilename.isBlank()) {
            throw badRequest("Uploaded file name is required");
        }

        String filename = originalFilename.trim();
        if (filename.contains("/") || filename.contains("\\") || filename.contains("..")) {
            throw badRequest("Uploaded file name is invalid");
        }

        if (!SAFE_FILENAME.matcher(filename).matches()) {
            throw badRequest("Uploaded file name contains unsupported characters");
        }

        return filename;
    }

    private String extension(String filename) {
        int index = filename.lastIndexOf('.');
        if (index < 0 || index == filename.length() - 1) {
            throw badRequest("Uploaded file extension is required");
        }
        return filename.substring(index).toLowerCase(Locale.ROOT);
    }

    private String normalizedContentType(String contentType) {
        if (contentType == null || contentType.isBlank()) {
            throw badRequest("Uploaded file content type is required");
        }
        return contentType.trim().toLowerCase(Locale.ROOT);
    }

    private boolean looksLikeSvg(byte[] header) {
        if (header == null || header.length == 0) {
            return false;
        }
        String preview = new String(header, StandardCharsets.UTF_8).toLowerCase(Locale.ROOT);
        return preview.contains("<svg") || preview.contains("<?xml") || preview.contains("<!doctype svg");
    }

    private boolean hasExpectedSignature(byte[] header, String contentType) {
        if ("image/webp".equals(contentType)) {
            return isWebp(header);
        }

        if ("video/mp4".equals(contentType)) {
            return hasAsciiAt(header, 4, "ftyp");
        }
        if ("video/webm".equals(contentType)) {
            return startsWith(header, new byte[]{0x1A, 0x45, (byte) 0xDF, (byte) 0xA3});
        }
        if ("audio/mpeg".equals(contentType) || "audio/mp3".equals(contentType)) {
            return hasAsciiAt(header, 0, "ID3")
                    || (header.length >= 2 && (header[0] & 0xFF) == 0xFF && (header[1] & 0xE0) == 0xE0);
        }
        if ("audio/wav".equals(contentType)) {
            return hasAsciiAt(header, 0, "RIFF") && hasAsciiAt(header, 8, "WAVE");
        }
        if ("audio/ogg".equals(contentType)) {
            return hasAsciiAt(header, 0, "OggS");
        }
        if ("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet".equals(contentType)
                || "application/octet-stream".equals(contentType)) {
            return startsWith(header, new byte[]{0x50, 0x4B});
        }
        if ("text/csv".equals(contentType)
                || "application/csv".equals(contentType)
                || "application/vnd.ms-excel".equals(contentType)) {
            return looksLikeText(header);
        }

        byte[][] allowedSignatures = SIGNATURES.get(contentType);
        if (allowedSignatures == null) {
            return false;
        }

        for (byte[] signature : allowedSignatures) {
            if (startsWith(header, signature)) {
                return true;
            }
        }
        return false;
    }

    private boolean contentTypeMatchesExtension(String extension, String contentType) {
        Set<String> allowedContentTypes = EXTENSION_CONTENT_TYPES.get(extension);
        return allowedContentTypes != null && allowedContentTypes.contains(contentType);
    }

    private byte[] readHeader(MultipartFile file) {
        try (InputStream inputStream = file.getInputStream()) {
            return inputStream.readNBytes(16);
        } catch (IOException exception) {
            throw badRequest("Uploaded file could not be read");
        }
    }

    private boolean startsWith(byte[] value, byte[] prefix) {
        if (value.length < prefix.length) {
            return false;
        }

        for (int index = 0; index < prefix.length; index++) {
            if (value[index] != prefix[index]) {
                return false;
            }
        }
        return true;
    }

    private boolean hasAsciiAt(byte[] value, int offset, String expected) {
        if (value.length < offset + expected.length()) {
            return false;
        }
        for (int index = 0; index < expected.length(); index++) {
            if (value[offset + index] != (byte) expected.charAt(index)) {
                return false;
            }
        }
        return true;
    }

    private boolean looksLikeText(byte[] value) {
        if (value.length == 0) {
            return false;
        }
        for (byte current : value) {
            int character = current & 0xFF;
            if (character == 0) {
                return false;
            }
            if (character < 0x20 && character != '\n' && character != '\r' && character != '\t') {
                return false;
            }
        }
        return true;
    }

    private boolean isWebp(byte[] value) {
        return value.length >= 12
                && value[0] == 0x52
                && value[1] == 0x49
                && value[2] == 0x46
                && value[3] == 0x46
                && value[8] == 0x57
                && value[9] == 0x45
                && value[10] == 0x42
                && value[11] == 0x50;
    }

    private ApiException badRequest(String message) {
        return new ApiException(HttpStatus.BAD_REQUEST, message);
    }
}
