package com.koupreng.backend.seating.application;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.koupreng.backend.entitlement.application.EntitlementService;
import com.koupreng.backend.guest.domain.Guest;
import com.koupreng.backend.invitation.domain.*;
import com.koupreng.backend.seating.api.dto.*;
import com.koupreng.backend.seating.api.dto.SeatingLayoutRequest.*;
import com.koupreng.backend.seating.domain.EventTable;
import com.koupreng.backend.seating.infrastructure.persistence.EventTableRepository;
import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.user.application.CurrentUserService;
import com.koupreng.backend.user.domain.AppUser;
import jakarta.persistence.EntityManager;
import java.util.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {"spring.datasource.url=jdbc:h2:mem:phase5-layout;MODE=MySQL;DB_CLOSE_DELAY=-1",
    "spring.datasource.driver-class-name=org.h2.Driver", "spring.datasource.username=sa", "spring.datasource.password=",
    "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect", "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.jpa.properties.hibernate.boot.allow_jdbc_metadata_access=true", "app.auth.cookie.enabled=false", "app.waf.max-requests-per-minute=1000"})
@ActiveProfiles("test") @AutoConfigureMockMvc
class SeatingLayoutIntegrationTests {
    @Autowired EntityManager em;
    @Autowired PlatformTransactionManager transactions;
    @Autowired SeatingLayoutService layouts;
    @Autowired SeatingService seating;
    @Autowired EventTableRepository tables;
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @MockitoBean CurrentUserService currentUser;
    @MockitoBean EntitlementService entitlements;
    AppUser owner; UserInvitation event; EventTable table; Guest guest; Authentication auth;
    @BeforeEach void setup() {
        new TransactionTemplate(transactions).executeWithoutResult(status -> {
            owner = new AppUser(); owner.setEmail(UUID.randomUUID()+"@example.test"); owner.setFullName("Fictional Seating Host"); em.persist(owner);
            event = new UserInvitation(); event.setUser(owner); event.setTitle("Fictional seating"); event.setSlug(UUID.randomUUID().toString()); event.setStatus(InvitationStatus.DRAFT); em.persist(event);
            table = new EventTable(); table.setInvitation(event); table.setTableName("Family A"); table.setCapacity(3); table.setNotes("Keep family together"); em.persist(table);
            guest = new Guest(); guest.setInvitation(event); guest.setGuestName("Fictional party"); guest.setSeatCount(2); guest.setInviteToken(UUID.randomUUID().toString()); em.persist(guest); em.flush();
        });
        auth = new UsernamePasswordAuthenticationToken(owner.getId().toString(), "", List.of(new SimpleGrantedAuthority("ROLE_USER")));
        when(currentUser.currentUser(any())).thenReturn(owner);
    }
    SeatingLayoutRequest request(long version, Long tableId, double x) {
        return new SeatingLayoutRequest(version,new LayoutData(1,Map.of(tableId,new Point(x,40.0)),new Venue(new Point(50.0,9.0),new Point(50.0,92.0),new Walkway(50.0,51.0,"vertical",true))));
    }
    @Test void persistsAllGeometryWithoutChangingCapacityAssignmentsOrLegacyNotesAndRejectsStaleVersion() {
        assertEquals(0,layouts.get(auth,event.getId()).version());
        var saved = layouts.save(auth,event.getId(),request(0,table.getId(),25));
        assertEquals(1,saved.version()); assertEquals(25.0,layouts.get(auth,event.getId()).data().positions().get(table.getId()).x());
        assertEquals("Keep family together",tables.findById(table.getId()).orElseThrow().getNotes());
        assertThrows(ApiException.class,()->layouts.save(auth,event.getId(),request(0,table.getId(),45)));
        assertEquals(25.0,layouts.get(auth,event.getId()).data().positions().get(table.getId()).x());
        assertEquals(2,layouts.save(auth,event.getId(),request(1,table.getId(),35)).version());
    }
    @Test void rejectsCrossEventTableAndOutOfBoundsCoordinates() {
        assertThrows(ApiException.class,()->layouts.save(auth,event.getId(),request(0,Long.MAX_VALUE,25)));
        assertThrows(ApiException.class,()->layouts.save(auth,event.getId(),request(0,table.getId(),101)));
        assertEquals(0,layouts.get(auth,event.getId()).version());
    }
    @Test void existingAssignmentCapacityMoveAndDeleteGuardsRemainAuthoritative() {
        var assignment = new SeatAssignmentRequest(); assignment.setGuestId(guest.getId());assignment.setTableId(table.getId());assignment.setSeatCount(2);
        var saved = seating.assign(auth,event.getId(),assignment);
        assertThrows(ApiException.class,()->seating.deleteTable(auth,event.getId(),table.getId()));
        assignment.setSeatCount(4); assertThrows(ApiException.class,()->seating.assign(auth,event.getId(),assignment));
        var second = new EventTableRequest();second.setTableName("Friends");second.setCapacity(3);
        var target = seating.createTable(auth,event.getId(),second);assignment.setTableId(target.getId());assignment.setSeatCount(2);
        var moved = seating.assign(auth,event.getId(),assignment); assertEquals(target.getId(),moved.getTableId());
        seating.unassign(auth,event.getId(),moved.getId());
        assertTrue(seating.plan(auth,event.getId()).getAssignments().isEmpty());
        seating.deleteTable(auth,event.getId(),table.getId()); assertFalse(tables.existsById(table.getId()));
    }
    @Test void httpOwnerGuardSchemaValidationAndPersistedReload() throws Exception {
        String url="/api/v1/invitations/"+event.getId()+"/seating/layout";
        mvc.perform(get(url)).andExpect(status().isUnauthorized());
        mvc.perform(put(url).with(authentication(auth)).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(request(0,table.getId(),25)))).andExpect(status().isOk()).andExpect(jsonPath("$.data.version").value(1));
        mvc.perform(get(url).with(authentication(auth))).andExpect(status().isOk()).andExpect(jsonPath("$.data.data.venue.stage.x").value(50));
        var other = new AppUser();other.setId(Long.MAX_VALUE);when(currentUser.currentUser(any())).thenReturn(other);
        mvc.perform(get(url).with(authentication(auth))).andExpect(status().isForbidden());
    }
}
