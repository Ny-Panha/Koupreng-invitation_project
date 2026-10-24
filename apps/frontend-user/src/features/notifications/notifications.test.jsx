import { useLanguageStore } from "@/stores/useLanguageStore";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

beforeEach(() => useLanguageStore.setState({ lang: "en" }));
import NotificationsPage from "./NotificationsPage";
import { notificationsApi } from "./api/notificationsApi";

describe("Notifications Feature", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders notification summaries and notification items", async () => {
    vi.spyOn(notificationsApi, "summary").mockResolvedValue({
      unread: 2,
      sent: 10,
      delivered: 8,
      failed: 0,
    });

    vi.spyOn(notificationsApi, "list").mockResolvedValue([
      {
        id: 1,
        title: "Guest RSVP Confirmed",
        message: "Sok Dara accepted the invitation.",
        type: "RSVP",
        channel: "TELEGRAM",
        status: "DELIVERED",
        readAt: null,
        createdAt: "2026-09-01T10:00:00Z",
      },
    ]);

    render(<NotificationsPage />);

    await waitFor(() => {
      expect(screen.getByText("Guest RSVP Confirmed")).toBeInTheDocument();
      expect(screen.getByText("Sok Dara accepted the invitation.")).toBeInTheDocument();
      expect(screen.getByText("Unread")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
    });
  });

  it("handles marking a notification as read", async () => {
    vi.spyOn(notificationsApi, "summary").mockResolvedValue({
      unread: 1,
      sent: 5,
      delivered: 5,
      failed: 0,
    });

    vi.spyOn(notificationsApi, "list").mockResolvedValue([
      {
        id: 1,
        title: "Unread Alert",
        message: "Please review your budget.",
        type: "SYSTEM_ALERT",
        channel: "EMAIL",
        status: "SENT",
        readAt: null,
        createdAt: "2026-09-01T11:00:00Z",
      },
    ]);

    vi.spyOn(notificationsApi, "markRead").mockResolvedValue({
      id: 1,
      readAt: "2026-09-01T11:05:00Z",
      status: "READ",
    });

    render(<NotificationsPage />);

    await waitFor(() => {
      expect(screen.getByText("Unread Alert")).toBeInTheDocument();
    });

    const markReadBtn = screen.getByRole("button", { name: /^Mark read$/i });
    fireEvent.click(markReadBtn);

    await waitFor(() => {
      expect(notificationsApi.markRead).toHaveBeenCalledWith(1);
    });
  });
});
