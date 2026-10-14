import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, afterEach, it, expect } from "vitest";
import TemplateRsvp from "./TemplateRsvp";
import { useLanguageStore } from "@/stores/useLanguageStore";

beforeEach(() => useLanguageStore.setState({ lang: "en" }));
afterEach(cleanup);

it("explains demo fields and routes creation without pretending to submit", () => {
  render(<MemoryRouter><TemplateRsvp useTemplateLink="/templates/browse?template=silk-heritage" /></MemoryRouter>);
  expect(screen.getByText(/do not send or save/)).toBeInTheDocument();
  expect(screen.queryByText("Send RSVP Response")).not.toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Create with this design" })).toHaveAttribute("href", "/templates/browse?template=silk-heritage");
  const form = screen.getByRole("form");
  expect(fireEvent.submit(form)).toBe(false);
});
it("disables RSVP when no create action is available", () => {
  render(<MemoryRouter><TemplateRsvp /></MemoryRouter>);
  expect(screen.getByRole("button", { name: /Demo only/ })).toBeDisabled();
});
it("translates the disclosure and action into Khmer", () => {
  useLanguageStore.setState({ lang: "km" });
  render(<MemoryRouter><TemplateRsvp useTemplateLink="/templates/browse" /></MemoryRouter>);
  expect(screen.getByRole("link", { name: "បង្កើតជាមួយគំរូនេះ" })).toBeInTheDocument();
  expect(screen.getByText(/មិនត្រូវបានផ្ញើ/)).toBeInTheDocument();
});
