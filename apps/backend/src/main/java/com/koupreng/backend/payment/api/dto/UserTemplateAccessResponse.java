package com.koupreng.backend.payment.api.dto;

import com.koupreng.backend.payment.domain.TemplatePaymentOrder;
import com.koupreng.backend.payment.domain.UserTemplateAccess;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserTemplateAccessResponse {

    private Long templateId;
    private String templateName;
    private String accessType;
    private Boolean active;
    private Instant createdAt;

    public static UserTemplateAccessResponse from(UserTemplateAccess access) {
        TemplatePaymentOrder order = access.getOrder();
        return UserTemplateAccessResponse.builder()
                .templateId(access.getTemplateId())
                .templateName(order == null ? null : order.getTemplateName())
                .accessType(access.getAccessType())
                .active(access.getActive())
                .createdAt(access.getCreatedAt())
                .build();
    }
}
