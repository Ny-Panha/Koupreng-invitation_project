import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import TemplateGrid from "./TemplateGrid";
import { usePublicTemplateCatalog } from "../hooks/usePublicTemplateCatalog";

vi.mock("../hooks/usePublicTemplateCatalog", () => ({
  usePublicTemplateCatalog: vi.fn(),
}));

const mockTemplates = [
  {
    id: 1,
    identity: "emerald-luxe",
    name: "Emerald Luxe Wedding",
    category: "luxury",
    description: "Royal emerald and gold ceremonial invitation",
    image: "/templates/emerald-luxe.png",
    price: 0,
    currency: "USD",
    isPremium: false,
    live: true,
    languageMode: "KH",
  },
  {
    id: 2,
    identity: "royal-garden-cinematic",
    name: "Royal Garden Cinematic",
    category: "luxury",
    description: "Cinematic 3D unsealing experience",
    image: "/templates/royal-garden.png",
    price: 15,
    currency: "USD",
    isPremium: true,
    live: true,
    languageMode: "BOTH",
  },
  {
    id: 3,
    identity: "minimalist-chic",
    name: "Minimalist Chic",
    category: "minimalist",
    description: "Clean modern typography",
    image: "/templates/minimalist.png",
    price: 0,
    currency: "USD",
    isPremium: false,
    live: true,
    languageMode: "EN",
  },
  {
    id: 4,
    identity: "demo-heritage",
    name: "Heritage Archive Demo",
    category: "ancient",
    description: "Historical demonstration",
    image: "/templates/heritage.png",
    price: null,
    currency: "USD",
    isPremium: false,
    live: false,
    languageMode: "KH",
  },
];

describe("Workstream C — Phase 06 Premium Template Marketplace Modernization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usePublicTemplateCatalog.mockReturnValue({
      items: mockTemplates,
      status: "ready",
      retry: vi.fn(),
    });
  });

  afterEach(cleanup);

  it("renders price preference filters (All, Free, Premium)", () => {
    render(
      <MemoryRouter>
        <TemplateGrid />
      </MemoryRouter>
    );

    const priceGroup = screen.getByRole("group", { name: /Price filter|តម្លៃគំរូ/ });
    expect(priceGroup).toBeInTheDocument();
    expect(within(priceGroup).getByRole("button", { name: /^All$|^ទាំងអស់$/ })).toBeInTheDocument();
    expect(within(priceGroup).getByRole("button", { name: /^Free$|^ឥតគិតថ្លៃ$/ })).toBeInTheDocument();
    expect(within(priceGroup).getByRole("button", { name: /^Premium$|^ប្រណីត$/ })).toBeInTheDocument();
  });

  it("filters templates by Free price preference", () => {
    render(
      <MemoryRouter>
        <TemplateGrid />
      </MemoryRouter>
    );

    const freePill = screen.getByRole("button", { name: /^Free$|^ឥតគិតថ្លៃ$/ });
    fireEvent.click(freePill);

    // Free templates should be displayed
    expect(screen.getByText("Emerald Luxe Wedding")).toBeInTheDocument();
    expect(screen.getByText("Minimalist Chic")).toBeInTheDocument();

    // Premium template should be filtered out
    expect(screen.queryByText("Royal Garden Cinematic")).not.toBeInTheDocument();
  });

  it("filters templates by Premium price preference", () => {
    render(
      <MemoryRouter>
        <TemplateGrid />
      </MemoryRouter>
    );

    const premiumPill = screen.getByRole("button", { name: /^Premium$|^ប្រណីត$/ });
    fireEvent.click(premiumPill);

    // Premium template should be displayed
    expect(screen.getByText("Royal Garden Cinematic")).toBeInTheDocument();

    // Free templates should be filtered out
    expect(screen.queryByText("Emerald Luxe Wedding")).not.toBeInTheDocument();
    expect(screen.queryByText("Minimalist Chic")).not.toBeInTheDocument();
  });

  it("filters templates by text search query", () => {
    render(
      <MemoryRouter>
        <TemplateGrid />
      </MemoryRouter>
    );

    const searchInput = screen.getByRole("searchbox");
    fireEvent.change(searchInput, { target: { value: "Minimalist" } });

    expect(screen.getByText("Minimalist Chic")).toBeInTheDocument();
    expect(screen.queryByText("Emerald Luxe Wedding")).not.toBeInTheDocument();
    expect(screen.queryByText("Royal Garden Cinematic")).not.toBeInTheDocument();
  });

  it("resets category, price, and search when clicking Clear filters in empty state", () => {
    render(
      <MemoryRouter>
        <TemplateGrid />
      </MemoryRouter>
    );

    const searchInput = screen.getByRole("searchbox");
    fireEvent.change(searchInput, { target: { value: "NonExistentDesign999" } });

    const clearBtn = screen.getByRole("button", { name: /Clear filters|សម្អាតតម្រង/ });
    expect(clearBtn).toBeInTheDocument();

    fireEvent.click(clearBtn);

    // Templates should be visible again
    expect(screen.getByText("Emerald Luxe Wedding")).toBeInTheDocument();
    expect(screen.getByText("Royal Garden Cinematic")).toBeInTheDocument();
  });
});
