package com.koupreng.backend.organization.api.dto;

import com.koupreng.backend.organization.domain.Organization;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrganizationResponse {

    private Long id;
    private String name;
    private String slug;
    private Long ownerUserId;
    private String status;
    private List<OrganizationMemberResponse> members;
    private Instant createdAt;

    public static OrganizationResponse from(Organization organization, List<OrganizationMemberResponse> members) {
        return OrganizationResponse.builder()
                .id(organization.getId())
                .name(organization.getName())
                .slug(organization.getSlug())
                .ownerUserId(organization.getOwner() == null ? null : organization.getOwner().getId())
                .status(organization.getStatus())
                .members(members)
                .createdAt(organization.getCreatedAt())
                .build();
    }
}
