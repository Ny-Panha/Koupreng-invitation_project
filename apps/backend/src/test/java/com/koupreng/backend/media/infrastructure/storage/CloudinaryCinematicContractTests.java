package com.koupreng.backend.media.infrastructure.storage;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.koupreng.backend.media.domain.MediaType;
import com.koupreng.backend.media.infrastructure.config.StorageProperties;
import com.koupreng.backend.shared.exception.ApiException;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import java.io.ByteArrayInputStream;
import java.net.http.*;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.Flow;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/** Provider contract checks with mocked HTTP; these do not verify a live Cloudinary account. */
class CloudinaryCinematicContractTests {
    @Test void cinematicUploadUsesAuthenticatedVideoEndpointAndExposesNoRawDeliveryUrl() throws Exception {
        var http = mock(HttpClient.class); var storage = storage(http);
        when(http.send(any(), any())).thenAnswer(invocation -> {
            HttpRequest request = invocation.getArgument(0);
            assertEquals("/v1_1/fixture-cloud/video/authenticated", request.uri().getPath());
            String form = body(request);
            String publicId = field(form, "public_id");
            assertTrue(publicId.startsWith("koupreng/invitations/7/pre_wedding_video/"));
            var response = mock(HttpResponse.class);
            when(response.statusCode()).thenReturn(200);
            when(response.body()).thenReturn("{\"type\":\"authenticated\",\"public_id\":\"" + publicId + "\",\"secure_url\":\"https://res.cloudinary.com/fixture-cloud/video/authenticated/film.mp4\"}");
            return response;
        });
        var uploaded = storage.upload(new MockMultipartFile("file", "film.mp4", "video/mp4", "0000ftyp".getBytes()), MediaType.PRE_WEDDING_VIDEO, 7L);
        assertNull(uploaded.fileUrl()); assertEquals("cloudinary", uploaded.storageProvider());
    }

    @Test void providerDownloadSignatureIsShortLivedAndBytesAreProxiedWithoutReturningItsUrl() throws Exception {
        var http = mock(HttpClient.class); var storage = storage(http);
        String id = "koupreng/invitations/7/pre_wedding_video/film";
        var uri = storage.privateDownloadUri(id, "video/webm", 1700000000);
        assertEquals("api.cloudinary.com", uri.getHost()); assertEquals("/v1_1/fixture-cloud/video/download", uri.getPath());
        var parameters = new HashMap<String,String>();
        for (String item : uri.getRawQuery().split("&")) {
            String[] pair = item.split("=", 2); parameters.put(pair[0], java.net.URLDecoder.decode(pair[1], StandardCharsets.UTF_8));
        }
        assertEquals("1700000060", parameters.get("expires_at")); assertEquals("authenticated", parameters.get("type"));
        String expected = "expires_at=1700000060&format=webm&public_id=" + id + "&timestamp=1700000000&type=authenticated" + "fictional-contract-signing-material";
        assertEquals(HexFormat.of().formatHex(MessageDigest.getInstance("SHA-1").digest(expected.getBytes(StandardCharsets.UTF_8))), parameters.get("signature"));
        assertFalse(uri.toString().contains("fictional-contract-signing-material"));
        byte[] bytes = { 1, 2, 3 };
        when(http.send(any(), any())).thenAnswer(invocation -> {
            var response = mock(HttpResponse.class); when(response.statusCode()).thenReturn(200); when(response.body()).thenReturn(new ByteArrayInputStream(bytes)); return response;
        });
        try (var input = storage.readPrivate(id, "video/webm").getInputStream()) { assertArrayEquals(bytes, input.readAllBytes()); }
        assertThrows(ApiException.class, () -> storage.readPrivate("https://untrusted.example.test/film", "video/mp4"));
    }

    @Test void deletionSignsTheAuthenticatedDeliveryTypeAndKeepsExistingOrdinaryUploads() throws Exception {
        var http = mock(HttpClient.class); var storage = storage(http);
        when(http.send(any(), any())).thenAnswer(invocation -> {
            HttpRequest request = invocation.getArgument(0); String form = body(request);
            if (request.uri().getPath().endsWith("destroy")) {
                assertEquals("authenticated", field(form, "type"));
                String signed = "public_id=" + field(form, "public_id") + "&timestamp=" + field(form, "timestamp") + "&type=authenticated" + "fictional-contract-signing-material";
                assertEquals(HexFormat.of().formatHex(MessageDigest.getInstance("SHA-1").digest(signed.getBytes(StandardCharsets.UTF_8))), field(form, "signature"));
            } else assertEquals("/v1_1/fixture-cloud/image/upload", request.uri().getPath());
            var response = mock(HttpResponse.class); when(response.statusCode()).thenReturn(200); when(response.body()).thenReturn("{\"secure_url\":\"https://fixture.invalid/image.png\",\"public_id\":\"ordinary-image\"}"); return response;
        });
        storage.delete("koupreng/invitations/7/pre_wedding_video/film", MediaType.PRE_WEDDING_VIDEO);
        assertEquals("https://fixture.invalid/image.png", storage.upload(new MockMultipartFile("file", "cover.png", "image/png", new byte[]{1}), MediaType.COVER_IMAGE, 7L).fileUrl());
    }

    private CloudinaryStorageService storage(HttpClient http) {
        var properties = new StorageProperties(); properties.getCloudinary().setCloudName("fixture-cloud");
        properties.getCloudinary().setApiKey("fictional-contract-key"); properties.getCloudinary().setApiSecret("fictional-contract-signing-material");
        return new CloudinaryStorageService(properties, new ObjectMapper(), http);
    }
    private static String field(String body, String name) { return body.split("name=\"" + name + "\"\r\n\r\n", 2)[1].split("\r\n", 2)[0]; }
    private static String body(HttpRequest request) throws Exception {
        var completed = new CompletableFuture<String>(); var output = new java.io.ByteArrayOutputStream();
        request.bodyPublisher().orElseThrow().subscribe(new Flow.Subscriber<ByteBuffer>() {
            public void onSubscribe(Flow.Subscription subscription) { subscription.request(Long.MAX_VALUE); }
            public void onNext(ByteBuffer buffer) { byte[] bytes = new byte[buffer.remaining()]; buffer.get(bytes); output.writeBytes(bytes); }
            public void onError(Throwable error) { completed.completeExceptionally(error); }
            public void onComplete() { completed.complete(output.toString(StandardCharsets.UTF_8)); }
        });
        return completed.get(5, TimeUnit.SECONDS);
    }
}
