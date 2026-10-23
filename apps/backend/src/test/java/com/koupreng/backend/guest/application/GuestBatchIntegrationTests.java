package com.koupreng.backend.guest.application;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.koupreng.backend.entitlement.application.EntitlementService;
import com.koupreng.backend.guest.api.dto.GuestBatchRequest;
import com.koupreng.backend.guest.api.dto.GuestBatchRequest.*;
import com.koupreng.backend.guest.domain.Guest;
import com.koupreng.backend.guest.infrastructure.persistence.*;
import com.koupreng.backend.invitation.domain.*;
import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.user.application.CurrentUserService;
import com.koupreng.backend.user.domain.AppUser;
import jakarta.persistence.EntityManager;
import java.util.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:phase5-import;MODE=MySQL;DB_CLOSE_DELAY=-1",
    "spring.datasource.driver-class-name=org.h2.Driver", "spring.datasource.username=sa", "spring.datasource.password=",
    "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect", "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.jpa.properties.hibernate.boot.allow_jdbc_metadata_access=true", "app.auth.cookie.enabled=false",
    "app.waf.max-requests-per-minute=1000"
})
@ActiveProfiles("test") @AutoConfigureMockMvc
class GuestBatchIntegrationTests {
    @Autowired GuestBatchService service;
    @Autowired GuestRepository guests;
    @Autowired GuestImportBatchRepository batches;
    @Autowired EntityManager em;
    @Autowired PlatformTransactionManager transactions;
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @MockitoBean CurrentUserService currentUser;
    @MockitoBean EntitlementService entitlements;
    AppUser owner; UserInvitation event; Authentication auth;

    @BeforeEach void setup() {
        new TransactionTemplate(transactions).executeWithoutResult(status -> {
            owner = new AppUser(); owner.setEmail(UUID.randomUUID() + "@example.test"); owner.setFullName("Fictional Import Host"); em.persist(owner);
            event = new UserInvitation(); event.setUser(owner); event.setTitle("Fictional Import Event");
            event.setSlug(UUID.randomUUID().toString()); event.setStatus(InvitationStatus.DRAFT); em.persist(event); em.flush();
        });
        auth = new UsernamePasswordAuthenticationToken(owner.getId().toString(), "", List.of(new SimpleGrantedAuthority("ROLE_USER")));
        when(currentUser.currentUser(any())).thenReturn(owner);
    }
    ImportRow row(int number, String name, String phone, String seats, boolean skip, boolean allowName) {
        return new ImportRow(number, new Fields(name, phone, null, "Groom Side", "Family", "Fictional Companion", "Label A", "Test note", seats), skip, allowName);
    }
    GuestBatchRequest request(ImportRow... rows) { return new GuestBatchRequest(UUID.randomUUID(), List.of(rows)); }
    String url() { return "/api/v1/invitations/" + event.getId() + "/guests/import-batch"; }

    @Test void previewNeverWritesAndCommitPersistsKhmerPhoneAndOptionalFieldsAndReplaysExactly() {
        var request = request(row(2, "ភ្ញៀវគំរូ ក", "012000001", "3", false, false));
        assertFalse(service.preview(auth, event.getId(), request).committed());
        assertEquals(0, guests.countByInvitationId(event.getId()));
        var result = service.commit(auth, event.getId(), request);
        assertEquals(1, result.importedCount()); assertTrue(result.committed());
        var replay = service.commit(auth, event.getId(), request);
        assertEquals(result, replay); assertEquals(1, guests.countByInvitationId(event.getId()));
        var saved = guests.findByInvitationIdOrderByCreatedAtDesc(event.getId()).getFirst();
        assertEquals("012000001", saved.getPhone()); assertEquals(3, saved.getSeatCount());
        assertEquals("Fictional Companion", saved.getCompanionName()); assertEquals("Label A", saved.getTableNumber());
        assertNotNull(saved.getInviteToken()); assertNull(saved.getContributionStatus());
        var changed = new GuestBatchRequest(request.batchId(), List.of(row(2, "Changed", "012000001", "3", false, false)));
        assertThrows(ApiException.class, () -> service.commit(auth, event.getId(), changed));
    }
    @Test void invalidAndDuplicateRowsRequireExplicitResolutionAndExistingQrRemainsUnchanged() {
        var first = request(row(2, "Existing", "012000002", "2", false, false));
        service.commit(auth, event.getId(), first);
        var saved = guests.findByInvitationIdOrderByCreatedAtDesc(event.getId()).getFirst();
        String token = saved.getInviteToken();
        var proposed = request(row(2, "Other", "012000002", "1", false, false), row(3, "", "012000003", "0", false, false), row(4, "Existing", "012000004", "1", false, false));
        var preview = service.preview(auth, event.getId(), proposed);
        assertEquals(List.of("DUPLICATE", "INVALID", "NAME_MATCH"), preview.rows().stream().map(r -> r.status()).toList());
        assertThrows(ApiException.class, () -> service.commit(auth, event.getId(), proposed));
        var resolved = request(row(2, "Other", "012000002", "1", true, false), row(3, "", "012000003", "0", true, false), row(4, "Existing", "012000004", "1", false, true));
        var result = service.commit(auth, event.getId(), resolved);
        assertEquals(1, result.importedCount()); assertEquals(2, result.skippedCount());
        assertEquals(token, guests.findById(saved.getId()).orElseThrow().getInviteToken());
    }
    @Test void inFileContactDuplicatesAreBlockedAndNamesCanBeIntentionallySeparate() {
        var proposed = request(row(2,"Same", "012000010", "1",false,false),row(3,"Other","012000010","1",false,false),row(4,"Same","012000011","1",false,false));
        assertEquals(List.of("READY","DUPLICATE","NAME_MATCH"),service.preview(auth,event.getId(),proposed).rows().stream().map(r->r.status()).toList());
    }
    @Test void midBatchCapacityFailureRollsBackGuestsAndReceipt() {
        doNothing().doThrow(new ApiException(HttpStatus.CONFLICT,"Capacity changed")).when(entitlements).requireGuestCreation(any(),eq(1));
        var request = request(row(2,"One","012000021","1",false,false),row(3,"Two","012000022","1",false,false));
        assertThrows(ApiException.class,()->service.commit(auth,event.getId(),request));
        assertEquals(0,guests.countByInvitationId(event.getId())); assertFalse(batches.existsById(request.batchId().toString()));
    }
    @Test void anonymousCrossEventAndBadPayloadRequestsNeverCreateGuests() throws Exception {
        var request = request(row(2,"Fictional","012000031","1",false,false));
        mvc.perform(post(url()).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(request))).andExpect(status().isUnauthorized());
        AppUser stranger = new TransactionTemplate(transactions).execute(status -> { var user = new AppUser(); user.setEmail(UUID.randomUUID()+"@example.test");user.setFullName("Fictional Other Host");em.persist(user);return user; });
        when(currentUser.currentUser(any())).thenReturn(stranger);
        mvc.perform(post(url()).with(authentication(auth)).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(request))).andExpect(status().isForbidden());
        assertEquals(0,guests.countByInvitationId(event.getId()));
    }
    @Test void actualHttpPreviewThenCommitReturnsTruthfulCountsAndList() throws Exception {
        var request = request(row(2,"HTTP Fictional","012000041","2",false,false));
        mvc.perform(post(url()+"/preview").with(authentication(auth)).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(request))).andExpect(status().isOk()).andExpect(jsonPath("$.data.committed").value(false));
        mvc.perform(post(url()).with(authentication(auth)).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(request))).andExpect(status().isOk()).andExpect(jsonPath("$.data.importedCount").value(1)).andExpect(jsonPath("$.data.committed").value(true));
        mvc.perform(get("/api/v1/invitations/"+event.getId()+"/guests").with(authentication(auth))).andExpect(status().isOk()).andExpect(jsonPath("$.data[0].phone").value("012000041"));
    }
}
