import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useLanguageStore } from "@/stores/useLanguageStore";
import RsvpDashboardPage from "./RsvpDashboardPage";

vi.mock("./api/rsvpApi", () => {
  const rsvps = [
    { id: 101, guestName: "Vireak", status: "ATTENDING", partySize: 2, wish: "Congratulations!" },
  ];
  const summary = { attending: 1, declined: 0, pending: 0 };

  return {
    rsvpService: {
      listByInvitation: vi.fn().mockResolvedValue(rsvps),
      summary: vi.fn().mockResolvedValue(summary),
      wishes: vi.fn().mockResolvedValue(rsvps),
    },
    default: {
      listByInvitation: vi.fn().mockResolvedValue(rsvps),
      summary: vi.fn().mockResolvedValue(summary),
      wishes: vi.fn().mockResolvedValue(rsvps),
    },
  };
});

vi.mock("@/features/invitations/api/invitationApi", () => ({
  invitationService: {
    get: vi.fn().mockResolvedValue({ id: 1, title: "Dara & Sophea Wedding" }),
  },
}));

describe("RsvpDashboardPage Module", () => {
  beforeEach(() => useLanguageStore.setState({ lang: "en" }));
  it("renders host RSVP summary and responses table", async () => {
    render(
      <MemoryRouter initialEntries={["/dashboard/invitations/1/rsvp"]}>
        <Routes>
          <Route path="/dashboard/invitations/:invitationId/rsvp" element={<RsvpDashboardPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Dara & Sophea Wedding")).toBeInTheDocument();
      expect(screen.getByText("Vireak")).toBeInTheDocument();
      expect(screen.getByText("Congratulations!")).toBeInTheDocument();
    });
  });

  it("allows switching to wishes card view mode", async () => {
    render(
      <MemoryRouter initialEntries={["/dashboard/invitations/1/rsvp"]}>
        <Routes>
          <Route path="/dashboard/invitations/:invitationId/rsvp" element={<RsvpDashboardPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByRole("button", { name: /Wishes/i })[0]).toBeInTheDocument();
    });

    const wishesBtn = screen.getAllByRole("button", { name: /Wishes/i })[0];
    wishesBtn.click();

    await waitFor(() => {
      expect(screen.getByText("“Congratulations!”")).toBeInTheDocument();
    });
  });
});

