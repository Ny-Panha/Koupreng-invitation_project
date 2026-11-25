import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { AdminLanguageProvider } from "../../app/providers/AdminLanguageProvider";
import AdminDashboardPage from "./AdminDashboardPage";
import dashboardService from "./dashboardService";

vi.mock("./dashboardService", () => ({ default: Object.fromEntries([
  "summary", "analyticsOverview", "analyticsRevenue", "analyticsTemplates", "analyticsDelivery",
  "analyticsRsvp", "analyticsCheckIn", "systemHealth", "alerts",
].map(key => [key, vi.fn()])) }));

const snapshot = {
  totalUsers: 12, activeUsers: 10, totalInvitations: 20, publishedInvitations: 8,
  totalGuests: 0, totalTemplates: 4, premiumTemplates: 2, totalPayments: 7,
  failedPayments: 0, recentUsers: [], recentInvitations: [], recentPayments: [],
};

function renderDashboard() {
  return render(<MemoryRouter><AdminLanguageProvider><AdminDashboardPage /></AdminLanguageProvider></MemoryRouter>);
}

beforeEach(() => {
  vi.resetAllMocks();
  localStorage.setItem("koupreng.admin.lang", "en");
  Object.values(dashboardService).forEach(fetcher => fetcher.mockResolvedValue({ summary: {} }));
  dashboardService.summary.mockResolvedValue(snapshot);
});
afterEach(cleanup);

it("keeps verified records visible and prevents a second refresh while a refresh is pending", async () => {
  renderDashboard();
  const refresh = await screen.findByRole("button", { name: "Refresh", exact: true });
  await waitFor(() => expect(refresh).toBeEnabled());
  let completeRefresh;
  dashboardService.summary.mockImplementationOnce(() => new Promise(resolve => { completeRefresh = resolve; }));
  fireEvent.click(refresh);
  expect(refresh).toBeDisabled();
  expect(screen.getByText("12")).toBeInTheDocument();
  fireEvent.click(refresh);
  expect(dashboardService.summary).toHaveBeenCalledTimes(2);
  completeRefresh({ ...snapshot, totalUsers: 15 });
  await screen.findByText("15");
  await waitFor(() => expect(refresh).toBeEnabled());
});

it("retains the dashboard when an independent receipt report is unavailable", async () => {
  dashboardService.analyticsRevenue.mockRejectedValueOnce(new Error("Report unavailable"));
  renderDashboard();
  await screen.findByText(/Receipt report unavailable/);
  expect(screen.getByRole("heading", { level: 1, name: "Dashboard" })).toBeInTheDocument();
  expect(screen.getByText("12")).toBeInTheDocument();
  expect(screen.queryByText("$0.00")).not.toBeInTheDocument();
});

it("retries a failed initial summary without showing fictional counts", async () => {
  dashboardService.summary.mockRejectedValueOnce(new Error("Unavailable"));
  renderDashboard();
  const retry = await screen.findByRole("button", { name: "Retry" });
  expect(screen.queryByText("12")).not.toBeInTheDocument();
  fireEvent.click(retry);
  await screen.findByText("12");
});

it("removes protected dashboard records after authorization is lost during refresh", async () => {
  renderDashboard();
  const refresh = await screen.findByRole("button", { name: "Refresh", exact: true });
  await waitFor(() => expect(refresh).toBeEnabled());
  dashboardService.summary.mockRejectedValueOnce({ status: 403 });
  fireEvent.click(refresh);
  await screen.findByRole("button", { name: "Retry" });
  expect(screen.queryByText("12")).not.toBeInTheDocument();
});
