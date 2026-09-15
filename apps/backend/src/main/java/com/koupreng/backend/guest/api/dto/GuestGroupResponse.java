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
public class GuestGroupResponse {

    private String category;
    private int totalGuests;
    private List<GuestResponse> guests;
}
