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
  supportedLanguages: ["KH", "EN", "BOTH"]
};

const recommendations = [{ template, styleMatch: true }];

const fill = (name, value) => {
  const input = document.querySelector(`[name="${name}"]`);
  if (input) fireEvent.change(input, { target: { value } });
};

function renderWizard(path = "/app/events/new") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/app/events/new" element={<EventCreatePage />} />
        <Route path="/app/events/:eventId" element={<p>Exact saved workspace</p>} />
        <Route path="/app/events/:eventId/invitation" element={<><p>Exact saved workspace</p><p>Guided invitation studio</p></>} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
  useLanguageStore.setState({ lang: "en" });
  api.get.mockResolvedValue({ data: recommendations });
  templateCatalogService.list.mockResolvedValue([template]);
  subscriptionService.current.mockResolvedValue(null);
  paymentService.templateAccess.mockResolvedValue({ hasAccess: false });
  invitationService.create.mockResolvedValue({ id: 104 });
});

afterEach(cleanup);

describe("Phase 04 Event Creation Multi-Step Wizard Modernization", () => {
  it("renders the 4-step progress stepper with accessible labels and ARIA attributes", async () => {
    renderWizard();
    await screen.findByRole("button", { name: "Select Event Essential" });

    // Progress bar
    const progressTrack = screen.getByRole("progressbar");
    expect(progressTrack).toBeInTheDocument();
    expect(progressTrack).toHaveAttribute("aria-valuemin", "0");
    expect(progressTrack).toHaveAttribute("aria-valuemax", "100");

    // Stepper buttons
    const stepsNav = screen.getByRole("navigation", { name: "Event creation steps" });
    expect(stepsNav).toBeInTheDocument();

    const typeStep = screen.getByRole("button", { name: /Event Type/ });
    const detailsStep = screen.getByRole("button", { name: /Event Essentials/ });
    const designStep = screen.getByRole("button", { name: /Choose Design/ });
    const reviewStep = screen.getByRole("button", { name: /Review & Create/ });

    expect(typeStep).toBeInTheDocument();
    expect(detailsStep).toBeInTheDocument();
    expect(designStep).toBeInTheDocument();
    expect(reviewStep).toBeInTheDocument();

    // Step 1 is active on mount
    expect(typeStep).toHaveAttribute("aria-current", "step");
  });

  it("navigates forward using next step transition buttons", async () => {
    renderWizard();
    await screen.findByRole("button", { name: "Select Event Essential" });

    // Step 1 next button
    const nextToDetails = screen.getByRole("button", { name: "Next: Event essentials" });
    expect(nextToDetails).toBeInTheDocument();
    fireEvent.click(nextToDetails);

    // Step 2 next button
    const nextToDesign = screen.getByRole("button", { name: "Next: Choose design" });
    expect(nextToDesign).toBeInTheDocument();
    fireEvent.click(nextToDesign);

    // Step 3 next button
    const nextToReview = screen.getByRole("button", { name: "Next: Review & create" });
    expect(nextToReview).toBeInTheDocument();
    fireEvent.click(nextToReview);

    // Step 4 heading
    expect(screen.getByRole("heading", { name: "Review and create your event" })).toBeInTheDocument();
  });

  it("renders live review summary in Step 4 reflecting entered wedding details", async () => {
    renderWizard();
    await screen.findByRole("button", { name: "Select Event Essential" });

    fireEvent.click(screen.getByRole("button", { name: "Wedding", exact: true }));
    fill("title", "Koupreng Royal Wedding");
    fill("groomName", "Visal");
    fill("brideName", "Sophea");
    fill("eventDate", "2026-11-28");
    fill("eventTime", "16:00");
    fill("venueName", "Sokha Hotel Grand Ballroom");
    fill("venueAddress", "Street 51, Phnom Penh");
    fill("googleMapUrl", "https://maps.google.com/?q=sokha");

    // Select template
    fireEvent.click(screen.getByRole("button", { name: "Select Event Essential" }));

    // Review card checks
    expect(screen.getAllByText("Koupreng Royal Wedding").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Visal & Sophea")).toBeInTheDocument();
    expect(screen.getAllByText("2026-11-28").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("16:00")).toBeInTheDocument();
    expect(screen.getByText("Sokha Hotel Grand Ballroom")).toBeInTheDocument();
    expect(screen.getByText("Street 51, Phnom Penh")).toBeInTheDocument();

    const mapLink = screen.getByRole("link", { name: "https://maps.google.com/?q=sokha" });
    expect(mapLink).toHaveAttribute("href", "https://maps.google.com/?q=sokha");
    expect(mapLink).toHaveAttribute("target", "_blank");
  });

  it("allows jump-to-step editing via edit buttons on the review card", async () => {
    renderWizard();
    await screen.findByRole("button", { name: "Select Event Essential" });

    const editTypeBtn = screen.getByRole("button", { name: "Edit event type" });
    const editDetailsBtn = screen.getByRole("button", { name: "Edit event details" });
    const editDesignBtn = screen.getByRole("button", { name: "Edit design" });

    expect(editTypeBtn).toBeInTheDocument();
    expect(editDetailsBtn).toBeInTheDocument();
    expect(editDesignBtn).toBeInTheDocument();

    fireEvent.click(editTypeBtn);
    expect(screen.getByRole("button", { name: /Event Type/ })).toHaveAttribute("aria-current", "step");

    fireEvent.click(editDetailsBtn);
    expect(screen.getByRole("button", { name: /Event Essentials/ })).toHaveAttribute("aria-current", "step");

    fireEvent.click(editDesignBtn);
    expect(screen.getByRole("button", { name: /Choose Design/ })).toHaveAttribute("aria-current", "step");
  });

  it("renders Khmer language step badges and labels cleanly when Khmer is selected", async () => {
    useLanguageStore.setState({ lang: "km" });
    renderWizard();
    await screen.findByRole("button", { name: "ជ្រើសរើស Event Essential" });

    expect(screen.getByText("ជំហានទី ១")).toBeInTheDocument();
    expect(screen.getByText("ជំហានទី ២")).toBeInTheDocument();
    expect(screen.getByText("ជំហានទី ៣")).toBeInTheDocument();
    expect(screen.getByText("ជំហានទី ៤")).toBeInTheDocument();

    expect(screen.getByRole("navigation", { name: "ជំហានបង្កើតកម្មវិធី" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "ពិនិត្យ និងបង្កើតកម្មវិធី" })).toBeInTheDocument();
  });
});
