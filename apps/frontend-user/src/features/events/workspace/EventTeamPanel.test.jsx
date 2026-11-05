import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import EventTeamPanel from "./EventTeamPanel";
import { EventContext } from "./EventContext";
import { invitationService } from "@/features/invitations/api/invitationApi";
import { organizationService } from "@/features/organizations/api/organizationApi";

vi.mock("@/features/invitations/api/invitationApi", () => ({
  invitationService: {
    access: vi.fn(),
    linkTeam: vi.fn(),
    get: vi.fn(),
  },
}));

vi.mock("@/features/organizations/api/organizationApi", () => ({
  organizationService: {
    listMine: vi.fn(),
  },
}));

let mockUser = { id: 7 };
vi.mock("@/features/auth/hooks/useAuth", () => ({
  useAuth: () => ({ user: mockUser }),
}));

const mockEvent = {
  id: 101,
  userId: 7,
  title: "Sokha & Bopha",
  organizationId: null,
  updatedAt: "2026-11-05T00:00:00Z",
};

function renderPanel(eventOverride = {}, contextOverride = {}) {
  const contextValue = {
    eventId: "101",
    event: { ...mockEvent, ...eventOverride },
    updateEvent: vi.fn(),
    isOwner: true,
    can: () => true,
    ...contextOverride,
  };

  return render(
    <MemoryRouter>
      <EventContext.Provider value={contextValue}>
        <EventTeamPanel />
      </EventContext.Provider>
    </MemoryRouter>
  );
}

describe("EventTeamPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUser = { id: 7 };
    invitationService.access.mockResolvedValue({
      owner: true,
      ownerFeatures: ["TEAM_MEMBERS"],
      permissions: [],
    });
    organizationService.listMine.mockResolvedValue([
      { id: 1, name: "Wedding Planners Cambodia", ownerUserId: 7 },
      { id: 2, name: "Other Org", ownerUserId: 99 },
    ]);
  });

  afterEach(() => {
    cleanup();
  });

  it("renders event team heading and team selection when eligible", async () => {
    renderPanel();
    expect(await screen.findByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(await screen.findByLabelText(/Linked team|ក្រុមដែលភ្ជាប់/i)).toBeInTheDocument();
    expect(screen.getByText("Wedding Planners Cambodia")).toBeInTheDocument();
    expect(screen.queryByText("Other Org")).not.toBeInTheDocument();
  });

  it("displays non-owner restriction message when current user is not event owner", async () => {
    mockUser = { id: 99 };
    renderPanel({ userId: 7 });
    expect(await screen.findByText(/Only the event owner can change its team|មានតែម្ចាស់អាចប្ដូរក្រុមកម្មវិធី/i)).toBeInTheDocument();
  });

  it("displays feature access card when owner is not entitled to TEAM_MEMBERS", async () => {
    invitationService.access.mockResolvedValue({
      owner: true,
      ownerFeatures: [],
      permissions: [],
    });
    renderPanel();
    expect(await screen.findByText(/TEAM_MEMBERS|សិទ្ធិ/i)).toBeInTheDocument();
  });
});
