package com.koupreng.backend.ticket.api;

import com.koupreng.backend.shared.response.ApiResponse;
import com.koupreng.backend.ticket.api.dto.*;
import com.koupreng.backend.ticket.application.TicketService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
public class TicketController {
    private final TicketService service;
    public TicketController(TicketService service) { this.service = service; }
    @ExceptionHandler({org.springframework.dao.OptimisticLockingFailureException.class,
            org.springframework.dao.DataIntegrityViolationException.class})
    public ResponseEntity<ApiResponse<Void>> conflict() {
        return ResponseEntity.status(409).header("Cache-Control", "no-store")
                .body(ApiResponse.error("Ticket design changed. Reload before saving."));
    }
    private <T> ResponseEntity<ApiResponse<T>> response(T data) {
        return ResponseEntity.ok().header("Cache-Control", "no-store, private")
                .header("Referrer-Policy", "no-referrer").header("X-Robots-Tag", "noindex, nofollow")
                .body(ApiResponse.success("Ticket ready", data));
    }
    @GetMapping("/invitations/{eventId}/ticket-design")
    public ResponseEntity<ApiResponse<TicketDesignResponse>> design(Authentication auth, @PathVariable Long eventId) {
        return response(service.design(auth, eventId));
    }
    @PutMapping("/invitations/{eventId}/ticket-design")
    public ResponseEntity<ApiResponse<TicketDesignResponse>> save(Authentication auth, @PathVariable Long eventId,
            @Valid @RequestBody TicketDesignRequest request) { return response(service.save(auth, eventId, request)); }
    @GetMapping("/invitations/{eventId}/ticket")
    public ResponseEntity<ApiResponse<TicketResponse>> general(Authentication auth, @PathVariable Long eventId) {
        return response(service.ownerTicket(auth, eventId, null));
    }
    @GetMapping("/invitations/{eventId}/guests/{guestId}/ticket")
    public ResponseEntity<ApiResponse<TicketResponse>> guest(Authentication auth, @PathVariable Long eventId, @PathVariable Long guestId) {
        return response(service.ownerTicket(auth, eventId, guestId));
    }
    @GetMapping("/public/invitations/{slug}/ticket")
    public ResponseEntity<ApiResponse<TicketResponse>> publicTicket(@PathVariable String slug,
            @RequestParam(required = false) String token, @RequestParam(required = false) String accessToken) {
        return response(service.publicTicket(slug, token, accessToken));
    }
}
