import { describe, expect, it } from "vitest";
import { formatRevenue } from "./format";

describe("revenue currency presentation", () => {
    it("shows mixed ledgers separately and never presents the invalid scalar as USD", () => {
        const result = formatRevenue({ totalRevenue: 40010, revenueComparable: false, revenueByCurrency: { USD: 10, KHR: 40000 } });
        expect(result).toContain("USD $10.00");
        expect(result).toContain("KHR");
        expect(result).toContain("40,000");
        expect(result).not.toContain("$40,010.00");
    });
    it("uses the actual single currency and preserves legacy USD responses", () => {
        expect(formatRevenue({ totalRevenue: 40000, currency: "KHR" })).toContain("KHR");
        expect(formatRevenue({ totalRevenue: 10 })).toBe("$10.00");
    });
    it("shows unavailable rather than a fabricated zero for missing mixed totals", () => {
        expect(formatRevenue({ revenueComparable: false, totalRevenue: null })).toBe("—");
    });
});
