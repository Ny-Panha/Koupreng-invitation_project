import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Header from "../../layouts/components/Header";
import ChatBot from "../../shared/ui/ChatBot";
import VenuesFeature from "./VenuesFeature";
import { useLanguageStore } from "../../stores/useLanguageStore";
vi.mock("@/features/auth/hooks/useAuth", () => ({ useAuth: () => ({ isAuthenticated: false, logout: vi.fn() }) }));
vi.mock("../../shared/api/i18nService", () => ({ i18nService: { messages: vi.fn().mockResolvedValue({ messages: {} }) } }));
afterEach(cleanup);
beforeEach(() => useLanguageStore.getState().setLang("en"));

it("names the mobile toggle and exposes its controlled menu state", () => {
  render(<MemoryRouter><Header /></MemoryRouter>);
  const toggle = screen.getByLabelText("Open navigation menu");
  expect(toggle).toHaveAttribute("aria-expanded", "false");
  fireEvent.click(toggle);
  expect(screen.getByLabelText("Close navigation menu")).toHaveAttribute("aria-expanded", "true");
  expect(document.getElementById(toggle.getAttribute("aria-controls"))).toHaveAttribute("aria-label", "Navigation");
  fireEvent.keyDown(document, { key: "Escape" });
  expect(screen.getByLabelText("Open navigation menu")).toHaveAttribute("aria-expanded", "false");
});

it("names support icon buttons and the message field", () => {
  render(<MemoryRouter><ChatBot /></MemoryRouter>);
  expect(screen.getByLabelText("Dismiss greeting")).toBeInTheDocument();
  fireEvent.click(screen.getByLabelText("Open support chat"));
  expect(screen.getByRole("region", { name: "Help & Support" })).toBeInTheDocument();
  expect(screen.getByLabelText("Message to Telegram support")).toBeInTheDocument();
  expect(screen.getByLabelText("Send to Telegram")).toBeInTheDocument();
  fireEvent.click(screen.getByLabelText("Close support chat", { selector: ".chat-close-btn" }));
});

it("supports a keyboard-contained venue dialog and restores trigger focus", async () => {
  render(<MemoryRouter initialEntries={["/venues"]}><Routes><Route path="/venues/:id?" element={<VenuesFeature />} /></Routes></MemoryRouter>);
  const trigger = screen.getAllByRole("button", { name: "View details" })[0];
  trigger.focus(); fireEvent.click(trigger);
  const dialog = await screen.findByRole("dialog", { name: "Koh Pich Theatre" });
  const close = screen.getByRole("button", { name: "Close venue details" });
  await waitFor(() => expect(close).toHaveFocus());
  fireEvent.keyDown(dialog, { key: "Tab", shiftKey: true });
  expect(screen.getByRole("button", { name: /បិទ \/ Close/ })).toHaveFocus();
  fireEvent.keyDown(document, { key: "Escape" });
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  expect(trigger).toHaveFocus();
});
