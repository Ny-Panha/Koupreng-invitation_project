package com.koupreng.backend.ticket.api;

import com.koupreng.backend.shared.response.ApiResponse;
import com.koupreng.backend.ticket.api.dto.*;
import com.koupreng.backend.ticket.application.TicketService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(value = "/api/v1", produces = "application/json")
@io.swagger.v3.oas.annotations.tags.Tag(name = "Invitation Tickets", description = "Event-owned ticket appearance and minimal personalized guest display. Existing guest invite tokens remain the check-in identity.")
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
    @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<TicketDesignResponse>> design(Authentication auth, @PathVariable Long eventId) {
        return response(service.design(auth, eventId));
    }
    @PutMapping("/invitations/{eventId}/ticket-design")
    @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = "bearerAuth")
    @io.swagger.v3.oas.annotations.parameters.RequestBody(content = @io.swagger.v3.oas.annotations.media.Content(
            examples = @io.swagger.v3.oas.annotations.media.ExampleObject(name = "ticketDesign", value = """
                {"version":0,"layout":"GOLD","accent":"#956d2c","font":"MOUL","frame":"DOUBLE",
                 "header":"សូមគោរពអញ្ជើញ","footer":"Present this ticket at the entrance",
                 "backgroundMediaId":null,"coverMediaId":null,"showGroup":false,"showTable":true,"showSeatCount":true}
                """)))
    public ResponseEntity<ApiResponse<TicketDesignResponse>> save(Authentication auth, @PathVariable Long eventId,
            @Valid @RequestBody TicketDesignRequest request) { return response(service.save(auth, eventId, request)); }
    @GetMapping("/invitations/{eventId}/ticket")
    @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<TicketResponse>> general(Authentication auth, @PathVariable Long eventId) {
        return response(service.ownerTicket(auth, eventId, null));
    }
    @GetMapping("/invitations/{eventId}/guests/{guestId}/ticket")
    @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<TicketResponse>> guest(Authentication auth, @PathVariable Long eventId, @PathVariable Long guestId) {
        return response(service.ownerTicket(auth, eventId, guestId));
    }
    @GetMapping("/public/invitations/{slug}/ticket")
    public ResponseEntity<ApiResponse<TicketResponse>> publicTicket(@PathVariable String slug,
            @RequestParam(required = false) String token, @RequestParam(required = false) String accessToken) {
        return response(service.publicTicket(slug, token, accessToken));
    }
}
