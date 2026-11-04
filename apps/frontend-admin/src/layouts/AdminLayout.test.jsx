import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { AdminLanguageProvider } from "../app/providers/AdminLanguageProvider";

vi.mock("../app/providers/AdminAuthProvider", () => ({
  useAuth: () => ({ user: { fullName: "Sophea", email: "sophea@example.test", role: "ADMIN" }, logout: vi.fn() }),
}));

beforeEach(() => {
  localStorage.setItem("koupreng.admin.lang", "en");
  Object.defineProperty(window, "innerWidth", { value: 390, configurable: true });
});
afterEach(() => { cleanup(); document.body.style.overflow = ""; document.documentElement.classList.remove("dark"); });

function shell() {
  return render(<AdminLanguageProvider><MemoryRouter initialEntries={["/dashboard"]}><Routes><Route element={<AdminLayout />}><Route path="/dashboard" element={<h1>Overview</h1>} /><Route path="/payments" element={<h1>Payment monitoring</h1>} /></Route></Routes></MemoryRouter></AdminLanguageProvider>);
}

describe("admin workspace navigation", () => {
  it("keeps the closed drawer out of the document and gives every dock destination a name", () => {
    shell();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    const nav = screen.getByRole("navigation", { name: "Admin navigation" });
    expect(within(nav).getAllByRole("link")).toHaveLength(9);
    for (const link of within(nav).getAllByRole("link")) expect(link).toHaveAccessibleName();
    expect(screen.getByRole("button", { name: "Open navigation" })).toHaveAttribute("aria-expanded", "false");
  });

  it("focuses the mobile drawer, filters actual pages, unlocks scroll and restores focus on close", () => {
    shell();
    const trigger = screen.getByRole("button", { name: "Open navigation" });
    trigger.focus(); fireEvent.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "Admin navigation" });
    expect(within(dialog).getByRole("button", { name: "Close navigation" })).toHaveFocus();
    expect(document.body.style.overflow).toBe("hidden");
    fireEvent.change(within(dialog).getByRole("searchbox"), { target: { value: "payments" } });
    expect(within(dialog).getByRole("link", { name: "KHQR payments" })).toHaveAttribute("href", "/payments");
    expect(within(dialog).queryByRole("link", { name: "Users" })).not.toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("button", { name: "Close navigation" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe("");
    expect(trigger).toHaveFocus();
  });

  it("searches destinations, shows a useful empty result and navigates to the selected page", () => {
    shell();
    fireEvent.click(screen.getByRole("button", { name: "Find a page in your workspace" }));
    const dialog = screen.getByRole("dialog", { name: "Find an admin page" });
    const input = within(dialog).getByLabelText("Page name");
    expect(input).toHaveFocus();
    fireEvent.change(input, { target: { value: "no such page" } });
    expect(within(dialog).getByRole("status")).toHaveTextContent("Try a different page name");
    fireEvent.change(input, { target: { value: "PAYMENTS" } });
    expect(within(dialog).getAllByRole("link")).toHaveLength(1);
    fireEvent.click(within(dialog).getByRole("link", { name: "KHQR payments" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Payment monitoring" })).toBeInTheDocument();
  });

  it("cancels the search dialog and restores its trigger", () => {
    shell();
    const trigger = screen.getByRole("button", { name: "Find a page in your workspace" });
    trigger.focus(); fireEvent.click(trigger);
    const dialog = screen.getByRole("dialog");
    fireEvent(dialog, new Event("cancel", { cancelable: true, bubbles: true }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("closes a drawer with Escape even when its search query is not empty", () => {
    shell();
    fireEvent.click(screen.getByRole("button", { name: "Open navigation" }));
    const dialog = screen.getByRole("dialog");
    const input = within(dialog).getByRole("searchbox");
    fireEvent.change(input, { target: { value: "payments" } });
    fireEvent.keyDown(input, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("reports the real administrator role and dismisses account options with Escape", () => {
    shell();
    const trigger = screen.getByRole("button", { name: "Account options" });
    fireEvent.click(trigger);
    expect(screen.getByText("Administrator")).toBeInTheDocument();
    expect(screen.queryByText("Super Admin")).not.toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });
});
