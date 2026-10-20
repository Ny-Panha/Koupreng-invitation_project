package com.koupreng.backend.invitation.application;

import com.koupreng.backend.invitation.domain.UserInvitation;
import com.koupreng.backend.shared.exception.ApiException;
import com.koupreng.backend.user.domain.AppUser;
import com.koupreng.backend.user.domain.Role;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class EventAccessPolicyTests {
    @Test
    void onlyOwnerReceivesWorkspacePermissionsRegardlessOfGlobalRole() {
        AppUser owner = new AppUser();
        owner.setId(1L);
        UserInvitation event = new UserInvitation();
        event.setUser(owner);
        for (var permission : EventAccessPolicy.Permission.values()) {
            assertDoesNotThrow(() -> EventAccessPolicy.requireOwner(owner, event, permission));
            for (Role role : Role.values()) {
                AppUser other = new AppUser();
                other.setId(2L);
                other.setRole(role);
                assertThrows(ApiException.class, () -> EventAccessPolicy.requireOwner(other, event, permission));
            }
        }
        event.setDeleted(true);
        assertThrows(ApiException.class, () -> EventAccessPolicy.requireOwner(owner, event,
                EventAccessPolicy.Permission.VIEW_EVENT));
    }
}
