package com.koupreng.backend.ticket.api.dto;

import jakarta.validation.constraints.*;

public record TicketDesignRequest(
        @NotNull @Min(0) Long version,
        @NotNull Layout layout,
        @NotBlank @Pattern(regexp = "#[0-9a-fA-F]{6}") String accent,
        @NotNull Font font,
        @NotNull Frame frame,
        @NotNull @Size(max = 100) String header,
        @NotNull @Size(max = 200) String footer,
        @Positive Long backgroundMediaId,
        @Positive Long coverMediaId,
        boolean showGroup,
        boolean showTable,
        boolean showSeatCount,
        @Min(0) @Max(100) Integer coverFocusX,
        @Min(0) @Max(100) Integer coverFocusY,
        Fit coverFit,
        @DecimalMin("0.0") @DecimalMax("0.4") Double backgroundOpacity) {
    public enum Layout { GOLD, MINIMAL, FLORAL, IVORY }
    public enum Font { MOUL, KANTUMRUY, CORMORANT }
    public enum Frame { DOUBLE, SINGLE, NONE }
    public enum Fit { COVER, CONTAIN }
    // Keep source and stored schema-1 designs compatible when the new fields are absent.
    public TicketDesignRequest(Long version, Layout layout, String accent, Font font, Frame frame,
            String header, String footer, Long backgroundMediaId, Long coverMediaId,
            boolean showGroup, boolean showTable, boolean showSeatCount) {
        this(version, layout, accent, font, frame, header, footer, backgroundMediaId, coverMediaId,
                showGroup, showTable, showSeatCount, null, null, null, null);
    }
    public static TicketDesignRequest defaults() {
        return new TicketDesignRequest(0L, Layout.GOLD, "#956d2c", Font.MOUL, Frame.DOUBLE,
                "សូមគោរពអញ្ជើញ", "សូមបង្ហាញកាតនេះនៅច្រកចូល · Present this ticket at the entrance", null, null, false, true, true);
    }
    public TicketDesignRequest withVersion(long revision) {
        return new TicketDesignRequest(revision, layout, accent, font, frame, header, footer,
                backgroundMediaId, coverMediaId, showGroup, showTable, showSeatCount,
                coverFocusX, coverFocusY, coverFit, backgroundOpacity);
    }
}
