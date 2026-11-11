import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { useLanguageStore } from "@/stores/useLanguageStore";
import BudgetSummaryCards from "@/features/budget/components/BudgetSummaryCards";
import BudgetProgress from "@/features/budget/components/BudgetProgress";
import MarketingShell from "@/layouts/MarketingShell";
import HostShell from "@/layouts/HostShell";
import { usePrefersReducedMotion } from "@/shared/hooks/usePrefersReducedMotion";

afterEach(cleanup);

describe("Phase 13: Advanced Responsive Design, WCAG 2.2 Accessibility & Performance Quality", () => {
  beforeEach(() => {
    useLanguageStore.setState({ lang: "en" });
  });

  describe("WCAG 2.2 Skip Links & Landmark Navigation", () => {
    it("renders keyboard skip link in MarketingShell in English", () => {
      useLanguageStore.setState({ lang: "en" });
      render(
        <MemoryRouter initialEntries={["/"]}>
          <Routes>
            <Route path="/" element={<MarketingShell />}>
              <Route index element={<div>Marketing Landing Page</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      );

      const skipLink = screen.getByRole("link", { name: /skip to main content/i });
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute("href", "#marketing-content");
      expect(skipLink).toHaveClass("host-skip-link");
    });

    it("renders keyboard skip link in MarketingShell in pure Khmer", () => {
      useLanguageStore.setState({ lang: "km" });
      render(
        <MemoryRouter initialEntries={["/"]}>
          <Routes>
            <Route path="/" element={<MarketingShell />}>
              <Route index element={<div>Marketing Landing Page</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      );

      const skipLink = screen.getByRole("link", { name: "រំលងទៅមាតិកាចម្បង" });
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute("href", "#marketing-content");
      expect(skipLink.textContent).not.toContain("Skip");
    });

    it("renders keyboard skip link in HostShell targeting host-main-content", () => {
      useLanguageStore.setState({ lang: "en" });
      render(
        <MemoryRouter initialEntries={["/app/events/70"]}>
          <Routes>
            <Route path="/app/events/:id" element={<HostShell />}>
              <Route index element={<div>Host Overview</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      );

      const skipLink = screen.getByRole("link", { name: /skip to main content/i });
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute("href", "#host-main-content");
    });
  });

  describe("Bilingual Precision & Phase 12 Budget Summary Leak Resolution", () => {
    const mixedBudget = {
      totalBudget: 5000,
      currency: "USD",
      totalsComparable: false,
      totalEstimated: null,
      totalActual: null,
      remainingBudget: null,
      estimatedByCurrency: { USD: 3000, KHR: 4800000 },
      actualByCurrency: { USD: 3200, KHR: 5600000 },
      items: [
        { category: "VENUE", currency: "USD", actualCost: 3200 },
        { category: "FOOD", currency: "KHR", actualCost: 5600000 },
      ],
    };

    it("renders BudgetSummaryCards in English with Comparison unavailable for mixed budgets", () => {
      useLanguageStore.setState({ lang: "en" });
      const { container } = render(<BudgetSummaryCards budget={mixedBudget} />);

      expect(screen.getByText("Comparison unavailable")).toBeInTheDocument();
      expect(screen.getByText("Budget comparison")).toBeInTheDocument();
      expect(screen.getByText("Mixed currency")).toBeInTheDocument();
      expect(container.textContent).not.toContain("មិនអាចប្រៀបធៀបបាន");
    });

    it("renders BudgetSummaryCards in Khmer with មិនអាចប្រៀបធៀបបាន and ZERO English leak", () => {
      useLanguageStore.setState({ lang: "km" });
      const { container } = render(<BudgetSummaryCards budget={mixedBudget} />);

      expect(screen.getByText("មិនអាចប្រៀបធៀបបាន")).toBeInTheDocument();
      expect(screen.getByText("ការប្រៀបធៀបថវិកា")).toBeInTheDocument();
      expect(screen.getByText("រូបិយប័ណ្ណចម្រុះ")).toBeInTheDocument();
      expect(container.textContent).not.toContain("Comparison unavailable");
      expect(container.textContent).not.toContain("unavailable");
    });

    it("renders BudgetProgress in pure Khmer without English leak in comparison note", () => {
      useLanguageStore.setState({ lang: "km" });
      const { container } = render(<BudgetProgress budget={mixedBudget} />);

      expect(container.textContent).toContain("មិនអាចប្រៀបធៀបថវិកាបានទេ");
      expect(container.textContent).not.toContain("Comparison unavailable");
    });
  });

  describe("Chuon Nath Linguistic Compliance & Zero Forbidden Terms", () => {
    it("ensures no forbidden terms appear in BudgetSummaryCards or BudgetProgress", () => {
      useLanguageStore.setState({ lang: "km" });
      const budgetSample = {
        totalBudget: 2000,
        currency: "USD",
        totalsComparable: true,
        totalEstimated: 1500,
        totalActual: 1400,
        remainingBudget: 600,
        items: [{ category: "VENUE", currency: "USD", actualCost: 1400 }],
      };

      const { container: cardsContainer } = render(<BudgetSummaryCards budget={budgetSample} />);
      expect(cardsContainer.textContent).not.toContain("ធៀប");
      expect(cardsContainer.textContent).not.toContain("សំបុត្រអញ្ចើញ");

      const { container: progressContainer } = render(<BudgetProgress budget={budgetSample} />);
      expect(progressContainer.textContent).not.toContain("ធៀប");
      expect(progressContainer.textContent).not.toContain("សំបុត្រអញ្ចើញ");
    });
  });

  describe("Motion Accessibility: prefers-reduced-motion Hook", () => {
    it("detects prefers-reduced-motion correctly", () => {
      const originalMatchMedia = window.matchMedia;

      // Mock prefers-reduced-motion: true
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query.includes("prefers-reduced-motion: reduce"),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      function MotionConsumer() {
        const prefersReduced = usePrefersReducedMotion();
        return <div data-testid="motion-state">{prefersReduced ? "reduced" : "full"}</div>;
      }

      const { unmount } = render(<MotionConsumer />);
      expect(screen.getByTestId("motion-state").textContent).toBe("reduced");

      unmount();
      window.matchMedia = originalMatchMedia;
    });
  });
});
