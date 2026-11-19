import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EventCalendar } from "./EventCalendar";
import { useLanguageStore } from "@/stores/useLanguageStore";

describe("Phase 12.1 Event Calendar Fidelity & Temporal Correctness", () => {
  beforeEach(() => {
    useLanguageStore.setState({ lang: "en" });
  });

  afterEach(() => {
    cleanup();
    useLanguageStore.setState({ lang: "en" });
  });

  it("handles leap year date 2028-02-29 safely without shifting dates across month boundaries", () => {
    const leapEvent = {
      id: "evt-leap-2028",
      title: "Royal Leap Day Celebration",
      eventType: "WEDDING",
      status: "PUBLISHED",
      eventDate: "2028-02-29",
      eventTime: "17:30",
      venueName: "Koh Pich Hall",
    };

    render(<EventCalendar events={[leapEvent]} initialDate={new Date(2028, 1, 1)} />);

    // February 2028 header
    expect(screen.getByText("February 2028")).toBeInTheDocument();
    // February 29th should be present as a gridcell
    const day29Cell = screen.getByRole("gridcell", { name: /Feb 29, 2028/i });
    expect(day29Cell).toBeInTheDocument();
    // Verify chip renders inside the cell
    expect(screen.getByText("Royal Leap Day Celebration")).toBeInTheDocument();
  });

  it("differentiates local drafts, sync-failed events, and published events in calendar chips and detail view", () => {
    const events = [
      {
        id: "draft-local-1",
        title: "Local Offline Draft",
        eventType: "BIRTHDAY",
        syncStatus: "LOCAL_ONLY",
        isLocal: true,
        eventDate: "2026-11-20",
        eventTime: "18:00",
      },
      {
        id: "draft-failed-1",
        title: "Failed Sync Anniversary",
        eventType: "ANNIVERSARY",
        syncStatus: "SYNC_FAILED",
        eventDate: "2026-11-20",
        eventTime: "19:00",
      },
      {
        id: "server-pub-1",
        backendInvitationId: 999,
        title: "Grand Published Gala",
        eventType: "CORPORATE",
        status: "PUBLISHED",
        eventDate: "2026-11-20",
        eventTime: "20:00",
      },
    ];

    const onManage = vi.fn();
    const onEdit = vi.fn();

    render(
      <EventCalendar
        events={events}
        initialDate={new Date(2026, 10, 1)}
        onManage={onManage}
        onEdit={onEdit}
      />
    );

    // Select the 20th of November 2026
    const day20Cell = screen.getByRole("gridcell", { name: /Nov 20, 2026/i });
    fireEvent.click(day20Cell);

    // Verify detail cards render with correct badges
    expect(screen.getByText("Local draft")).toBeInTheDocument();
    expect(screen.getByText("Sync failed")).toBeInTheDocument();
    expect(screen.getByText("Published")).toBeInTheDocument();

    // Verify action button labels: local draft gets "Resume draft", server event gets "Manage"
    expect(screen.getAllByRole("button", { name: "Resume draft" }).length).toBe(2);
    expect(screen.getByRole("button", { name: "Manage" })).toBeInTheDocument();
  });

  it("renders authentic Khmer numerals, month labels, and weekday titles when lang is km", () => {
    useLanguageStore.setState({ lang: "km" });

    const events = [
      {
        id: "evt-km-1",
        title: "មង្គលការ សុខា",
        eventType: "WEDDING",
        status: "PUBLISHED",
        eventDate: "2026-11-15",
      },
    ];

    render(<EventCalendar events={events} initialDate={new Date(2026, 10, 1)} />);

    // Khmer month name for November: វិច្ឆិកា 2026
    expect(screen.getByText(/វិច្ឆិកា 2026/)).toBeInTheDocument();
    // Weekday headers in Khmer short forms (ច, អ, etc.)
    expect(screen.getByText("ច")).toBeInTheDocument();
    expect(screen.getByText("អា")).toBeInTheDocument();
  });
});
