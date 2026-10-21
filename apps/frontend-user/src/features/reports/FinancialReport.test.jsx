import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useLanguageStore } from "@/stores/useLanguageStore";

const reportState = vi.hoisted(() => ({
  useActiveEventReport: vi.fn(),
}));

vi.mock("./hooks/useActiveEventReport", () => ({ useActiveEventReport: reportState.useActiveEventReport }));
vi.mock("./components/OwnerReportSummary", () => ({ default: () => null }));

import ReportsPage from "./ReportsPage";

afterEach(cleanup);

describe("user financial report", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useLanguageStore.setState({ lang: "en" });
    reportState.useActiveEventReport.mockReturnValue({
      sourceData: {
        invitation: { id: 88, title: "Sokha's Birthday", eventType: "BIRTHDAY", eventDate: "2027-04-20" },
        gifts: [
          { id: 1, name: "Dara", amount: 40, currency: "USD", method: "ABA KHQR" },
          { id: 2, name: "Sophea", amount: 15, currency: "USD", method: "Cash" },
        ],
        expenses: [{ id: 3, category: "Venue", estimatedCost: 100, actualCost: 60, currency: "USD" }],
        guests: [{ id: 4 }, { id: 5 }],
        rsvps: [{ responseStatus: "ATTENDING", attendeeCount: 4 }],
        checkIns: [{ id: 6, active: true }],
      },
      generatedAt: new Date("2026-10-04T12:00:00Z"),
      loading: false,
      error: "",
      reload: vi.fn(),
    });
  });

  it("renders the active event's budget, payment channels, attendance, check-ins, and print action", () => {
    render(<ReportsPage />);

    expect(screen.getByText("Sokha's Birthday")).toBeInTheDocument();
    expect(screen.getByText("Birthday")).toBeInTheDocument();
    expect(screen.getByText("Estimated Budget").parentElement).toHaveTextContent("$100.00");
    expect(screen.getByText("Actual Expenses").parentElement).toHaveTextContent("$60.00");
    expect(screen.getByText("Unpaid Balance").parentElement).toHaveTextContent("$40.00");
    expect(screen.getByText("ABA / KHQR").parentElement).toHaveTextContent("$40.00");
    expect(screen.getByText("Cash", { selector: "span" }).parentElement).toHaveTextContent("$15.00");
    expect(screen.getByText("Confirmed Attendees").parentElement).toHaveTextContent("4");
    expect(screen.getByText("QR Check-ins").parentElement).toHaveTextContent("1");
    expect(screen.getByRole("button", { name: "Print Report" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Save as PDF/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Preview/ })).toBeInTheDocument();
    expect(screen.getByText("Expense records")).toBeInTheDocument();
  });

  it("toggles print preview mode and handles escape key to exit", () => {
    render(<ReportsPage />);

    expect(screen.queryByRole("dialog")).toBeNull();
    const previewBtn = screen.getByRole("button", { name: /Preview/ });
    fireEvent.click(previewBtn);

    expect(screen.queryByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText("Print preview controls")).toBeInTheDocument();

    const exitBtn = screen.getByRole("button", { name: /Exit/ });
    fireEvent.click(exitBtn);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("triggers window.print with custom document title for PDF export", () => {
    window.print = vi.fn();
    render(<ReportsPage />);

    const pdfBtn = screen.getByRole("button", { name: /Save as PDF/ });
    fireEvent.click(pdfBtn);

    expect(window.print).toHaveBeenCalledTimes(1);
    expect(document.title).toContain("Koupreng-Financial-Report-Sokha_s_Birthday");
  });

  it("shows an empty state instead of selecting an arbitrary event", () => {
    reportState.useActiveEventReport.mockReturnValue({ sourceData: null, generatedAt: new Date(), loading: false, error: "", reload: vi.fn() });
    render(<ReportsPage />);
    expect(screen.getByText(/No active event is available/)).toBeInTheDocument();
  });
});
