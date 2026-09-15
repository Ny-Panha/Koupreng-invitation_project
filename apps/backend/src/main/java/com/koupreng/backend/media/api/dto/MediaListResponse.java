package com.koupreng.backend.media.api.dto;

import com.koupreng.backend.media.domain.MediaFile;
import com.koupreng.backend.media.domain.MediaType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MediaListResponse {

    private MediaResponse coverImage;
    private List<MediaResponse> galleryImages;
    private MediaResponse video;
    private MediaResponse backgroundMusic;
    private List<MediaResponse> all;

    public static MediaListResponse from(List<MediaFile> mediaFiles) {
        List<MediaResponse> all = mediaFiles.stream()
                .map(MediaResponse::from)
                .toList();
        List<MediaResponse> gallery = all.stream()
                .filter(media -> media.getMediaType() == MediaType.GALLERY_IMAGE)
                .toList();

        return MediaListResponse.builder()
                .coverImage(firstOfType(all, MediaType.COVER_IMAGE))
                .galleryImages(gallery)
                .video(firstOfType(all, MediaType.VIDEO))
                .backgroundMusic(firstOfType(all, MediaType.BACKGROUND_MUSIC))
                .all(all)
                .build();
    }

    private static MediaResponse firstOfType(List<MediaResponse> mediaFiles, MediaType mediaType) {
        return mediaFiles.stream()
                .filter(media -> media.getMediaType() == mediaType)
                .findFirst()
                .orElse(null);
    }
}
