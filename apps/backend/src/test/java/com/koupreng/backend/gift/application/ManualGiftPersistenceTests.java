package com.koupreng.backend.gift.application;

import com.koupreng.backend.gift.api.dto.WeddingGiftRequest;
import com.koupreng.backend.gift.infrastructure.persistence.WeddingGiftRepository;
import com.koupreng.backend.invitation.domain.*;
import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.user.application.CurrentUserService;
import com.koupreng.backend.user.domain.AppUser;
import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.annotation.Transactional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@SpringBootTest(properties={"spring.datasource.url=jdbc:h2:mem:phase5-gifts;MODE=MySQL;DB_CLOSE_DELAY=-1","spring.datasource.driver-class-name=org.h2.Driver",
    "spring.datasource.username=sa","spring.datasource.password=","spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
    "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect","spring.jpa.hibernate.ddl-auto=create-drop","spring.jpa.properties.hibernate.boot.allow_jdbc_metadata_access=true"})
@ActiveProfiles("test") @Transactional
class ManualGiftPersistenceTests {
    @Autowired EntityManager em;
    @Autowired WeddingGiftService gifts;
    @Autowired WeddingGiftRepository records;
    @MockitoBean CurrentUserService currentUser;
    Authentication auth; UserInvitation event;
    @BeforeEach void setup() {
        var owner=new AppUser();owner.setFullName("Fictional Gift Host");owner.setEmail(UUID.randomUUID()+"@example.test");em.persist(owner);
        event=new UserInvitation();event.setUser(owner);event.setTitle("Fictional Gifts");event.setSlug(UUID.randomUUID().toString());event.setStatus(InvitationStatus.DRAFT);em.persist(event);em.flush();
        auth=new UsernamePasswordAuthenticationToken(owner.getId().toString(),"",List.of(new SimpleGrantedAuthority("ROLE_USER")));when(currentUser.currentUser(any())).thenReturn(owner);
    }
    WeddingGiftRequest request(String currency,String amount) { var r=new WeddingGiftRequest();r.setName("Fictional contributor");r.setAmount(new BigDecimal(amount));r.setCurrency(currency);r.setMethod("ABA");r.setDate(LocalDate.of(2026,10,23));r.setClientRequestId(UUID.randomUUID());return r; }
    @Test void retriesReturnTheSameManualRecordAndConflictingReuseDoesNotCreateAnother() {
        var request=request("KHR","40000");var first=gifts.create(auth,event.getId(),request);em.flush();em.clear();
        var second=gifts.create(auth,event.getId(),request);assertEquals(first.getId(),second.getId());assertEquals(1,records.findAllByInvitationId(event.getId()).size());
        request.setAmount(new BigDecimal("50000"));assertThrows(ApiException.class,()->gifts.create(auth,event.getId(),request));
    }
    @Test void currenciesRemainSeparateAndNegativeOrOverprecisionValuesAreRejected() {
        var usd=gifts.create(auth,event.getId(),request("USD","25.50"));var khr=gifts.create(auth,event.getId(),request("KHR","40000"));
        assertEquals("USD",usd.getCurrency());assertEquals("KHR",khr.getCurrency());
        assertThrows(ApiException.class,()->gifts.create(auth,event.getId(),request("USD","-1")));
        assertThrows(ApiException.class,()->gifts.create(auth,event.getId(),request("USD","1.234")));
        assertThrows(ApiException.class,()->gifts.create(auth,event.getId(),request("EUR","1")));
    }
}
