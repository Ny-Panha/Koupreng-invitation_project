import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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
vi.mock("@/features/invitations/api/invitationApi", () => ({ invitationService: { create: vi.fn() } }));
vi.mock("@/features/templates/api/templateCatalogApi", () => ({ templateCatalogService: { list: vi.fn() } }));
vi.mock("@/features/subscriptions/subscriptionService", () => ({ default: { current: vi.fn() } }));
vi.mock("@/features/payments/paymentService", () => ({ paymentService: { templateAccess: vi.fn() } }));
vi.mock("@/features/auth/hooks/useAuth", () => ({ useAuth: () => ({ user: { id: 7 } }) }));

const template = {
  id: 30,
  name: "Event Essential",
  code: "event-essential",
  category: "MINIMALIST",
  thumbnailUrl: "/templates/event-essential.svg",
  price: 0,
  currency: "USD",
  supportedEventTypes: ["WEDDING", "ENGAGEMENT", "BIRTHDAY", "ANNIVERSARY", "CORPORATE", "OTHER"],
  supportedLanguages: ["KH", "EN", "BOTH"],
};

function renderWizard() {
  return render(
    <MemoryRouter initialEntries={["/app/events/new"]}>
      <Routes>
        <Route path="/app/events/new" element={<EventCreatePage />} />
        <Route path="/app/events/:eventId" element={<p>Saved workspace</p>} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
  useLanguageStore.setState({ lang: "en" });
  api.get.mockResolvedValue({ data: [{ template, styleMatch: true }] });
  templateCatalogService.list.mockResolvedValue([template]);
  subscriptionService.current.mockResolvedValue(null);
  paymentService.templateAccess.mockResolvedValue({ hasAccess: false });
  invitationService.create.mockResolvedValue({ id: 104 });
});

afterEach(cleanup);

describe("Workstream B — Premium Mobile Event Creation Wizard Refinement", () => {
  it("renders the persistent mobile bottom navigation bar with Cancel and Next on Step 1", async () => {
    renderWizard();
    await screen.findByRole("button", { name: "Select Event Essential" });

    const mobileNav = screen.getByRole("region", { name: "Wizard step navigation" });
    expect(mobileNav).toBeInTheDocument();

    const cancelLink = screen.getByRole("link", { name: /Cancel|បោះបង់/ });
    expect(cancelLink).toHaveAttribute("href", "/app/events");

    // Both the in-flow next button and mobile next button should be available
    const nextButtons = screen.getAllByRole("button", { name: /Next: Event essentials|Next|បន្ត/ });
    expect(nextButtons.length).toBeGreaterThanOrEqual(1);
  });

  it("navigates through steps using the persistent bottom bar and updates active step indicator", async () => {
    renderWizard();
    await screen.findByRole("button", { name: "Select Event Essential" });

    const mobileNav = screen.getByRole("region", { name: "Wizard step navigation" });
    const mobileNext = mobileNav.querySelector(".event-mobile-nav-btn.next");
    expect(mobileNext).toBeInTheDocument();

    // Click next to Step 2
    fireEvent.click(mobileNext);
    expect(screen.getByRole("button", { name: /Event Essentials/ })).toHaveAttribute("aria-current", "step");

    // Step 2 now has Back button in mobile bottom bar
    const mobileBack = mobileNav.querySelector(".event-mobile-nav-btn.prev");
    expect(mobileBack).toBeInTheDocument();

    // Click back to Step 1
    fireEvent.click(mobileBack);
    expect(screen.getByRole("button", { name: /Event Type/ })).toHaveAttribute("aria-current", "step");
  });

  it("renders grouped event essential sections with descriptive fieldset legends", async () => {
    renderWizard();
    await screen.findByRole("button", { name: "Select Event Essential" });

    // Grouped fieldset legends should be present
    expect(screen.getByText("Event information")).toBeInTheDocument();
    expect(screen.getByText("Date and venue")).toBeInTheDocument();
    expect(screen.getByText("Maps and location")).toBeInTheDocument();
  });

  it("presents Save Draft and Create Event in mobile bottom bar on Step 4", async () => {
    renderWizard();
    await screen.findByRole("button", { name: "Select Event Essential" });

    // Jump directly to Step 4 via stepper button
    const reviewStepBtn = screen.getByRole("button", { name: /Review & Create/ });
    fireEvent.click(reviewStepBtn);

    const mobileNav = screen.getByRole("region", { name: "Wizard step navigation" });
    const submitGroup = mobileNav.querySelector(".event-mobile-submit-group");
    expect(submitGroup).toBeInTheDocument();
    expect(submitGroup.querySelector(".event-mobile-nav-btn.draft")).toBeInTheDocument();
    expect(submitGroup.querySelector(".event-mobile-nav-btn.create")).toBeInTheDocument();
  });
});
