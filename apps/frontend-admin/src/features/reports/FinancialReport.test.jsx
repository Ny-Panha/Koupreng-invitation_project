import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const adminService = vi.hoisted(() => ({
  invitations: vi.fn(),
  invitation: vi.fn(),
  invitationGifts: vi.fn(),
  invitationBudgetItems: vi.fn(),
  invitationRsvpSummary: vi.fn(),
}));

vi.mock("../../shared/api/adminService", () => ({ default: adminService }));

import FinancialReport from "./FinancialReport";

afterEach(cleanup);

describe("FinancialReport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    adminService.invitations.mockResolvedValue([{ id: 42, title: "Wedding" }]);
    adminService.invitation.mockResolvedValue({
      id: 42,
      groomName: "Dara",
      brideName: "Sophea",
      eventDate: "2026-12-01",
    });
    adminService.invitationGifts.mockResolvedValue([]);
    adminService.invitationBudgetItems.mockResolvedValue([]);
    adminService.invitationRsvpSummary.mockResolvedValue({ totalGuests: 0, attending: 0 });
  });

  it("renders the selected invitation financial report after live data loads", async () => {
    render(<FinancialReport />);

    expect(await screen.findByText("Dara & Sophea")).toBeInTheDocument();
    expect(screen.getByText("តារាងអំណោយ និងចំណូលផ្សេងៗ")).toBeInTheDocument();
    expect(screen.getByText("តារាងថវិកាគ្រោង និងចំណាយជាក់ស្តែង")).toBeInTheDocument();
    expect(screen.getAllByText("មិនមានទិន្នន័យ / No records")).toHaveLength(2);
  });

  it("lists multiple user-created invitations and fetches the selected event by ID", async () => {
    adminService.invitations.mockResolvedValue([
      { id: 42, title: "Wedding One", groomName: "Dara", brideName: "Sophea" },
      { id: 77, title: "Wedding Two", groomName: "Vireak", brideName: "Chenda" },
    ]);
    adminService.invitation.mockImplementation(async (id) => id === "77"
      ? { id: 77, groomName: "Vireak", brideName: "Chenda", eventDate: "2027-01-15" }
      : { id: 42, groomName: "Dara", brideName: "Sophea", eventDate: "2026-12-01" });

    render(<FinancialReport />);

    const invitationSelect = await screen.findByRole("combobox", { name: "ជ្រើសរើសកម្មវិធី" });
    expect(screen.getByRole("option", { name: /Vireak & Chenda/ })).toBeInTheDocument();
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "Vireak" } });
    fireEvent.change(invitationSelect, { target: { value: "77" } });

    expect(await screen.findByText("Vireak & Chenda")).toBeInTheDocument();
    await waitFor(() => {
      expect(adminService.invitationGifts).toHaveBeenCalledWith("77");
      expect(adminService.invitationBudgetItems).toHaveBeenCalledWith("77");
      expect(adminService.invitationRsvpSummary).toHaveBeenCalledWith("77");
    });
  });

  it("defaults to printing all sections and updates the selected print mode", async () => {
    render(<FinancialReport />);

    const printFilter = await screen.findByRole("combobox", { name: "Print section" });
    expect(printFilter).toHaveValue("all");
    expect(document.querySelector(".admin-financial-report")).toHaveClass("print-mode-all");
    expect(screen.getByRole("button", { name: /Print Selected Section/ })).toBeInTheDocument();

    fireEvent.change(printFilter, { target: { value: "income" } });
    expect(document.querySelector(".admin-financial-report")).toHaveClass("print-mode-income");

    fireEvent.change(printFilter, { target: { value: "expenses" } });
    expect(document.querySelector(".admin-financial-report")).toHaveClass("print-mode-expenses");
  });

  it("uses user event titles and filters the list by event type", async () => {
    adminService.invitations.mockResolvedValue([
      { id: 42, title: "Wedding One", eventType: "WEDDING", groomName: "Dara", brideName: "Sophea" },
      { id: 88, title: "Sokha's Birthday", eventType: "BIRTHDAY", ownerName: "Sokha" },
    ]);
    adminService.invitation.mockImplementation(async (id) => id === "88"
      ? { id: 88, title: "Sokha's Birthday", eventType: "BIRTHDAY", ownerName: "Sokha", eventDate: "2027-04-20" }
      : { id: 42, title: "Wedding One", eventType: "WEDDING", groomName: "Dara", brideName: "Sophea" });

    render(<FinancialReport />);

    const invitationSelect = await screen.findByRole("combobox", { name: "ជ្រើសរើសកម្មវិធី" });
    fireEvent.change(screen.getByLabelText("ត្រងតាមប្រភេទកម្មវិធី"), { target: { value: "BIRTHDAY" } });
    expect(screen.getByRole("option", { name: /Sokha's Birthday/ })).toBeInTheDocument();
    expect(invitationSelect).toHaveValue("42");

    fireEvent.change(invitationSelect, { target: { value: "88" } });

    expect(await screen.findByRole("heading", { name: "Sokha's Birthday" })).toBeInTheDocument();
    expect(screen.getAllByText("ខួបកំណើត").length).toBeGreaterThan(0);
  });

  it("separates planned budgets from recorded actual expenses and itemizes RSVP counts", async () => {
    adminService.invitationBudgetItems.mockResolvedValue([
      { id: 1, category: "Venue", estimatedCost: 300, actualCost: null, currency: "USD" },
      { id: 2, category: "Food", estimatedCost: 500, actualCost: 275, currency: "USD" },
      { id: 3, category: "Decor", estimatedCost: 100000, actualCost: 50000, currency: "KHR" },
    ]);
    adminService.invitationRsvpSummary.mockResolvedValue({
      totalGuests: 10,
      attending: 4,
      totalAttendeeCount: 6,
      notAttending: 2,
      maybe: 1,
      pending: 3,
    });

    render(<FinancialReport />);

    expect(await screen.findByText("តារាងថវិកាគ្រោង និងចំណាយជាក់ស្តែង")).toBeInTheDocument();
    await waitFor(() => expect(adminService.invitationBudgetItems).toHaveBeenCalledWith("42"));
    expect(screen.getByText(/Actual Cost Missing/)).toBeInTheDocument();
    expect(screen.getByText(/Not recorded/)).toBeInTheDocument();
    expect(screen.getByText("$300.00")).toBeInTheDocument();
    expect(screen.getAllByText("50,000 ៛").length).toBeGreaterThan(0);
    expect(screen.getByText(/Confirmed Attendees/)).toBeInTheDocument();
    expect(screen.getByText("6")).toBeInTheDocument();
    expect(screen.getByText(/Attending Responses/)).toBeInTheDocument();
  });

  it("shows payment channel totals, Khmer categories, clean fallbacks, and explicit deficits", async () => {
    adminService.invitationGifts.mockResolvedValue([
      { id: 1, amount: 40, currency: "USD", method: "ABA PayWay", name: "ABA giver", side: "   " },
      { id: 2, amount: 15, currency: "USD", method: "Cash" },
      { id: 3, amount: 12000, currency: "KHR", method: "KHQR" },
    ]);
    adminService.invitationBudgetItems.mockResolvedValue([
      { id: 1, category: "ATTIRE & MAKEUP", actualCost: 70, currency: "USD", vendorName: null, notes: null },
    ]);

    render(<FinancialReport />);

    const expenseHeading = await screen.findByText("តារាងថវិកាគ្រោង និងចំណាយជាក់ស្តែង");
    const categoryRow = (await screen.findByText(/សំលៀកបំពាក់/)).closest("tr");
    expect(categoryRow.cells[1]).toHaveTextContent("-");
    expect(categoryRow.cells[5]).toHaveTextContent("-");
    expect(screen.getByText("ABA giver").closest("tr").cells[1]).toHaveTextContent("-");
    expect(screen.getByText("ABA / KHQR")).toBeInTheDocument();
    expect(screen.getByText("សាច់ប្រាក់ / Cash")).toBeInTheDocument();
    expect(screen.getByText("Deficit $15.00")).toBeInTheDocument();
    expect(expenseHeading).toBeInTheDocument();
  });

  it("formats structured expense notes and hides empty JSON metadata", async () => {
    adminService.invitationBudgetItems.mockResolvedValue([
      { id: 1, category: "Venue", actualCost: 200, currency: "USD", notes: '{"text":"","payments":[]}' },
      { id: 2, category: "Food", actualCost: 250, currency: "USD", notes: '{"text":"Contract signed","payments":[{"desc":"Deposit","amount":"75"}]}' },
      { id: 3, category: "Music", actualCost: 20, currency: "USD", notes: "Legacy plain note" },
    ]);

    render(<FinancialReport />);

    await screen.findByText("តារាងថវិកាគ្រោង និងចំណាយជាក់ស្តែង");
    await waitFor(() => expect(adminService.invitationBudgetItems).toHaveBeenCalledWith("42"));

    const venueRow = screen.getByText("ទីតាំងកម្មវិធី").closest("tr");
    expect(venueRow.cells[5]).toHaveTextContent("-");
    expect(screen.queryByText('{"text":"","payments":[]}')).not.toBeInTheDocument();
    expect(screen.getByText("Contract signed · Deposit: $75.00")).toBeInTheDocument();
    expect(screen.getByText("Legacy plain note")).toBeInTheDocument();
  });
});