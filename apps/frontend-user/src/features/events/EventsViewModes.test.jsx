import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import EventsFeature from "./EventsFeature";
import { eventsApi } from "./api/eventsApi";
import { useLanguageStore } from "@/stores/useLanguageStore";

vi.mock("../../shared/i18n/useBackendMessages", () => ({
  useBackendMessages: () => ({ text: () => "" }),
}));
vi.mock("../wedding-builder/utils/draftPublishApi", () => ({ persistWeddingDraft: vi.fn() }));
vi.mock("../auth/hooks/useAuth", () => ({ useAuth: () => ({ user: null }) }));

describe("EventsFeature View Modes & Period Filters", () => {
  const mockEvents = [
    {
      id: "evt-future",
      title: "Upcoming Royal Wedding",
      eventType: "WEDDING",
      status: "PUBLISHED",
      eventDate: "2027-11-28",
      venueName: "Sokha Hotel Grand Ballroom",
    },
    {
      id: "evt-past",
      title: "Completed Anniversary Gala",
      eventType: "ANNIVERSARY",
      status: "PUBLISHED",
      eventDate: "2020-01-15",
      venueName: "Rosewood Phnom Penh",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    useLanguageStore.setState({ lang: "en" });
    vi.spyOn(eventsApi, "listMine").mockResolvedValue(mockEvents);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    useLanguageStore.setState({ lang: "en" });
  });

  it("renders view mode toggle buttons (List and Calendar) and mobile FAB", async () => {
    render(
      <MemoryRouter initialEntries={["/app/events"]}>
        <EventsFeature />
      </MemoryRouter>
    );

    expect(await screen.findByText("Upcoming Royal Wedding")).toBeInTheDocument();

    const listBtn = screen.getByRole("button", { name: "List view" });
    const calBtn = screen.getByRole("button", { name: "Calendar view" });
    expect(listBtn).toBeInTheDocument();
    expect(calBtn).toBeInTheDocument();
    expect(listBtn).toHaveAttribute("aria-pressed", "true");
    expect(calBtn).toHaveAttribute("aria-pressed", "false");

    const fab = screen.getByRole("link", { name: "Create new event" });
    expect(fab).toHaveAttribute("href", "/app/events/new");
  });

  it("switches to Calendar view when clicking the Calendar view toggle button", async () => {
    render(
      <MemoryRouter initialEntries={["/app/events"]}>
        <EventsFeature />
      </MemoryRouter>
    );

    await screen.findByText("Upcoming Royal Wedding");

    const calBtn = screen.getByRole("button", { name: "Calendar view" });
    fireEvent.click(calBtn);

    expect(await screen.findByRole("region", { name: "Event Calendar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Calendar view" })).toHaveAttribute("aria-pressed", "true");
  });

  it("filters upcoming and past events via period tabs", async () => {
    render(
      <MemoryRouter initialEntries={["/app/events"]}>
        <EventsFeature />
      </MemoryRouter>
    );

    await screen.findByText("Upcoming Royal Wedding");
    expect(screen.getByText("Completed Anniversary Gala")).toBeInTheDocument();

    // Click "Upcoming" tab
    const upcomingTab = screen.getByRole("tab", { name: "Upcoming" });
    fireEvent.click(upcomingTab);

    await waitFor(() => {
      expect(screen.getByText("Upcoming Royal Wedding")).toBeInTheDocument();
      expect(screen.queryByText("Completed Anniversary Gala")).not.toBeInTheDocument();
    });

    // Click "Past" tab
    const pastTab = screen.getByRole("tab", { name: "Past" });
    fireEvent.click(pastTab);

    await waitFor(() => {
      expect(screen.queryByText("Upcoming Royal Wedding")).not.toBeInTheDocument();
      expect(screen.getByText("Completed Anniversary Gala")).toBeInTheDocument();
    });

    // Click "All" tab
    const allTab = screen.getByRole("tab", { name: "All" });
    fireEvent.click(allTab);

    await waitFor(() => {
      expect(screen.getByText("Upcoming Royal Wedding")).toBeInTheDocument();
      expect(screen.getByText("Completed Anniversary Gala")).toBeInTheDocument();
    });
  });
});
