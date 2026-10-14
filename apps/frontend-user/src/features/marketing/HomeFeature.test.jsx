import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { beforeEach, afterEach, it, expect, vi } from "vitest";
import Home from "./HomeFeature";
import MarketingShell from "../../layouts/MarketingShell";
import { useLanguageStore } from "../../stores/useLanguageStore";
import { templateService } from "../templates/api/templateService";

vi.mock("../templates/api/templateService", () => ({ templateService: { listPublic: vi.fn() } }));
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
it("opens a labeled lightweight preview and lets visitors choose story stages", async () => {
  show();
  const open = screen.getByRole("button", { name: "Open invitation preview" });
  expect(open).toHaveAttribute("aria-expanded", "false");
  fireEvent.click(open);
  expect(screen.getByRole("button", { name: "Close invitation preview" })).toHaveAttribute("aria-expanded", "true");
  expect(screen.getByRole("link", { name: "View the full demo" })).toHaveAttribute("href", "/templates/silk-heritage");
  fireEvent.click(screen.getByRole("button", { name: /The details/ }));
  expect(screen.getByText(/This sample does not collect responses/)).toBeInTheDocument();
  await waitFor(() => expect(screen.getByText(/Premium · Access required/)).toBeInTheDocument());
});
it("labels offline fallback as demo and retries the actual service", async () => {
  templateService.listPublic.mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce([]);
  show();
  await screen.findByText(/These are demo designs/);
  expect(screen.queryByText("Free design")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  await screen.findByText(/No designs match/);
  expect(templateService.listPublic).toHaveBeenLastCalledWith({ force: true });
});
