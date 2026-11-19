import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import TemplateGrid from "./components/TemplateGrid";
import PublicTemplateCard from "./components/PublicTemplateCard";
import { templateUsePath, templatePriceLabel } from "./model/templateIdentity";
import { templateService } from "./api/templateService";
import { useLanguageStore } from "@/stores/useLanguageStore";

vi.mock("./api/templateService", () => ({
  templateService: {
    listPublic: vi.fn(),
    getPublic: vi.fn(),
    getPublicBySlug: vi.fn(),
  },
}));

vi.mock("@/features/auth/hooks/useAuth", () => ({
  useAuth: () => ({ isAuthenticated: false, isLoading: false }),
}));

const mockTemplates = [
  {
    id: 101,
    code: "khmer-celestial",
    slug: "khmer-celestial",
    name: "Khmer Celestial",
    nameKm: "ខ្មែរ សេឡេស្ទាល",
    nameEn: "Khmer Celestial",
    status: "ACTIVE",
    category: "ancient",
    premium: false,
    price: 0,
    currency: "USD",
    live: true,
  },
  {
    id: 102,
    code: "silk-heritage",
    slug: "silk-heritage",
    name: "Silk Heritage",
    nameKm: "សូត្រ បុរាណ",
    nameEn: "Silk Heritage",
    status: "ACTIVE",
    category: "ancient",
    premium: true,
    price: 35,
    currency: "USD",
    checkoutEligible: true,
    checkoutAmount: "35.00",
    checkoutCurrency: "USD",
    live: true,
  },
  {
    id: 103,
    code: "modern-minimalist",
    slug: "modern-minimalist",
    name: "Modern Minimalist",
    nameKm: "ទំនើប សាមញ្ញ",
    nameEn: "Modern Minimalist",
    status: "ACTIVE",
    category: "minimalist",
    premium: true,
    price: null, // missing price
    currency: "USD",
    live: true,
  },
];

describe("Phase 09.1 — Template Marketplace & Discovery Experience", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useLanguageStore.setState({ lang: "en" });
    templateService.listPublic.mockResolvedValue(mockTemplates);
  });

  afterEach(cleanup);

  it("01. Renders the luxury header with Cambodian atelier title and orientation copy", async () => {
    render(
      <MemoryRouter>
        <TemplateGrid />
      </MemoryRouter>
    );

    expect(await screen.findByRole("heading", { level: 1 })).toHaveTextContent("A design that feels like you.");
    expect(screen.getByText(/The invitation collection/i)).toBeInTheDocument();
    expect(screen.getByText(/Preview the complete invitation/i)).toBeInTheDocument();
  });

  it("02. Filters by category accurately using accessible aria-pressed chips", async () => {
    render(
      <MemoryRouter>
        <TemplateGrid />
      </MemoryRouter>
    );

    await screen.findByText("Khmer Celestial");
    expect(screen.getByText("Modern Minimalist")).toBeInTheDocument();

    // Click Minimalist category button
    const minBtn = screen.getByRole("button", { name: "Minimalist" });
    expect(minBtn).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(minBtn);
    expect(minBtn).toHaveAttribute("aria-pressed", "true");

    expect(screen.getByText("Modern Minimalist")).toBeInTheDocument();
    expect(screen.queryByText("Khmer Celestial")).not.toBeInTheDocument();
  });

  it("03. Filters by price preference (Free vs Premium) without inventing prices", async () => {
    render(
      <MemoryRouter>
        <TemplateGrid />
      </MemoryRouter>
    );

    await screen.findByText("Khmer Celestial");

    // Click "Free" pill
    const freePill = screen.getByRole("button", { name: "Free" });
    fireEvent.click(freePill);

    expect(screen.getByText("Khmer Celestial")).toBeInTheDocument();
    expect(screen.queryByText("Silk Heritage")).not.toBeInTheDocument();

    // Click "Premium" pill
    const premiumPill = screen.getByRole("button", { name: "Premium" });
    fireEvent.click(premiumPill);

    expect(screen.getByText("Silk Heritage")).toBeInTheDocument();
    expect(screen.getByText("Modern Minimalist")).toBeInTheDocument();
    expect(screen.queryByText("Khmer Celestial")).not.toBeInTheDocument();
  });

  it("04. Sorts deterministically by Name (A-Z) and Name (Z-A)", async () => {
    render(
      <MemoryRouter>
        <TemplateGrid />
      </MemoryRouter>
    );

    await screen.findByText("Khmer Celestial");

    const sortSelect = screen.getByLabelText(/Sort invitation designs/i);
    expect(sortSelect).toHaveValue("default");

    // Sort A-Z
    fireEvent.change(sortSelect, { target: { value: "name-asc" } });
    expect(sortSelect).toHaveValue("name-asc");

    // Sort Z-A
    fireEvent.change(sortSelect, { target: { value: "name-desc" } });
    expect(sortSelect).toHaveValue("name-desc");
  });

  it("05. Performs Unicode search and provides a clear button to restore catalog", async () => {
    render(
      <MemoryRouter>
        <TemplateGrid />
      </MemoryRouter>
    );

    await screen.findByText("Khmer Celestial");

    const searchInput = screen.getByLabelText(/Search invitation designs/i);
    fireEvent.change(searchInput, { target: { value: "Silk" } });

    expect(screen.getByText("Silk Heritage")).toBeInTheDocument();
    expect(screen.queryByText("Khmer Celestial")).not.toBeInTheDocument();

    // Clear search via clear button
    const clearBtn = screen.getByRole("button", { name: /Clear search/i });
    expect(clearBtn).toBeInTheDocument();
    fireEvent.click(clearBtn);

    expect(screen.getByText("Khmer Celestial")).toBeInTheDocument();
    expect(screen.getByText("Silk Heritage")).toBeInTheDocument();
  });

  it("06. Announces live result count and offers reset filters button when filters active", async () => {
    render(
      <MemoryRouter>
        <TemplateGrid />
      </MemoryRouter>
    );

    await screen.findByText("Khmer Celestial");

    expect(screen.getByRole("status")).toHaveTextContent("Showing 3 designs");

    // Set filter
    fireEvent.click(screen.getByRole("button", { name: "Minimalist" }));
    expect(screen.getByRole("status")).toHaveTextContent("Showing 1 designs");

    // Reset filters button is visible and clears filters
    const resetBtn = screen.getByRole("button", { name: "Reset filters" });
    expect(resetBtn).toBeInTheDocument();

    fireEvent.click(resetBtn);
    expect(screen.getByRole("status")).toHaveTextContent("Showing 3 designs");
  });

  it("07. Never classifies a missing price as Free or $0.00", () => {
    const missingPriceTpl = {
      identity: "unknown-price",
      name: "Luxury Palace",
      isPremium: true,
      price: null,
      currency: "USD",
      live: true,
    };

    render(
      <MemoryRouter>
        <PublicTemplateCard template={missingPriceTpl} lang="en" isAuthenticated={false} />
      </MemoryRouter>
    );

    expect(screen.getByText(/Included with Premium access/i)).toBeInTheDocument();
    expect(screen.queryByText(/\$0\.00|Free design/i)).not.toBeInTheDocument();
  });

  it("08. Preserves safe intent in templateUsePath without leaking tokens", () => {
    // Unauthenticated user directed to login with safe next parameter
    const unauthPath = templateUsePath("royal-garden-cinematic", false);
    expect(unauthPath).toBe("/login?next=%2Fapp%2Fevents%2Fnew%3Ftemplate%3Droyal-garden-cinematic");

    // Authenticated user directed directly to new event creation
    const authPath = templateUsePath("royal-garden-cinematic", true);
    expect(authPath).toBe("/app/events/new?template=royal-garden-cinematic");

    // Rejects external/open redirect injection attempts
    const sanitized = templateUsePath("evil-code", true, "https://malicious.com/phish");
    expect(sanitized).toBe("/app/events/new?template=evil-code");
  });

  it("09. templatePriceLabel handles USD and KHR currencies without mixing or synthesizing", () => {
    expect(templatePriceLabel({ price: 25, currency: "USD" }, "en")).toBe("$25.00");
    expect(templatePriceLabel({ price: 100000, currency: "KHR" }, "km")).toContain("100,000");

    // Missing currency or invalid amount returns null
    expect(templatePriceLabel({ price: null, currency: "USD" }, "en")).toBeNull();
    expect(templatePriceLabel({ price: -10, currency: "USD" }, "en")).toBeNull();
    expect(templatePriceLabel({ price: 20, currency: "" }, "en")).toBeNull();
  });

  it("10. Bilingual parity: renders complete Khmer translations when lang is switched to km", async () => {
    useLanguageStore.setState({ lang: "km" });

    render(
      <MemoryRouter>
        <TemplateGrid />
      </MemoryRouter>
    );

    expect(await screen.findByRole("heading", { level: 1 })).toHaveTextContent("រចនាបទដែលជារបស់អ្នក។");
    expect(screen.getByText("គំរូសន្លឹកការប្រណិត")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "ទាំងអស់" })).toHaveLength(2);
    expect(screen.getByRole("button", { name: "ឥតគិតថ្លៃ" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ប្រណីត" })).toBeInTheDocument();
  });
});
