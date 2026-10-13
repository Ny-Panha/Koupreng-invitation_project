import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { RequestWaterfall } from "./RequestWaterfall";

describe("RequestWaterfall", () => {
  afterEach(() => {
    cleanup();
  });
  const mockEvents = [
    {
      id: 1,
      requestId: "req-1",
      actionId: "act-create-invite",
      clientAction: "CREATE_INVITATION",
      method: "POST",
      path: "/api/v1/invitations/create",
      status: 201,
      durationMs: 80,
      clientDurationMs: 110,
      sqlQueryCount: 3,
      nPlusOneDetected: false,
      timestamp: "2026-10-13T15:00:00.000Z",
    },
    {
      id: 2,
      requestId: "req-2",
      actionId: "act-create-invite",
      clientAction: "CREATE_INVITATION",
      method: "GET",
      path: "/api/v1/invitations/details/1",
      status: 200,
      durationMs: 40,
      clientDurationMs: 60,
      sqlQueryCount: 1,
      nPlusOneDetected: false,
      timestamp: "2026-10-13T15:00:00.120Z",
    },
  ];

  it("renders waterfall timeline grouped by actionId", () => {
    const onSelectEvent = vi.fn();
    render(
      <RequestWaterfall
        events={mockEvents}
        onSelectEvent={onSelectEvent}
        selectedEventId={null}
        lang="en"
      />
    );

    expect(screen.getByText(/Interactive Request Waterfall/i)).toBeInTheDocument();
    expect(screen.getByText("act-create-invite")).toBeInTheDocument();
    expect(screen.getByText("/api/v1/invitations/create")).toBeInTheDocument();
  });

  it("triggers onSelectEvent when clicking a waterfall bar", () => {
    const onSelectEvent = vi.fn();
    render(
      <RequestWaterfall
        events={mockEvents}
        onSelectEvent={onSelectEvent}
        selectedEventId={null}
        lang="en"
      />
    );

    const firstTrace = screen.getByText("/api/v1/invitations/create");
    fireEvent.click(firstTrace);
    expect(onSelectEvent).toHaveBeenCalledWith(mockEvents[0]);
  });

  it("renders empty state when no events exist", () => {
    render(
      <RequestWaterfall
        events={[]}
        onSelectEvent={vi.fn()}
        selectedEventId={null}
        lang="en"
      />
    );

    expect(screen.getByText(/No requests available for Waterfall view/i)).toBeInTheDocument();
  });
});
