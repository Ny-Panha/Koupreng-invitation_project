import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import { beforeEach, afterEach, it, expect, vi } from "vitest";
import { feedback } from "@/shared/feedback/feedback";
import Browse from "./BrowseTemplatesFeature";
import { templateCatalogService } from "../api/templateCatalogApi";
import { paymentService } from "../../payments/paymentService";

vi.mock("@/shared/feedback/feedback", () => ({ feedback: { upgrade: vi.fn(), explain: vi.fn(), error: vi.fn() } }));
vi.mock("../api/templateCatalogApi", () => ({ templateCatalogService: { list: vi.fn() } }));
vi.mock("../../payments/paymentService", () => ({ paymentService: { paidTemplates: vi.fn(), templateAccess: vi.fn() } }));
vi.mock("@/shared/i18n/useBackendMessages", () => ({ useBackendMessages: () => ({ lang: "en", text: stableText }) }));
function stableText(key) { return key; }
function Destination() { const location = useLocation(); return <p>{location.pathname + location.search}</p>; }
const base = { id: 2, code: "silk-heritage", status: "ACTIVE", slug: "silk-heritage", name: "Silk Heritage", category: "TRADITIONAL", premium: true, price: null, currency: "USD" };
const show = (path = "/templates/browse?template=silk-heritage") => render(<MemoryRouter initialEntries={[path]}><Routes><Route path="/templates/browse" element={<Browse />} /><Route path="*" element={<Destination />} /></Routes></MemoryRouter>);
beforeEach(() => { vi.clearAllMocks(); paymentService.templateAccess.mockResolvedValue({ hasAccess: false }); templateCatalogService.list.mockReset().mockResolvedValue([base]); paymentService.paidTemplates.mockReset().mockResolvedValue([]); });
afterEach(cleanup);

it("explains a locked premium design without inventing a price", async () => {
  show();
  const action = await screen.findByRole("button", { name: /View pricing — price unavailable/ });
  expect(screen.queryByText(/\$0\.01/)).not.toBeInTheDocument();
  fireEvent.click(action);
  await vi.waitFor(() => expect(feedback.upgrade).toHaveBeenCalledWith(expect.objectContaining({ feature: "PREMIUM_TEMPLATES", template: base })));
});
it("uses the actual currency and retains a locked checkout identity", async () => {
  templateCatalogService.list.mockResolvedValue([{ ...base, price: 48000, currency: "KHR", checkoutEligible: true }]);
  show();
  fireEvent.click(await screen.findByRole("button", { name: /Buy design.*KHR/ }));
  await vi.waitFor(() => expect(feedback.upgrade).toHaveBeenCalledWith(expect.objectContaining({ template: expect.objectContaining({ currency: "KHR", price: 48000, checkoutEligible: true }) })));
});
it.each([false, true])("retains the explicit creation intent when premium unlocked=%s", async (premium) => {
  templateCatalogService.list.mockResolvedValue([{ ...base, premium }]);
  if (premium) paymentService.paidTemplates.mockResolvedValue([{ templateId: 2 }]);
  show();
  fireEvent.click(await screen.findByRole("button", { name: "Use Template" }));
  expect(await screen.findByText("/app/events/new?template=silk-heritage")).toBeInTheDocument();
});
it("previews the explicit design rather than the colliding numeric preset", async () => {
  show();
  fireEvent.click(await screen.findByRole("button", { name: "Preview" }));
  expect(await screen.findByText("/templates/browse/silk-heritage")).toBeInTheDocument();
});
it("does not silently substitute another template for an invalid selection", async () => {
  show("/templates/browse?template=missing");
  await screen.findByText("emptyTitle");
  expect(screen.queryByRole("button", { name: /Use Template|Buy design/ })).not.toBeInTheDocument();
});
