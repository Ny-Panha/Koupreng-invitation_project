import { Suspense } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Outlet, Routes, useLocation } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { hostRoutes } from "./hostRoutes";
vi.mock("./RequireAuth", () => ({ default: ({ children }) => children }));
vi.mock("../../layouts/HostShell", () => ({ default: () => <Outlet /> }));
vi.mock("../../features/events/workspace/EventWorkspace", () => ({ default: () => <Outlet /> }));
vi.mock("../../pages/host/EventsPage", () => ({ default: () => <p>Choose event</p> }));
vi.mock("../../features/reports/FinancialReport", () => ({ default: function Report() {
  const location = useLocation(); return <p>{location.pathname} · {location.state?.from || "none"}</p>;
} }));
afterEach(cleanup);
describe("owner report routes", () => {
  it.each(["/dashboard/reports", "/reports"])("requires event selection for ambiguous route %s", async path => {
    render(<MemoryRouter initialEntries={[path]}><Suspense fallback="Loading"><Routes>{hostRoutes()}</Routes></Suspense></MemoryRouter>);
    expect(await screen.findByText("Choose event")).toBeInTheDocument();
  });
  it("preserves explicit invitation identity and location state in the report redirect", async () => {
    render(<MemoryRouter initialEntries={[{ pathname: "/dashboard/invitations/42/reports", state: { from: "host dashboard" } }]}><Suspense fallback="Loading"><Routes>{hostRoutes()}</Routes></Suspense></MemoryRouter>);
    expect(await screen.findByText("/app/events/42/reports · host dashboard")).toBeInTheDocument();
  });
});
