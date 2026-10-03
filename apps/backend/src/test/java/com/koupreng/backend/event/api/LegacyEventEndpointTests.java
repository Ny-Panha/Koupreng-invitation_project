package com.koupreng.backend.event.api;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.request;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.util.Optional;

import com.koupreng.backend.event.domain.Event;
import com.koupreng.backend.event.domain.EventStatus;
import com.koupreng.backend.event.domain.TemplateType;
import com.koupreng.backend.event.infrastructure.persistence.EventRepository;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(properties = {
        "app.waf.max-requests-per-minute=1000",
        "spring.datasource.url=jdbc:h2:mem:legacy-event-transport;MODE=MySQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password="
})
@AutoConfigureMockMvc
@ActiveProfiles("test")
class LegacyEventEndpointTests {
    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private EventRepository repository;

    private static final String BODY = """
            {"eventName":"Ceremony","templateType":"WEDDING","eventDate":"2027-01-10"}
            """;
    private static final String[][] ROUTES = {
            {"GET", ""}, {"POST", ""}, {"GET", "/10"}, {"PUT", "/10"}, {"DELETE", "/10"},
            {"GET", "/published"}, {"GET", "/drafts"}, {"GET", "/10/preview"},
            {"PATCH", "/10/draft"}, {"PATCH", "/10/publish"}, {"PATCH", "/10/unpublish"},
    };

    @Test
    void allElevenLegacyRoutesRequireAuthentication() throws Exception {
        for (String[] route : ROUTES) {
            mockMvc.perform(request(HttpMethod.valueOf(route[0]), "/api/v1/events" + route[1])
                            .contentType(MediaType.APPLICATION_JSON).content(BODY))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Test
    void allElevenLegacyRoutesRemainAdminOnly() throws Exception {
        for (String[] route : ROUTES) {
            mockMvc.perform(request(HttpMethod.valueOf(route[0]), "/api/v1/events" + route[1])
                            .with(user("normal-host").roles("USER"))
                            .contentType(MediaType.APPLICATION_JSON).content(BODY))
                    .andExpect(status().isForbidden());
        }
    }

    @Test
    void adminMissingEventIs404WithStableCode() throws Exception {
        when(repository.findByIdAndDeletedFalse(10L)).thenReturn(Optional.empty());
        mockMvc.perform(request(HttpMethod.GET, "/api/v1/events/10").with(user("admin").roles("ADMIN")))
                .andExpect(status().isNotFound()).andExpect(jsonPath("$.code").value("EVENT_NOT_FOUND"));
    }

    @Test
    void adminInvalidTransitionsAre409WithStableCodes() throws Exception {
        Event event = Event.builder().id(10L).eventName("Ceremony").templateType(TemplateType.WEDDING)
                .eventDate(LocalDate.of(2027, 1, 10)).status(EventStatus.PUBLISHED).build();
        when(repository.findByIdAndDeletedFalse(10L)).thenReturn(Optional.of(event));
        mockMvc.perform(request(HttpMethod.PATCH, "/api/v1/events/10/publish").with(user("admin").roles("ADMIN")))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("EVENT_ALREADY_PUBLISHED"));
        event.setStatus(EventStatus.DRAFT);
        mockMvc.perform(request(HttpMethod.PATCH, "/api/v1/events/10/unpublish").with(user("admin").roles("ADMIN")))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("EVENT_NOT_PUBLISHED"));
    }
}
