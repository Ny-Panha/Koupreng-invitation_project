import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  guestInviteUrl,
  initials,
  mergeBackendGuestsWithRsvps,
  normalizeBackendGuest,
  normalizeBackendRsvp,
  normalizeManualGuest,
} from "./model/guestMappers";
import GuestStats from "./components/GuestStats";
import GuestTable from "./components/GuestTable";

afterEach(() => {
  cleanup();
});

describe("Guest Domain Module", () => {
  describe("guestMappers", () => {
    it("normalizes backend guest record correctly", () => {
      const raw = {
        id: 101,
        guestName: "Sok Dara",
        phone: "012345678",
        guestGroup: "Groom Side",
        sideType: "Friend",
        tableNumber: "T-01",
        seatCount: 2,
        sendStatus: "បានផ្ញើ",
        inviteToken: "token-dara-123",
      };

      const result = normalizeBackendGuest(raw);
      expect(result.id).toBe(101);
      expect(result.name).toBe("Sok Dara");
      expect(result.phone).toBe("012345678");
      expect(result.group).toBe("Groom Side");
      expect(result.category).toBe("Friend");
      expect(result.seat).toBe("T-01");
      expect(result.count).toBe(2);
      expect(result.inviteToken).toBe("token-dara-123");
      expect(result.source).toBe("backend");
    });

    it("generates unique guest invite URL with token (1 guest = 1 unique QR link)", () => {
      const draft = { slug: "nha-pkay" };
      const guest = { name: "Heng Thida", inviteToken: "token-thida-999" };
      const url = guestInviteUrl(draft, guest);

      expect(url).toContain("/w/nha-pkay?token=token-thida-999");
    });

    it("normalizes manual guest record correctly", () => {
      const manual = {
        name: "Channa",
        phone: "-",
        count: "3",
      };

      const result = normalizeManualGuest(manual);
      expect(result.name).toBe("Channa");
      expect(result.phone).toBe("");
      expect(result.count).toBe(3);
      expect(result.source).toBe("manual");
    });

    it("generates correct initials from guest name", () => {
      expect(initials("Sok Dara")).toBe("SD");
      expect(initials("Koupreng")).toBe("K");
      expect(initials("")).toBe("?");
    });

    it("joins RSVP state by backend guest ID without creating duplicate guests", () => {
      const guests = [
        normalizeBackendGuest({ id: 101, guestName: "Sok Dara" }),
        normalizeBackendGuest({ id: 102, guestName: "Sok Dara" }),
      ];
      const rsvps = [
        normalizeBackendRsvp({ id: 501, guestId: 102, responseStatus: "ATTENDING", attendeeCount: 2 }),
        normalizeBackendRsvp({ id: 502, guestId: 999, responseStatus: "MAYBE", attendeeCount: 1 }),
      ];

      const result = mergeBackendGuestsWithRsvps(guests, rsvps);

      expect(result).toHaveLength(2);
      expect(result[0].rsvpStatus).toBeUndefined();
      expect(result[1]).toMatchObject({ id: 102, rsvpStatus: "ATTENDING", rsvpAttendeeCount: 2 });
    });
  });

  describe("GuestStats Component", () => {
    it("calculates summary statistics correctly", () => {
      const sampleGuests = [
        { id: 1, count: 2, sendStatus: "បានផ្ញើ" },
        { id: 2, count: 1, sendStatus: "បានឆ្លើយតប" },
        { id: 3, count: 3, sendStatus: "មិនទាន់ផ្ញើ" },
      ];

      render(<GuestStats guests={sampleGuests} />);

      expect(screen.getByText("3")).toBeInTheDocument(); // total count
      expect(screen.getByText("6")).toBeInTheDocument(); // total seats (2+1+3)
      expect(screen.getAllByText("1").length).toBe(2); // sent count (1) & responded count (1)
    });

    it("counts canonical backend delivery statuses", () => {
      render(<GuestStats guests={[{ id: 1, count: 1, sendStatus: "SENT" }]} t={(key) => key} />);

      expect(screen.getByText("statSent").closest("article")).toHaveTextContent("1");
    });
  });

  describe("GuestTable Component", () => {
    it("renders guest rows with status badges and action buttons", () => {
      const sampleGuests = [
        {
          id: 1,
          name: "Sok Dara",
          phone: "012345678",
          group: "Groom Side",
          category: "Friend",
          count: 2,
          sendStatus: "PUBLISHED",
          rsvpStatus: "ATTENDING",
        },
      ];

      const handleEdit = vi.fn();
      const handleDelete = vi.fn();
      const handleQr = vi.fn();
      const handleCopy = vi.fn();

      render(
        <GuestTable
          guests={sampleGuests}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onShowQr={handleQr}
          onCopyLink={handleCopy}
        />
      );

      expect(screen.getByText("Sok Dara")).toBeInTheDocument();
      expect(screen.getByText("012345678")).toBeInTheDocument();
      expect(screen.getByText("Groom Side")).toBeInTheDocument();
      expect(screen.getByText("Published")).toBeInTheDocument();
      expect(screen.getByText("RSVP: ATTENDING")).toBeInTheDocument();
    });

    it("suppresses pending status and shows checked-in and RSVP badges when guest has responded and checked in", () => {
      const sampleGuests = [
        {
          id: 2,
          name: "Eng Thida",
          phone: "085221144",
          group: "Family",
          category: "Family",
          count: 1,
          sendStatus: "មិនទាន់ផ្ញើ",
          rsvpStatus: "ATTENDING",
          checkedIn: true,
        },
      ];

      render(
        <GuestTable
          guests={sampleGuests}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          onShowQr={vi.fn()}
          onCopyLink={vi.fn()}
        />
      );

      expect(screen.getByText("Eng Thida")).toBeInTheDocument();
      expect(screen.getByText("បានចូលរួម")).toBeInTheDocument();
      expect(screen.getByText("RSVP: ATTENDING")).toBeInTheDocument();
      expect(screen.queryByText("មិនទាន់ផ្ញើ")).not.toBeInTheDocument();
    });
  });
});
