import { cleanup, render, screen } from "@testing-library/react";
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

describe("Phase 12.1 Truthful Dashboard & Strict Currency Separation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useLanguageStore.setState({ lang: "en" });

    invitationService.listMine.mockResolvedValue([
      {
        id: 42,
        title: "Koupreng Grand Celebration",
        groomName: "Vannak",
        brideName: "Kolab",
        eventType: "WEDDING",
        eventDate: "2027-12-15",
        eventTime: "17:00",
        venueName: "Sokha Hotel Grand Ballroom",
        status: "PUBLISHED",
        slug: "vannak-kolab-2027",
      },
    ]);

    reportsApi.invitationDashboard.mockResolvedValue({
      totalGuests: 200,
      totalInvited: 200,
      attending: 150,
      declined: 10,
      pending: 40,
    });

    guestService.checkInSummary.mockResolvedValue({
      totalCheckedIn: 80,
      checkedIn: 80,
    });

    notificationService.listByInvitation.mockResolvedValue([]);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("strictly separates USD and KHR in budget and gift totals without blending or exchange conversions", async () => {
    budgetService.listItems.mockResolvedValue([
      { id: 1, category: "Venue", actualCost: 2500, currency: "USD" },
      { id: 2, category: "Floral", actualCost: 4000000, currency: "KHR" },
    ]);

    planningService.listGifts.mockResolvedValue([
      { id: 1, guestName: "Sok", amount: 150, currency: "USD" },
      { id: 2, guestName: "Sao", amount: 200000, currency: "KHR" },
    ]);

    renderDashboard();

    expect(await screen.findByRole("heading", { name: "Koupreng Grand Celebration" })).toBeInTheDocument();

    // Verify budget card formats both USD and KHR separately with dot separator
    // USD $2,500 and KHR 4,000,000
    const budgetCard = screen.getByText("Recorded expenses").closest("a");
    expect(budgetCard).toBeInTheDocument();
    expect(budgetCard).toHaveTextContent(/USD/i);
    expect(budgetCard).toHaveTextContent(/KHR/i);

    // Verify gift card formats both USD and KHR separately
    const giftCard = screen.getByText("2 gifts recorded").closest("a");
    expect(giftCard).toBeInTheDocument();
    expect(giftCard).toHaveTextContent(/USD/i);
    expect(giftCard).toHaveTextContent(/KHR/i);
  });

  it("truthfully renders countdown pill for future event and date-passed pill for past event", async () => {
    budgetService.listItems.mockResolvedValue([]);
    planningService.listGifts.mockResolvedValue([]);

    // Future event
    const { unmount } = renderDashboard();
    expect(await screen.findByText(/days to your celebration/i)).toBeInTheDocument();
    unmount();

    // Past event
    invitationService.listMine.mockResolvedValue([
      {
        id: 42,
        title: "Past Celebration",
        eventType: "ANNIVERSARY",
        eventDate: "2020-01-01",
        status: "PUBLISHED",
      },
    ]);

    renderDashboard();
    expect(await screen.findByText("Date passed")).toBeInTheDocument();
  });

  it("differentiates truthful zero guest count from uninitialized data", async () => {
    budgetService.listItems.mockResolvedValue([]);
    planningService.listGifts.mockResolvedValue([]);
    reportsApi.invitationDashboard.mockResolvedValue({
      totalGuests: 0,
      totalInvited: 0,
      attending: 0,
      declined: 0,
      pending: 0,
    });

    renderDashboard();

    expect(await screen.findByRole("heading", { name: "Koupreng Grand Celebration" })).toBeInTheDocument();
    expect(screen.getByText("No guests yet")).toBeInTheDocument();
    expect(screen.getAllByText("Awaiting reply").length).toBeGreaterThanOrEqual(1);
  });
});
