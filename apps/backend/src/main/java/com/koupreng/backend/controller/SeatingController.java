package com.koupreng.backend.controller;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.koupreng.backend.dto.ApiResponse;
import com.koupreng.backend.dto.seating.EventTableRequest;
import com.koupreng.backend.dto.seating.EventTableResponse;
import com.koupreng.backend.dto.seating.SeatAssignmentRequest;
import com.koupreng.backend.dto.seating.SeatAssignmentResponse;
import com.koupreng.backend.dto.seating.SeatingPlanResponse;
import com.koupreng.backend.dto.seating.SeatingSummaryResponse;
import com.koupreng.backend.service.SeatingService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Validated
@RequestMapping("/api/v1/invitations/{invitationId}")
@Tag(name = "Seating", description = "Invitation-owner tables, seat assignments, summaries, and exports.")
@SecurityRequirement(name = "bearerAuth")
public class SeatingController {

    private final SeatingService seatingService;

    public SeatingController(SeatingService seatingService) {
        this.seatingService = seatingService;
    }

    @GetMapping("/seating")
    public ResponseEntity<ApiResponse<SeatingPlanResponse>> plan(
            Authentication authentication,
            @PathVariable Long invitationId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Seating plan fetched successfully",
                seatingService.plan(authentication, invitationId)
        ));
    }

    @GetMapping("/tables")
    public ResponseEntity<ApiResponse<List<EventTableResponse>>> getTables(
            Authentication authentication,
            @PathVariable Long invitationId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Tables fetched successfully",
                seatingService.listTables(authentication, invitationId)
        ));
    }

    @PostMapping({"/seating/tables", "/tables"})
    public ResponseEntity<ApiResponse<EventTableResponse>> createTable(
            Authentication authentication,
            @PathVariable Long invitationId,
            @Valid @RequestBody EventTableRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Table created successfully",
                seatingService.createTable(authentication, invitationId, request)
        ));
    }

    @PutMapping({"/seating/tables/{tableId}", "/tables/{tableId}"})
    public ResponseEntity<ApiResponse<EventTableResponse>> updateTable(
            Authentication authentication,
            @PathVariable Long invitationId,
            @PathVariable Long tableId,
            @Valid @RequestBody EventTableRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Table updated successfully",
                seatingService.updateTable(authentication, invitationId, tableId, request)
        ));
    }

    @DeleteMapping({"/seating/tables/{tableId}", "/tables/{tableId}"})
    public ResponseEntity<ApiResponse<Void>> deleteTable(
            Authentication authentication,
            @PathVariable Long invitationId,
            @PathVariable Long tableId
    ) {
        seatingService.deleteTable(authentication, invitationId, tableId);
        return ResponseEntity.ok(ApiResponse.success("Table deleted successfully", null));
    }

    @PostMapping("/seating/assignments")
    public ResponseEntity<ApiResponse<SeatAssignmentResponse>> assign(
            Authentication authentication,
            @PathVariable Long invitationId,
            @Valid @RequestBody SeatAssignmentRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Guest assigned successfully",
                seatingService.assign(authentication, invitationId, request)
        ));
    }

    @PostMapping("/tables/{tableId}/assign-guests")
    public ResponseEntity<ApiResponse<SeatAssignmentResponse>> assignToTable(
            Authentication authentication,
            @PathVariable Long invitationId,
            @PathVariable Long tableId,
            @Valid @RequestBody SeatAssignmentRequest request
    ) {
        request.setTableId(tableId);
        return ResponseEntity.ok(ApiResponse.success(
                "Guest assigned successfully",
                seatingService.assign(authentication, invitationId, request)
        ));
    }

    @DeleteMapping("/seating/assignments/{assignmentId}")
    public ResponseEntity<ApiResponse<Void>> unassign(
            Authentication authentication,
            @PathVariable Long invitationId,
            @PathVariable Long assignmentId
    ) {
        seatingService.unassign(authentication, invitationId, assignmentId);
        return ResponseEntity.ok(ApiResponse.success("Guest unassigned successfully", null));
    }

    @DeleteMapping("/guests/{guestId}/seat")
    public ResponseEntity<ApiResponse<Void>> unassignGuest(
            Authentication authentication,
            @PathVariable Long invitationId,
            @PathVariable Long guestId
    ) {
        seatingService.unassignGuest(authentication, invitationId, guestId);
        return ResponseEntity.ok(ApiResponse.success("Guest unassigned successfully", null));
    }

    @GetMapping("/seating/summary")
    public ResponseEntity<ApiResponse<SeatingSummaryResponse>> summary(
            Authentication authentication,
            @PathVariable Long invitationId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Seating summary fetched successfully",
                seatingService.summary(authentication, invitationId)
        ));
    }

    @GetMapping("/seating/export")
    public ResponseEntity<String> export(
            Authentication authentication,
            @PathVariable Long invitationId
    ) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"seating-plan-" + invitationId + ".csv\"")
                .contentType(new MediaType("text", "csv"))
                .body(seatingService.exportCsv(authentication, invitationId));
    }
}
