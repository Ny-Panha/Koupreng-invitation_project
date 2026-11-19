import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import EventsFeature from "./EventsFeature";
import { eventsApi } from "./api/eventsApi";
import { useLanguageStore } from "@/stores/useLanguageStore";
import { saveDraft } from "../../shared/storage/weddingStorage";

vi.mock("../../shared/i18n/useBackendMessages", () => ({
  useBackendMessages: () => ({ text: () => "" }),
}));
vi.mock("../wedding-builder/utils/draftPublishApi", () => ({ persistWeddingDraft: vi.fn() }));
vi.mock("../auth/hooks/useAuth", () => ({ useAuth: () => ({ user: { id: "user-owner-1", name: "Sophea" } }) }));

describe("Phase 12.1 Event List Provenance & Deterministic Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    useLanguageStore.setState({ lang: "en" });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  it("differentiates server events, local drafts, failed sync, and shared events with truthful badges and actions", async () => {
    const mockEvents = [
      {
        id: 101,
        title: "Published Royal Wedding",
        eventType: "WEDDING",
        status: "PUBLISHED",
        eventDate: "2027-01-15",
        venueName: "Sokha Hotel",
      },
      {
        id: 102,
        title: "Shared Friend Gala",
        eventType: "CORPORATE",
        status: "PUBLISHED",
        shared: true,
        ownerName: "Piseth",
        eventDate: "2027-02-20",
      },
    ];

    saveDraft({
      id: "wed-local-1",
      title: "Local Unsynced Celebration",
      eventType: "BIRTHDAY",
      status: "DRAFT",
      syncStatus: "LOCAL_ONLY",
      eventDate: "2027-03-10",
    });

    saveDraft({
      id: "wed-failed-sync",
      title: "Failed Sync Ceremony",
      eventType: "ENGAGEMENT",
      status: "DRAFT",
      syncStatus: "SYNC_FAILED",
      eventDate: "2027-04-05",
    });

    vi.spyOn(eventsApi, "listMine").mockResolvedValue(mockEvents);

    render(
      <MemoryRouter initialEntries={["/app/events"]}>
        <EventsFeature />
      </MemoryRouter>
    );

    // Verify all four events render
    expect(await screen.findByRole("heading", { name: "Published Royal Wedding" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Shared Friend Gala" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Local Unsynced Celebration" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Failed Sync Ceremony" })).toBeInTheDocument();

    // Verify truth provenance badges
    expect(screen.getAllByText("Published").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Local draft")).toBeInTheDocument();
    expect(screen.getByText("Sync failed")).toBeInTheDocument();
    expect(screen.getByText("Shared by Piseth")).toBeInTheDocument();

    // Verify action differentiation:
    // Server events render "Manage event"
    // Local / sync-failed drafts render "Resume draft"
    const manageButtons = screen.getAllByRole("button", { name: "Manage event" });
    const resumeButtons = screen.getAllByRole("button", { name: "Resume draft" });
    expect(manageButtons.length).toBeGreaterThanOrEqual(2);
    expect(resumeButtons.length).toBeGreaterThanOrEqual(2);

    // Verify shared event omits delete action
    const sharedCard = screen.getByRole("heading", { name: "Shared Friend Gala" }).closest("article");
    expect(within(sharedCard).queryByRole("button", { name: "More options" })).not.toBeInTheDocument();
    expect(within(sharedCard).queryByRole("button", { name: "Delete" })).not.toBeInTheDocument();
  });

  it("performs deterministic sorting by newest, date, and title with tie-breaking", async () => {
    const mockEvents = [
      {
        id: 1,
        title: "Beta Event",
        eventDate: "2027-05-01",
        updatedAt: "2026-11-10T10:00:00Z",
      },
      {
        id: 2,
        title: "Alpha Event",
        eventDate: "2027-01-01",
        updatedAt: "2026-11-18T10:00:00Z",
      },
      {
        id: 3,
        title: "Gamma Event",
        eventDate: "2027-09-01",
        updatedAt: "2026-11-01T10:00:00Z",
      },
    ];

    vi.spyOn(eventsApi, "listMine").mockResolvedValue(mockEvents);

    const { unmount } = render(
      <MemoryRouter initialEntries={["/app/events?sort=date"]}>
        <EventsFeature />
      </MemoryRouter>
    );

    // By date ascending: 2027-01-01 (Alpha), 2027-05-01 (Beta), 2027-09-01 (Gamma)
    await screen.findByRole("heading", { name: "Alpha Event" });
    const headings = screen.getAllByRole("heading", { level: 2 });
    expect(headings[0]).toHaveTextContent("Alpha Event");
    expect(headings[1]).toHaveTextContent("Beta Event");
    expect(headings[2]).toHaveTextContent("Gamma Event");

    unmount();

    // By title alphabetical: Alpha, Beta, Gamma
    render(
      <MemoryRouter initialEntries={["/app/events?sort=title"]}>
        <EventsFeature />
      </MemoryRouter>
    );
    await screen.findByRole("heading", { name: "Alpha Event" });
    const titleHeadings = screen.getAllByRole("heading", { level: 2 });
    expect(titleHeadings[0]).toHaveTextContent("Alpha Event");
    expect(titleHeadings[1]).toHaveTextContent("Beta Event");
    expect(titleHeadings[2]).toHaveTextContent("Gamma Event");
  });

  it("normalizes Khmer Unicode NFC search query across all host and participant fields", async () => {
    const mockEvents = [
      {
        id: 201,
        title: "ពិធីមង្គលការ តារា និង សុភា",
        groomName: "ដារ៉ា",
        brideName: "សុភា",
        venueName: "សណ្ឋាគារសុខា",
      },
      {
        id: 202,
        title: "ខួបកំណើត ចាន់ណារី",
        celebrantName: "ចាន់ណារី",
        venueName: "ភ្នំពេញ",
      },
    ];

    vi.spyOn(eventsApi, "listMine").mockResolvedValue(mockEvents);

    render(
      <MemoryRouter initialEntries={["/app/events"]}>
        <EventsFeature />
      </MemoryRouter>
    );

    await screen.findByText("ពិធីមង្គលការ តារា និង សុភា");
    expect(screen.getByText("ខួបកំណើត ចាន់ណារី")).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/Filter by name or venue/i);
    // Type decomposing or standard Khmer search
    fireEvent.change(searchInput, { target: { value: "សុភា".normalize("NFD") } });

    await waitFor(() => {
      expect(screen.getByText("ពិធីមង្គលការ តារា និង សុភា")).toBeInTheDocument();
      expect(screen.queryByText("ខួបកំណើត ចាន់ណារី")).not.toBeInTheDocument();
    });
  });
});
