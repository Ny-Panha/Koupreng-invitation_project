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
  useAuth: () => ({ user: { id: 8 } }),
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

const attachPhoto = (fileName = "couple.jpg") => {
  const input = document.getElementById("event-photo-input");
  if (input) {
    const file = new File(["dummy content"], fileName, { type: "image/jpeg" });
    fireEvent.change(input, { target: { files: [file] } });
    return file;
  }
  return null;
};

function renderWizard() {
  return render(
    <MemoryRouter initialEntries={["/app/events/new"]}>
      <Routes>
        <Route path="/app/events/new" element={<EventCreatePage />} />
        <Route path="/app/events/:eventId" element={<p>Exact saved workspace</p>} />
        <Route
          path="/app/events/:eventId/invitation"
          element={<p>Guided invitation studio</p>}
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
  invitationService.create.mockResolvedValue({ id: 201 });
  mediaService.uploadCover.mockResolvedValue({
    id: 1,
    fileUrl: "https://example.com/cover.jpg",
  });
});

afterEach(cleanup);

describe("Required Event Photo Onboarding & Sequential Upload Flow", () => {
  it("blocks event creation when photo is not selected and presents validation error", async () => {
    renderWizard();
    await screen.findByRole("button", { name: "Select Event Essential" });

    // Fill details without attaching a photo
    fill("title", "Koupreng Royal Celebration");
    fill("groomName", "Kosal");
    fill("brideName", "Bopha");
    fill("eventDate", "2026-12-12");
    fill("eventTime", "17:00");
    fill("venueName", "Grand Palace Ballroom");

    // Select template
    fireEvent.click(screen.getByRole("button", { name: "Select Event Essential" }));

    // Click Create Event
    fireEvent.click(screen.getByRole("button", { name: "Create event" }));

    // Must not call invitationService.create
    expect(invitationService.create).not.toHaveBeenCalled();

    // Error message should be displayed
    expect(
      screen.getAllByText("An event photo is required to complete event creation.").length
    ).toBeGreaterThanOrEqual(1);

    // Stepper should navigate back to Step 2
    expect(screen.getByRole("button", { name: /Event Essentials/ })).toHaveAttribute(
      "aria-current",
      "step"
    );
  });

  it("permits saving an incomplete draft without requiring a photo", async () => {
    renderWizard();
    await screen.findByRole("button", { name: "Select Event Essential" });

    fill("title", "Draft Event Without Photo");

    // Click Save draft
    fireEvent.click(screen.getByRole("button", { name: "Save draft" }));

    await screen.findByText("Exact saved workspace");
    expect(invitationService.create).toHaveBeenCalledOnce();
    expect(mediaService.uploadCover).not.toHaveBeenCalled();
  });

  it("creates event and sequentially uploads cover photo when valid photo is provided", async () => {
    renderWizard();
    await screen.findByRole("button", { name: "Select Event Essential" });

    fill("title", "Koupreng Royal Celebration");
    fill("groomName", "Kosal");
    fill("brideName", "Bopha");
    fill("eventDate", "2026-12-12");
    fill("eventTime", "17:00");
    fill("venueName", "Grand Palace Ballroom");

    const photo = attachPhoto("couple-wedding.jpg");
    expect(photo).not.toBeNull();

    // Select template
    fireEvent.click(screen.getByRole("button", { name: "Select Event Essential" }));

    // Click Create Event
    fireEvent.click(screen.getByRole("button", { name: "Create event" }));

    await screen.findByText("Guided invitation studio");

    // Verify invitationService.create called first
    expect(invitationService.create).toHaveBeenCalledOnce();

    // Verify mediaService.uploadCover called with the created event ID 201
    expect(mediaService.uploadCover).toHaveBeenCalledWith(201, expect.any(File));
  });

  it("handles cover upload failure gracefully and retries without creating a duplicate event", async () => {
    // First upload attempt fails
    mediaService.uploadCover.mockRejectedValueOnce(new Error("Storage unavailable"));

    renderWizard();
    await screen.findByRole("button", { name: "Select Event Essential" });

    fill("title", "Retry Event Test");
    fill("groomName", "Dara");
    fill("brideName", "Chenda");
    fill("eventDate", "2026-12-15");
    fill("eventTime", "18:00");
    fill("venueName", "Phnom Penh Hotel");

    attachPhoto("portrait.jpg");
    fireEvent.click(screen.getByRole("button", { name: "Select Event Essential" }));

    // First attempt
    fireEvent.click(screen.getByRole("button", { name: "Create event" }));

    // Event creation succeeded with ID 201, but upload failed
    await screen.findByText(/Event created successfully, but photo upload failed/);
    expect(invitationService.create).toHaveBeenCalledTimes(1);
    expect(mediaService.uploadCover).toHaveBeenCalledTimes(1);

    // Recovery banner presents retry button
    const retryBtn = screen.getByRole("button", { name: "Retry photo upload" });
    expect(retryBtn).toBeInTheDocument();

    // Second attempt (retry) succeeds
    mediaService.uploadCover.mockResolvedValueOnce({
      id: 2,
      fileUrl: "https://example.com/cover-retry.jpg",
    });

    fireEvent.click(retryBtn);

    await screen.findByText("Guided invitation studio");

    // MUST NOT create a duplicate event!
    expect(invitationService.create).toHaveBeenCalledTimes(1);
    // Cover upload called again with the same event ID 201
    expect(mediaService.uploadCover).toHaveBeenCalledTimes(2);
    expect(mediaService.uploadCover).toHaveBeenLastCalledWith(201, expect.any(File));
  });
});
