import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";

const adminService = vi.hoisted(() => ({
  report: vi.fn(),
  invitations: vi.fn(),
  invitation: vi.fn(),
  invitationGifts: vi.fn(),
  invitationBudgetItems: vi.fn(),
  invitationRsvpSummary: vi.fn(),
  updateInvitationStatus: vi.fn(),
}));

vi.mock("../../shared/api/adminService", () => ({ default: adminService }));

import AdminReportsPage from "../../pages/reports/AdminReportsPage";
import { AdminLanguageProvider } from "../../app/providers/AdminLanguageProvider";

afterEach(cleanup);

describe("admin report overview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    adminService.report.mockImplementation(async (name) => {
      if (name === "payments") {
        return {
          summary: { paidAmountUsd: 150 },
          rows: [
            {
              id: 1,
              period: "2026-03",
              type: "TEMPLATE",
              provider: "KHQR",
              status: "COMPLETED",
              transactionCount: 5,
              totalAmount: 50,
              currency: "USD",
              reference: "REF-KHQR-1",
            },
            {
              id: 2,
              period: "2026-03",
              type: "SUBSCRIPTION",
              provider: "STRIPE",
              status: "PENDING",
              transactionCount: 2,
              totalAmount: 100,
              currency: "USD",
              reference: "REF-STRIPE-2",
            },
          ],
        };
      }
      return {
        generatedAt: "2026-09-29T10:00:00Z",
        summary: { totalInvitations: 4, publishedInvitations: 1, hiddenInvitations: 1 },
        rows: [
          { id: 42, title: "Dara and Sophea", ownerName: "Dara", eventType: "WEDDING", eventDate: "2026-12-01", status: "PUBLISHED", moderationStatus: "ACTIVE" },
          { id: 77, title: "Sokha Birthday", ownerName: "Sokha", eventType: "BIRTHDAY", eventDate: "2027-01-15", status: "DRAFT", moderationStatus: "HIDDEN" },
          { id: 88, title: "Company Dinner", ownerName: "Koupreng Co.", eventType: "CORPORATE", status: "UNPUBLISHED", moderationStatus: "REPORTED" },
          { id: 99, title: "Archived Dinner", ownerName: "Koupreng Co.", eventType: "CORPORATE", status: "ARCHIVED", moderationStatus: "ACTIVE" },
        ],
      };
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
    adminService.updateInvitationStatus.mockImplementation(async (id, nextStatus) => ({ id: Number(id), status: nextStatus }));
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

  it("filters by event type without exposing a removed detail route", async () => {
    renderPage();

    expect(await screen.findByText("Company Dinner")).toBeInTheDocument();
    fireEvent.change(screen.getByRole("combobox", { name: "ប្រភេទកម្មវិធី" }), { target: { value: "BIRTHDAY" } });

    expect(screen.getByText("Sokha Birthday")).toBeInTheDocument();
    expect(screen.queryByText("Company Dinner")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Sokha Birthday/ })).not.toBeInTheDocument();
  });

  it("filters invitations by search and publication status", async () => {
    renderPage();

    await screen.findByText("Company Dinner");
    fireEvent.change(screen.getByRole("searchbox", { name: "ស្វែងរកកម្មវិធី" }), { target: { value: "Koupreng" } });
    fireEvent.change(screen.getByRole("combobox", { name: "ស្ថានភាពផ្សាយ" }), { target: { value: "UNPUBLISHED" } });

    expect(screen.getByText("Company Dinner")).toBeInTheDocument();
    expect(screen.queryByText("Dara and Sophea")).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByText(/បង្ហាញ 1 ក្នុងចំណោម 4/)).toBeInTheDocument());
  });

  it("filters each lifecycle status immediately and displays localized lifecycle badges", async () => {
    renderPage();
    await screen.findByText("Company Dinner");

    const statusFilter = screen.getByRole("combobox", { name: "ស្ថានភាពផ្សាយ" });
    const cases = [
      ["PUBLISHED", "Dara and Sophea", "បានផ្សាយ"],
      ["DRAFT", "Sokha Birthday", "សេចក្តីព្រាង"],
      ["UNPUBLISHED", "Company Dinner", "មិនទាន់ផ្សាយ"],
      ["ARCHIVED", "Archived Dinner", "បានរក្សាទុក"],
    ];

    const eventsTable = screen.getByRole("table", { name: "បញ្ជីកម្មវិធី" });
    for (const [value, title, badge] of cases) {
      fireEvent.change(statusFilter, { target: { value } });
      const eventRow = screen.getByText(title).closest("tr");
      expect(eventRow).toBeInTheDocument();
      expect(eventRow).toHaveTextContent(badge);
      expect(within(eventsTable).getAllByRole("row")).toHaveLength(2);
    }
  });

  it("offers lifecycle actions for the current status and refreshes the row after updates", async () => {
    let rows = [
      { id: 42, title: "Dara and Sophea", ownerName: "Dara", eventType: "WEDDING", status: "PUBLISHED", moderationStatus: "ACTIVE" },
      { id: 77, title: "Sokha Birthday", ownerName: "Sokha", eventType: "BIRTHDAY", status: "DRAFT", moderationStatus: "ACTIVE" },
      { id: 55, title: "Vireak and Chenda", ownerName: "Vireak", eventType: "WEDDING", status: "PUBLISHED", moderationStatus: "ACTIVE" },
    ];
    adminService.report.mockImplementation(async (name) => {
      if (name === "payments") {
        return { summary: {}, rows: [] };
      }
      return {
        summary: { totalInvitations: rows.length, publishedInvitations: rows.filter((row) => row.status === "PUBLISHED").length },
        rows,
      };
    });
    adminService.updateInvitationStatus.mockImplementation(async (id, nextStatus) => {
      rows = rows.map((row) => row.id === Number(id) ? { ...row, status: nextStatus } : row);
      return rows.find((row) => row.id === Number(id));
    });

    renderPage();
    await screen.findByText("Sokha Birthday");

    fireEvent.click(screen.getByRole("button", { name: "សកម្មភាព Sokha Birthday" }));
    fireEvent.click(screen.getByRole("menuitem", { name: /Publish/ }));
    await waitFor(() => expect(adminService.updateInvitationStatus).toHaveBeenCalledWith(77, "PUBLISHED"));
    await waitFor(() => expect(screen.getAllByText("បានផ្សាយ").length).toBeGreaterThan(0));

    fireEvent.click(screen.getByRole("button", { name: "សកម្មភាព Dara and Sophea" }));
    expect(screen.getByRole("menuitem", { name: /Unpublish/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("menuitem", { name: /Unpublish/ }));
    await waitFor(() => expect(adminService.updateInvitationStatus).toHaveBeenCalledWith(42, "UNPUBLISHED"));

    fireEvent.click(screen.getByRole("button", { name: "សកម្មភាព Vireak and Chenda" }));
    fireEvent.click(screen.getByRole("menuitem", { name: /Archive/ }));
    await waitFor(() => expect(adminService.updateInvitationStatus).toHaveBeenCalledWith(55, "ARCHIVED"));
    fireEvent.click(screen.getByRole("button", { name: "សកម្មភាព Vireak and Chenda" }));
    expect(screen.queryByRole("menuitem", { name: /Publish|Unpublish|Archive/ })).not.toBeInTheDocument();
  });

  // Task 1 (a) - Search filter on transactions table
  it("filters transactions table rows by typing in search input", async () => {
    renderPage();
    expect(await screen.findByText("REF-KHQR-1")).toBeInTheDocument();
    expect(screen.getByText("REF-STRIPE-2")).toBeInTheDocument();
    expect(screen.getByText("Showing 2 of 2 transactions")).toBeInTheDocument();

    const searchInput = screen.getByRole("searchbox", { name: "Search transactions" });
    fireEvent.change(searchInput, { target: { value: "STRIPE" } });

    expect(screen.getByText("REF-STRIPE-2")).toBeInTheDocument();
    expect(screen.queryByText("REF-KHQR-1")).not.toBeInTheDocument();
    expect(screen.getByText("Showing 1 of 2 transactions")).toBeInTheDocument();
  });

  // Task 1 (b) - Type dropdown filter on transactions table
  it("filters transactions table rows by selecting a Type dropdown value", async () => {
    renderPage();
    expect(await screen.findByText("REF-KHQR-1")).toBeInTheDocument();
    expect(screen.getByText("REF-STRIPE-2")).toBeInTheDocument();

    const typeFilter = screen.getByRole("combobox", { name: "Transaction type" });
    fireEvent.change(typeFilter, { target: { value: "TEMPLATE" } });

    expect(screen.getByText("REF-KHQR-1")).toBeInTheDocument();
    expect(screen.queryByText("REF-STRIPE-2")).not.toBeInTheDocument();
    expect(screen.getByText("Showing 1 of 2 transactions")).toBeInTheDocument();

    fireEvent.change(typeFilter, { target: { value: "SUBSCRIPTION" } });
    expect(screen.getByText("REF-STRIPE-2")).toBeInTheDocument();
    expect(screen.queryByText("REF-KHQR-1")).not.toBeInTheDocument();
    expect(screen.getByText("Showing 1 of 2 transactions")).toBeInTheDocument();
  });

  // Task 1 (c) - Clear filters resets all controls
  it("resets all transaction filter controls and restores rows when Clear filters is clicked", async () => {
    renderPage();
    expect(await screen.findByText("REF-KHQR-1")).toBeInTheDocument();

    const searchInput = screen.getByRole("searchbox", { name: "Search transactions" });
    fireEvent.change(searchInput, { target: { value: "NO_MATCHING_REFERENCE" } });

    expect(screen.getByText("No transactions match the current filters.")).toBeInTheDocument();
    expect(screen.queryByText("REF-KHQR-1")).not.toBeInTheDocument();
    expect(screen.getByText("Showing 0 of 2 transactions")).toBeInTheDocument();

    const clearBtn = screen.getByRole("button", { name: "Clear filters" });
    fireEvent.click(clearBtn);

    expect(screen.getByText("REF-KHQR-1")).toBeInTheDocument();
    expect(screen.getByText("REF-STRIPE-2")).toBeInTheDocument();
    expect(screen.getByText("Showing 2 of 2 transactions")).toBeInTheDocument();
    expect(searchInput.value).toBe("");
    expect(screen.getByRole("combobox", { name: "Transaction type" }).value).toBe("ALL");
  });

  // Task 2 (d) - Interactive Category Widget toggles selected state
  it("toggles category row selection and highlights donut segment", async () => {
    renderPage();
    await screen.findByText("Dara and Sophea");

    const weddingRow = screen.getByTestId("category-row-WEDDING");
    expect(weddingRow).toHaveAttribute("aria-pressed", "false");

    const weddingSegment = screen.getByTestId("donut-segment-WEDDING");
    const birthdaySegment = screen.getByTestId("donut-segment-BIRTHDAY");

    expect(weddingSegment.style.opacity).toBe("1");
    expect(birthdaySegment.style.opacity).toBe("1");

    // Click WEDDING category row -> toggle selected ON
    fireEvent.click(weddingRow);
    expect(weddingRow).toHaveAttribute("aria-pressed", "true");
    expect(weddingSegment.style.opacity).toBe("1");
    expect(birthdaySegment.style.opacity).toBe("0.25");

    // Click WEDDING category row again -> toggle selected OFF
    fireEvent.click(weddingRow);
    expect(weddingRow).toHaveAttribute("aria-pressed", "false");
    expect(weddingSegment.style.opacity).toBe("1");
    expect(birthdaySegment.style.opacity).toBe("1");
  });

  it("renders report overview in English when language is en", async () => {
    localStorage.setItem("koupreng.admin.lang", "en");
    render(
      <AdminLanguageProvider>
        <MemoryRouter initialEntries={["/reports"]}>
          <Routes>
            <Route path="/reports" element={<AdminReportsPage />} />
          </Routes>
        </MemoryRouter>
      </AdminLanguageProvider>
    );

    expect(await screen.findByText("Platform & System Reports")).toBeInTheDocument();
    expect(screen.getAllByText("Total Events").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Export CSV")).toBeInTheDocument();
    expect(screen.getByText("Event Categories Report")).toBeInTheDocument();
    expect(screen.getByText("Revenue & Payments Report")).toBeInTheDocument();
    localStorage.removeItem("koupreng.admin.lang");
  });
});
