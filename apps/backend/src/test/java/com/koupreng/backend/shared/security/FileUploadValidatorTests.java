package com.koupreng.backend.shared.security;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.koupreng.backend.shared.exception.ApiException;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockMultipartFile;

class FileUploadValidatorTests {

    private final ApiSecurityProperties properties = new ApiSecurityProperties();
    private final FileUploadValidator validator = new FileUploadValidator(properties);

    @Test
    void acceptsAllowedPngWithMatchingSignature() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "invite.png",
                "image/png",
                new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A}
        );

        assertDoesNotThrow(() -> validator.validate(file));
    }

    @Test
    void acceptsOpeningVideoWithIsoMediaSignature() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "opening.mp4",
                "video/mp4",
                new byte[]{0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6F, 0x6D}
        );

        assertDoesNotThrow(() -> validator.validate(file));
    }

    @Test
    void acceptsBackgroundMusicWithMp3Signature() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "wedding.mp3",
                "audio/mpeg",
                new byte[]{0x49, 0x44, 0x33, 0x04, 0x00, 0x00}
        );

        assertDoesNotThrow(() -> validator.validate(file));
    }

    @Test
    void acceptsGuestSpreadsheetWithZipContainerSignature() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "guests.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                new byte[]{0x50, 0x4B, 0x03, 0x04, 0x14, 0x00}
        );

        assertDoesNotThrow(() -> validator.validate(file));
    }

    @Test
    void rejectsVideoWhoseContentDoesNotMatchItsDeclaration() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "opening.mp4",
                "video/mp4",
                new byte[]{0x4D, 0x5A, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00}
        );

        ApiException exception = assertThrows(ApiException.class, () -> validator.validate(file));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
        assertEquals("Uploaded file content does not match its declared type", exception.getMessage());
    }

    @Test
    void rejectsContentTypeThatDoesNotMatchExtension() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "invite.jpg",
                "image/png",
                new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47}
        );

        ApiException exception = assertThrows(ApiException.class, () -> validator.validate(file));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
        assertEquals("Uploaded file extension does not match its content type", exception.getMessage());
    }

    @Test
    void rejectsMismatchedSignature() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "invite.pdf",
                "application/pdf",
                new byte[]{0x50, 0x4B, 0x03, 0x04}
        );

        ApiException exception = assertThrows(ApiException.class, () -> validator.validate(file));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
        assertEquals("Uploaded file content does not match its declared type", exception.getMessage());
    }

    @Test
    void rejectsUnsafeFilename() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "../invite.png",
                "image/png",
                new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47}
        );

        ApiException exception = assertThrows(ApiException.class, () -> validator.validate(file));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
        assertEquals("Uploaded file name is invalid", exception.getMessage());
    }

    @Test
    void rejectsOversizedFile() {
        properties.getUpload().setMaxFileSizeBytes(3);
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "invite.png",
                "image/png",
                new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47}
        );

        ApiException exception = assertThrows(ApiException.class, () -> validator.validate(file));

        assertEquals(HttpStatus.CONTENT_TOO_LARGE, exception.getStatus());
    }

    @Test
    void rejectsSvgUploadOutright() {
        MockMultipartFile svgFile = new MockMultipartFile(
                "file",
                "malicious.svg",
                "image/svg+xml",
                "<svg xmlns=\"http://www.w3.org/2000/svg\"><script>alert(1)</script></svg>".getBytes()
        );

        ApiException exception = assertThrows(ApiException.class, () -> validator.validate(svgFile));
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
        assertEquals("SVG uploads are not permitted", exception.getMessage());
    }

    @Test
    void requireImageRejectsNonImage() {
        MockMultipartFile pdfFile = new MockMultipartFile(
                "file",
                "document.pdf",
                "application/pdf",
                new byte[]{0x25, 0x50, 0x44, 0x46}
        );

        ApiException exception = assertThrows(ApiException.class, () -> validator.requireImage(pdfFile));
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
        assertEquals("Profile image must be a JPEG, PNG, or WebP image", exception.getMessage());
    }
}
