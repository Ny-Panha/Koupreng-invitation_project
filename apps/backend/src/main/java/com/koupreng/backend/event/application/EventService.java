package com.koupreng.backend.event.application;

import com.koupreng.backend.event.api.dto.EventRequest;
import com.koupreng.backend.event.api.dto.EventResponse;
import com.koupreng.backend.event.domain.Event;
import com.koupreng.backend.event.domain.EventStatus;
import com.koupreng.backend.event.infrastructure.persistence.EventRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;

    // ─── CREATE ──────────────────────────────────────────────────────────────

    @Transactional
    public EventResponse createEvent(EventRequest request) {
        Event event = Event.builder()
                .eventName(request.getEventName())
                .templateType(request.getTemplateType())
                .groom(request.getGroom())
                .bride(request.getBride())
                .eventDate(request.getEventDate())
                .eatingTime(request.getEatingTime())
                .location(request.getLocation())
                .description(request.getDescription())
                .coverImageUrl(request.getCoverImageUrl())
                .status(EventStatus.DRAFT)   // always start as draft
                .build();

        return toResponse(eventRepository.save(event));
    }

    // ─── READ ─────────────────────────────────────────────────────────────────

    public List<EventResponse> getAllEvents() {
        return eventRepository.findAllByDeletedFalse()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public EventResponse getEventById(Long id) {
        return toResponse(findActiveEvent(id));
    }

    public List<EventResponse> getPublishedEvents() {
        return eventRepository.findAllByStatusAndDeletedFalse(EventStatus.PUBLISHED)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<EventResponse> getDraftEvents() {
        return eventRepository.findAllByStatusAndDeletedFalse(EventStatus.DRAFT)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ─── UPDATE ───────────────────────────────────────────────────────────────

    @Transactional
    public EventResponse updateEvent(Long id, EventRequest request) {
        Event event = findActiveEvent(id);

        event.setEventName(request.getEventName());
        event.setTemplateType(request.getTemplateType());
        event.setGroom(request.getGroom());
        event.setBride(request.getBride());
        event.setEventDate(request.getEventDate());
        event.setEatingTime(request.getEatingTime());
        event.setLocation(request.getLocation());
        event.setDescription(request.getDescription());

        if (request.getCoverImageUrl() != null) {
            event.setCoverImageUrl(request.getCoverImageUrl());
        }

        return toResponse(eventRepository.save(event));
    }

    // ─── DELETE (Soft Delete) ─────────────────────────────────────────────────

    @Transactional
    public void deleteEvent(Long id) {
        Event event = findActiveEvent(id);
        event.setDeleted(true);
        eventRepository.save(event);
    }

    // ─── SAVE AS DRAFT ────────────────────────────────────────────────────────

    @Transactional
    public EventResponse saveAsDraft(Long id) {
        Event event = findActiveEvent(id);
        event.setStatus(EventStatus.DRAFT);
        return toResponse(eventRepository.save(event));
    }

    // ─── PUBLISH ──────────────────────────────────────────────────────────────

    @Transactional
    public EventResponse publishEvent(Long id) {
        Event event = findActiveEvent(id);

        if (event.getStatus() == EventStatus.PUBLISHED) {
            throw new IllegalStateException("Event is already published.");
        }

        event.setStatus(EventStatus.PUBLISHED);
        event.setPublishedAt(LocalDateTime.now());

        return toResponse(eventRepository.save(event));
    }

    // ─── UNPUBLISH ────────────────────────────────────────────────────────────

    @Transactional
    public EventResponse unpublishEvent(Long id) {
        Event event = findActiveEvent(id);

        if (event.getStatus() != EventStatus.PUBLISHED) {
            throw new IllegalStateException("Event is not published yet.");
        }

        event.setStatus(EventStatus.UNPUBLISHED);
        return toResponse(eventRepository.save(event));
    }

    // ─── PREVIEW (same as getById but could add view-count logic later) ───────

    public EventResponse previewEvent(Long id) {
        return toResponse(findActiveEvent(id));
    }

    // ─── HELPERS ──────────────────────────────────────────────────────────────

    private Event findActiveEvent(Long id) {
        return eventRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Event not found with id: " + id));
    }

    private EventResponse toResponse(Event event) {
        return EventResponse.builder()
                .id(event.getId())
                .eventName(event.getEventName())
                .templateType(event.getTemplateType())
                .groom(event.getGroom())
                .bride(event.getBride())
                .eventDate(event.getEventDate())
                .eatingTime(event.getEatingTime())
                .location(event.getLocation())
                .description(event.getDescription())
                .coverImageUrl(event.getCoverImageUrl())
                .status(event.getStatus())
                .createdAt(event.getCreatedAt())
                .updatedAt(event.getUpdatedAt())
                .publishedAt(event.getPublishedAt())
                .isPublished(event.getStatus() == EventStatus.PUBLISHED)
                .isDraft(event.getStatus() == EventStatus.DRAFT)
                .build();
    }
}
