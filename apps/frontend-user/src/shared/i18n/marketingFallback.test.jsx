import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { useBackendMessages } from "./useBackendMessages";
import { useLanguageStore } from "../../stores/useLanguageStore";
import { i18nService } from "../api/i18nService";
vi.mock("../api/i18nService", () => ({ i18nService: { messages: vi.fn() } }));
afterEach(cleanup);
it.each(["km", "en"])("home and venues keep readable copy during an i18n outage (%s)", async (lang) => {
  useLanguageStore.getState().setLang(lang);
  i18nService.messages.mockRejectedValue(new Error("Controlled unavailable fixture"));
  const home = renderHook(() => useBackendMessages("home"));
  const venues = renderHook(() => useBackendMessages("venues"));
  await waitFor(() => expect(i18nService.messages).toHaveBeenCalledWith("home", lang));
  expect(home.result.current.text("titlePlan")).not.toBe("titlePlan");
  expect(venues.result.current.text("searchPlaceholder")).not.toBe("searchPlaceholder");
});
