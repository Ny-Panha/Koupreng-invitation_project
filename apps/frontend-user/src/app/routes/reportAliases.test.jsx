import { Suspense } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Outlet, Routes, useLocation } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { hostRoutes } from "./hostRoutes";
vi.mock("./RequireAuth", () => ({ default: ({ children }) => children }));
vi.mock("../../layouts/HostShell", () => ({ default: () => <Outlet /> }));
vi.mock("@/features/auth/hooks/useAuth", () => ({ useAuth: () => ({ user: { id: 1 } }) }));
vi.mock("../../features/reports/FinancialReport", () => ({ default: function Report() {
  const location = useLocation(); return <p>Event report · context {location.state?.from || "none"}</p>;
} }));
afterEach(cleanup);
describe("owner report routes", () => {
  it("renders the active-event report directly and retains location state", async () => {
    render(<MemoryRouter initialEntries={[{ pathname: "/dashboard/reports", state: { from: "host dashboard" } }]}><Suspense fallback="Loading"><Routes>{hostRoutes()}</Routes></Suspense></MemoryRouter>);
    expect(await screen.findByText("Event report · context host dashboard")).toBeInTheDocument();
  });

  it("redirects the legacy report alias to the active-event report", async () => {
    render(<MemoryRouter initialEntries={["/reports"]}><Suspense fallback="Loading"><Routes>{hostRoutes()}</Routes></Suspense></MemoryRouter>);
    expect(await screen.findByText("Event report · context none")).toBeInTheDocument();
  });

  it("does not carry a nested invitation ID into the active-event report", async () => {
    render(<MemoryRouter initialEntries={["/dashboard/invitations/42/reports"]}><Suspense fallback="Loading"><Routes>{hostRoutes()}</Routes></Suspense></MemoryRouter>);
    expect(await screen.findByText("Event report · context none")).toBeInTheDocument();
  });
});
