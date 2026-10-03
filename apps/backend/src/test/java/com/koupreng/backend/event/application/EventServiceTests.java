package com.koupreng.backend.event.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import com.koupreng.backend.event.api.dto.EventRequest;
import com.koupreng.backend.event.domain.Event;
import com.koupreng.backend.event.domain.EventStatus;
import com.koupreng.backend.event.domain.TemplateType;
import com.koupreng.backend.event.infrastructure.persistence.EventRepository;
import com.koupreng.backend.shared.exception.ApiException;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

class EventServiceTests {
    private final EventRepository repository = mock(EventRepository.class);
    private final EventService service = new EventService(repository);

    @Test
    void missingOrDeletedEventIsNotFound() {
        when(repository.findByIdAndDeletedFalse(10L)).thenReturn(Optional.empty());
        ApiException error = assertThrows(ApiException.class, () -> service.getEventById(10L));
        assertEquals(HttpStatus.NOT_FOUND, error.getStatus());
        assertEquals("EVENT_NOT_FOUND", error.getCode());
    }

    @Test
    void publishingPublishedEventIsConflict() {
        event(EventStatus.PUBLISHED);
        ApiException error = assertThrows(ApiException.class, () -> service.publishEvent(10L));
        assertEquals(HttpStatus.CONFLICT, error.getStatus());
        assertEquals("EVENT_ALREADY_PUBLISHED", error.getCode());
    }

    @Test
    void unpublishingDraftEventIsConflict() {
        event(EventStatus.DRAFT);
        ApiException error = assertThrows(ApiException.class, () -> service.unpublishEvent(10L));
        assertEquals(HttpStatus.CONFLICT, error.getStatus());
        assertEquals("EVENT_NOT_PUBLISHED", error.getCode());
    }

    @Test
    void lifecycleAndSoftDeletionPreserveEventData() {
        Event event = event(EventStatus.DRAFT);
        assertEquals(EventStatus.PUBLISHED, service.publishEvent(10L).getStatus());
        assertNotNull(event.getPublishedAt());
        assertEquals(EventStatus.UNPUBLISHED, service.unpublishEvent(10L).getStatus());
        assertEquals(EventStatus.DRAFT, service.saveAsDraft(10L).getStatus());
        assertEquals("Preserved ceremony", service.previewEvent(10L).getEventName());
        service.deleteEvent(10L);
        assertTrue(event.isDeleted());
        assertEquals("Preserved ceremony", event.getEventName());
    }

    @Test
    void createUpdateAndStatusListsStayAvailable() {
        when(repository.save(any(Event.class))).thenAnswer(invocation -> invocation.getArgument(0));
        EventRequest request = new EventRequest();
        request.setEventName("New ceremony");
        request.setEventDate(LocalDate.of(2027, 1, 10));
        request.setTemplateType(TemplateType.WEDDING);
        assertEquals(EventStatus.DRAFT, service.createEvent(request).getStatus());
        Event existing = event(EventStatus.DRAFT);
        existing.setCoverImageUrl("/uploads/existing.webp");
        assertEquals("New ceremony", service.updateEvent(10L, request).getEventName());
        assertEquals("/uploads/existing.webp", existing.getCoverImageUrl());
        when(repository.findAllByDeletedFalse()).thenReturn(List.of(existing));
        when(repository.findAllByStatusAndDeletedFalse(EventStatus.DRAFT)).thenReturn(List.of(existing));
        when(repository.findAllByStatusAndDeletedFalse(EventStatus.PUBLISHED)).thenReturn(List.of());
        assertEquals(1, service.getAllEvents().size());
        assertEquals(1, service.getDraftEvents().size());
        assertTrue(service.getPublishedEvents().isEmpty());
        verify(repository).findAllByDeletedFalse();
    }

    private Event event(EventStatus status) {
        Event event = Event.builder().id(10L).eventName("Preserved ceremony")
                .templateType(TemplateType.WEDDING).eventDate(LocalDate.of(2027, 1, 10)).status(status).build();
        when(repository.findByIdAndDeletedFalse(10L)).thenReturn(Optional.of(event));
        when(repository.save(any(Event.class))).thenAnswer(invocation -> invocation.getArgument(0));
        return event;
    }
}
