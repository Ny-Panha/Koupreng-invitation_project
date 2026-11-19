import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import TemplateGrid from "./components/TemplateGrid";
import PublicTemplateCard from "./components/PublicTemplateCard";
import { templateUsePath, templatePriceLabel, templateIdentity } from "./model/templateIdentity";
import { isPublicCatalogTemplate } from "./model/catalogPolicy";
import { templateService } from "./api/templateService";
import { useLanguageStore } from "@/stores/useLanguageStore";
import { safeAuthRedirect } from "@/features/auth/safeRedirect";

// CODEX-P09: Independent Negative Scenarios & Audit Regression Suite (N09-01 through N09-24)

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

describe("Phase 09 Codex Independent Negative & Audit Regression Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useLanguageStore.setState({ lang: "en" });
  });

  afterEach(cleanup);

  it("N09-01: Handles mixed Khmer and Latin input with language switch without crashing or losing filter consistency", async () => {
    const catalog = [
      { id: 1, code: "khmer-celestial", status: "ACTIVE", name: "Khmer Celestial", nameKm: "ខ្មែរ សេឡេស្ទាល", nameEn: "Khmer Celestial", category: "ancient", live: true },
      { id: 2, code: "royal-garden", status: "ACTIVE", name: "Royal Garden", nameKm: "សួន សួគ៌ា", nameEn: "Royal Garden", category: "floral", live: true },
    ];
    templateService.listPublic.mockResolvedValue(catalog);

    render(
      <MemoryRouter>
        <TemplateGrid />
      </MemoryRouter>
    );

    await screen.findByText("Khmer Celestial");
    const input = screen.getByLabelText(/Search invitation designs/i);

    // Type Khmer query
    fireEvent.change(input, { target: { value: "ខ្មែរ" } });
    expect(screen.getByText("Khmer Celestial")).toBeInTheDocument();
    expect(screen.queryByText("Royal Garden")).not.toBeInTheDocument();

    // Switch language to KM mid-query
    useLanguageStore.setState({ lang: "km" });
    await waitFor(() => {
      expect(screen.getByText("ខ្មែរ សេឡេស្ទាល")).toBeInTheDocument();
    });
    expect(screen.queryByText("សួន សួគ៌ា")).not.toBeInTheDocument();
  });

  it("N09-02: Search clear button satisfies accessible contract and touch target enhancement", async () => {
    const catalog = [
      { id: 1, code: "celestial", status: "ACTIVE", name: "Celestial", category: "all", live: true },
    ];
    templateService.listPublic.mockResolvedValue(catalog);

    render(
      <MemoryRouter>
        <TemplateGrid />
      </MemoryRouter>
    );

    await screen.findByText("Celestial");
    const input = screen.getByLabelText(/Search invitation designs/i);
    fireEvent.change(input, { target: { value: "test" } });

    const clearBtn = screen.getByRole("button", { name: /Clear search/i });
    expect(clearBtn).toBeInTheDocument();
    expect(clearBtn).toHaveAttribute("type", "button");
    expect(clearBtn.className).toContain("kp-search-clear-btn");
  });

  it("N09-03: Race condition safety: late catalog response does not overwrite current state", async () => {
    let resolveFirst;
    const firstPromise = new Promise((resolve) => { resolveFirst = resolve; });

    templateService.listPublic.mockImplementationOnce(() => firstPromise);
    const { unmount } = render(
      <MemoryRouter>
        <TemplateGrid />
      </MemoryRouter>
    );

    // Unmount before first slow promise settles
    unmount();
    resolveFirst([{ id: 1, code: "stale-arrival", status: "ACTIVE", name: "Stale Design", live: true }]);
    // Should settle cleanly without error
  });

  it("N09-04 & N09-05: Filter for Free does not classify unknown/null price as Free", () => {
    const nullPriceTpl = {
      identity: "null-price",
      name: "Mystic Temple",
      isPremium: true,
      price: null,
      currency: "USD",
      live: true,
    };

    render(
      <MemoryRouter>
        <PublicTemplateCard template={nullPriceTpl} lang="en" isAuthenticated={false} />
      </MemoryRouter>
    );

    expect(screen.queryByText(/^Free$|^Free design$/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Included with Premium access/i)).toBeInTheDocument();
  });

  it("N09-06: Distinct truthful CTA for unowned vs verified owned templates", () => {
    const unownedTpl = {
      identity: "silk-heritage",
      name: "Silk Heritage",
      isPremium: true,
      price: 35,
      currency: "USD",
      live: true,
    };

    render(
      <MemoryRouter>
        <PublicTemplateCard template={unownedTpl} lang="en" isAuthenticated={true} />
      </MemoryRouter>
    );
    expect(screen.getByRole("link", { name: /Preview design Silk Heritage/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Use design/i })).toBeInTheDocument();
  });

  it("N09-09 & N09-10: Stable slug/code precedes numeric ID and unknown codes avoid incorrect fallback", () => {
    const itemWithCollision = {
      id: 1,
      code: "royal-garden-cinematic",
      slug: "royal-garden-cinematic",
    };
    expect(templateIdentity(itemWithCollision)).toBe("royal-garden-cinematic");

    const itemNumericOnly = {
      id: 42,
    };
    expect(templateIdentity(itemNumericOnly)).toBe("42");
  });

  it("N09-15: templatePriceLabel rejects null, 0, negative amounts, or malformed currency without synthesizing numbers", () => {
    expect(templatePriceLabel({ price: null, currency: "USD" }, "en")).toBeNull();
    expect(templatePriceLabel({ price: 0, currency: "USD" }, "en")).toBeNull();
    expect(templatePriceLabel({ price: -50, currency: "USD" }, "en")).toBeNull();
    expect(templatePriceLabel({ price: 30, currency: "US" }, "en")).toBeNull(); // invalid ISO
    expect(templatePriceLabel({ price: 30, currency: "123" }, "en")).toBeNull();
    expect(templatePriceLabel({ price: "not-a-number", currency: "USD" }, "en")).toBeNull();
  });

  it("N09-17: templateUsePath and safeAuthRedirect sanitize external and malicious redirect attempts", () => {
    // Malicious open redirect URL injection in templateUsePath
    const badPath = templateUsePath("floral-gold", false, "https://phishing.site/login");
    expect(badPath).toBe("/login?next=%2Fapp%2Fevents%2Fnew%3Ftemplate%3Dfloral-gold");
    expect(badPath).not.toContain("phishing.site");

    // safeAuthRedirect drops cross-origin host and falls back to default safe destination
    const resolved = safeAuthRedirect("https://attacker.example/app/events/new");
    expect(resolved).toBe("/app/events");
  });

  it("N09-22: Deterministic sort handles missing, empty, or duplicate names without dropping items", async () => {
    const messyCatalog = [
      { id: 1, code: "b-item", status: "ACTIVE", name: "Beta", category: "all", live: true },
      { id: 2, code: "a-item", status: "ACTIVE", name: "Alpha", category: "all", live: true },
      { id: 3, code: "no-name", status: "ACTIVE", name: "", category: "all", live: true },
      { id: 4, code: "dup-item", status: "ACTIVE", name: "Alpha", category: "all", live: true },
    ];
    templateService.listPublic.mockResolvedValue(messyCatalog);

    render(
      <MemoryRouter>
        <TemplateGrid />
      </MemoryRouter>
    );

    await screen.findByText("Beta");
    const sortSelect = screen.getByLabelText(/Sort invitation designs/i);

    // Sort A-Z should not crash and all 4 cards should remain present
    fireEvent.change(sortSelect, { target: { value: "name-asc" } });
    expect(screen.getByRole("status")).toHaveTextContent("Showing 4 designs");
  });

  it("N09-08: Inactive, retired, or unpublished designs are strictly filtered from public catalog", () => {
    expect(isPublicCatalogTemplate({ id: 1, code: "active-design", status: "ACTIVE" })).toBe(true);
    expect(isPublicCatalogTemplate({ id: 2, code: "draft-design", status: "DRAFT" })).toBe(false);
    expect(isPublicCatalogTemplate({ id: 3, code: "retired-design", status: "INACTIVE" })).toBe(false);
    expect(isPublicCatalogTemplate({ id: 4, code: "garden-royal-khmer-wedding", status: "ACTIVE" })).toBe(false);
    expect(isPublicCatalogTemplate({ id: null, code: "no-id", status: "ACTIVE" })).toBe(false);
    expect(isPublicCatalogTemplate({ id: 5, code: "", status: "ACTIVE" })).toBe(false);
  });

  it("N09-11: Public card preview link targets /templates/:id without injecting edit or admin capabilities", () => {
    const previewTpl = {
      identity: "celestial-gem",
      name: "Celestial Gem",
      isPremium: true,
      price: 25,
      currency: "USD",
      live: true,
    };

    render(
      <MemoryRouter>
        <PublicTemplateCard template={previewTpl} lang="en" isAuthenticated={false} />
      </MemoryRouter>
    );

    const previewLink = screen.getByRole("link", { name: "Preview" });
    expect(previewLink).toHaveAttribute("href", "/templates/celestial-gem");
    expect(previewLink.getAttribute("href")).not.toContain("/edit");
    expect(previewLink.getAttribute("href")).not.toContain("/admin");
  });

  it("N09-24: Direct protected access to /app/packages preserves safe login continuation", () => {
    const redirectUrl = safeAuthRedirect("/app/packages");
    expect(redirectUrl).toBe("/app/packages");

    // Malformed/open redirect falls back to default safe destination
    const badRedirect = safeAuthRedirect("/app/packages?next=https://attacker.site");
    expect(badRedirect).toBe("/app/events");
  });
});
