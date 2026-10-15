import { describe, expect, it } from "vitest";
import { addDays, reportPreset, reportValue, safeTsv } from "./reportModel";

describe("report presentation contract", () => {
  it("uses Phnom Penh calendar days and exclusive end dates across year boundaries", () => {
    expect(reportPreset("today", new Date("2025-12-31T18:00:00Z"))).toEqual({
      from: "2026-01-01",
      to: "2026-01-02",
    });
    expect(
      reportPreset("previousMonth", new Date("2026-01-15T00:00:00Z")),
    ).toEqual({ from: "2025-12-01", to: "2026-01-01" });
    expect(addDays("invalid", 1)).toBe("");
  });
  it("distinguishes null, zero and rates without fabricating missing amounts", () => {
    expect(reportValue(null, { type: "MONEY" }, "en")).toBe("Unavailable");
    expect(reportValue(0, { type: "MONEY" }, "en", { currency: "KHR" })).toBe(
      "0 KHR",
    );
    expect(reportValue(0.5, { type: "PERCENT" }, "en")).toBe("50%");
    expect(reportValue(1791997200, { type: "DATETIME" }, "en")).toContain(
      "15 Oct 2026",
    );
  });
  it("protects TSV formulas and cannot introduce extra clipboard rows or columns", () => {
    expect(safeTsv("\u200B\t=1+1\r\nnext")).toBe("'\u200B =1+1  next");
    expect(safeTsv(null)).toBe("");
  });
});
