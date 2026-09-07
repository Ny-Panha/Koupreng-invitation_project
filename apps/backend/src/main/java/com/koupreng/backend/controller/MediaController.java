package com.koupreng.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.koupreng.backend.dto.ApiResponse;
import com.koupreng.backend.dto.media.MediaListResponse;
import com.koupreng.backend.dto.media.MediaResponse;
import com.koupreng.backend.service.MediaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@RestController
@Validated
@RequestMapping("/api/v1")
@Tag(name = "Media", description = "Validated invitation-owner uploads and public published-invitation media reads.")
@SecurityRequirement(name = "bearerAuth")
public class MediaController {

    private final MediaService mediaService;

    public MediaController(MediaService mediaService) {
        this.mediaService = mediaService;
    }

    @PostMapping(value = "/invitations/{invitationId}/media/cover", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<MediaResponse>> uploadCover(
            Authentication authentication,
            @PathVariable Long invitationId,
            @RequestParam("file") MultipartFile file
    ) {
        MediaResponse response = mediaService.uploadCover(authentication, invitationId, file);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Cover image uploaded successfully", response));
    }

    @PostMapping(value = "/invitations/{invitationId}/media/gallery", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<List<MediaResponse>>> uploadGallery(
            Authentication authentication,
            @PathVariable Long invitationId,
            @RequestParam(value = "files", required = false) List<MultipartFile> files,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(required = false) Integer sortOrder
    ) {
        List<MultipartFile> uploads = new ArrayList<>();
        if (files != null) {
            uploads.addAll(files);
        }
        if (file != null) {
            uploads.add(file);
        }
        List<MediaResponse> response = mediaService.uploadGallery(authentication, invitationId, uploads, sortOrder);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Gallery images uploaded successfully", response));
    }

    @PostMapping(value = "/invitations/{invitationId}/media/video", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<MediaResponse>> uploadVideo(
            Authentication authentication,
            @PathVariable Long invitationId,
            @RequestParam("file") MultipartFile file
    ) {
        MediaResponse response = mediaService.uploadVideo(authentication, invitationId, file);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Video uploaded successfully", response));
    }

    @PostMapping(value = "/invitations/{invitationId}/media/music", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<MediaResponse>> uploadMusic(
            Authentication authentication,
            @PathVariable Long invitationId,
            @RequestParam("file") MultipartFile file
    ) {
        MediaResponse response = mediaService.uploadMusic(authentication, invitationId, file);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Background music uploaded successfully", response));
    }

    @GetMapping("/invitations/{invitationId}/media")
    public ResponseEntity<ApiResponse<MediaListResponse>> list(
            Authentication authentication,
            @PathVariable Long invitationId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Media files fetched successfully",
                mediaService.list(authentication, invitationId)
        ));
    }

    @Operation(summary = "List public invitation media",
            description = "Return media that belongs to an accessible published invitation.")
    @GetMapping("/public/invitations/{slug}/media")
    public ResponseEntity<ApiResponse<MediaListResponse>> publicMedia(
            @PathVariable String slug,
            @RequestParam(required = false) String accessToken,
            @RequestParam(required = false, name = "token") String inviteToken
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Media files fetched successfully",
                mediaService.listPublic(slug, accessToken, inviteToken)
        ));
    }

    @PutMapping(value = "/invitations/{invitationId}/media/{mediaId}/replace", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<MediaResponse>> replace(
            Authentication authentication,
            @PathVariable Long invitationId,
            @PathVariable Long mediaId,
            @RequestParam("file") MultipartFile file
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Media file replaced successfully",
                mediaService.replace(authentication, invitationId, mediaId, file)
        ));
    }

    @DeleteMapping("/invitations/{invitationId}/media/{mediaId}")
    public ResponseEntity<ApiResponse<Void>> delete(
            Authentication authentication,
            @PathVariable Long invitationId,
            @PathVariable Long mediaId
    ) {
        mediaService.delete(authentication, invitationId, mediaId);
        return ResponseEntity.ok(ApiResponse.success("Media file deleted successfully", null));
    }
}
