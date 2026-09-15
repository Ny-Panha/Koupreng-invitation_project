package com.koupreng.backend.dto.dashboard;

import com.koupreng.backend.guest.api.dto.GuestResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GuestStatusReportResponse {

    private Long invitationId;
    private long totalGuests;
    private long ready;
    private long linkGenerated;
    private long sent;
    private long delivered;
    private long failed;
    private long opened;
    private long responded;
    private long notResponded;
    private List<GuestResponse> guests;
}
