import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";

const services = vi.hoisted(() => ({
  getBudget: vi.fn(),
  listGifts: vi.fn(),
  listGuests: vi.fn(),
  getInvitation: vi.fn(),
  listRsvps: vi.fn(),
}));

vi.mock("@/features/budget/api/budgetApi", () => ({ budgetService: { getBudget: services.getBudget } }));
vi.mock("@/features/gifts/api/giftsApi", () => ({ giftsApi: { listGifts: services.listGifts } }));
vi.mock("@/features/guests/api/guestApi", () => ({ guestService: { listByInvitation: services.listGuests } }));
vi.mock("@/features/invitations/api/invitationApi", () => ({ invitationService: { get: services.getInvitation } }));
vi.mock("@/features/rsvp/api/rsvpApi", () => ({ rsvpService: { listByInvitation: services.listRsvps } }));

import ReportsPage from "./ReportsPage";

afterEach(cleanup);

describe("user financial report", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    services.getInvitation.mockResolvedValue({
      id: 88,
      title: "Sokha's Birthday",
      eventType: "BIRTHDAY",
      ownerName: "Sokha",
      eventDate: "2027-04-20",
    });
    services.getBudget.mockResolvedValue({ items: [] });
    services.listGifts.mockResolvedValue([{ id: 1, name: "Dara", amount: 125, currency: "USD" }]);
    services.listGuests.mockResolvedValue([]);
    services.listRsvps.mockResolvedValue([]);
  });

  it("loads the selected user's event title and financial records from the API", async () => {
    render(
      <MemoryRouter initialEntries={["/host/invitations/88/reports"]}>
        <Routes>
          <Route path="/host/invitations/:invitationId/reports" element={<ReportsPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText("Sokha's Birthday")).toBeInTheDocument();
    expect(screen.getByText("ខួបកំណើត")).toBeInTheDocument();
    expect(screen.getAllByText("$125.00")).toHaveLength(3);
    await waitFor(() => {
      expect(services.getInvitation).toHaveBeenCalledWith("88");
      expect(services.listGifts).toHaveBeenCalledWith("88");
      expect(services.getBudget).toHaveBeenCalledWith("88");
    });
  });
});