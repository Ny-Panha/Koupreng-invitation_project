package com.koupreng.backend.invitation.application;

import static org.assertj.core.api.Assertions.*;
import org.junit.jupiter.api.Test;

class InvitationContentPolicyTests {
    @Test void downgradePreservesExistingBrandingButNewLogosRequireCapability() {
        String existing = "{\"brandMarkUrl\":\"/uploads/one.png\"}";
        assertThat(InvitationContentPolicy.addsCustomBranding(existing, existing)).isFalse();
        assertThat(InvitationContentPolicy.addsCustomBranding(existing, "{}")).isFalse();
        assertThat(InvitationContentPolicy.addsCustomBranding(null, existing)).isTrue();
        assertThat(InvitationContentPolicy.addsCustomBranding("{malformed-json", "{\"brandMarkUrl\":\"\"}")).isFalse();
        assertThat(InvitationContentPolicy.addsCustomBranding("{malformed-json", "{\"brandMarkUrl\":\"/uploads/new.png\"}")).isTrue();
    }
    @Test void validatesCalendarDaysWithoutChangingLegacyText() {
        assertThatCode(() -> InvitationContentPolicy.validate("{\"schedule\":[{\"date\":\"2028-02-29\",\"day\":2,\"time\":\"៥:០០ ល្ងាច\"}]}" )).doesNotThrowAnyException();
        for (String content : new String[]{"{", "[]", "{\"schedule\":{}}", "{\"schedule\":[{\"date\":\"2027-02-29\"}]}", "{\"schedule\":[{\"day\":31}]}"})
            assertThatThrownBy(() -> InvitationContentPolicy.validate(content)).hasMessageContaining("program dates");
        assertThatCode(() -> InvitationContentPolicy.validate("{\"schedule\":[{\"time\":\"៥:០០ ល្ងាច\",\"dayTitle\":\"Legacy\"}]}" )).doesNotThrowAnyException();
    }
    @Test void acceptsAdditiveMultiDaySettingsAndUnknownExtensions() {
        assertThatCode(() -> InvitationContentPolicy.validate("""
            {"programDays":[{"id":"a","date":"2028-02-29","titleEn":"Our day","extension":42}],
             "schedule":[{"id":"one","day":3,"dayId":"a","title":"ពិធី","enabled":false}],
             "eventDate":"2028-02-29","eventTime":"07:30","eventTimezone":"Asia/Phnom_Penh",
             "saveTheDate":{"enabled":true,"showCalendar":true,"numerals":"khmer","countdownStyle":"circles"},"futureField":{"keep":true}}
            """)).doesNotThrowAnyException();
    }
    @Test void rejectsMalformedMetadataOversizedTextInvalidZonesAndDstGaps() {
        for (String content : new String[]{
            "{\"programDays\":{}}", "{\"programDays\":[{\"id\":\"a\"},{\"id\":\"a\"}]}",
            "{\"schedule\":[{\"dayId\":\"orphan\"}]}", "{\"schedule\":[{\"title\":{}}]}",
            "{\"saveTheDate\":{\"showCalendar\":\"yes\"}}", "{\"eventTimezone\":\"Not/AZone\"}",
            "{\"eventDate\":\"2027-03-14\",\"eventTime\":\"02:30\",\"eventTimezone\":\"America/New_York\"}",
            "{\"eventDate\":\"2027-01-01\",\"eventTime\":\"17:00\",\"eventEndTime\":\"16:00\"}",
            "{\"schedule\":[{\"description\":\"" + "x".repeat(5001) + "\"}]}"})
            assertThatThrownBy(() -> InvitationContentPolicy.validate(content)).hasMessageContaining("program dates");
    }
}
