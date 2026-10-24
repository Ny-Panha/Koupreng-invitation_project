package com.koupreng.backend.invitation.application;

import static org.assertj.core.api.Assertions.*;
import org.junit.jupiter.api.Test;

class InvitationContentPolicyTests {
    @Test void downgradePreservesExistingBrandingButNewLogosRequireCapability() {
        String existing = "{\"brandMarkUrl\":\"/uploads/one.png\"}";
        assertThat(InvitationContentPolicy.addsCustomBranding(existing, existing)).isFalse();
        assertThat(InvitationContentPolicy.addsCustomBranding(existing, "{}")).isFalse();
        assertThat(InvitationContentPolicy.addsCustomBranding(null, existing)).isTrue();
    }
    @Test void validatesCalendarDaysWithoutChangingLegacyText() {
        assertThatCode(() -> InvitationContentPolicy.validate("{\"schedule\":[{\"date\":\"2028-02-29\",\"day\":2,\"time\":\"៥:០០ ល្ងាច\"}]}" )).doesNotThrowAnyException();
        for (String content : new String[]{"{", "[]", "{\"schedule\":{}}", "{\"schedule\":[{\"date\":\"2027-02-29\"}]}", "{\"schedule\":[{\"day\":3}]}"})
            assertThatThrownBy(() -> InvitationContentPolicy.validate(content)).hasMessageContaining("program dates");
        assertThatCode(() -> InvitationContentPolicy.validate("{\"schedule\":[{\"time\":\"៥:០០ ល្ងាច\",\"dayTitle\":\"Legacy\"}]}" )).doesNotThrowAnyException();
    }
}
