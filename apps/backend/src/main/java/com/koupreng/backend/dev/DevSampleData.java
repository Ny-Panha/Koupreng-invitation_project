package com.koupreng.backend.dev;

/**
 * Stable identifiers shared by development fixtures and OpenAPI examples.
 * No production secrets or bearer tokens belong in this class.
 */
public final class DevSampleData {

    public static final String USER_EMAIL = "demo@koupreng.local";
    public static final String USER_PASSWORD = "DemoPass123!";
    public static final String ADMIN_EMAIL = "admin.demo@koupreng.local";
    public static final String ADMIN_PASSWORD = "AdminDemoPass123!";
    public static final String ORGANIZATION_SLUG = "koupreng-demo-events";
    public static final String TEMPLATE_CODE = "koupreng-demo-wedding";
    public static final String INVITATION_SLUG = "demo-wedding";
    public static final String INVITATION_ACCESS_TOKEN = "demo-invitation-access-token";
    public static final String ATTENDING_GUEST_TOKEN = "demo-guest-attending-token";
    public static final String DECLINED_GUEST_TOKEN = "demo-guest-declined-token";
    public static final String PENDING_GUEST_TOKEN = "demo-guest-pending-token";
    public static final String PACKAGE_CODE = "DEV_STARTER";

    private DevSampleData() {
    }
}
