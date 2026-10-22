import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useLanguageStore } from '@/stores/useLanguageStore';
import InvitationCheckInPage from "./InvitationCheckInPage";

afterEach(() => {
  cleanup();
});
beforeEach(() => useLanguageStore.setState({lang:'en'}));

vi.mock("@/features/guests/api/guestApi", () => {
  const guests = [
    { id: 1, guestName: "Sok Dara", phone: "012345678", email: "dara@example.com" },
    { id: 2, guestName: "Keo Sophea", phone: "098765432", email: "sophea@example.com" },
  ];
  const summary = { totalGuests: 2, checkedIn: 1, attendingCheckedIn: 1, remaining: 1 };
  const checkIns = [
    { id: 101, guestId: 1, guestName: "Sok Dara", source: "QR", checkedInAt: "2026-09-01T10:00:00Z" },
  ];

  return {
    guestService: {
      listByInvitation: vi.fn().mockResolvedValue(guests),
      checkInSummary: vi.fn().mockResolvedValue(summary),
      checkInList: vi.fn().mockResolvedValue(checkIns),
      scanCheckIn: vi.fn().mockResolvedValue({ id: 102, guestId: 2, guestName: "Keo Sophea", alreadyCheckedIn: false }),
      manualCheckIn: vi.fn().mockResolvedValue({ id: 102, guestId: 2, guestName: "Keo Sophea", alreadyCheckedIn: false }),
    },
    default: {
      listByInvitation: vi.fn().mockResolvedValue(guests),
      checkInSummary: vi.fn().mockResolvedValue(summary),
      checkInList: vi.fn().mockResolvedValue(checkIns),
      scanCheckIn: vi.fn().mockResolvedValue({ id: 102, guestId: 2, guestName: "Keo Sophea", alreadyCheckedIn: false }),
      manualCheckIn: vi.fn().mockResolvedValue({ id: 102, guestId: 2, guestName: "Keo Sophea", alreadyCheckedIn: false }),
    },
  };
});

vi.mock("@/features/invitations/api/invitationApi", () => ({
  invitationService: {
    get: vi.fn().mockResolvedValue({ id: 10, title: "Dara & Sophea Wedding" }),
  },
}));

vi.mock("../../shared/ui/toast", () => ({
  toast: vi.fn(),
}));

describe("InvitationCheckInPage Feature", () => {
  it('names scanner fields and contains walk-in dialog focus until Escape restores the opener', async () => {
    render(<MemoryRouter initialEntries={['/app/events/10/check-in']}><Routes><Route path='/app/events/:eventId/check-in' element={<InvitationCheckInPage/>}/></Routes></MemoryRouter>);
    await screen.findByLabelText('QR link or token');
    expect(screen.getByLabelText('Gift amount (optional)')).toBeInTheDocument();
    const opener=screen.getByRole('button',{name:'Add walk-in guest'});
    opener.focus();fireEvent.click(opener);
    const dialog=screen.getByRole('dialog',{name:'Walk-in guest'});
    expect(dialog.contains(document.activeElement)).toBe(true);
    expect(screen.getByLabelText(/Guest name/)).toBeRequired();
    fireEvent.keyDown(document,{key:'Escape'});
    expect(screen.queryByRole('dialog')).toBeNull();expect(opener).toHaveFocus();
  });
  it("renders summary cards and guest status correctly", async () => {
    render(
      <MemoryRouter initialEntries={["/dashboard/invitations/10/check-in"]}>
        <Routes>
          <Route path="/dashboard/invitations/:invitationId/check-in" element={<InvitationCheckInPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Dara & Sophea Wedding");
      expect(screen.getByText("Total guests")).toBeInTheDocument();
      expect(screen.getAllByText("Sok Dara").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("Keo Sophea")).toBeInTheDocument();
    });
  });

  it("handles manual check-in when clicking check in button", async () => {
    render(
      <MemoryRouter initialEntries={["/dashboard/invitations/10/check-in"]}>
        <Routes>
          <Route path="/dashboard/invitations/:invitationId/check-in" element={<InvitationCheckInPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Keo Sophea")).toBeInTheDocument();
    });

    const checkInButtons = screen.getAllByRole("button", { name: /^Check in$/i });
    const enabledBtn = checkInButtons.find((btn) => !btn.disabled);
    expect(enabledBtn).toBeDefined();
    fireEvent.click(enabledBtn);

    await waitFor(() => {
      expect(screen.getByText("Keo Sophea")).toBeInTheDocument();
    });
  });
});
