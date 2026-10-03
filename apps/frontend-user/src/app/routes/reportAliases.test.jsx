import { Suspense } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Outlet, Routes, useLocation, useParams } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { hostRoutes } from "./hostRoutes";
vi.mock("./RequireAuth", () => ({ default: ({ children }) => children }));
vi.mock("../../layouts/HostShell", () => ({ default: () => <Outlet /> }));
vi.mock("@/features/auth/hooks/useAuth", () => ({ useAuth: () => ({ user: { id: 1 } }) }));
vi.mock("@/features/invitations/api/invitationApi", () => ({ invitationService: { listMine: vi.fn().mockResolvedValue([{ id: 42 }]) } }));
vi.mock("@/shared/storage/hostPlanningStorage", () => ({ getActiveEventId: () => "" }));
vi.mock("@/shared/storage/weddingStorage", () => ({ listDrafts: () => [] }));
vi.mock("../../features/reports/FinancialReport", () => ({ default: function Report() {
  const params = useParams(); const location = useLocation(); return <p>Report {params.invitationId} · context {location.state?.from || "none"}</p>;
} }));
afterEach(cleanup);
describe("FE-009 preserved report aliases", () => {
  it.each(["/reports", "/dashboard/reports"])("resolves %s to the real scoped report and retains location state", async (pathname) => {
    render(<MemoryRouter initialEntries={[{ pathname, state: { from: "host dashboard" } }]}><Suspense fallback="Loading"><Routes>{hostRoutes()}</Routes></Suspense></MemoryRouter>);
    expect(await screen.findByText("Report 42 · context host dashboard")).toBeInTheDocument();
  });
});
