import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";

const adminService = vi.hoisted(() => ({
  report: vi.fn(),
  invitations: vi.fn(),
  invitation: vi.fn(),
  invitationGifts: vi.fn(),
  invitationBudgetItems: vi.fn(),
  invitationRsvpSummary: vi.fn(),
}));

vi.mock("../../shared/api/adminService", () => ({ default: adminService }));

import AdminReportsPage from "../../pages/reports/AdminReportsPage";

afterEach(cleanup);

describe("admin report overview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    adminService.report.mockResolvedValue({
      generatedAt: "2026-09-29T10:00:00Z",
      summary: { totalInvitations: 3, publishedInvitations: 1, hiddenInvitations: 1 },
      rows: [
        { id: 42, title: "Dara and Sophea", ownerName: "Dara", eventType: "WEDDING", eventDate: "2026-12-01", status: "PUBLISHED", moderationStatus: "ACTIVE" },
        { id: 77, title: "Sokha Birthday", ownerName: "Sokha", eventType: "BIRTHDAY", eventDate: "2027-01-15", status: "DRAFT", moderationStatus: "HIDDEN" },
        { id: 88, title: "Company Dinner", ownerName: "Koupreng Co.", eventType: "CORPORATE", status: "UNPUBLISHED", moderationStatus: "REPORTED" },
      ],
    });
    adminService.invitations.mockResolvedValue([]);
    adminService.invitation.mockImplementation(async (id) => ({
      id: Number(id),
      title: "Sokha Birthday",
      eventType: "BIRTHDAY",
      ownerName: "Sokha",
    }));
    adminService.invitationGifts.mockResolvedValue([]);
    adminService.invitationBudgetItems.mockResolvedValue([]);
    adminService.invitationRsvpSummary.mockResolvedValue({ totalGuests: 0, attending: 0 });
  });

  function renderPage() {
    return render(
      <MemoryRouter initialEntries={["/reports"]}>
        <Routes>
          <Route path="/reports" element={<AdminReportsPage />} />
          <Route path="/reports/:invitationId" element={<AdminReportsPage />} />
        </Routes>
      </MemoryRouter>,
    );
  }

  it("shows platform-level event and moderation counts from the report API", async () => {
    renderPage();

    expect(await screen.findByText("Dara and Sophea")).toBeInTheDocument();
    expect(screen.getByText("កម្មវិធីសរុប")).toBeInTheDocument();
    expect(screen.getAllByText("បានផ្សាយ").length).toBeGreaterThan(0);
    expect(screen.getByText("ត្រូវការត្រួតពិនិត្យ")).toBeInTheDocument();
    expect(adminService.report).toHaveBeenCalledWith("invitations");
  });

  it("filters by event type and opens the selected invitation's detail route", async () => {
    renderPage();

    expect(await screen.findByText("Company Dinner")).toBeInTheDocument();
    fireEvent.change(screen.getByRole("combobox", { name: "ប្រភេទកម្មវិធី" }), { target: { value: "BIRTHDAY" } });

    expect(screen.getByText("Sokha Birthday")).toBeInTheDocument();
    expect(screen.queryByText("Company Dinner")).not.toBeInTheDocument();
    const detailLink = screen.getByRole("link", { name: /មើលរបាយការណ៍ Sokha Birthday/ });
    expect(detailLink).toHaveAttribute("href", "/reports/77");
    fireEvent.click(detailLink);
    expect(await screen.findByRole("heading", { name: "Sokha Birthday" })).toBeInTheDocument();
    expect(adminService.invitation).toHaveBeenCalledWith("77");
  });

  it("filters invitations by search and publication status", async () => {
    renderPage();

    await screen.findByText("Company Dinner");
    fireEvent.change(screen.getByRole("searchbox", { name: "ស្វែងរកកម្មវិធី" }), { target: { value: "Koupreng" } });
    fireEvent.change(screen.getByRole("combobox", { name: "ស្ថានភាពផ្សាយ" }), { target: { value: "UNPUBLISHED" } });

    expect(screen.getByText("Company Dinner")).toBeInTheDocument();
    expect(screen.queryByText("Dara and Sophea")).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByText(/បង្ហាញ 1 ក្នុងចំណោម 3/)).toBeInTheDocument());
  });
});
