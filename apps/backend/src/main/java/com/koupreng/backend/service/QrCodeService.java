package com.koupreng.backend.service;

import com.koupreng.backend.invitation.application.InvitationService;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.config.AppProperties;
import com.koupreng.backend.dto.qr.QrCodeResponse;
import com.koupreng.backend.guest.domain.Guest;
import com.koupreng.backend.invitation.domain.UserInvitation;
import com.koupreng.backend.invitation.domain.InvitationVisibility;
import com.koupreng.backend.guest.infrastructure.persistence.GuestRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Service
public class QrCodeService {

    private static final int QR_SIZE = 320;

    private final InvitationService invitationService;
    private final GuestRepository guestRepository;
    private final AppProperties appProperties;

    public QrCodeService(
            InvitationService invitationService,
            GuestRepository guestRepository,
            AppProperties appProperties
    ) {
        this.invitationService = invitationService;
        this.guestRepository = guestRepository;
        this.appProperties = appProperties;
    }

    @Transactional
    public QrCodeResponse invitationQr(Authentication authentication, Long invitationId) {
        UserInvitation invitation = invitationService.requireOwnedInvitationEntity(authentication, invitationId);
        if (invitation.getVisibility() != null && invitation.getVisibility() != InvitationVisibility.PUBLIC) {
            invitationService.ensureAccessTokenValue(invitation);
        }
        String url = invitationUrl(invitation, null);
        return response(url, url, null, "INVITATION");
    }

    @Transactional(readOnly = true)
    public QrCodeResponse guestQr(Authentication authentication, Long invitationId, Long guestId) {
        UserInvitation invitation = invitationService.requireOwnedInvitationEntity(authentication, invitationId);
        Guest guest = guestRepository.findByIdAndInvitationId(guestId, invitationId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Guest not found"));
        if (guest.getInviteToken() == null || guest.getInviteToken().isBlank()) {
            throw new ApiException(HttpStatus.CONFLICT, "Guest invite token is not ready");
        }
        String url = invitationUrl(invitation, guest.getInviteToken());
        return response(url, url, guest.getGuestName(), "GUEST");
    }

    public String invitationUrl(UserInvitation invitation, String inviteToken) {
        String base = appProperties.getInvitation().getPublicBaseUrl();
        if (base == null || base.isBlank()) {
            base = "http://localhost:5173";
        }
        base = base.replaceAll("/+$", "");
        String slug = invitation.getSlug() == null || invitation.getSlug().isBlank()
                ? "invitation-" + invitation.getId()
                : invitation.getSlug();
        String url = base + "/i/" + encode(slug);
        if (inviteToken != null && !inviteToken.isBlank()) {
            url += "?token=" + encode(inviteToken);
        } else if (invitation.getVisibility() != null
                && invitation.getVisibility() != InvitationVisibility.PUBLIC
                && invitation.getAccessToken() != null
                && !invitation.getAccessToken().isBlank()) {
            url += "?accessToken=" + encode(invitation.getAccessToken());
        }
        return url;
    }

    private QrCodeResponse response(String url, String qrPayload, String guestName, String tokenType) {
        return QrCodeResponse.builder()
                .invitationUrl(url)
                .qrCodeDataUri(qrDataUri(url))
                .qrPayload(qrPayload)
                .guestName(guestName)
                .tokenType(tokenType)
                .build();
    }

    private String qrDataUri(String value) {
        try {
            BitMatrix matrix = new QRCodeWriter().encode(value, BarcodeFormat.QR_CODE, QR_SIZE, QR_SIZE);
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(matrix, "PNG", outputStream);
            return "data:image/png;base64," + Base64.getEncoder().encodeToString(outputStream.toByteArray());
        } catch (WriterException | IOException exception) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not generate QR code");
        }
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8).replace("+", "%20");
    }
}
