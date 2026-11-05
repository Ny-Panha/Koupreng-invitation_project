import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AdminNotificationsFeature from "./AdminNotificationsFeature";
import { AdminLanguageProvider } from "../../app/providers/AdminLanguageProvider";

const mockNotifications = [
  {
    id: 101,
    userId: 5,
    recipientEmail: "client@example.com",
    title: "Event Reminder",
    message: "Your wedding date is coming up in 7 days.",
    type: "SYSTEM_ALERT",
    channel: "SYSTEM",
    status: "DELIVERED",
    createdAt: "2026-11-01T10:00:00Z",
  },
  {
    id: 102,
    userId: null,
    recipientEmail: null,
    title: "System Maintenance Notice",
    message: "Routine database maintenance scheduled this Sunday at 2 AM ICT.",
    type: "ADMIN_NOTICE",
    channel: "EMAIL",
    status: "SENT",
    createdAt: "2026-11-02T12:00:00Z",
  },
  {
    id: 103,
    userId: 12,
    recipientEmail: "vip@example.com",
    title: "Telegram Verification Failed",
    message: "Could not reach Telegram gateway.",
    type: "SYSTEM_ALERT",
    channel: "TELEGRAM",
    status: "FAILED",
    errorMessage: "Bot was blocked by user",
    createdAt: "2026-11-03T14:00:00Z",
  },
];

const { mockAdminService } = vi.hoisted(() => ({
  mockAdminService: {
    notifications: vi.fn(),
    createNotification: vi.fn(),
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

describe("AdminNotificationsFeature UX & Broadcast Safety", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem("koupreng.admin.lang", "en");
    mockAdminService.notifications.mockResolvedValue([...mockNotifications]);
  });

  afterEach(() => {
    cleanup();
    localStorage.removeItem("koupreng.admin.lang");
  });

  it("renders notification composer and history table with mock data", async () => {
    render(
      <AdminLanguageProvider>
        <MemoryRouter>
          <AdminNotificationsFeature />
        </MemoryRouter>
      </AdminLanguageProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Event Reminder")).toBeInTheDocument();
      expect(screen.getByText("System Maintenance Notice")).toBeInTheDocument();
      expect(screen.getByText("Telegram Verification Failed")).toBeInTheDocument();
      expect(screen.getByText("client@example.com")).toBeInTheDocument();
      expect(screen.getByText("Bot was blocked by user")).toBeInTheDocument();
    });
  });

  it("requires a valid numeric User ID in Single User mode", async () => {
    render(
      <AdminLanguageProvider>
        <MemoryRouter>
          <AdminNotificationsFeature />
        </MemoryRouter>
      </AdminLanguageProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Event Reminder")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Title/i), {
      target: { value: "Test Title" },
    });
    fireEvent.change(screen.getByLabelText(/Message Content/i), {
      target: { value: "Test Message Content" },
    });

    // Leave Recipient User ID empty and submit using the submit button
    const submitBtn = screen.getByRole("button", { name: /^Send Notification$/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/Please provide a valid numeric User ID/i)
      ).toBeInTheDocument();
    });
    expect(mockAdminService.createNotification).not.toHaveBeenCalled();
  });

  it("rejects dangerous action URLs with javascript: schemes", async () => {
    render(
      <AdminLanguageProvider>
        <MemoryRouter>
          <AdminNotificationsFeature />
        </MemoryRouter>
      </AdminLanguageProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Event Reminder")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Recipient User ID/i), {
      target: { value: "42" },
    });
    fireEvent.change(screen.getByLabelText(/Title/i), {
      target: { value: "Test Title" },
    });
    fireEvent.change(screen.getByLabelText(/Message Content/i), {
      target: { value: "Test Message Content" },
    });
    fireEvent.change(screen.getByLabelText(/Action URL/i), {
      target: { value: "javascript:alert(1)" },
    });

    const submitBtn = screen.getByRole("button", { name: /^Send Notification$/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/Invalid action URL/i)
      ).toBeInTheDocument();
    });
    expect(mockAdminService.createNotification).not.toHaveBeenCalled();
  });

  it("opens broadcast confirmation modal when in Broadcast mode and executes on confirm", async () => {
    mockAdminService.createNotification.mockResolvedValueOnce({
      id: 104,
      userId: null,
      title: "Global Platform Announcement",
      message: "Important service update for all users.",
      type: "SYSTEM_ALERT",
      channel: "SYSTEM",
      status: "SENT",
      createdAt: "2026-11-05T15:00:00Z",
    });

    render(
      <AdminLanguageProvider>
        <MemoryRouter>
          <AdminNotificationsFeature />
        </MemoryRouter>
      </AdminLanguageProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Event Reminder")).toBeInTheDocument();
    });

    // Select Broadcast audience
    const broadcastBtn = screen.getByRole("button", {
      name: /All Users Broadcast/i,
    });
    fireEvent.click(broadcastBtn);

    // Verify warning banner appears
    expect(
      screen.getByText(/System-wide announcement visible to all registered platform users/i)
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Title/i), {
      target: { value: "Global Platform Announcement" },
    });
    fireEvent.change(screen.getByLabelText(/Message Content/i), {
      target: { value: "Important service update for all users." },
    });

    // Submit form -> should trigger confirmation modal
    const submitBtn = screen.getByRole("button", { name: /^Send Notification$/i });
    fireEvent.click(submitBtn);

    const modal = await screen.findByRole("dialog", {
      name: /Confirm Broadcast Announcement/i,
    });
    expect(modal).toBeInTheDocument();
    expect(
      within(modal).getByText(/This action cannot be undone once confirmed/i)
    ).toBeInTheDocument();

    // Confirm broadcast in modal
    const confirmBtn = within(modal).getByRole("button", {
      name: /Confirm & Broadcast/i,
    });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(mockAdminService.createNotification).toHaveBeenCalledWith({
        title: "Global Platform Announcement",
        message: "Important service update for all users.",
        type: "SYSTEM_ALERT",
        channel: "SYSTEM",
        userId: null,
      });
    });

    // Verify modal closes and new announcement is listed
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(screen.getByText("Global Platform Announcement")).toBeInTheDocument();
    });
  });

  it("filters notification history by status tabs", async () => {
    render(
      <AdminLanguageProvider>
        <MemoryRouter>
          <AdminNotificationsFeature />
        </MemoryRouter>
      </AdminLanguageProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Event Reminder")).toBeInTheDocument();
      expect(screen.getByText("System Maintenance Notice")).toBeInTheDocument();
      expect(screen.getByText("Telegram Verification Failed")).toBeInTheDocument();
    });

    // Click FAILED status tab
    const failedTab = screen.getByRole("button", { name: "FAILED" });
    fireEvent.click(failedTab);

    expect(screen.getByText("Telegram Verification Failed")).toBeInTheDocument();
    expect(screen.queryByText("Event Reminder")).not.toBeInTheDocument();
    expect(screen.queryByText("System Maintenance Notice")).not.toBeInTheDocument();
  });
});
