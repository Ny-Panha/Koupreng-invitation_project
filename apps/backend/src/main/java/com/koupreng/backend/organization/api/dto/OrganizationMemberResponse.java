package com.koupreng.backend.organization.api.dto;

import com.koupreng.backend.organization.domain.OrganizationMember;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrganizationMemberResponse {

    private Long id;
    private Long userId;
    private String email;
    private String role;
    private String status;
    private Instant invitedAt;
    private Instant joinedAt;

    public static OrganizationMemberResponse from(OrganizationMember member) {
        return OrganizationMemberResponse.builder()
                .id(member.getId())
                .userId(member.getUser() == null ? null : member.getUser().getId())
                .email(member.getEmail())
                .role(member.getRole())
                .status(member.getStatus())
                .invitedAt(member.getInvitedAt())
                .joinedAt(member.getJoinedAt())
                .build();
    }
}
