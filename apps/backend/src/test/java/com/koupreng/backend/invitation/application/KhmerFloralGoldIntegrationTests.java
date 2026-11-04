package com.koupreng.backend.invitation.application;

import com.koupreng.backend.invitation.api.dto.InvitationRequest;
import com.koupreng.backend.invitation.domain.EventType;
import com.koupreng.backend.rsvp.api.dto.RsvpRequest;
import com.koupreng.backend.rsvp.application.RsvpService;
import com.koupreng.backend.rsvp.domain.RsvpStatus;
import com.koupreng.backend.rsvp.infrastructure.persistence.RsvpRepository;
import com.koupreng.backend.subscription.domain.SubscriptionPackage;
import com.koupreng.backend.template.domain.InvitationTemplate;
import com.koupreng.backend.user.domain.AppUser;
import com.koupreng.backend.shared.exception.ApiException;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import static org.assertj.core.api.Assertions.*;

/** Real services, entitlement policies and JPA persistence; no mocked subscription/ownership gates. */
@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:floral-tests;MODE=MySQL;DB_CLOSE_DELAY=-1",
    "spring.datasource.driver-class-name=org.h2.Driver", "spring.datasource.username=sa", "spring.datasource.password=",
    "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect", "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.jpa.properties.hibernate.boot.allow_jdbc_metadata_access=true", "app.entitlements.free-package-code=FLORAL_TEST_FREE"
})
@ActiveProfiles("test")
@Transactional
class KhmerFloralGoldIntegrationTests {
    @Autowired EntityManager em;
    @Autowired InvitationService invitations;
    @Autowired RsvpService rsvp;
    @Autowired RsvpRepository responses;

    @Test void freeHostCanCreateCustomizeReopenPublishAndReceivePersistentGuestResponses() {
        var baseline = new SubscriptionPackage(); baseline.setCode("FLORAL_TEST_FREE"); baseline.setPackageName("Test Free");
        baseline.setPrice(BigDecimal.ZERO); baseline.setStatus("ACTIVE"); baseline.setMaxInvitations(1);
        baseline.setMaxGuests(5); baseline.setMaxGuestsPerInvitation(5); em.persist(baseline);
        var owner = user("Floral owner");
        var auth = new UsernamePasswordAuthenticationToken(owner.getId().toString(), "", List.of(new SimpleGrantedAuthority("ROLE_USER")));
        var floral = new InvitationTemplate(); floral.setCode("khmer-floral-gold"); floral.setName("Khmer Floral Gold");
        floral.setStatus("ACTIVE"); floral.setPrice(BigDecimal.ZERO); floral.setPremium(false); em.persist(floral); em.flush();
        var request = new InvitationRequest(); request.setTemplateId(floral.getId()); request.setTitle("Dara & Sophea");
        request.setEventType(EventType.WEDDING); request.setGroomName("Dara"); request.setBrideName("Sophea");
        request.setLanguageMode("EN"); request.setEventDate(LocalDate.now().plusDays(30)); request.setEventTime(LocalTime.of(17, 0));
        request.setVenueName("Owner hall"); request.setVenueAddress("Owner address"); request.setVisibility("PUBLIC");
        request.setContentJson("{\"monogramText\":\"DS\",\"sketchMapImage\":\"/uploads/owner-map.webp\",\"invitationImage\":\"/uploads/groom.webp\",\"invitationImage2\":\"/uploads/bride.webp\",\"eventTimezone\":\"Asia/Phnom_Penh\"}");
        request.setDesignJson("{\"presetId\":\"KHMER_FLORAL_GOLD\",\"monogramText\":\"DS\"}");
        var created = invitations.create(auth, request); em.flush(); em.clear();
        assertThat(created.getTemplateCode()).isEqualTo("khmer-floral-gold");
        assertThat(invitations.get(auth, created.getId()).getContentJson()).contains("owner-map.webp", "groom.webp", "bride.webp", "DS");
        var published = invitations.publish(auth, created.getId()); em.flush(); em.clear();
        assertThat(invitations.publicBySlug(published.getSlug()).getTemplateCode()).isEqualTo("khmer-floral-gold");
        var response = new RsvpRequest(); response.setGuestName("Floral guest"); response.setPhone("012345678");
        response.setResponseStatus(RsvpStatus.ATTENDING); response.setAttendeeCount(1);
        var saved = rsvp.submitPublic(published.getSlug(), response); em.flush(); em.clear();
        assertThat(responses.findById(saved.getId())).hasValueSatisfying(row -> {
            assertThat(row.getResponseStatus()).isEqualTo(RsvpStatus.ATTENDING);
            assertThat(row.getGuest().getGuestName()).isEqualTo("Floral guest");
        });
        assertThatThrownBy(() -> rsvp.submitPublic(published.getSlug(), response)).isInstanceOf(ApiException.class);
        var stranger = user("Stranger");
        var otherAuth = new UsernamePasswordAuthenticationToken(stranger.getId().toString(), "", List.of(new SimpleGrantedAuthority("ROLE_USER")));
        assertThatThrownBy(() -> invitations.update(otherAuth, created.getId(), request)).isInstanceOf(ApiException.class);
        assertThatThrownBy(() -> invitations.get(null, created.getId())).isInstanceOf(org.springframework.security.authentication.BadCredentialsException.class);
        assertThatThrownBy(() -> invitations.create(auth, request)).isInstanceOf(ApiException.class);
    }

    private AppUser user(String name) { var user = new AppUser(); user.setEmail(UUID.randomUUID() + "@example.test"); user.setFullName(name); em.persist(user); em.flush(); return user; }
}
