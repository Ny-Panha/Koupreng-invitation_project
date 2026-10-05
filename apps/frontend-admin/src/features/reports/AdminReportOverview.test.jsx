import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";

const adminService = vi.hoisted(() => ({ platformReport: vi.fn() }));

vi.mock("../../shared/api/adminService", () => ({ default: adminService }));

import AdminReportsPage from "../../pages/reports/AdminReportsPage";

afterEach(cleanup);

describe("admin platform reports", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    adminService.platformReport.mockResolvedValue({
      summary: {
        totalInvitations: 4,
        publishedInvitations: 2,
        totalUsers: 12,
        activeUsers: 9,
        totalCheckIns: 25,
        draftInvitations: 1,
        suspendedInvitations: 1,
        eventCreationGrowth: [{ month: "2026-09", created: 4 }],
        eventCategoryBreakdown: [{ category: "WEDDING", count: 4 }],
        paymentRevenueByCurrency: { USD: 120 },
        subscriptionRevenueByCurrency: { USD: 30 },
        totalPayments: 8,
        failedPayments: 1,
        subscriptionTiers: [{ tier: "Basic", activeSubscriptions: 3 }],
      },
      rows: [],
    });
  });

  function renderPage() {
    return render(
      <MemoryRouter initialEntries={["/reports"]}>
        <Routes>
          <Route path="/reports" element={<AdminReportsPage />} />
        </Routes>
      </MemoryRouter>,
    );
  }

  it("shows aggregate platform metrics without invitation-level records", async () => {
    renderPage();

    expect(await screen.findByText("Platform Reports")).toBeInTheDocument();
    expect(screen.getByText("Total events")).toBeInTheDocument();
    expect(screen.getByText("Registered users")).toBeInTheDocument();
    expect(screen.getByText("Revenue & payments")).toBeInTheDocument();
    expect(screen.getByText("No aggregate transactions available.")).toBeInTheDocument();
    expect(screen.queryByText("Dara and Sophea")).not.toBeInTheDocument();
    expect(adminService.platformReport).toHaveBeenCalledOnce();
  });

  it("refreshes the platform report on request", async () => {
    renderPage();
    await screen.findByText("Platform Reports");

    fireEvent.click(screen.getByRole("button", { name: "Refresh" }));

    await waitFor(() => expect(adminService.platformReport).toHaveBeenCalledTimes(2));
  });

  it("offers retry when the report cannot load", async () => {
    adminService.platformReport
      .mockRejectedValueOnce(new Error("Report unavailable"))
      .mockResolvedValueOnce({ summary: {}, rows: [] });
    renderPage();

    expect(await screen.findByText("Report unavailable")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "ព្យាយាមម្តងទៀត" }));

    await waitFor(() => expect(adminService.platformReport).toHaveBeenCalledTimes(2));
    expect(await screen.findByText("Platform Reports")).toBeInTheDocument();
  });
});
