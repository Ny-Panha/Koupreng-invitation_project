import { afterEach, describe, expect, it, vi } from "vitest";
import { localDateString } from "./localDate";
import { toGiftPayload } from "@/features/gifts/hooks/useGifts";
import { toExpensePayload } from "@/features/expenses/hooks/useExpenses";

describe("FE-013 local ledger calendar dates", () => {
  afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });

  it("uses the local wedding day just after midnight, even when UTC is still the previous day", () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date(2026, 9, 2, 1, 30));
    vi.spyOn(Date.prototype, "toISOString").mockReturnValue("2026-10-01T18:30:00.000Z");
    expect(localDateString()).toBe("2026-10-02");
    expect(toGiftPayload({ name: "Known guest", amount: "20", currency: "USD", method: "Cash", date: "", note: "" }).date).toBe("2026-10-02");
    expect(toExpensePayload({ name: "Venue", category: "Venue", budget: "20", amount: "20", date: "", note: "" }).date).toBe("2026-10-02");
  });

  it("preserves an explicitly selected ledger date", () => {
    expect(toGiftPayload({ name: "Known guest", amount: "20", currency: "USD", method: "Cash", date: "2026-12-20", note: "" }).date).toBe("2026-12-20");
  });
});
