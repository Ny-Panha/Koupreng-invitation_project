package com.koupreng.backend.payment.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TemplateAccessCheckResponse {

    private Long templateId;
    private boolean hasAccess;
}
