package com.koupreng.backend.media.infrastructure.storage;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.media.infrastructure.config.StorageProperties;
import com.koupreng.backend.media.application.port.StorageService;
import com.koupreng.backend.media.application.port.StorageUploadResult;
import com.koupreng.backend.media.domain.MediaType;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.Locale;
import java.util.UUID;

@Service
@ConditionalOnProperty(name = "app.storage.provider", havingValue = "cloudinary")
public class CloudinaryStorageService implements StorageService {

    private final StorageProperties.Cloudinary properties;
    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper;

    public CloudinaryStorageService(StorageProperties storageProperties, ObjectMapper objectMapper) {
        this.properties = storageProperties.getCloudinary();
        this.objectMapper = objectMapper;
    }

    @Override
    public StorageUploadResult upload(MultipartFile file, MediaType mediaType, Long invitationId) {
        validateConfigured();
        String resourceType = resourceType(mediaType);
        String timestamp = String.valueOf(Instant.now().getEpochSecond());
        String publicId = "%s/invitations/%d/%s/%s".formatted(
                trimSlashes(properties.getFolder()),
                invitationId,
                mediaType.name().toLowerCase(Locale.ROOT),
                UUID.randomUUID()
        );
        String signature = sha1("public_id=%s&timestamp=%s%s".formatted(publicId, timestamp, properties.getApiSecret()));
        String boundary = "----KouprengBoundary" + UUID.randomUUID().toString().replace("-", "");

        HttpRequest request;
        try {
            request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.cloudinary.com/v1_1/%s/%s/upload".formatted(
                            properties.getCloudName(),
                            resourceType
                    )))
                    .header("Content-Type", "multipart/form-data; boundary=" + boundary)
                    .POST(HttpRequest.BodyPublishers.ofByteArray(uploadBody(boundary, file, publicId, timestamp, signature)))
                    .build();
        } catch (IOException exception) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Uploaded file could not be read");
        }

        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new ApiException(HttpStatus.BAD_GATEWAY, "Cloud storage upload failed");
            }
            JsonNode json = objectMapper.readTree(response.body());
            String fileUrl = json.path("secure_url").asText(json.path("url").asText(null));
            String storedPublicId = json.path("public_id").asText(publicId);
            if (fileUrl == null || fileUrl.isBlank()) {
                throw new ApiException(HttpStatus.BAD_GATEWAY, "Cloud storage upload response is invalid");
            }
            return new StorageUploadResult(fileUrl, storedPublicId, providerName());
        } catch (IOException exception) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Cloud storage upload response could not be read");
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Cloud storage upload was interrupted");
        }
    }

    @Override
    public void delete(String publicId, MediaType mediaType) {
        if (publicId == null || publicId.isBlank()) {
            return;
        }
        validateConfigured();
        String resourceType = resourceType(mediaType);
        String timestamp = String.valueOf(Instant.now().getEpochSecond());
        String signature = sha1("public_id=%s&timestamp=%s%s".formatted(publicId, timestamp, properties.getApiSecret()));
        String boundary = "----KouprengBoundary" + UUID.randomUUID().toString().replace("-", "");

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.cloudinary.com/v1_1/%s/%s/destroy".formatted(
                        properties.getCloudName(),
                        resourceType
                )))
                .header("Content-Type", "multipart/form-data; boundary=" + boundary)
                .POST(HttpRequest.BodyPublishers.ofByteArray(destroyBody(boundary, publicId, timestamp, signature)))
                .build();

        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new ApiException(HttpStatus.BAD_GATEWAY, "Cloud storage delete failed");
            }
        } catch (IOException exception) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Cloud storage delete response could not be read");
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Cloud storage delete was interrupted");
        }
    }

    @Override
    public String providerName() {
        return "cloudinary";
    }

    private byte[] uploadBody(
            String boundary,
            MultipartFile file,
            String publicId,
            String timestamp,
            String signature
    ) throws IOException {
        ByteArrayOutputStream body = new ByteArrayOutputStream();
        writeFormField(body, boundary, "api_key", properties.getApiKey());
        writeFormField(body, boundary, "timestamp", timestamp);
        writeFormField(body, boundary, "public_id", publicId);
        writeFormField(body, boundary, "signature", signature);
        writeFileField(body, boundary, "file", file);
        writeClosingBoundary(body, boundary);
        return body.toByteArray();
    }

    private byte[] destroyBody(String boundary, String publicId, String timestamp, String signature) {
        ByteArrayOutputStream body = new ByteArrayOutputStream();
        writeFormField(body, boundary, "api_key", properties.getApiKey());
        writeFormField(body, boundary, "timestamp", timestamp);
        writeFormField(body, boundary, "public_id", publicId);
        writeFormField(body, boundary, "signature", signature);
        writeClosingBoundary(body, boundary);
        return body.toByteArray();
    }

    private void writeFormField(ByteArrayOutputStream body, String boundary, String name, String value) {
        body.writeBytes(("--" + boundary + "\r\n").getBytes(StandardCharsets.UTF_8));
        body.writeBytes(("Content-Disposition: form-data; name=\"" + name + "\"\r\n\r\n")
                .getBytes(StandardCharsets.UTF_8));
        body.writeBytes((value == null ? "" : value).getBytes(StandardCharsets.UTF_8));
        body.writeBytes("\r\n".getBytes(StandardCharsets.UTF_8));
    }

    private void writeFileField(
            ByteArrayOutputStream body,
            String boundary,
            String name,
            MultipartFile file
    ) throws IOException {
        String filename = "upload" + extension(file.getOriginalFilename());
        body.writeBytes(("--" + boundary + "\r\n").getBytes(StandardCharsets.UTF_8));
        body.writeBytes(("Content-Disposition: form-data; name=\"" + name + "\"; filename=\"" + filename + "\"\r\n")
                .getBytes(StandardCharsets.UTF_8));
        body.writeBytes(("Content-Type: " + file.getContentType() + "\r\n\r\n").getBytes(StandardCharsets.UTF_8));
        body.write(file.getBytes());
        body.writeBytes("\r\n".getBytes(StandardCharsets.UTF_8));
    }

    private void writeClosingBoundary(ByteArrayOutputStream body, String boundary) {
        body.writeBytes(("--" + boundary + "--\r\n").getBytes(StandardCharsets.UTF_8));
    }

    private String resourceType(MediaType mediaType) {
        return mediaType == MediaType.VIDEO || mediaType == MediaType.BACKGROUND_MUSIC ? "video" : "image";
    }

    private String sha1(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-1");
            byte[] hash = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            StringBuilder builder = new StringBuilder(hash.length * 2);
            for (byte b : hash) {
                builder.append("%02x".formatted(b));
            }
            return builder.toString();
        } catch (NoSuchAlgorithmException exception) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Storage signature could not be created");
        }
    }

    private void validateConfigured() {
        if (isBlank(properties.getCloudName()) || isBlank(properties.getApiKey()) || isBlank(properties.getApiSecret())) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Cloudinary storage is not configured");
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private String trimSlashes(String value) {
        if (value == null || value.isBlank()) {
            return "koupreng";
        }
        return value.replaceAll("^/+|/+$", "");
    }

    private String extension(String filename) {
        if (filename == null) {
            return "";
        }
        int index = filename.lastIndexOf('.');
        return index < 0 ? "" : filename.substring(index).toLowerCase(Locale.ROOT);
    }
}
