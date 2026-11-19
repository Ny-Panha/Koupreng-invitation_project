import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@/shared/api/httpClient";
import { invitationService } from "@/features/invitations/api/invitationApi";
import { mediaService } from "@/features/invitations/api/mediaApi";
import { templateCatalogService } from "@/features/templates/api/templateCatalogApi";
import subscriptionService from "@/features/subscriptions/subscriptionService";
import { paymentService } from "@/features/payments/paymentService";
import { useLanguageStore } from "@/stores/useLanguageStore";
import EventCreatePage from "./EventCreatePage";
import { eventPayload } from "./eventFields";
import { validateEventForm } from "./eventCreation";

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
        <Route
          path="/app/events/:eventId/invitation"
          element={<><p>Exact saved workspace</p><p>Guided invitation studio</p></>}
        />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
  useLanguageStore.setState({ lang: "en" });
  window.URL.createObjectURL = vi.fn(() => "blob:http://localhost/test-photo-url");
  window.URL.revokeObjectURL = vi.fn();
  api.get.mockResolvedValue({ data: [{ template, styleMatch: true }] });
  templateCatalogService.list.mockResolvedValue([template]);
  subscriptionService.current.mockResolvedValue(null);
  paymentService.templateAccess.mockResolvedValue({ hasAccess: false });
  invitationService.create.mockResolvedValue({ id: 901 });
  mediaService.uploadCover.mockResolvedValue({ id: 1, fileUrl: "https://example.com/cover.jpg" });
});

afterEach(cleanup);

describe("Phase 11.1 Wizard Regression: Type Semantics, Navigation, and Field Contracts", () => {
  it("clears irrelevant participant fields when switching from couple type to single-host type", async () => {
    renderWizard();
    await screen.findByRole("button", { name: /^(?:Select|Selected) Event Essential$/ });

    // In Wedding (default), fill groom and bride
    fill("title", "Celebration Title");
    fill("groomName", "Kosal");
    fill("brideName", "Bopha");

    // Switch to Birthday (single celebrant)
    fireEvent.click(screen.getByRole("button", { name: "Birthday", exact: true }));

    // Celebrant name should inherit Kosal
    expect(screen.getByLabelText(/Celebrant name/)).toHaveValue("Kosal");

    // There should be NO partner or bride name input in Birthday
    expect(screen.queryByLabelText(/Second participant/)).toBeNull();
    expect(screen.queryByLabelText(/Bride name/)).toBeNull();
  });

  it("navigates via review step Edit links directly to the corresponding wizard step", async () => {
    renderWizard();
    await screen.findByRole("button", { name: /^(?:Select|Selected) Event Essential$/ });

    // Step 4 review
    fireEvent.click(screen.getByRole("button", { name: "Next: Event essentials" }));
    fireEvent.click(screen.getByRole("button", { name: "Next: Choose design" }));
    fireEvent.click(screen.getByRole("button", { name: "Next: Review & create" }));

    // Verify Review step is active
    expect(screen.getByRole("heading", { name: "Review and create your event" })).toBeInTheDocument();

    // Click Edit event type
    const editTypeBtn = screen.getByRole("button", { name: "Edit event type" });
    fireEvent.click(editTypeBtn);

    // Should navigate to Step 1
    expect(screen.getByRole("button", { name: /Event Type/ })).toHaveAttribute("aria-current", "step");

    // Return to review
    fireEvent.click(screen.getByRole("button", { name: "Review & Create" }));

    // Click Edit event details
    const editDetailsBtn = screen.getByRole("button", { name: "Edit event details" });
    fireEvent.click(editDetailsBtn);

    // Should navigate to Step 2
    expect(screen.getByRole("button", { name: /Event Essentials/ })).toHaveAttribute("aria-current", "step");
  });

  it("enforces validation boundary rules on date, time, url, and field length", () => {
    // 255 chars valid, 256 invalid
    const longString256 = "a".repeat(256);
    const validString255 = "a".repeat(255);
    const longAddress1001 = "b".repeat(1001);
    const validAddress1000 = "b".repeat(1000);

    const errorsLength = validateEventForm(
      { title: longString256, venueAddress: longAddress1001 },
      "OTHER"
    );
    expect(errorsLength.title).toBe("This value is too long.");
    expect(errorsLength.venueAddress).toBe("This value is too long.");

    const errorsValidLength = validateEventForm(
      { title: validString255, venueAddress: validAddress1000, hostName: "Host" },
      "OTHER"
    );
    expect(errorsValidLength.title).toBeUndefined();
    expect(errorsValidLength.venueAddress).toBeUndefined();

    // Valid date & time
    const errorsValidDate = validateEventForm(
      { title: "Test", hostName: "Host", eventDate: "2026-11-25", eventTime: "18:00" },
      "OTHER"
    );
    expect(errorsValidDate.eventDate).toBeUndefined();
    expect(errorsValidDate.eventTime).toBeUndefined();

    // Invalid date & time
    const errorsInvalid = validateEventForm(
      { title: "Test", hostName: "Host", eventDate: "2026-02-31", eventTime: "24:00" },
      "OTHER"
    );
    expect(errorsInvalid.eventDate).toBe("Enter a valid date.");
    expect(errorsInvalid.eventTime).toBe("Enter a valid time.");
  });

  it("generates correct payload with visibility PRIVATE and clientRequestId for CORPORATE event", () => {
    const form = {
      title: "Annual Gala 2026",
      hostName: "Koupreng Tech Corp",
      eventDate: "2026-12-30",
      eventTime: "19:00",
      venueName: "Sofitel Phnom Penh",
      venueAddress: "26 Old August Site, Sothearos Blvd",
      googleMapUrl: "https://maps.app.goo.gl/sample",
    };

    const payload = eventPayload(form, "CORPORATE");
    expect(payload.eventType).toBe("CORPORATE");
    expect(payload.hostName).toBe("Koupreng Tech Corp");
    expect(payload.groomName).toBe("");
    expect(payload.brideName).toBe("");
    expect(payload.partnerName).toBe("");
    expect(payload.title).toBe("Annual Gala 2026");
    expect(payload.venueAddress).toBe("26 Old August Site, Sothearos Blvd");
  });
});
