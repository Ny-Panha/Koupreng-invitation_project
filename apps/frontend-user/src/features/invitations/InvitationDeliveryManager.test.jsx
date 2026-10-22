import { render, screen, waitFor, cleanup } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import InvitationDeliveryManager from "./InvitationDeliveryManager";
import { useLanguageStore } from "@/stores/useLanguageStore";

vi.mock("@/features/invitations/api/invitationApi", () => ({
  invitationService: {
    get: vi.fn(),
  },
}));

vi.mock("@/features/invitations/api/deliveryApi", () => ({
  deliveryService: {
    summary: vi.fn(),
    events: vi.fn(),
    prepare: vi.fn(),
    shareMessage: vi.fn(),
    markShared: vi.fn(),
    sendEmail: vi.fn(),
    sendReminders: vi.fn(),
  },
}));

import { invitationService } from "@/features/invitations/api/invitationApi";
import { deliveryService } from "@/features/invitations/api/deliveryApi";

describe("InvitationDeliveryManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useLanguageStore.setState({ lang: "en" });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders recipient selection before delivery methods and server metrics", async () => {
    invitationService.get.mockResolvedValue({
      id: "101",
      title: "ពិធីមង្គលការ សុខ & ចិន្តា",
      status: "PUBLISHED",
    });

    deliveryService.summary.mockResolvedValue({
      totalGuests: 120,
      ready: 110,
      notReady: 10,
      sent: 85,
      opened: 60,
      responded: 45,
      failed: 2,
      guests: [
        {
          guestId: "g-1",
          guestName: "លោកស្រី ម៉ៅ សុខា",
          phone: "012345678",
          email: "sokha@example.com",
          sendStatus: "SENT",
          invitationUrl: "https://koupreng.app/i/sokha-token",
          lastSentAt: "2026-10-20T10:00:00Z",
          responded: true,
        },
      ],
    });

    deliveryService.events.mockResolvedValue([
      {
        id: "ev-1",
        eventType: "BATCH_EMAIL_SENT",
        guestName: "លោកស្រី ម៉ៅ សុខា",
        channel: "EMAIL",
        status: "SUCCESS",
        createdAt: "2026-10-20T10:00:00Z",
      },
    ]);

    render(
      <MemoryRouter initialEntries={["/app/events/101/delivery"]}>
        <Routes>
          <Route path="/app/events/:id/delivery" element={<InvitationDeliveryManager />} />
        </Routes>
      </MemoryRouter>
    );

    // Verify title and stages render
    await waitFor(() => {
      expect(screen.getByText(/ពិធីមង្គលការ សុខ & ចិន្តា/)).toBeInTheDocument();
    });

    expect(screen.getByRole('heading', { name: 'Recipients' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Share or send' })).toBeInTheDocument();
    expect(screen.getAllByRole('checkbox', { name: 'Select all visible eligible guests' }).length).toBeGreaterThan(0);

    // Check guest row and audit event
    expect(screen.getAllByText("លោកស្រី ម៉ៅ សុខា").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("sokha@example.com")).toBeInTheDocument();
  });

  it("displays actionable unpublished notice when invitation is draft", async () => {
    invitationService.get.mockResolvedValue({
      id: "101",
      title: "Draft Wedding",
      status: "DRAFT",
    });

    deliveryService.summary.mockResolvedValue({
      totalGuests: 10,
      ready: 0,
      notReady: 10,
      guests: [],
    });

    deliveryService.events.mockResolvedValue([]);

    render(
      <MemoryRouter initialEntries={["/app/events/101/delivery"]}>
        <Routes>
          <Route path="/app/events/:id/delivery" element={<InvitationDeliveryManager />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Invitation Not Yet Published|ធៀបការមិនទាន់បានបោះផ្សាយនៅឡើយទេ/i)).toBeInTheDocument();
    });

    expect(screen.getByRole("link", { name: /Publish Invitation|ទៅផ្សព្វផ្សាយធៀប/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Prepare delivery' })).toBeDisabled();
  });
});
