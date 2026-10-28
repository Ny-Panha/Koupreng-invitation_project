import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, expect, it, vi } from "vitest";
import TemplateChooser from "./TemplateChooser";

const royal = { id: "614", backendId: 614, code: "royal-garden-cinematic", name: "Royal Garden Cinematic", status: "ACTIVE", category: "TRADITIONAL", premium: true, price: 0, currency: "USD", thumbnailUrl: "/images/marketing/catalog/royal-garden-cinematic-640.webp", supportedEventTypes: ["WEDDING"], supportedLanguages: ["KH", "EN", "BOTH"] };
const show = (props = {}) => render(<MemoryRouter><TemplateChooser templates={[royal]} status="ready" currentId="silk-heritage" english language="EN" onSelect={vi.fn()} onClose={vi.fn()} onRetry={vi.fn()} {...props} /></MemoryRouter>);
afterEach(cleanup);
it("provides distinct preview, selection and confirmation actions with backend Premium labels", () => {
  const onSelect = vi.fn(); show({ onSelect });
  expect(screen.getAllByRole("heading", { name: "Change template" })).toHaveLength(1);
  expect(screen.getByRole("link", { name: /Preview Royal Garden/ })).toHaveAttribute("href", "/templates/royal-garden-cinematic");
  expect(screen.getByText("Premium · Included with Premium access")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Use selected design" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Select", exact: true }));
  expect(onSelect).not.toHaveBeenCalled();
  expect(screen.getByRole("button", { name: "Selected", exact: true })).toHaveAttribute("aria-pressed", "true");
  fireEvent.click(screen.getByRole("button", { name: "Use selected design" }));
  expect(onSelect).toHaveBeenCalledWith(royal);
});
it("searches by code and filters Khmer tradition without hiding Royal", () => {
  show(); fireEvent.change(screen.getByRole("searchbox"), { target: { value: "garden-cinematic" } });
  fireEvent.click(screen.getByRole("button", { name: "Khmer tradition" }));
  expect(screen.getByRole("heading", { name: "Royal Garden Cinematic" })).toBeInTheDocument();
  fireEvent.change(screen.getByRole("searchbox"), { target: { value: "absent" } });
  expect(screen.getByText("No designs match your search or category.")).toBeInTheDocument();
});
it("excludes inactive inventory and disables incompatible event and language selections", () => {
  const { rerender } = show({ templates: [{ ...royal, status: "INACTIVE" }] });
  expect(screen.queryByRole("button", { name: "Select", exact: true })).not.toBeInTheDocument();
  rerender(<MemoryRouter><TemplateChooser templates={[royal]} status="ready" english eventType="BIRTHDAY" language="EN" /></MemoryRouter>);
  expect(screen.getByRole("button", { name: "Select", exact: true })).toBeDisabled();
  expect(screen.getByText("Unavailable for this event or language")).toBeInTheDocument();
});
it("shows honest loading and retryable preview-only catalog errors", () => {
  const retry = vi.fn(); const { rerender } = show({ status: "loading" });
  expect(screen.getByText("Loading the invitation collection…")).toBeInTheDocument();
  rerender(<MemoryRouter><TemplateChooser templates={[]} status="error" english onRetry={retry} /></MemoryRouter>);
  expect(screen.getByText(/The catalog is unavailable/)).toBeInTheDocument();
  expect(screen.getAllByRole("button", { name: "Select", exact: true }).every(button => button.disabled)).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "Try again" })); expect(retry).toHaveBeenCalledOnce();
  expect(screen.getByRole("button", { name: "Use selected design" })).toBeDisabled();
});
