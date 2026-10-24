import { render, screen, waitFor, cleanup, fireEvent, within } from "@testing-library/react";
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
    vi.unstubAllGlobals();
  });

  async function sharingWorkspace(sendStatus = "PENDING") {
    let guest = { guestId: 501, guestName: "Sample guest", invitationUrl: "https://koupreng.example/i/sample?token=personal-501", sendStatus };
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText } });
    invitationService.get.mockResolvedValue({ id: 101, title: "Wedding", status: "PUBLISHED" });
    deliveryService.summary.mockImplementation(async () => ({ totalGuests: 1, guests: [guest] }));
    deliveryService.events.mockResolvedValue([]);
    deliveryService.shareMessage.mockResolvedValue({ message: `Invitation for Sample guest: ${guest.invitationUrl}` });
    deliveryService.markShared.mockImplementation(async () => { guest = { ...guest, sendStatus: "SENT" }; return guest; });
    render(<MemoryRouter initialEntries={["/app/events/101/delivery?guestId=501"]}><Routes><Route path="/app/events/:id/delivery" element={<InvitationDeliveryManager />} /></Routes></MemoryRouter>);
    await screen.findByRole("button", { name: "Copy message" });
    return { writeText, row: () => within(screen.getByRole("row", { name: /Sample guest/ })) };
  }

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

  it.each(["Copy link: Sample guest", "Copy message"])("saves Sent status after %s succeeds", async action => {
    const { writeText, row } = await sharingWorkspace();
    fireEvent.click(screen.getByRole("button", { name: action, exact: true }));
    await waitFor(() => expect(row().getByText("Sent / recorded share")).toBeInTheDocument());
    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText.mock.calls[0][0]).toContain("personal-501");
    expect(deliveryService.markShared).toHaveBeenCalledExactlyOnceWith("101", 501);
  });

  it("saves Sent status when Telegram sharing is clicked", async () => {
    const { writeText, row } = await sharingWorkspace();
    fireEvent.click(screen.getByRole("link", { name: "Open Telegram" }));
    await waitFor(() => expect(row().getByText("Sent / recorded share")).toBeInTheDocument());
    expect(deliveryService.markShared).toHaveBeenCalledExactlyOnceWith("101", 501);
    expect(writeText).not.toHaveBeenCalled();
  });

  it("leaves the status unchanged after a clipboard error", async () => {
    const { writeText, row } = await sharingWorkspace();
    writeText.mockRejectedValueOnce(new Error("Clipboard access denied"));
    fireEvent.click(screen.getByRole("button", { name: "Copy link: Sample guest" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Clipboard access denied"));
    expect(deliveryService.markShared).not.toHaveBeenCalled();
    expect(row().getByText("Not sent")).toBeInTheDocument();
  });

  it.each(["SENT", "OPENED", "RESPONDED"])("preserves %s when the link is copied again", async sendStatus => {
    const { writeText } = await sharingWorkspace(sendStatus);
    fireEvent.click(screen.getByRole("button", { name: "Copy link: Sample guest" }));
    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
    expect(deliveryService.markShared).not.toHaveBeenCalled();
  });

  it("does not mark sent when a native share is cancelled", async () => {
    await sharingWorkspace();
    navigator.share = vi.fn().mockRejectedValue(new DOMException("Cancelled", "AbortError"));
    fireEvent.click(screen.getByRole("button", { name: "Share: Sample guest", exact: true }));
    await waitFor(() => expect(navigator.share).toHaveBeenCalledTimes(1));
    expect(deliveryService.markShared).not.toHaveBeenCalled();
  });
});
