import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useLanguageStore } from "@/stores/useLanguageStore";
import TicketDesigner from "./TicketDesigner";
import { ticketService } from "./ticketApi";
import { guestService } from "@/features/guests/api/guestApi";
import { mediaService } from "@/features/invitations/api/mediaApi";

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  vi.clearAllMocks();
  useLanguageStore.setState({ lang: "en" });
});

vi.mock("./ticketRenderer", () => ({
  renderTicket: vi.fn().mockResolvedValue(undefined),
  ticketBlob: vi.fn().mockResolvedValue(new Blob(["test-png"], { type: "image/png" })),
  wrapTicketText: vi.fn().mockReturnValue(["line1"]),
}));

vi.mock("./ticketApi", () => ({
  ticketService: {
    design: vi.fn(),
    save: vi.fn(),
    ticket: vi.fn(),
  },
}));

vi.mock("@/features/guests/api/guestApi", () => ({
  guestService: {
    listByInvitation: vi.fn(),
  },
}));

vi.mock("@/features/invitations/api/mediaApi", () => ({
  mediaService: {
    list: vi.fn(),
    uploadTicketImage: vi.fn(),
    remove: vi.fn(),
  },
}));

vi.mock("@/shared/feedback/feedback", () => ({
  feedback: {
    confirm: vi.fn().mockResolvedValue(true),
  },
}));

describe("TicketDesigner Feature", () => {
  const mockDesign = {
    layout: "GOLD",
    accent: "#967037",
    frame: "DOUBLE",
    font: "MOUL",
    header: "Exclusive Invitation",
    footer: "Please present this pass at the reception.",
    coverMediaId: null,
    backgroundMediaId: null,
    coverFit: "COVER",
    coverFocusX: 50,
    coverFocusY: 50,
    backgroundOpacity: 0.12,
    showTable: true,
    showSeatCount: true,
    showGroup: false,
  };

  const mockTicket = {
    id: "101",
    title: "Sok & Dara Wedding",
    hostName: "Sok",
    partnerName: "Dara",
    eventDate: "2026-12-25",
    eventTime: "17:00",
    venueName: "Grand Ballroom",
    qrCodeDataUri: "data:image/png;base64,mockqr",
    invitationUrl: "https://koupreng.app/w/sok-dara",
    kind: "GENERAL",
  };

  const mockGuests = [
    { id: "g-1", guestName: "Lok Chumteav Bopha" },
    { id: "g-2", guestName: "Oknha Rithy" },
  ];

  beforeEach(() => {
    ticketService.design.mockResolvedValue({ design: mockDesign });
    ticketService.ticket.mockResolvedValue(mockTicket);
    guestService.listByInvitation.mockResolvedValue(mockGuests);
    mediaService.list.mockResolvedValue({ all: [] });
  });

  it("renders ticket designer header, controls and live preview", async () => {
    render(
      <MemoryRouter initialEntries={["/app/events/101/tickets/design"]}>
        <Routes>
          <Route path="/app/events/:eventId/tickets/design" element={<TicketDesigner />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Ticket designer" })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Live preview" })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Style" })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Wording" })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Guest details" })).toBeInTheDocument();
    });

    expect(screen.getByText("Saved design")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save design" })).toBeDisabled();
  });

  it("marks design dirty when changing wording and enables save button", async () => {
    ticketService.save.mockResolvedValue({ design: { ...mockDesign, header: "VIP Golden Pass" } });

    render(
      <MemoryRouter initialEntries={["/app/events/101/tickets/design"]}>
        <Routes>
          <Route path="/app/events/:eventId/tickets/design" element={<TicketDesigner />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue("Exclusive Invitation")).toBeInTheDocument();
    });

    const headerInput = screen.getByDisplayValue("Exclusive Invitation");
    fireEvent.change(headerInput, { target: { value: "VIP Golden Pass" } });

    await waitFor(() => {
      expect(screen.getByText("Unsaved design")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Save design" })).toBeEnabled();
    });

    // Click Save
    fireEvent.click(screen.getByRole("button", { name: "Save design" }));

    await waitFor(() => {
      expect(ticketService.save).toHaveBeenCalledWith("101", expect.objectContaining({ header: "VIP Golden Pass" }));
      expect(screen.getByText("Saved")).toBeInTheDocument();
    });
  });

  it("switches preview recipient to a personalized guest", async () => {
    const personalizedTicket = {
      ...mockTicket,
      guestId: "g-1",
      guestName: "Lok Chumteav Bopha",
      tableName: "VIP Table 1",
      seatNumber: "A1",
      kind: "GUEST",
      invitationUrl: "https://koupreng.app/i/sok-dara?token=bopha-token",
    };
    ticketService.ticket.mockResolvedValueOnce(mockTicket).mockResolvedValueOnce(personalizedTicket);

    render(
      <MemoryRouter initialEntries={["/app/events/101/tickets/design"]}>
        <Routes>
          <Route path="/app/events/:eventId/tickets/design" element={<TicketDesigner />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Preview recipient")).toBeInTheDocument();
    });

    const recipientSelect = screen.getByLabelText("Preview recipient");
    fireEvent.change(recipientSelect, { target: { value: "g-1" } });

    await waitFor(() => {
      expect(ticketService.ticket).toHaveBeenCalledWith("101", "g-1");
    });
  });
});
