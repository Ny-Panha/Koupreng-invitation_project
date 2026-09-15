package com.koupreng.backend.guest.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GuestSendListResponse {

    private Long invitationId;
    private String invitationSlug;
    private int totalGuests;
    private int sendableGuests;
    private List<GuestSendListItemResponse> guests;
}
