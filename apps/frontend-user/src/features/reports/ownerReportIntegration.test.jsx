import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import OwnerReportSummary from "./components/OwnerReportSummary";
import { reportsApi } from "./api/reportsApi";
vi.mock("./api/reportsApi", () => ({ reportsApi: { getReport: vi.fn(), exportCsv: vi.fn() } }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });
describe("BG-03 mounted owner report summary", () => {
  it("renders authoritative attendance/delivery counts and retains export errors", async () => {
    reportsApi.getReport.mockImplementation((_id, { type }) => Promise.resolve(type === "GUEST"
      ? { totalGuests: 200, sent: 150, opened: 125 } : { yesCount: 80, attendeeTotal: 120, pendingCount: 40 }));
    reportsApi.exportCsv.mockRejectedValue(new Error("Export unavailable"));
    render(<OwnerReportSummary invitationId={42} />);
    await screen.findByText(/Guests: 200/); expect(screen.getByText(/Attendees: 120/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Export RSVP report CSV" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Export unavailable");
    expect(reportsApi.exportCsv).toHaveBeenCalledWith(42, "RSVP");
  });
  it("does not show fabricated zero counts when the server refuses access", async () => {
    reportsApi.getReport.mockRejectedValue(new Error("Permission denied"));
    render(<OwnerReportSummary invitationId={43} />); await screen.findByRole("alert"); expect(screen.queryByText(/Guests: 0/)).not.toBeInTheDocument();
  });
});
