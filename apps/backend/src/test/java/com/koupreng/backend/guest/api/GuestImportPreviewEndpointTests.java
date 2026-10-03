package com.koupreng.backend.guest.api;

import com.koupreng.backend.guest.api.dto.GuestImportErrorResponse;
import com.koupreng.backend.guest.api.dto.GuestImportFilePreviewResponse;
import com.koupreng.backend.guest.api.dto.GuestImportFileResultResponse;
import com.koupreng.backend.guest.api.dto.GuestRequest;
import com.koupreng.backend.guest.application.GuestService;
import com.koupreng.backend.shared.exception.ApiException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {"app.waf.max-requests-per-minute=1000", "app.auth.cookie.enabled=false"})
@AutoConfigureMockMvc
@ActiveProfiles("test")
class GuestImportPreviewEndpointTests {
    @Autowired private MockMvc mvc;
    @MockitoBean private GuestService guests;

    @Test
    void anonymousPreviewIsRejectedBeforeServiceInvocation() throws Exception {
        mvc.perform(multipart("/api/v1/invitations/10/guests/import-file/preview").file(file()))
                .andExpect(status().isUnauthorized());
        verify(guests, never()).previewGuestsFile(any(), any(), any());
    }

    @Test
    @WithMockUser(username = "1")
    void previewReturnsAdvisoryRowsAndCountsWithoutAnnouncingImport() throws Exception {
        GuestRequest candidate = new GuestRequest(); candidate.setGuestName("សុភា");
        var error = GuestImportErrorResponse.builder().rowNumber(3).reason("Guest name is required").build();
        when(guests.previewGuestsFile(any(), eq(10L), any())).thenReturn(new GuestImportFilePreviewResponse(
                1, 1, List.of(error), List.of(new GuestImportFilePreviewResponse.ValidRow(2, candidate))));
        mvc.perform(multipart("/api/v1/invitations/10/guests/import-file/preview").file(file()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.acceptedCount").value(1))
                .andExpect(jsonPath("$.data.skippedCount").value(1))
                .andExpect(jsonPath("$.data.errorRows[0].reason").value("Guest name is required"))
                .andExpect(jsonPath("$.data.validRows[0].rowNumber").value(2))
                .andExpect(jsonPath("$.data.validRows[0].guest.guestName").value("សុភា"))
                .andExpect(jsonPath("$.data.importedCount").doesNotExist())
                .andExpect(jsonPath("$.data.validRows[0].guest.inviteToken").doesNotExist());
        verify(guests, never()).importGuestsFile(any(), any(), any());
    }

    @Test
    @WithMockUser(username = "2")
    void ownerGuardRejectionKeepsTheExistingForbiddenErrorContract() throws Exception {
        when(guests.previewGuestsFile(any(), eq(10L), any()))
                .thenThrow(new ApiException(HttpStatus.FORBIDDEN, "Invitation access denied"));
        mvc.perform(multipart("/api/v1/invitations/10/guests/import-file/preview").file(file()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "1")
    void existingImportRouteRetainsCreatedResponseAndResultFields() throws Exception {
        when(guests.importGuestsFile(any(), eq(10L), any())).thenReturn(GuestImportFileResultResponse.builder()
                .importedCount(0).skippedCount(1).errorRows(List.of()).guests(List.of()).build());
        mvc.perform(multipart("/api/v1/invitations/10/guests/import-file").file(file()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.importedCount").value(0))
                .andExpect(jsonPath("$.data.skippedCount").value(1))
                .andExpect(jsonPath("$.data.guests").isArray());
    }

    private MockMultipartFile file() {
        return new MockMultipartFile("file", "guests.csv", "text/csv", "guestName\nHost".getBytes(StandardCharsets.UTF_8));
    }
}
