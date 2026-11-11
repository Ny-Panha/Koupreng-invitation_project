import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useLanguageStore } from "@/stores/useLanguageStore";
import { BUDGET_CATEGORIES, budgetCategoryLabel } from "@/features/budget/budgetCategories";
import BudgetItemForm from "@/features/budget/components/BudgetItemForm";
import { AI_ACTIONS, TONE_OPTIONS, LANGUAGE_OPTIONS } from "@/features/ai-assistant/model/aiAssistantConstants";
import { LOCAL_MESSAGES } from "@/shared/i18n/messagesDictionary";
import { PRIMARY_EVENT_LINKS, EVENT_LINK_GROUPS } from "@/features/events/workspace/eventNavigationModel";
import { featureNames } from "@/shared/access/accessCopy";
import { buildFinancialReport } from "@/features/reports/model/financialReport";

afterEach(cleanup);

describe("Phase 12 Modernization & Data Integrity Suite", () => {
  beforeEach(() => {
    useLanguageStore.setState({ lang: "en" });
  });

  describe("Budget Categories & Pure Localization", () => {
    it("provides pure Khmer and English labels without slash combination", () => {
      BUDGET_CATEGORIES.forEach((cat) => {
        expect(cat.labelKm).toBeDefined();
        expect(cat.labelEn).toBeDefined();
        expect(cat.labelKm).not.toContain("/");
        expect(cat.labelEn).not.toContain("/");
        expect(cat.labelKm).not.toContain("ធៀប");
      });

      expect(budgetCategoryLabel("FOOD", false)).toBe("ម្ហូបអាហារ និងភេសជ្ជៈ");
      expect(budgetCategoryLabel("FOOD", true)).toBe("Food & Catering");
      expect(budgetCategoryLabel("DECORATION", false)).toBe("តុបតែង និងផ្កា");
      expect(budgetCategoryLabel("DECORATION", true)).toBe("Decoration & Flowers");
    });

    it("renders BudgetItemForm in English when active language is English", () => {
      useLanguageStore.setState({ lang: "en" });
      render(<BudgetItemForm onSubmit={() => {}} saving={false} />);

      expect(screen.getByText("Category")).toBeInTheDocument();
      expect(screen.getByText("Currency")).toBeInTheDocument();
      expect(screen.getByText("Item name")).toBeInTheDocument();
      expect(screen.getByText("Estimated cost")).toBeInTheDocument();
      expect(screen.getByText("Actual cost")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("e.g. Venue deposit")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Add item" })).toBeInTheDocument();
    });

    it("renders BudgetItemForm in pure Khmer when active language is Khmer", () => {
      useLanguageStore.setState({ lang: "km" });
      render(<BudgetItemForm onSubmit={() => {}} saving={false} />);

      expect(screen.getByText("ប្រភេទចំណាយ")).toBeInTheDocument();
      expect(screen.getByText("រូបិយប័ណ្ណ")).toBeInTheDocument();
      expect(screen.getByText("ឈ្មោះមុខទំនិញ")).toBeInTheDocument();
      expect(screen.getByText("ប៉ាន់ប្រមាណ")).toBeInTheDocument();
      expect(screen.getByText("ចំណាយជាក់ស្តែង")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("ឧ. ប្រាក់កក់ទីតាំង")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "បន្ថែមមុខទំនិញ" })).toBeInTheDocument();
    });
  });

  describe("AI Assistant Constants & Linguistic Invariants", () => {
    it("does not contain the forbidden term ធៀប in any action or option", () => {
      AI_ACTIONS.forEach((action) => {
        expect(action.label).not.toContain("ធៀប");
        expect(action.labelKm).not.toContain("ធៀប");
        expect(action.labelKm).not.toContain("សំបុត្រអញ្ចើញ");
      });
      expect(AI_ACTIONS.find((a) => a.value === "copy").labelKm).toBe("ខ្លឹមសារសំបុត្រអញ្ជើញ");
    });

    it("contains clean tone and language definitions", () => {
      TONE_OPTIONS.forEach((tone) => {
        expect(tone.labelKm).toBeDefined();
        expect(tone.labelEn).toBeDefined();
      });
      LANGUAGE_OPTIONS.forEach((lang) => {
        expect(lang.labelKm).toBeDefined();
        expect(lang.labelEn).toBeDefined();
      });
    });
  });

  describe("Project Dictionary Linguistic Compliance", () => {
    it("ensures messagesDictionary has zero forbidden terms", () => {
      const dictionaryString = JSON.stringify(LOCAL_MESSAGES);
      expect(dictionaryString).not.toContain("ធៀប");
      expect(dictionaryString).not.toContain("សំបុត្រអញ្ចើញ");
    });

    it("ensures workspace navigation model has zero forbidden terms and uses Chuon Nath standard", () => {
      const navString = JSON.stringify({ PRIMARY_EVENT_LINKS, EVENT_LINK_GROUPS });
      expect(navString).not.toContain("ធៀប");
      expect(navString).not.toContain("សំបុត្រអញ្ចើញ");
      expect(navString).toContain("សំបុត្រអញ្ជើញ");
    });

    it("ensures access entitlement feature names has zero forbidden terms", () => {
      const accessString = JSON.stringify(featureNames);
      expect(accessString).not.toContain("ធៀប");
      expect(accessString).not.toContain("សំបុត្រអញ្ចើញ");
      expect(featureNames.QR_INVITATIONS[0]).toBe("QR សំបុត្រអញ្ជើញ");
    });
  });

  describe("Financial Report Strict Currency Separation", () => {
    it("keeps USD and KHR totals strictly separate without currency cross-contamination", () => {
      const report = buildFinancialReport({
        gifts: [
          { amount: 50, currency: "USD", method: "ABA" },
          { amount: 100000, currency: "KHR", method: "Cash" },
        ],
        expenses: [
          { actualCost: 30, currency: "USD" },
          { actualCost: 40000, currency: "KHR" },
        ],
        guests: [],
        rsvps: [],
        checkIns: [],
      });

      expect(report.totalIncome).toEqual({ USD: 50, KHR: 100000 });
      expect(report.totalExpenses).toEqual({ USD: 30, KHR: 40000 });
      expect(report.netBalance).toEqual({ USD: 20, KHR: 60000 });
      expect(typeof report.totalIncome.USD).toBe("number");
      expect(typeof report.totalIncome.KHR).toBe("number");
      // Must never combine them into a single currency sum
      expect(report.totalIncome).not.toHaveProperty("total");
    });
  });
});
