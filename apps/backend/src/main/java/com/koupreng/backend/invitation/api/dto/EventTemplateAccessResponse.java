package com.koupreng.backend.invitation.api.dto;

/** An editor can check this event owner's template access without seeing purchase records. */
public record EventTemplateAccessResponse(long templateId, boolean hasAccess) { }
