package com.koupreng.backend.guest.api;

import com.koupreng.backend.guest.application.GuestDashboardService;
import com.koupreng.backend.guest.api.dto.*;
import com.koupreng.backend.shared.response.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/invitations/{invitationId}/guests")
@io.swagger.v3.oas.annotations.security.SecurityRequirement(name="bearerAuth")
@io.swagger.v3.oas.annotations.tags.Tag(name="Guests",description="Permission-checked guest pages, record/seat totals and bounded selection exports.")
public class GuestDashboardController {
    private final GuestDashboardService service;
    public GuestDashboardController(GuestDashboardService service) { this.service=service; }
    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<GuestOverviewResponse>> overview(Authentication auth,@PathVariable Long invitationId) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(ApiResponse.success("Guest overview",service.overview(auth,invitationId)));
    }
    @GetMapping("/page")
    public ResponseEntity<ApiResponse<GuestPageResponse>> page(Authentication auth,@PathVariable Long invitationId,
            @RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="25") int size,@RequestParam(defaultValue="") String search,
            @RequestParam(defaultValue="") String group,@RequestParam(defaultValue="") String category,@RequestParam(defaultValue="") String status) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(ApiResponse.success("Guest page",service.page(auth,invitationId,page,size,search,group,category,status)));
    }
    @PostMapping(value="/export-selection",produces="text/csv")
    public ResponseEntity<String> export(Authentication auth,@PathVariable Long invitationId,@Valid @RequestBody GuestSelectionExportRequest request) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).header(HttpHeaders.CONTENT_DISPOSITION,"attachment; filename=\"selected-guests-"+invitationId+".csv\"")
                .contentType(new MediaType("text","csv",java.nio.charset.StandardCharsets.UTF_8)).body(service.exportSelection(auth,invitationId,request));
    }
}
