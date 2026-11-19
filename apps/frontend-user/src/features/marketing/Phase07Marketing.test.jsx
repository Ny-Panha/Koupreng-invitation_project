import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Home from "./HomeFeature";
import ContactFeature from "./ContactFeature";
import VenuesFeature from "./VenuesFeature";
import MarketingShell from "../../layouts/MarketingShell";
import Header from "../../layouts/components/Header";
import Footer from "../../layouts/components/Footer";
import { useLanguageStore } from "../../stores/useLanguageStore";
import { templateService } from "../templates/api/templateService";
import subscriptionService from "../subscriptions/subscriptionService";
import { i18nService } from "../../shared/api/i18nService";
import { api } from "../../shared/api/httpClient";

vi.mock("../templates/api/templateService", () => ({
  templateService: { listPublic: vi.fn() },
}));
vi.mock("../subscriptions/subscriptionService", () => ({
  default: { publicPackages: vi.fn().mockResolvedValue([]) },
}));
vi.mock("../../shared/api/i18nService", () => ({
  i18nService: { messages: vi.fn().mockResolvedValue({ messages: {} }) },
}));
vi.mock("@/features/auth/hooks/useAuth", () => ({
  useAuth: () => ({ isAuthenticated: false, logout: vi.fn() }),
}));
vi.mock("../../shared/api/httpClient", () => ({
  api: { post: vi.fn() },
}));

describe("Phase 07.1 Marketing Domain Verification", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    useLanguageStore.setState({ lang: "en" });
    window.matchMedia = vi.fn(() => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    templateService.listPublic.mockResolvedValue([
      { id: 2, code: "silk-heritage", name: "Silk Heritage", premium: true, price: null, category: "TRADITIONAL" },
    ]);
    subscriptionService.publicPackages.mockResolvedValue([]);
    i18nService.messages.mockResolvedValue({ messages: {} });
  });

  afterEach(cleanup);

  it("verifies homepage single H1, zero inline styles, 5 FAQ details, and valid CTA destinations", async () => {
    const { container } = render(
      <MemoryRouter>
        <Routes>
          <Route element={<MarketingShell />}>
            <Route path="/" element={<Home />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    // Exactly one H1 on homepage
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);

    // Exactly one footer
    expect(container.querySelectorAll("footer")).toHaveLength(1);

    // Zero inline <style> tags on the rendered page
    expect(container.querySelector("style")).toBeNull();

    // Exactly 5 FAQ accordions
    expect(container.querySelectorAll("details")).toHaveLength(5);

    // All links begin with / or #
    for (const link of container.querySelectorAll("a")) {
      expect(link.getAttribute("href")).toMatch(/^(\/|#)/);
    }

    // Key primary and secondary CTAs exist and have correct paths
    const createBtns = screen.getAllByRole("link", { name: /Create invitation/i });
    expect(createBtns.length).toBeGreaterThanOrEqual(1);
    createBtns.forEach((btn) => expect(btn).toHaveAttribute("href", "/app/events/new"));

    const exploreLinks = screen.getAllByRole("link", { name: /Explore templates/i });
    expect(exploreLinks.length).toBeGreaterThanOrEqual(1);
    exploreLinks.forEach((link) => expect(link).toHaveAttribute("href", "/templates"));

    const pricingBtn = container.querySelector(".kp-pricing-preview .kp-button");
    expect(pricingBtn).toHaveAttribute("href", "/pricing");

    const helpBtn = container.querySelector(".kp-help-preview .kp-button");
    expect(helpBtn).toHaveAttribute("href", "/contact");
  });

  it("verifies header navigation and mobile dialog accessibility contracts", () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    const toggle = screen.getByLabelText("Open navigation menu");
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");

    const dialog = screen.getByRole("dialog", { name: "Navigation" });
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("id", toggle.getAttribute("aria-controls"));

    const closeBtn = screen.getByLabelText("Close navigation menu");
    fireEvent.click(closeBtn);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("verifies footer explore and support link targets", () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    expect(screen.getByRole("link", { name: /Invitation designs/i })).toHaveAttribute("href", "/templates");
    expect(screen.getByRole("link", { name: /Packages & access/i })).toHaveAttribute("href", "/pricing");
    expect(screen.getByRole("link", { name: /Venues/i })).toHaveAttribute("href", "/venues");
    expect(screen.getByRole("link", { name: /Contact us/i })).toHaveAttribute("href", "/contact");
    expect(screen.getByRole("link", { name: /Log in/i })).toHaveAttribute("href", "/login");
  });

  it("verifies venue discovery has zero inline styles, lazy images, search filtering, and accessible detail dialog", async () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/venues"]}>
        <Routes>
          <Route path="/venues/:id?" element={<VenuesFeature />} />
        </Routes>
      </MemoryRouter>
    );

    // No inline <style> tags
    expect(container.querySelector("style")).toBeNull();

    // Venue images have loading="lazy"
    const images = container.querySelectorAll(".venue-img");
    expect(images.length).toBeGreaterThan(0);
    images.forEach((img) => expect(img).toHaveAttribute("loading", "lazy"));

    // Search filter works
    const searchInput = screen.getByPlaceholderText(/Search by name or location/i);
    fireEvent.change(searchInput, { target: { value: "Sokha" } });
    expect(screen.getByText(/Sokha Residence Hotel/i)).toBeInTheDocument();
    expect(screen.queryByText(/Koh Pich Theatre/i)).not.toBeInTheDocument();

    // Clear search restores all venues
    fireEvent.change(searchInput, { target: { value: "" } });
    expect(screen.getByText(/Koh Pich Theatre/i)).toBeInTheDocument();

    // View detail modal dialog
    const detailBtn = screen.getAllByRole("button", { name: /View details/i })[0];
    detailBtn.focus();
    fireEvent.click(detailBtn);

    const dialog = await screen.findByRole("dialog", { name: "Koh Pich Theatre" });
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-modal", "true");

    // Close button has accessible label
    const closeBtn = screen.getByRole("button", { name: "Close venue details" });
    expect(closeBtn).toBeInTheDocument();

    // Escape closes modal
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("verifies contact form field constraints, validation focus, and retry after failure", async () => {
    render(
      <MemoryRouter>
        <ContactFeature />
      </MemoryRouter>
    );

    const submitBtn = screen.getByRole("button", { name: /Send message/i });

    // Empty submission triggers focus on first invalid field
    fireEvent.click(submitBtn);
    const nameField = screen.getByLabelText(/Full name/i);
    expect(nameField).toHaveFocus();
    expect(nameField).toHaveAttribute("aria-invalid", "true");

    // Fill valid data
    fireEvent.change(nameField, { target: { value: "Test Host" } });
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: "host@example.com" } });
    fireEvent.change(screen.getByLabelText(/Message/), { target: { value: "Wedding inquiry details." } });

    // Mock failure and verify draft preservation
    api.post.mockRejectedValueOnce({ status: 500 });
    fireEvent.click(submitBtn);

    expect(await screen.findByRole("alert")).toBeVisible();
    expect(nameField).toHaveValue("Test Host");
    expect(screen.getByLabelText(/Email/)).toHaveValue("host@example.com");
    expect(screen.getByLabelText(/Message/)).toHaveValue("Wedding inquiry details.");

    // Retry with success
    api.post.mockResolvedValueOnce({ data: { accepted: true, delivery: "SMTP_ACCEPTED" } });
    fireEvent.click(screen.getByRole("button", { name: /Send message/i }));

    expect(await screen.findByRole("status")).toHaveTextContent(/received|accepted/i);
  });
});
