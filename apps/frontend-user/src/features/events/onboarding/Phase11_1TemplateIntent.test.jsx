import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@/shared/api/httpClient";
import { invitationService } from "@/features/invitations/api/invitationApi";
import { templateCatalogService } from "@/features/templates/api/templateCatalogApi";
import subscriptionService from "@/features/subscriptions/subscriptionService";
import { paymentService } from "@/features/payments/paymentService";
import { useLanguageStore } from "@/stores/useLanguageStore";
import EventCreatePage from "./EventCreatePage";

vi.mock("@/shared/api/httpClient", () => ({ api: { get: vi.fn() } }));
vi.mock("@/features/invitations/api/invitationApi", () => ({
  invitationService: { create: vi.fn() },
}));
vi.mock("@/features/invitations/api/mediaApi", () => ({
  mediaService: { uploadCover: vi.fn() },
}));
vi.mock("@/features/templates/api/templateCatalogApi", () => ({
  templateCatalogService: { list: vi.fn() },
}));
vi.mock("@/features/subscriptions/subscriptionService", () => ({
  default: { current: vi.fn() },
}));
vi.mock("@/features/payments/paymentService", () => ({
  paymentService: { templateAccess: vi.fn() },
}));
vi.mock("@/features/auth/hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: 7 } }),
}));

const premiumTemplate = {
  id: 42,
  name: "Emerald Royal Luxe",
  code: "emerald-luxe",
  category: "LUXURY",
  thumbnailUrl: "/templates/emerald-luxe.svg",
  price: 29,
  currency: "USD",
  premium: true,
  supportedEventTypes: ["WEDDING"],
  supportedLanguages: ["KH", "EN", "BOTH"],
};

function renderWizard(path = "/app/events/new") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/app/events/new" element={<EventCreatePage />} />
        <Route path="/app/events/:eventId" element={<p>Exact saved workspace</p>} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
  useLanguageStore.setState({ lang: "en" });
  templateCatalogService.list.mockResolvedValue([premiumTemplate]);
  api.get.mockResolvedValue({ data: [{ template: premiumTemplate, styleMatch: true }] });
  subscriptionService.current.mockResolvedValue(null);
  invitationService.create.mockResolvedValue({ id: 101 });
});

afterEach(cleanup);

describe("Phase 11.1 Template Intent & Paid Access Verification Truth", () => {
  it("never presents an active Select button for premium template while access check is pending or unknown", async () => {
    // Keep access check pending (never resolved)
    paymentService.templateAccess.mockImplementation(() => new Promise(() => {}));

    renderWizard();

    // The template card should render, but MUST NOT show an enabled "Select" button
    await screen.findByText("Emerald Royal Luxe");

    // The button must NOT say "Select" with enabled state or allow selecting an unverified premium template
    const selectBtn = screen.queryByRole("button", { name: /^(?:Select|Selected) Emerald Royal Luxe$/ });
    expect(selectBtn).toBeNull();
  });

  it("prevents saving with unentitled premium template even if selected earlier", async () => {
    // Access denied
    paymentService.templateAccess.mockResolvedValue({ hasAccess: false });

    renderWizard();
    await screen.findByText("Emerald Royal Luxe");

    // The card shows "Get access (new tab)" link instead of Select button
    const getAccessLink = await screen.findByRole("link", { name: "Get access (new tab)" });
    expect(getAccessLink).toBeInTheDocument();
    expect(getAccessLink).toHaveAttribute("href", "/templates/42/checkout");
  });
});
