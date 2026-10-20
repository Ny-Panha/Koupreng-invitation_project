import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, expect, it, vi } from "vitest";
import { templateService } from "../api/templateService";
import HostTemplateDemoFeature from "./HostTemplateDemoFeature";
vi.mock("../api/templateService", () => ({ templateService: { getPublic: vi.fn(), getPublicBySlug: vi.fn() } }));
vi.mock("../experience/TemplateExperience", () => ({ default: ({ tpl, backLink }) => <main><h1>{tpl.code}</h1><a href={backLink}>Back</a></main> }));
afterEach(cleanup);
function show(id) { return render(<MemoryRouter initialEntries={[`/templates/browse/${id}`]}><Routes><Route path="/templates/browse/:id" element={<HostTemplateDemoFeature />} /></Routes></MemoryRouter>); }
it("resolves a neutral host preview from the backend on a cold page load", async () => {
  templateService.getPublicBySlug.mockResolvedValue({ id: 30, code: "event-essential", name: "Event Essential", price: 0, currency: "USD" });
  show("event-essential");
  expect(await screen.findByRole("heading", { name: "event-essential" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Back" })).toHaveAttribute("href", "/templates/browse");
});
it("shows recovery for an unknown host template without borrowing another template", async () => {
  templateService.getPublicBySlug.mockRejectedValue(new Error("Not found"));
  show("unavailable-design");
  expect(await screen.findByRole("heading", { name: /Template unavailable/ })).toBeInTheDocument();
});
