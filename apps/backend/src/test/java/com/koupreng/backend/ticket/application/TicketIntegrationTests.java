package com.koupreng.backend.ticket.application;

import com.google.zxing.*;
import com.google.zxing.client.j2se.BufferedImageLuminanceSource;
import com.google.zxing.common.HybridBinarizer;
import com.koupreng.backend.checkin.application.CheckInService;
import com.koupreng.backend.checkin.api.dto.CheckInScanRequest;
import com.koupreng.backend.entitlement.application.EntitlementService;
import com.koupreng.backend.guest.domain.Guest;
import com.koupreng.backend.guest.infrastructure.persistence.GuestRepository;
import com.koupreng.backend.invitation.domain.*;
import com.koupreng.backend.media.domain.*;
import com.koupreng.backend.rsvp.infrastructure.persistence.RsvpRepository;
import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.ticket.api.dto.TicketDesignRequest;
import com.koupreng.backend.user.application.CurrentUserService;
import com.koupreng.backend.user.domain.AppUser;
import jakarta.persistence.EntityManager;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.annotation.Transactional;

import javax.imageio.ImageIO;
import java.io.ByteArrayInputStream;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:ticket-tests;MODE=MySQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver", "spring.datasource.username=sa", "spring.datasource.password=",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect", "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.properties.hibernate.boot.allow_jdbc_metadata_access=true"
})
@ActiveProfiles("test")
@Transactional
@org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
class TicketIntegrationTests {
    @Autowired EntityManager em;
    @Autowired TicketService tickets;
    @Autowired com.koupreng.backend.invitation.application.InvitationService invitations;
    @Autowired com.koupreng.backend.ticket.infrastructure.persistence.InvitationTicketDesignRepository designs;
    @Autowired CheckInService checkIn;
    @Autowired GuestRepository guests;
    @Autowired RsvpRepository rsvps;
    @Autowired Validator validator;
    @Autowired org.springframework.test.web.servlet.MockMvc mvc;
    @MockitoBean CurrentUserService currentUser;
    @MockitoBean EntitlementService entitlements;
    Authentication auth;
    AppUser owner;
    UserInvitation event;
    Guest guest;
    @BeforeEach void setup() {
        owner = new AppUser(); owner.setEmail(UUID.randomUUID() + "@example.test"); owner.setFullName("Ticket owner"); em.persist(owner);
        auth = new UsernamePasswordAuthenticationToken(owner.getId().toString(), "", List.of(new SimpleGrantedAuthority("ROLE_USER")));
        when(currentUser.currentUser(any())).thenReturn(owner);
        event = event(owner);
        guest = new Guest(); guest.setInvitation(event); guest.setGuestName("លោក សុខ សុវណ្ណ និងក្រុមគ្រួសារ");
        guest.setInviteToken(UUID.randomUUID().toString()); guest.setSeatCount(2); guest.setTableNumber("Lotus 8");
        guest.setEmail("private@example.test"); guest.setPhone("private"); em.persist(guest); em.flush();
    }
    UserInvitation event(AppUser user) {
        var value = new UserInvitation(); value.setUser(user); value.setTitle("សិរីមង្គលអាពាហ៍ពិពាហ៍");
        value.setHostName("សុខ"); value.setPartnerName("ស្រីពេជ្រ"); value.setSlug(UUID.randomUUID().toString());
        value.setStatus(InvitationStatus.PUBLISHED); value.setVisibility(InvitationVisibility.PUBLIC); em.persist(value); return value;
    }
    @Test void savesVersionedDesignAndRejectsStaleWriter() {
        var initial = tickets.design(auth, event.getId());
        assertEquals(0, initial.design().version());
        var saved = tickets.save(auth, event.getId(), initial.design());
        assertEquals(1, saved.design().version());
        assertEquals(HttpStatus.CONFLICT, assertThrows(ApiException.class, () -> tickets.save(auth, event.getId(), initial.design())).getStatus());
        assertEquals(2, tickets.save(auth, event.getId(), saved.design()).design().version());
    }
    @Test void publicTicketBeforeRsvpDoesNotCreateGuestOrRsvpAndUsesExistingQr() throws Exception {
        long guestCount = guests.count(), rsvpCount = rsvps.count();
        var ticket = tickets.publicTicket(event.getSlug(), guest.getInviteToken(), null);
        assertEquals("GUEST", ticket.kind()); assertEquals(guest.getGuestName(), ticket.guestName());
        assertEquals(guestCount, guests.count()); assertEquals(rsvpCount, rsvps.count());
        assertNull(guest.getInvitationViewedAt());
        var png = Base64.getDecoder().decode(ticket.qrCodeDataUri().split(",", 2)[1]);
        var bitmap = new BinaryBitmap(new HybridBinarizer(new BufferedImageLuminanceSource(ImageIO.read(new ByteArrayInputStream(png)))));
        assertEquals(ticket.qrPayload(), new MultiFormatReader().decode(bitmap, Map.of(DecodeHintType.PURE_BARCODE, true)).getText());
        assertTrue(ticket.qrPayload().contains("?token=" + guest.getInviteToken()));
        var scan = new CheckInScanRequest(); scan.setToken(ticket.qrPayload());
        assertEquals("CHECKED_IN", checkIn.scan(auth, event.getId(), scan.getToken(), null).getResult());
        assertEquals("ALREADY_CHECKED_IN", checkIn.scan(auth, event.getId(), scan.getToken(), null).getResult());
    }
    @Test void refusesWrongEventGuestAndInvalidPublicToken() {
        var other = event(owner); em.flush();
        assertEquals(HttpStatus.NOT_FOUND, assertThrows(ApiException.class, () -> tickets.ownerTicket(auth, other.getId(), guest.getId())).getStatus());
        assertEquals(HttpStatus.FORBIDDEN, assertThrows(ApiException.class, () -> tickets.publicTicket(other.getSlug(), guest.getInviteToken(), null)).getStatus());
        assertEquals(HttpStatus.FORBIDDEN, assertThrows(ApiException.class, () -> tickets.publicTicket(event.getSlug(), "invalid", null)).getStatus());
        var scan = new CheckInScanRequest(); scan.setToken(tickets.ownerTicket(auth, event.getId(), guest.getId()).qrPayload());
        assertEquals("CHECKIN_WRONG_INVITATION", assertThrows(ApiException.class, () -> checkIn.scan(auth, other.getId(), scan.getToken(), null)).getCode());
    }
    @Test void refusesNonOwnerAndGlobalStaff() {
        var actor = new AppUser(); actor.setEmail("other-" + UUID.randomUUID() + "@example.test"); actor.setFullName("Other"); em.persist(actor);
        when(currentUser.currentUser(any())).thenReturn(actor);
        var staff = new UsernamePasswordAuthenticationToken(actor.getId().toString(), "", List.of(new SimpleGrantedAuthority("ROLE_STAFF")));
        assertEquals(HttpStatus.FORBIDDEN, assertThrows(ApiException.class, () -> tickets.design(staff, event.getId())).getStatus());
        assertEquals(HttpStatus.FORBIDDEN, assertThrows(ApiException.class, () -> tickets.save(staff, event.getId(), TicketDesignRequest.defaults())).getStatus());
        assertEquals(HttpStatus.FORBIDDEN, assertThrows(ApiException.class, () -> tickets.ownerTicket(staff, event.getId(), guest.getId())).getStatus());
        var scan = new CheckInScanRequest(); scan.setToken(guest.getInviteToken());
        assertEquals(HttpStatus.FORBIDDEN, assertThrows(ApiException.class, () -> checkIn.scan(staff, event.getId(), scan.getToken(), null)).getStatus());
    }
    @Test void rejectsForeignAndNonImageMedia() {
        var other = event(owner);
        var image = new MediaFile(); image.setInvitation(other); image.setMediaType(MediaType.GALLERY_IMAGE); image.setMimeType("image/png"); image.setFileUrl("/uploads/foreign.png"); em.persist(image); em.flush();
        var d = TicketDesignRequest.defaults();
        var request = new TicketDesignRequest(0L, d.layout(), d.accent(), d.font(), d.frame(), d.header(), d.footer(), image.getId(), null, false, true, true);
        assertEquals(HttpStatus.BAD_REQUEST, assertThrows(ApiException.class, () -> tickets.save(auth, event.getId(), request)).getStatus());
        image.setInvitation(event); image.setMimeType("audio/mpeg"); em.flush();
        assertEquals(HttpStatus.BAD_REQUEST, assertThrows(ApiException.class, () -> tickets.save(auth, event.getId(), request)).getStatus());
    }
    @Test void unpublishedAndModeratedInvitationsDoNotExposePublicTickets() {
        event.setStatus(InvitationStatus.DRAFT); em.flush();
        assertEquals(HttpStatus.NOT_FOUND, assertThrows(ApiException.class, () -> tickets.publicTicket(event.getSlug(), guest.getInviteToken(), null)).getStatus());
        event.setStatus(InvitationStatus.PUBLISHED); event.setDeleted(true); em.flush();
        assertEquals(HttpStatus.NOT_FOUND, assertThrows(ApiException.class, () -> tickets.publicTicket(event.getSlug(), guest.getInviteToken(), null)).getStatus());
    }
    @Test void appliesPackageGateToOwnerAndPublicTickets() {
        doThrow(new ApiException(HttpStatus.FORBIDDEN, "Package upgrade required")).when(entitlements).requireFeature(any(), any());
        assertEquals(HttpStatus.FORBIDDEN, assertThrows(ApiException.class, () -> tickets.ownerTicket(auth, event.getId(), guest.getId())).getStatus());
        assertEquals(HttpStatus.FORBIDDEN, assertThrows(ApiException.class, () -> tickets.publicTicket(event.getSlug(), guest.getInviteToken(), null)).getStatus());
    }
    @Test void validatesUntrustedDesignAndDistinguishesGeneralQrPurpose() {
        var d = TicketDesignRequest.defaults();
        assertTrue(validator.validate(new TicketDesignRequest(-1L, d.layout(), "url(javascript:x)", d.font(), d.frame(), "x".repeat(101), d.footer(), -5L, null, false, false, false)).size() >= 4);
        event.setGroomName("Saved groom"); event.setBrideName("Saved bride"); event.setHostName(null); event.setPartnerName(null);
        var general = tickets.ownerTicket(auth, event.getId(), null);
        assertEquals("Saved groom", general.hostName()); assertEquals("Saved bride", general.partnerName());
        assertEquals("GENERAL", general.kind()); assertNull(general.guestName());
        assertFalse(general.qrPayload().contains("token="));
        var scan = new CheckInScanRequest(); scan.setToken(general.qrPayload());
        assertThrows(ApiException.class, () -> checkIn.scan(auth, event.getId(), scan.getToken(), null));
    }

    @Test void frontendExportFixtureContainsARealisticGuestUrl() throws Exception {
        var fixture = java.nio.file.Path.of("../frontend-user/tests/e2e/support/fixtures/ticket-qr.png");
        var pixels = new BinaryBitmap(new HybridBinarizer(new BufferedImageLuminanceSource(ImageIO.read(fixture.toFile()))));
        assertEquals("https://koupreng.example/i/wedding-sok-sophea-2026-12-20-phnom-penh?token=59d9cb1e-86b4-4d38-b531-d6c9034a17ea",
                new MultiFormatReader().decode(pixels, Map.of(DecodeHintType.PURE_BARCODE, true)).getText());
    }
    @Test void publicHttpContractHasPrivateCachingHeadersAndNoGuestContactFields() throws Exception {
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get(
                        "/api/v1/public/invitations/" + event.getSlug() + "/ticket").param("token", guest.getInviteToken()))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isOk())
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.header().string("Cache-Control", "no-store, private"))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.header().string("Referrer-Policy", "no-referrer"))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.data.kind").value("GUEST"))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.data.email").doesNotExist())
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.data.phone").doesNotExist());
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get(
                        "/api/v1/invitations/" + event.getId() + "/ticket-design"))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isUnauthorized());
    }
    @Test void deletingAnOwnedEventAlsoDeletesItsTicketDesign() {
        tickets.save(auth, event.getId(), TicketDesignRequest.defaults());
        Long id = event.getId();
        assertTrue(designs.existsById(id));
        invitations.delete(auth, id); em.flush(); em.clear();
        assertFalse(designs.existsById(id));
    }
}
