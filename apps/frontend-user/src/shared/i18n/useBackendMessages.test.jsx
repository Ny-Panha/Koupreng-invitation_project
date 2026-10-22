import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { i18nService } from "../api/i18nService";
import { useLanguageStore } from "../../stores/useLanguageStore";
import { LOCAL_MESSAGES } from "./messagesDictionary";
import { useBackendMessages } from "./useBackendMessages";
vi.mock("../api/i18nService", () => ({ i18nService: { messages: vi.fn() } }));
beforeEach(() => { vi.clearAllMocks(); useLanguageStore.setState({ lang: "en" }); i18nService.messages.mockResolvedValue({ messages: {} }); });
afterEach(cleanup);
it.each(["en", "km"])("supplies meaningful profile copy when the %s namespace is missing", async lang => {
  useLanguageStore.setState({ lang });
  const { result } = renderHook(() => useBackendMessages("profile"));
  for (const key of Object.keys(LOCAL_MESSAGES.profile.en)) expect(result.current.text(key)).toBe(LOCAL_MESSAGES.profile[lang][key]);
  await waitFor(() => expect(i18nService.messages).toHaveBeenCalledWith("profile", lang));
});
it("uses local fallback for a raw key or a malformed server message", async () => {
  i18nService.messages.mockResolvedValue({ messages: { editTitle: "profile.editTitle", fullNameLabel: { invalid: true } } });
  const { result } = renderHook(() => useBackendMessages("profile"));
  await waitFor(() => expect(result.current.messages.editTitle).toBe("profile.editTitle"));
  expect(result.current.text("editTitle")).toBe("Your profile");
  expect(result.current.text("fullNameLabel")).toBe("Full name");
});
it("does not show stale English server copy while Khmer messages are loading", async () => {
  let resolveKhmer;
  i18nService.messages.mockImplementation((_, lang) => lang === "en" ? Promise.resolve({ messages: { fullNameLabel: "Server full name" } }) : new Promise(resolve => { resolveKhmer = resolve; }));
  const { result } = renderHook(() => useBackendMessages("profile"));
  await waitFor(() => expect(result.current.text("fullNameLabel")).toBe("Server full name"));
  act(() => useLanguageStore.setState({ lang: "km" }));
  expect(result.current.text("fullNameLabel")).toBe(LOCAL_MESSAGES.profile.km.fullNameLabel);
  await act(async () => resolveKhmer({ messages: {} }));
  expect(result.current.text("fullNameLabel")).toBe(LOCAL_MESSAGES.profile.km.fullNameLabel);
});
