import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
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

let currentUser = { id: 7 };

vi.mock("@/shared/api/httpClient", () => ({ api: { get: vi.fn() } }));
vi.mock("@/features/invitations/api/invitationApi", () => ({
  invitationService: { create: vi.fn(), get: vi.fn() },
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
  useAuth: () => ({ user: currentUser }),
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

function renderWizard() {
  return render(
    <MemoryRouter initialEntries={["/app/events/new"]}>
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
  currentUser = { id: 7 };
  useLanguageStore.setState({ lang: "en" });
  window.URL.createObjectURL = vi.fn(() => "blob:http://localhost/test-photo-url");
  window.URL.revokeObjectURL = vi.fn();
  api.get.mockResolvedValue({ data: [{ template, styleMatch: true }] });
  templateCatalogService.list.mockResolvedValue([template]);
  subscriptionService.current.mockResolvedValue(null);
  paymentService.templateAccess.mockResolvedValue({ hasAccess: false });
  invitationService.create.mockResolvedValue({ id: 501 });
  invitationService.get.mockResolvedValue({ id: 501, userId: 7, visibility: "PRIVATE" });
  mediaService.uploadCover.mockResolvedValue({ id: 1, fileUrl: "https://example.com/cover.jpg" });
});

afterEach(cleanup);

describe("Phase 11.1 Draft Lifecycle, Account Isolation, and Partial Creation Recovery", () => {
  it("isolates drafts across account switch: resets state and does not bleed User A data to User B", async () => {
    // User A (id: 7) enters data
    const view = renderWizard();
    await screen.findByRole("button", { name: /^(?:Select|Selected) Event Essential$/ });
    fill("title", "User A Private Wedding");
    fill("groomName", "Alice");
    fill("venueName", "Secret Garden");

    // Verify session draft is saved for User 7
    await waitFor(() => {
      const stored = JSON.parse(sessionStorage.getItem("koupreng.onboarding.7") || "{}");
      expect(stored.form?.title).toBe("User A Private Wedding");
    });

    // Switch account to User B (id: 8) without unmounting
    currentUser = { id: 8 };
    view.rerender(
      <MemoryRouter initialEntries={["/app/events/new"]}>
        <Routes>
          <Route path="/app/events/new" element={<EventCreatePage />} />
        </Routes>
      </MemoryRouter>
    );

    // Title should be reset (not leaking User A's private title!)
    await waitFor(() => {
      expect(screen.getByLabelText(/Event title/)).toHaveValue("");
    });
    expect(screen.getByLabelText(/Groom name/)).toHaveValue("");

    // Verify User 8's session storage was NOT corrupted with User A's title
    const storedUser8 = JSON.parse(sessionStorage.getItem("koupreng.onboarding.8") || "{}");
    expect(storedUser8.form?.title).toBeUndefined();
  });

  it("persists pendingEventId in session draft across browser refresh so retry does not duplicate creation", async () => {
    // Simulate server event creation succeeded (id: 777), but photo upload failed
    mediaService.uploadCover.mockRejectedValueOnce(new Error("Upload network timeout"));

    const view = renderWizard();
    await screen.findByRole("button", { name: /^(?:Select|Selected) Event Essential$/ });

    fill("title", "Network Flake Event");
    fill("groomName", "Kosal");
    fill("brideName", "Bopha");
    fill("eventDate", "2026-12-20");
    fill("eventTime", "17:00");
    fill("venueName", "Ballroom A");

    const input = document.getElementById("event-photo-input");
    fireEvent.change(input, { target: { files: [new File(["dummy"], "photo.jpg", { type: "image/jpeg" })] } });

    fireEvent.click(screen.getByRole("button", { name: /^(?:Select|Selected) Event Essential$/ }));
    fireEvent.click(screen.getByRole("button", { name: "Create event" }));

    // Wait for upload failure message
    await screen.findByText(/Event created successfully, but photo upload failed/);
    expect(invitationService.create).toHaveBeenCalledTimes(1);

    // Check that pendingEventId is saved in sessionStorage
    const stored = JSON.parse(sessionStorage.getItem("koupreng.onboarding.7") || "{}");
    expect(stored.pendingEventId).toBe(501);

    // Simulate page refresh (unmount and remount)
    view.unmount();
    mediaService.uploadCover.mockResolvedValueOnce({ id: 99, fileUrl: "https://example.com/cover-ok.jpg" });

    renderWizard();

    // After refresh, the retry banner must be displayed because pendingEventId was restored
    await screen.findByText(/A saved event ID needs verification/);

    // Attach photo again since File is not stored in sessionStorage
    const freshInput = document.getElementById("event-photo-input");
    fireEvent.change(freshInput, { target: { files: [new File(["fresh"], "photo.jpg", { type: "image/jpeg" })] } });

    // Click retry photo upload
    const retryBtn = screen.getByRole("button", { name: "Retry photo upload" });
    fireEvent.click(retryBtn);

    await screen.findByText("Guided invitation studio");

    // MUST NOT have created a second event!
    expect(invitationService.create).toHaveBeenCalledTimes(1);
    expect(invitationService.get).toHaveBeenCalledWith(501, expect.objectContaining({ signal: expect.any(AbortSignal) }));
    expect(mediaService.uploadCover).toHaveBeenLastCalledWith(501, expect.any(File), undefined, expect.objectContaining({ signal: expect.any(AbortSignal) }));
  });

  it("notifies the user when restoring a draft that cover photo must be selected", async () => {
    // Pre-populate sessionStorage with a saved draft that has details
    sessionStorage.setItem(
      "koupreng.onboarding.7",
      JSON.stringify({
        type: "WEDDING",
        form: { title: "Restored Wedding", venueName: "Grand Palace" },
        requestId: "test-req-id",
      })
    );

    renderWizard();
    await screen.findByRole("button", { name: /^(?:Select|Selected) Event Essential$/ });

    // Form is restored
    expect(screen.getByLabelText(/Event title/)).toHaveValue("Restored Wedding");
    expect(screen.getByLabelText(/Venue/)).toHaveValue("Grand Palace");

    // Notice about photo reselection is visible
    expect(
      screen.getByText(/Photos are not stored in browser session drafts. Please select a cover photo before creating./)
    ).toBeInTheDocument();
  });
});
