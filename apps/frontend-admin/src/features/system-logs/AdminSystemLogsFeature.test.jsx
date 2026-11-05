import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AdminSystemLogsFeature from "./AdminSystemLogsFeature";
import { AdminLanguageProvider } from "../../app/providers/AdminLanguageProvider";

const mockLogs = [
  {
    id: 1,
    actorUserId: 1,
    actorEmail: "admin@koupreng.com",
    action: "ADMIN_LOGIN",
    resourceType: "USER",
    resourceId: 1,
    description: "Successful administrative login from IP 192.168.1.1",
    ipAddress: "192.168.1.1",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    metadataJson: '{"sessionId": "sess_123", "role": "ADMIN"}',
    createdAt: "2026-11-04T10:00:00Z",
  },
  {
    id: 2,
    actorUserId: 1,
    actorEmail: "admin@koupreng.com",
    action: "NOTIFICATION_CREATED",
    resourceType: "NOTIFICATION",
    resourceId: 101,
    description: "Created notification with secretToken=secret_pass_999 and Bearer eyJhbGciOiJIUzI1NiJ9.abc",
    ipAddress: "192.168.1.1",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    metadataJson: '{"type": "SYSTEM_ALERT", "apiKey": "live_key_xyz888", "target": "all"}',
    createdAt: "2026-11-04T11:00:00Z",
  },
  {
    id: 3,
    actorUserId: 2,
    actorEmail: "operator@koupreng.com",
    action: "PAYMENT_CONFIRMED",
    resourceType: "PAYMENT",
    resourceId: 999,
    description: "Verified ABA PayWay transaction for order ORD-555",
    ipAddress: "10.0.0.5",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    metadataJson: '{"orderCode": "ORD-555", "amount": 15.00, "currency": "USD"}',
    createdAt: "2026-11-04T12:00:00Z",
  },
];

const { mockAdminService } = vi.hoisted(() => ({
  mockAdminService: {
    systemLogs: vi.fn(),
  },
}));

vi.mock("../../shared/api", () => ({
  default: mockAdminService,
  adminService: mockAdminService,
  adminManagementService: mockAdminService,
}));

vi.mock("../../shared/api/adminService", () => ({
  default: mockAdminService,
  adminService: mockAdminService,
  adminManagementService: mockAdminService,
}));

describe("AdminSystemLogsFeature Audit Immutability & Privacy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem("koupreng.admin.lang", "en");
    mockAdminService.systemLogs.mockResolvedValue([...mockLogs]);
  });

  afterEach(() => {
    cleanup();
    localStorage.removeItem("koupreng.admin.lang");
  });

  it("renders audit log entries with actor, action, and IP address", async () => {
    render(
      <AdminLanguageProvider>
        <MemoryRouter>
          <AdminSystemLogsFeature />
        </MemoryRouter>
      </AdminLanguageProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("ADMIN_LOGIN")).toBeInTheDocument();
      expect(screen.getByText("NOTIFICATION_CREATED")).toBeInTheDocument();
      expect(screen.getByText("PAYMENT_CONFIRMED")).toBeInTheDocument();
      expect(screen.getAllByText("admin@koupreng.com").length).toBeGreaterThan(0);
      expect(screen.getByText("10.0.0.5")).toBeInTheDocument();
    });
  });

  it("redacts sensitive tokens and bearer credentials from descriptions", async () => {
    render(
      <AdminLanguageProvider>
        <MemoryRouter>
          <AdminSystemLogsFeature />
        </MemoryRouter>
      </AdminLanguageProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("NOTIFICATION_CREATED")).toBeInTheDocument();
    });

    // The raw description had: "Created notification with secretToken=secret_pass_999 and Bearer eyJhbGciOiJIUzI1NiJ9.abc"
    // Redacted should contain [REDACTED] and NEVER the raw secret
    expect(screen.queryByText(/secret_pass_999/)).not.toBeInTheDocument();
    expect(screen.queryByText(/eyJhbGciOiJIUzI1NiJ9/)).not.toBeInTheDocument();
  });

  it("filters logs by search query and action dropdown", async () => {
    render(
      <AdminLanguageProvider>
        <MemoryRouter>
          <AdminSystemLogsFeature />
        </MemoryRouter>
      </AdminLanguageProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("ADMIN_LOGIN")).toBeInTheDocument();
    });

    // Search by IP
    const searchInput = screen.getByPlaceholderText(/Search logs/i);
    fireEvent.change(searchInput, { target: { value: "10.0.0.5" } });

    expect(screen.getByText("PAYMENT_CONFIRMED")).toBeInTheDocument();
    expect(screen.queryByText("ADMIN_LOGIN")).not.toBeInTheDocument();
    expect(screen.queryByText("NOTIFICATION_CREATED")).not.toBeInTheDocument();

    // Clear search
    fireEvent.change(searchInput, { target: { value: "" } });

    // Filter by action: LOGIN
    const actionSelect = screen.getByLabelText(/All Actions/i);
    fireEvent.change(actionSelect, { target: { value: "LOGIN" } });

    expect(screen.getByText("ADMIN_LOGIN")).toBeInTheDocument();
    expect(screen.queryByText("PAYMENT_CONFIRMED")).not.toBeInTheDocument();
  });

  it("opens inspection drawer showing full metadata JSON with secrets scrubbed", async () => {
    render(
      <AdminLanguageProvider>
        <MemoryRouter>
          <AdminSystemLogsFeature />
        </MemoryRouter>
      </AdminLanguageProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("NOTIFICATION_CREATED")).toBeInTheDocument();
    });

    // Click inspect on the second log row (NOTIFICATION_CREATED)
    const inspectButtons = screen.getAllByRole("button", { name: /Inspect/i });
    fireEvent.click(inspectButtons[1]);

    const drawer = await screen.findByRole("dialog", { name: /Audit Log Entry #2/i });
    expect(drawer).toBeInTheDocument();
    expect(within(drawer).getByText("NOTIFICATION_CREATED")).toBeInTheDocument();
    expect(within(drawer).getByText("User Agent")).toBeInTheDocument();

    // In metadata JSON, "apiKey": "live_key_xyz888" should be scrubbed
    expect(within(drawer).getByText(/"apiKey": "\[REDACTED\]"/)).toBeInTheDocument();
    expect(within(drawer).queryByText(/live_key_xyz888/)).not.toBeInTheDocument();

    // Press Escape to close
    fireEvent.keyDown(window, { key: "Escape" });
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("preserves audit log immutability with no delete or clear actions", async () => {
    render(
      <AdminLanguageProvider>
        <MemoryRouter>
          <AdminSystemLogsFeature />
        </MemoryRouter>
      </AdminLanguageProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("ADMIN_LOGIN")).toBeInTheDocument();
    });

    // Ensure no delete, remove, clear, or purge buttons exist in the document
    expect(screen.queryByRole("button", { name: /delete|remove|clear|purge/i })).not.toBeInTheDocument();
  });
});

