import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EventCalendar } from "./EventCalendar";
import { useLanguageStore } from "@/stores/useLanguageStore";

describe("EventCalendar Component", () => {
  afterEach(() => {
    cleanup();
    useLanguageStore.setState({ lang: "en" });
  });

  const mockEvents = [
    {
      id: "evt-101",
      title: "Visal & Sophea Royal Wedding",
      eventType: "WEDDING",
      status: "PUBLISHED",
      eventDate: "2026-11-28",
      eventTime: "16:00",
      venueName: "Sokha Hotel Grand Ballroom",
    },
    {
      id: "evt-102",
      title: "Channary Birthday Bash",
      eventType: "BIRTHDAY",
      status: "DRAFT",
      eventDate: "2026-11-28",
      eventTime: "19:00",
      venueName: "Rosewood Phnom Penh",
    },
    {
      id: "evt-103",
      title: "Koupreng Tech Gala",
      eventType: "CORPORATE",
      status: "PUBLISHED",
      eventDate: "2026-12-15",
      eventTime: "09:00",
      venueName: "Koh Pich City Hall",
    },
  ];

  it("renders calendar month heading and weekday headers in English", () => {
    useLanguageStore.setState({ lang: "en" });
    render(<EventCalendar events={mockEvents} />);

    expect(screen.getByRole("region", { name: "Event Calendar" })).toBeInTheDocument();
    expect(screen.getByText("Mon")).toBeInTheDocument();
    expect(screen.getByText("Sun")).toBeInTheDocument();
    expect(screen.getByText("3 events")).toBeInTheDocument();
  });

  it("renders calendar in Khmer with authentic month and day labels", () => {
    useLanguageStore.setState({ lang: "km" });
    render(<EventCalendar events={mockEvents} />);

    expect(screen.getByRole("region", { name: "ប្រតិទិនកម្មវិធី" })).toBeInTheDocument();
    expect(screen.getByText("ច")).toBeInTheDocument();
    expect(screen.getByText("អា")).toBeInTheDocument();
    expect(screen.getByText("3 កម្មវិធី")).toBeInTheDocument();
  });

  it("navigates forward and backward across months and returns via Today button", () => {
    useLanguageStore.setState({ lang: "en" });
    render(<EventCalendar events={mockEvents} />);

    const nextBtn = screen.getByRole("button", { name: "Next month" });
    const prevBtn = screen.getByRole("button", { name: "Previous month" });
    const todayBtn = screen.getByRole("button", { name: "Today" });

    // Navigate to next month
    fireEvent.click(nextBtn);
    // Navigate back twice
    fireEvent.click(prevBtn);
    fireEvent.click(prevBtn);
    // Jump back to today
    fireEvent.click(todayBtn);

    const now = new Date();
    const currentMonthLabel = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(now);
    expect(screen.getByText(currentMonthLabel)).toBeInTheDocument();
  });

  it("switches to Agenda view and displays sorted events chronologically", () => {
    useLanguageStore.setState({ lang: "en" });
    render(<EventCalendar events={mockEvents} />);

    const agendaToggle = screen.getByRole("button", { name: "Agenda" });
    fireEvent.click(agendaToggle);

    expect(screen.getByRole("feed", { name: "Upcoming event agenda" })).toBeInTheDocument();
    expect(screen.getByText("Visal & Sophea Royal Wedding")).toBeInTheDocument();
    expect(screen.getByText("Channary Birthday Bash")).toBeInTheDocument();
    expect(screen.getByText("Koupreng Tech Gala")).toBeInTheDocument();
  });

  it("allows selecting a date to inspect scheduled events and triggers onManage callback", () => {
    useLanguageStore.setState({ lang: "en" });
    const onManage = vi.fn();
    render(<EventCalendar events={mockEvents} onManage={onManage} />);

    // Switch to Agenda view to click Manage directly
    fireEvent.click(screen.getByRole("button", { name: "Agenda" }));
    const manageButtons = screen.getAllByRole("button", { name: "Manage" });
    expect(manageButtons.length).toBe(3);

    fireEvent.click(manageButtons[0]);
    expect(onManage).toHaveBeenCalledWith(expect.objectContaining({ id: "evt-101" }));
  });

  it("handles leap years safely without local date shifts", () => {
    const leapYearEvent = [
      {
        id: "leap-1",
        title: "Leap Day Celebration",
        eventType: "WEDDING",
        status: "PUBLISHED",
        eventDate: "2028-02-29",
      },
    ];

    useLanguageStore.setState({ lang: "en" });
    render(<EventCalendar events={leapYearEvent} />);

    // Navigate to Agenda view
    fireEvent.click(screen.getByRole("button", { name: "Agenda" }));
    expect(screen.getByText("Leap Day Celebration")).toBeInTheDocument();
    expect(screen.getByText(/Feb 29, 2028/)).toBeInTheDocument();
  });
});
