import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { beforeEach, afterEach, it, expect, vi } from "vitest";
import Home from "./HomeFeature";
import MarketingShell from "../../layouts/MarketingShell";
import { useLanguageStore } from "../../stores/useLanguageStore";
import { templateService } from "../templates/api/templateService";

vi.mock("../templates/api/templateService", () => ({ templateService: { listPublic: vi.fn() } }));
vi.mock("../subscriptions/subscriptionService", () => ({ default: { publicPackages: vi.fn().mockResolvedValue([]) } }));
vi.mock("../../shared/api/i18nService", () => ({ i18nService: { messages: vi.fn().mockResolvedValue({ messages: {} }) } }));
vi.mock("@/features/auth/hooks/useAuth", () => ({ useAuth: () => ({ isAuthenticated: false, logout: vi.fn() }) }));

beforeEach(() => {
  useLanguageStore.setState({ lang: "en" });
  window.matchMedia = vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  templateService.listPublic.mockReset().mockResolvedValue([{ id: 2, code: "silk-heritage", name: "Silk Heritage", premium: true, price: null, category: "TRADITIONAL" }]);
});
afterEach(cleanup);
const show = () => render(<MemoryRouter><Routes><Route element={<MarketingShell />}><Route path="/" element={<Home />} /></Route></Routes></MemoryRouter>);

it.each(["en", "km"])("renders one H1, one footer, valid actions and complete %s content", async (lang) => {
  useLanguageStore.setState({ lang });
  const { container } = show();
  await waitFor(() => expect(container.querySelector(".kp-design-card")).toBeInTheDocument());
  expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  expect(container.querySelectorAll("footer")).toHaveLength(1);
  expect(container.querySelector("style")).toBeNull();
  expect(container.querySelectorAll("details")).toHaveLength(5);
  for (const link of container.querySelectorAll("a")) expect(link.getAttribute("href")).toMatch(/^(\/|#)/);
});
it("defers the real invitation frame until requested and closes the mobile dialog", async () => {
  show();
  expect(document.querySelector("iframe")).toBeNull();
  const open = screen.getByRole("button", { name: "Try the invitation" });
  expect(open).toHaveAttribute("aria-expanded", "false");
  fireEvent.click(open);
  const dialog = screen.getByRole("dialog", { name: "Explore Silk Heritage" });
  expect(dialog.querySelector("iframe")).toHaveAttribute("src", "/templates/silk-heritage?embed=demo");
  expect(document.querySelectorAll("iframe")).toHaveLength(1);
  fireEvent.keyDown(document, { key: "Escape" });
  expect(document.querySelector("iframe")).toBeNull();
  expect(screen.getByRole("link", { name: "View the full demo" })).toHaveAttribute("href", "/templates/silk-heritage");
  await waitFor(() => expect(screen.getByText(/Premium · Included with Premium access/)).toBeInTheDocument());
});
it("labels offline fallback as demo and retries the actual service", async () => {
  templateService.listPublic.mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce([]);
  show();
  await screen.findByText(/These are demo designs/);
  expect(screen.queryByText("Free design")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  await screen.findByText(/There are no designs in the collection yet/);
  expect(templateService.listPublic).toHaveBeenLastCalledWith({ force: true });
});
it("shows a labeled guest fixture, lazy featured images and connected pricing/help destinations", async () => {
  const { container } = show();
  await screen.findByText(/Premium · Included with Premium access/);
  expect(screen.getByText(/names and responses below are sample data/)).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Pending", exact: true }));
  expect(screen.getByRole("table", { name: "Illustrative guest response data" }).querySelectorAll("tbody tr")).toHaveLength(1);
  for (const image of container.querySelectorAll(".kp-design-card img")) expect(image).toHaveAttribute("loading", "lazy");
  expect(container.querySelector(".kp-pricing-preview .kp-button")).toHaveAttribute("href", "/pricing");
  expect(container.querySelector(".kp-help-preview .kp-button")).toHaveAttribute("href", "/contact");
});
