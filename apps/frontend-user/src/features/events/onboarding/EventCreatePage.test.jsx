import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@/shared/api/httpClient";
import { invitationService } from "@/features/invitations/api/invitationApi";
import { templateCatalogService } from "@/features/templates/api/templateCatalogApi";
import subscriptionService from "@/features/subscriptions/subscriptionService";
import { paymentService } from "@/features/payments/paymentService";
import { useLanguageStore } from "@/stores/useLanguageStore";
import EventCreatePage from "./EventCreatePage";
import { validateEventForm } from "./eventCreation.js";

vi.mock("@/shared/api/httpClient", () => ({ api: { get: vi.fn() } }));
vi.mock("@/features/invitations/api/invitationApi", () => ({ invitationService: { create: vi.fn() } }));
vi.mock("@/features/templates/api/templateCatalogApi", () => ({ templateCatalogService: { list: vi.fn() } }));
vi.mock("@/features/subscriptions/subscriptionService", () => ({ default: { current: vi.fn() } }));
vi.mock("@/features/payments/paymentService", () => ({ paymentService: { templateAccess: vi.fn() } }));
vi.mock("@/features/auth/hooks/useAuth", () => ({ useAuth: () => ({ user: { id: 7 } }) }));
const template = { id: 30, name: "Event Essential", code: "event-essential", category: "MINIMALIST", thumbnailUrl: "/templates/event-essential.svg", price: 0, currency: "USD", supportedEventTypes: ["WEDDING", "ENGAGEMENT", "BIRTHDAY", "ANNIVERSARY", "CORPORATE", "OTHER"], supportedLanguages: ["KH", "EN", "BOTH"] };
const recommendations = [{ template, styleMatch: true }];
const fill = (name, value) => fireEvent.change(document.querySelector(`[name="${name}"]`), { target: { value } });
function show(path = "/app/events/new") {
  return render(<MemoryRouter initialEntries={[path]}><Routes><Route path="/app/events/new" element={<EventCreatePage />} /><Route path="/app/events/:eventId" element={<p>Exact saved workspace</p>} /></Routes></MemoryRouter>);
}
beforeEach(() => {
  vi.clearAllMocks(); sessionStorage.clear();
  useLanguageStore.setState({ lang: "en" });
  api.get.mockResolvedValue({ data: recommendations });
  templateCatalogService.list.mockResolvedValue([template]);
  subscriptionService.current.mockResolvedValue(null);
  paymentService.templateAccess.mockResolvedValue({ hasAccess: false });
  invitationService.create.mockResolvedValue({ id: 103 });
});
afterEach(cleanup);

describe("single-page event creation", () => {
  it("exposes the complete form and recommendations without Continue screens", async () => {
    show();
    await screen.findByRole("button", { name: "Select Event Essential" });
    expect(screen.getByLabelText(/Event title/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Invitation language/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create event" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Continue" })).not.toBeInTheDocument();
    expect(screen.queryByText(/is required/)).not.toBeInTheDocument();
  });
  it.each([
    ["Wedding", "WEDDING", ["groomName", "brideName"]], ["Engagement", "ENGAGEMENT", ["hostName", "partnerName"]],
    ["Birthday", "BIRTHDAY", ["hostName"]], ["Anniversary", "ANNIVERSARY", ["hostName", "partnerName"]],
    ["Corporate", "CORPORATE", ["hostName"]], ["Other", "OTHER", ["hostName"]],
  ])("creates %s with its conditional participants and server-owned ID", async (label, type, participants) => {
    show(); fireEvent.click(screen.getByRole("button", { name: label, exact: true }));
    fireEvent.click(await screen.findByRole("button", { name: "Select Event Essential" }));
    fill("title", `${label} party`); participants.forEach((key, index) => fill(key, `Person ${index + 1}`));
    fill("eventDate", "2026-12-25"); fill("eventTime", "17:30"); fill("venueName", "Garden House");
    fireEvent.click(screen.getByRole("button", { name: "Create event" }));
    await screen.findByText("Exact saved workspace");
    expect(invitationService.create).toHaveBeenCalledOnce();
    const [payload] = invitationService.create.mock.calls[0];
    expect(payload).toMatchObject({ eventType: type, templateId: 30, visibility: "PRIVATE", eventDate: "2026-12-25", eventTime: "17:30" });
    expect(payload.clientRequestId).toMatch(/^[a-f0-9-]{36}$/);
    expect(payload).not.toHaveProperty("userId"); expect(payload).not.toHaveProperty("status");
    if (!["WEDDING", "ENGAGEMENT"].includes(type)) expect(payload.groomName).toBe("");
  });
  it("preserves values when type changes, filters update, and the page remounts", async () => {
    const view = show(); await screen.findByRole("button", { name: "Select Event Essential" });
    fill("title", "Keep my title"); fill("venueName", "Keep my venue"); fill("groomName", "Dara");
    fireEvent.click(screen.getByRole("button", { name: "Birthday", exact: true }));
    expect(screen.getByLabelText(/Celebrant name/)).toHaveValue("Dara");
    fireEvent.change(screen.getByLabelText("Invitation language"), { target: { value: "BOTH" } });
    fireEvent.change(screen.getByLabelText("Template price"), { target: { value: "FREE" } });
    await waitFor(() => expect(api.get).toHaveBeenLastCalledWith("/v1/templates/recommendations", expect.objectContaining({ params: expect.objectContaining({ eventType: "BIRTHDAY", language: "BOTH", pricePreference: "FREE" }) })));
    view.unmount(); show();
    expect(screen.getByLabelText(/Event title/)).toHaveValue("Keep my title");
    expect(screen.getByLabelText(/Venue/)).toHaveValue("Keep my venue");
    expect(screen.getByLabelText("Invitation language")).toHaveValue("BOTH");
    expect(await screen.findByRole("link", { name: /Preview Event Essential/ })).toHaveAttribute("target", "_blank");
  });
  it("focuses the first invalid field and allows a genuinely partial backend draft", async () => {
    show(); await screen.findByRole("button", { name: "Select Event Essential" });
    fireEvent.click(screen.getByRole("button", { name: "Create event" }));
    expect(screen.getByLabelText(/Event title/)).toHaveFocus();
    expect(invitationService.create).not.toHaveBeenCalled();
    fill("title", "Later details");
    fireEvent.click(screen.getByRole("button", { name: "Save draft" }));
    await screen.findByText("Exact saved workspace");
    expect(invitationService.create.mock.calls[0][0]).toMatchObject({ title: "Later details", eventType: "WEDDING" });
    expect(invitationService.create.mock.calls[0][0].templateId).toBeUndefined();
    expect(invitationService.create.mock.calls[0][0].eventDate).toBeUndefined();
  });
  it("retains the same request identity after an error and prevents double submission", async () => {
    invitationService.create.mockRejectedValueOnce(new Error("Network interrupted")).mockResolvedValueOnce({ id: 103 });
    show(); await screen.findByRole("button", { name: "Select Event Essential" }); fill("title", "Safe retry");
    fireEvent.click(screen.getByRole("button", { name: "Save draft" }));
    await screen.findByText("Network interrupted");
    expect(screen.getByLabelText(/Event title/)).toHaveValue("Safe retry");
    const button = screen.getByRole("button", { name: "Save draft" });
    fireEvent.click(button); fireEvent.click(button);
    await screen.findByText("Exact saved workspace");
    expect(invitationService.create).toHaveBeenCalledTimes(2);
    expect(invitationService.create.mock.calls[1][0].clientRequestId).toBe(invitationService.create.mock.calls[0][0].clientRequestId);
  });
  it("ignores an older recommendation response after rapid filter changes", async () => {
    let resolveOld;
    api.get.mockImplementationOnce(() => new Promise(resolve => { resolveOld = resolve; })).mockResolvedValueOnce({ data: [] });
    show(); fireEvent.click(screen.getByRole("button", { name: "Birthday", exact: true }));
    await screen.findByText(/No templates support these preferences/);
    await act(async () => resolveOld({ data: recommendations }));
    expect(screen.queryByRole("button", { name: "Select Event Essential" })).not.toBeInTheDocument();
    expect(screen.getByText(/No templates support these preferences/)).toBeInTheDocument();
  });
  it("keeps inputs available when recommendations fail and lets the user retry", async () => {
    api.get.mockRejectedValueOnce(new Error("Catalog unavailable"));
    show(); await screen.findByText("Catalog unavailable"); fill("title", "Keep working");
    fireEvent.click(screen.getByRole("button", { name: "Retry templates" }));
    await screen.findByRole("button", { name: "Select Event Essential" });
    expect(screen.getByLabelText(/Event title/)).toHaveValue("Keep working");
  });
  it("renders readable Khmer labels and only validates touched fields", async () => {
    useLanguageStore.setState({ lang: "km" }); show();
    await screen.findByRole("button", { name: "ជ្រើសរើស Event Essential" });
    expect(screen.getByRole("heading", { name: "ព័ត៌មានកម្មវិធី" })).toBeInTheDocument();
    fireEvent.blur(document.querySelector('[name="title"]'));
    expect(document.getElementById("event-title-error")).toBeInTheDocument();
    expect(document.getElementById("event-eventDate-error")).not.toBeInTheDocument();
  });
  it("shows a purchase path for a compatible premium template without implying access", async () => {
    api.get.mockResolvedValue({ data: [{ template: { ...template, id: 31, name: "Premium celebration", premium: true, price: 25 }, styleMatch: true }] });
    show(); fill("title", "Keep my celebration");
    const accessLink = await screen.findByRole("link", { name: "Get access (new tab)" });
    expect(accessLink).toHaveAttribute("href", "/templates/31/checkout");
    expect(screen.queryByRole("button", { name: "Select Premium celebration" })).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Event title/)).toHaveValue("Keep my celebration");
    expect(invitationService.create).not.toHaveBeenCalled();
  });
  it("allows an entitled premium template while keeping backend verification authoritative", async () => {
    paymentService.templateAccess.mockResolvedValue({ hasAccess: true });
    api.get.mockResolvedValue({ data: [{ template: { ...template, premium: true, price: 25 }, styleMatch: true }] });
    show();
    await screen.findByText("Included in your access");
    expect(paymentService.templateAccess).toHaveBeenCalledWith(30);
    fireEvent.click(screen.getByRole("button", { name: "Select Event Essential" }));
    expect(screen.getByRole("button", { name: "Select Event Essential" })).toHaveAttribute("aria-pressed", "true");
  });
  it("preserves template intent from query parameters and consumes it", async () => {
    const celestial = { id: 50, name: "Khmer Celestial", code: "khmer-celestial", category: "TRADITIONAL", price: 0, supportedEventTypes: ["WEDDING"] };
    templateCatalogService.list.mockResolvedValue([template, celestial]);
    api.get.mockResolvedValue({ data: [{ template, styleMatch: false }, { template: celestial, styleMatch: true }] });
    render(
      <MemoryRouter initialEntries={["/app/events/new?template=khmer-celestial"]}>
        <Routes>
          <Route path="/app/events/new" element={<EventCreatePage />} />
        </Routes>
      </MemoryRouter>
    );
    const selectedBtn = await screen.findByRole("button", { name: "Select Khmer Celestial" });
    expect(selectedBtn).toHaveAttribute("aria-pressed", "true");
  });
  it("preserves transient template intent stored across login in sessionStorage", async () => {
    const celestial = { id: 50, name: "Khmer Celestial", code: "khmer-celestial", category: "TRADITIONAL", price: 0, supportedEventTypes: ["WEDDING"] };
    sessionStorage.setItem("koupreng.template_intent", JSON.stringify({ key: "khmer-celestial", timestamp: Date.now() }));
    templateCatalogService.list.mockResolvedValue([template, celestial]);
    api.get.mockResolvedValue({ data: [{ template, styleMatch: false }, { template: celestial, styleMatch: true }] });
    show();
    const selectedBtn = await screen.findByRole("button", { name: "Select Khmer Celestial" });
    expect(selectedBtn).toHaveAttribute("aria-pressed", "true");
    expect(sessionStorage.getItem("koupreng.template_intent")).toBeNull();
  });
});
it("rejects invalid dates, times and unsafe map protocols even on partial drafts", () => {
  expect(validateEventForm({ title: "Draft", eventDate: "2026-02-30", eventTime: "25:01", googleMapUrl: "javascript:alert(1)" }, "OTHER", { draft: true })).toHaveProperty("eventDate");
  expect(validateEventForm({ title: "Draft", eventTime: "25:01" }, "OTHER", { draft: true })).toHaveProperty("eventTime");
  expect(validateEventForm({ title: "Draft", googleMapUrl: "javascript:alert(1)" }, "OTHER", { draft: true })).toHaveProperty("googleMapUrl");
  expect(validateEventForm({ title: "Draft" }, "OTHER", { draft: true })).toEqual({});
});

describe("explicit template intent precedence", () => {
  const celestial = { ...template, id: 50, name: "Khmer Celestial", code: "khmer-celestial", supportedEventTypes: ["WEDDING"], supportedLanguages: ["KH"] };
  it("prefers a fresh URL choice over stale draft/session and saves its actual catalog ID", async () => {
    sessionStorage.setItem("koupreng.onboarding.7", JSON.stringify({ type: "BIRTHDAY", templateId: 30, price: "FREE", form: { title: "Retained details" } }));
    sessionStorage.setItem("koupreng.template_intent", JSON.stringify({ key: "event-essential", timestamp: Date.now() }));
    templateCatalogService.list.mockResolvedValue([template, celestial]);
    show("/app/events/new?template=khmer-celestial");
    await waitFor(() => expect(screen.getByRole("button", { name: "Select Khmer Celestial" })).toHaveAttribute("aria-pressed", "true"));
    expect(screen.getByLabelText(/Event title/)).toHaveValue("Retained details");
    expect(screen.getByRole("button", { name: "Wedding", exact: true })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByLabelText("Invitation language")).toHaveValue("KH");
    expect(sessionStorage.getItem("koupreng.template_intent")).toBeNull();
    fill("groomName", "Dara"); fill("brideName", "Sokha"); fill("eventDate", "2026-12-25"); fill("eventTime", "17:30"); fill("venueName", "Garden House");
    fireEvent.click(screen.getByRole("button", { name: "Create event" }));
    await screen.findByText("Exact saved workspace");
    expect(invitationService.create.mock.calls[0][0]).toMatchObject({ templateId: 50, eventType: "WEDDING", languageMode: "KH" });
    expect(invitationService.create.mock.calls[0][0]).not.toHaveProperty("hasAccess");
  });
  it("invalidates an unknown choice without selecting Event Essential", async () => {
    show("/app/events/new?template=removed-design");
    await screen.findByText(/The selected design is unavailable/);
    expect(screen.getByRole("button", { name: "Select Event Essential" })).toHaveAttribute("aria-pressed", "false");
    fill("title", "Partial draft without a substituted design");
    fireEvent.click(screen.getByRole("button", { name: "Save draft" }));
    await screen.findByText("Exact saved workspace");
    expect(invitationService.create.mock.calls[0][0].templateId).toBeUndefined();
  });
  it("does not let a delayed catalog overwrite a newer manual selection", async () => {
    let resolveCatalog;
    templateCatalogService.list.mockImplementation(() => new Promise(resolve => { resolveCatalog = resolve; }));
    show("/app/events/new?template=khmer-celestial");
    fireEvent.click(await screen.findByRole("button", { name: "Select Event Essential" }));
    await act(async () => resolveCatalog([template, celestial]));
    expect(screen.getByRole("button", { name: "Select Event Essential" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByRole("button", { name: "Select Khmer Celestial" })).not.toBeInTheDocument();
  });
});
