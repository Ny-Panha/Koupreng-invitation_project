package com.koupreng.backend.controller;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.koupreng.backend.dto.ApiResponse;
import com.koupreng.backend.dto.EventRequest;
import com.koupreng.backend.dto.EventResponse;
import com.koupreng.backend.service.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/events")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Events", description = "ADMIN-only lifecycle operations for the legacy event model.")
@SecurityRequirement(name = "bearerAuth")
public class EventController {

    private final EventService eventService;

    // ─── CREATE ──────────────────────────────────────────────────────────────
    // POST /api/v1/events
    @PostMapping
    public ResponseEntity<ApiResponse<EventResponse>> createEvent(
            @Valid @RequestBody EventRequest request) {

        EventResponse response = eventService.createEvent(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Event created successfully", response));
    }

    // ─── GET ALL ─────────────────────────────────────────────────────────────
    // GET /api/v1/events
    @GetMapping
    public ResponseEntity<ApiResponse<List<EventResponse>>> getAllEvents() {
        return ResponseEntity.ok(
                ApiResponse.success("Events fetched successfully", eventService.getAllEvents()));
    }

    // ─── GET BY ID (View Details) ─────────────────────────────────────────────
    // GET /api/v1/events/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EventResponse>> getEventById(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success("Event fetched successfully", eventService.getEventById(id)));
    }

    // ─── GET PUBLISHED ────────────────────────────────────────────────────────
    // GET /api/v1/events/published
    @GetMapping("/published")
    public ResponseEntity<ApiResponse<List<EventResponse>>> getPublishedEvents() {
        return ResponseEntity.ok(
                ApiResponse.success("Published events fetched", eventService.getPublishedEvents()));
    }

    // ─── GET DRAFTS ───────────────────────────────────────────────────────────
    // GET /api/v1/events/drafts
    @GetMapping("/drafts")
    public ResponseEntity<ApiResponse<List<EventResponse>>> getDraftEvents() {
        return ResponseEntity.ok(
                ApiResponse.success("Draft events fetched", eventService.getDraftEvents()));
    }

    // ─── PREVIEW ──────────────────────────────────────────────────────────────
    // GET /api/v1/events/{id}/preview
    @GetMapping("/{id}/preview")
    public ResponseEntity<ApiResponse<EventResponse>> previewEvent(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success("Event preview loaded", eventService.previewEvent(id)));
    }

    // ─── UPDATE ───────────────────────────────────────────────────────────────
    // PUT /api/v1/events/{id}
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EventResponse>> updateEvent(
            @PathVariable Long id,
            @Valid @RequestBody EventRequest request) {

        return ResponseEntity.ok(
                ApiResponse.success("Event updated successfully", eventService.updateEvent(id, request)));
    }

    // ─── SAVE AS DRAFT ────────────────────────────────────────────────────────
    // PATCH /api/v1/events/{id}/draft
    @PatchMapping("/{id}/draft")
    public ResponseEntity<ApiResponse<EventResponse>> saveAsDraft(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success("Event saved as draft", eventService.saveAsDraft(id)));
    }

    // ─── PUBLISH ──────────────────────────────────────────────────────────────
    // PATCH /api/v1/events/{id}/publish
    @PatchMapping("/{id}/publish")
    public ResponseEntity<ApiResponse<EventResponse>> publishEvent(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success("Event published successfully", eventService.publishEvent(id)));
    }

    // ─── UNPUBLISH ────────────────────────────────────────────────────────────
    // PATCH /api/v1/events/{id}/unpublish
    @PatchMapping("/{id}/unpublish")
    public ResponseEntity<ApiResponse<EventResponse>> unpublishEvent(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success("Event unpublished successfully", eventService.unpublishEvent(id)));
    }

    // ─── DELETE (soft) ────────────────────────────────────────────────────────
    // DELETE /api/v1/events/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.ok(ApiResponse.success("Event deleted successfully", null));
    }
}
