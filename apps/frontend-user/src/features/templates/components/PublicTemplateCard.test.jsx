import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, expect, it } from "vitest";
import PublicTemplateCard from "./PublicTemplateCard";
const royal = { identity: "royal-garden-cinematic", name: "Royal Garden Cinematic", isPremium: true, premium: true, price: 0, currency: "USD", live: true };
const show = template => render(<MemoryRouter><PublicTemplateCard template={template} lang="en" isAuthenticated /></MemoryRouter>);
afterEach(cleanup);
it("keeps unavailable static fallbacks preview only without asserting Free or paid availability", () => {
  show({ ...royal, live: false });
  expect(screen.getByText("Demo design · Preview only")).toBeInTheDocument();
  expect(screen.queryByRole("link", { name: "Use design" })).not.toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Preview" })).toHaveAttribute("href", "/templates/royal-garden-cinematic");
  expect(screen.queryByText("Free design")).not.toBeInTheDocument();
});
it("labels zero per-template price with Premium access and preserves the stable code in creation", () => {
  show(royal);
  expect(screen.getByText("Premium · Included with Premium access")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Use design" })).toHaveAttribute("href", "/app/events/new?template=royal-garden-cinematic");
});
