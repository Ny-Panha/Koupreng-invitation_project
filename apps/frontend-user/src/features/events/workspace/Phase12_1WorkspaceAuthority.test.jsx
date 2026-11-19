import { act, cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useEffect } from "react";
import EventWorkspace from "./EventWorkspace";
import { useEventWorkspace } from "./EventContext";
import { invitationService } from "@/features/invitations/api/invitationApi";
import { useLanguageStore } from "@/stores/useLanguageStore";

vi.mock("@/features/auth/hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: 7, name: "Owner Dara" } }),
}));

vi.mock("@/features/invitations/api/invitationApi", () => ({
  invitationService: {
    get: vi.fn(),
    listMine: vi.fn(),
    access: vi.fn(),
  },
}));

vi.mock("../../../shared/i18n/useBackendMessages", () => ({
  useBackendMessages: () => ({ text: () => "" }),
}));

function WorkspaceProbe() {
  const ws = useEventWorkspace();
  return (
    <div>
      <p data-testid="probe-event-title">{ws.event?.title || "No event"}</p>
      <p data-testid="probe-loading">{ws.loading ? "Loading" : "Ready"}</p>
      <p data-testid="probe-can-manage">{ws.can("MANAGE_SETTINGS") ? "Can Manage" : "Restricted"}</p>
    </div>
  );
}

function NavController({ onReady }) {
  const navigate = useNavigate();
  useEffect(() => {
    onReady(navigate);
  }, [navigate, onReady]);
  return null;
}

describe("Phase 12.1 Event Workspace Authority & Race Isolation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useLanguageStore.setState({ lang: "en" });
    vi.stubGlobal("matchMedia", vi.fn(query => ({
      matches: true,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })));
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("immediately clears previous event data and shows loading skeleton on event switch (101 -> 102) to prevent flashing stale data", async () => {
    let resolveEvent102;
    const promise102 = new Promise((resolve) => {
      resolveEvent102 = resolve;
    });

    invitationService.listMine.mockResolvedValue([
      { id: 101, title: "First Event Title 101" },
      { id: 102, title: "Second Event Title 102" },
    ]);

    invitationService.access.mockResolvedValue({
      owner: true,
      permissions: ["VIEW_EVENT", "EDIT_EVENT", "MANAGE_SETTINGS"],
      ownerFeatures: [],
    });

    invitationService.get.mockImplementation((id) => {
      if (String(id) === "101") {
        return Promise.resolve({
          id: 101,
          title: "First Event Title 101",
          status: "PUBLISHED",
          eventType: "WEDDING",
        });
      }
      if (String(id) === "102") {
        return promise102;
      }
      return Promise.reject(new Error("Not found"));
    });

    let navFn;
    render(
      <MemoryRouter initialEntries={["/app/events/101"]}>
        <NavController onReady={(fn) => { navFn = fn; }} />
        <Routes>
          <Route path="/app/events/:eventId" element={<EventWorkspace />}>
            <Route index element={<WorkspaceProbe />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    // Event 101 finishes loading
    expect(await screen.findByTestId("probe-event-title")).toHaveTextContent("First Event Title 101");

    // In-router navigation from 101 to 102
    act(() => {
      navFn("/app/events/102");
    });

    // Stale Event 101 data must immediately be unmounted while Event 102 is pending
    expect(screen.queryByTestId("probe-event-title")).not.toBeInTheDocument();

    // Resolve Event 102
    await act(async () => {
      resolveEvent102({
        id: 102,
        title: "Second Event Title 102",
        status: "PUBLISHED",
        eventType: "BIRTHDAY",
      });
    });

    // Event 102 appears cleanly
    expect(await screen.findByTestId("probe-event-title")).toHaveTextContent("Second Event Title 102");
  });

  it("restricts owner-only settings and displays shared event messaging for non-owner access roles", async () => {
    invitationService.get.mockResolvedValue({
      id: 201,
      title: "Collaborator Event",
      status: "PUBLISHED",
      eventType: "WEDDING",
      shared: true,
    });
    invitationService.listMine.mockResolvedValue([
      { id: 201, title: "Collaborator Event" },
    ]);
    invitationService.access.mockResolvedValue({
      owner: false,
      permissions: ["VIEW_EVENT"],
      ownerFeatures: [],
    });

    render(
      <MemoryRouter initialEntries={["/app/events/201"]}>
        <Routes>
          <Route path="/app/events/:eventId" element={<EventWorkspace />}>
            <Route index element={<WorkspaceProbe />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText(/Shared event. Available tools follow your accepted team role/i)).toBeInTheDocument();
    // Non-owner should not see delete button
    expect(screen.queryByRole("button", { name: /delete/i })).not.toBeInTheDocument();
  });
});
