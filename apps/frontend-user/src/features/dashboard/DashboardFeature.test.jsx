import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DashboardFeature from "./DashboardFeature";
import { invitationService } from "@/features/invitations/api/invitationApi";
import { reportsApi } from "@/features/reports/api/reportsApi";
import { budgetService } from "@/features/budget/api/budgetApi";
import { planningService } from "@/features/planning/api/planningApi";
import { guestService } from "@/features/guests/api/guestApi";
import notificationService from "@/features/notifications/notificationService";
import { useLanguageStore } from "@/stores/useLanguageStore";

vi.mock("@/features/invitations/api/invitationApi", () => ({
  invitationService: {
    listMine: vi.fn(),
    get: vi.fn(),
    unpublish: vi.fn(),
    access: vi.fn(),
  },
}));

vi.mock("@/features/reports/api/reportsApi", () => ({
  reportsApi: {
    invitationDashboard: vi.fn(),
  },
}));

vi.mock("@/features/budget/api/budgetApi", () => ({
  budgetService: {
    listItems: vi.fn(),
  },
}));

vi.mock("@/features/planning/api/planningApi", () => ({
  planningService: {
    listGifts: vi.fn(),
  },
}));

vi.mock("@/features/guests/api/guestApi", () => ({
  guestService: {
    checkInSummary: vi.fn(),
  },
}));

vi.mock("@/features/notifications/notificationService", () => ({
  default: {
    listByInvitation: vi.fn(),
  },
}));

vi.mock("@/features/events/workspace/EventContext", () => ({
  useEventWorkspace: () => null,
}));

function renderDashboard(path = "/app/events/42") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/app/events/:eventId" element={<DashboardFeature />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("DashboardFeature Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useLanguageStore.setState({ lang: "en" });

    invitationService.listMine.mockResolvedValue([
      {
        id: 42,
        title: "Koupreng Grand Wedding",
        groomName: "Dara",
        brideName: "Sophea",
        eventType: "WEDDING",
        eventDate: "2026-11-28",
        eventTime: "17:00",
        venueName: "Nagaworld Ballroom",
        status: "PUBLISHED",
        slug: "dara-sophea-2026",
      },
    ]);

    reportsApi.invitationDashboard.mockResolvedValue({
      totalGuests: 250,
      totalInvited: 250,
      attending: 180,
      declined: 20,
      pending: 50,
    });

    budgetService.listItems.mockResolvedValue([
      { id: 1, category: "Venue", actualCost: 3500, currency: "USD" },
    ]);

    planningService.listGifts.mockResolvedValue([
      { id: 1, guestName: "Sok", amount: 100, currency: "USD" },
    ]);

    guestService.checkInSummary.mockResolvedValue({
      totalCheckedIn: 90,
      checkedIn: 90,
    });

    notificationService.listByInvitation.mockResolvedValue([
      { id: 1, title: "RSVP Accepted", message: "Visal confirmed attendance." },
    ]);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    useLanguageStore.setState({ lang: "en" });
  });

  it("renders event overview with title, venue, couple names, and date", async () => {
    renderDashboard();

    expect(await screen.findByRole("heading", { name: "Koupreng Grand Wedding" })).toBeInTheDocument();
    expect(screen.getByText("Dara & Sophea")).toBeInTheDocument();
    expect(screen.getByText("Nagaworld Ballroom")).toBeInTheDocument();
    expect(screen.getByText("Published")).toBeInTheDocument();
  });

  it("displays 4 authoritative metric cards with calculated statistics and subtitles", async () => {
    renderDashboard();

    await screen.findByRole("heading", { name: "Koupreng Grand Wedding" });

    // Total guests: 250
    expect(screen.getByText("250")).toBeInTheDocument();
    expect(screen.getByText("250 total invited")).toBeInTheDocument();

    // Attending / Confirmed: 180 (72% response rate)
    expect(screen.getByText("180")).toBeInTheDocument();
    expect(screen.getByText(/72% attending/)).toBeInTheDocument();

    // Pending: 50
    expect(screen.getByText("50")).toBeInTheDocument();
    expect(screen.getByText("Awaiting reply")).toBeInTheDocument();

    // Checked in: 90
    expect(screen.getByText("90")).toBeInTheDocument();
    expect(screen.getByText(/50% of confirmed/)).toBeInTheDocument();
  });

  it("renders preparation checklist with completion progress", async () => {
    renderDashboard();

    await screen.findByRole("heading", { name: "Koupreng Grand Wedding" });

    expect(screen.getByText("Next steps")).toBeInTheDocument();
    expect(screen.getByText("Complete event details")).toBeInTheDocument();
  });

  it("renders quick action tools grid including Delivery, Digital Tickets, Check-in, Seating, Budget, QR, and Wishes", async () => {
    renderDashboard();

    await screen.findByRole("heading", { name: "Koupreng Grand Wedding" });

    expect(screen.getByText("Plan the event day")).toBeInTheDocument();
    expect(screen.getByText("Delivery")).toBeInTheDocument();
    expect(screen.getByText("Digital tickets")).toBeInTheDocument();
    expect(screen.getByText("Check-in")).toBeInTheDocument();
    expect(screen.getByText("Seating")).toBeInTheDocument();
    expect(screen.getByText("Budget")).toBeInTheDocument();
    expect(screen.getByText("QR Check-in")).toBeInTheDocument();
    expect(screen.getByText("Wishes")).toBeInTheDocument();
  });

  it("copies invitation link to clipboard when clicking Copy Link in publication settings", async () => {
    const writeTextSpy = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: writeTextSpy },
      configurable: true,
    });

    renderDashboard();

    await screen.findByRole("heading", { name: "Koupreng Grand Wedding" });

    const details = screen.getByText("Publication settings");
    fireEvent.click(details);

    const copyBtn = await screen.findByRole("button", { name: /Copy Link|ចម្លងតំណ/i });
    fireEvent.click(copyBtn);

    expect(writeTextSpy).toHaveBeenCalledWith(
      expect.stringContaining("/w/dara-sophea-2026")
    );
  });
});
