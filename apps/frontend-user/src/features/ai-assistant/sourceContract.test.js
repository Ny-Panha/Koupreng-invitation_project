import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { aiAssistantService } from "./api/aiAssistantApi";
import { useAiAssistant } from "./hooks/useAiAssistant";
vi.mock("./api/aiAssistantApi", () => ({ aiAssistantService: { draftCopy: vi.fn() } }));
afterEach(() => vi.clearAllMocks());
const form = { coupleNames: "Known couple", eventDate: "2026-12-20", venueName: "Known venue", language: "English" };
describe("ARCH-001 assistant source honesty", () => {
  it.each([
    { enabled: false, source: "AI_PROVIDER", provider: "openai", generatedText: "Unexpected text" },
    { enabled: true, source: "UNEXPECTED_SOURCE", provider: "unknown", generatedText: "Unexpected text" },
    { enabled: true, provider: "local-template", generatedText: "Unexpected text" },
  ])("keeps disabled or unexpected output explicitly local (%j)", async (response) => {
    aiAssistantService.draftCopy.mockResolvedValue(response);
    const { result } = renderHook(useAiAssistant);
    await act(() => result.current.generate("copy", form));
    expect(result.current.response).toMatchObject({ enabled: false, source: "LOCAL_TEMPLATE" });
    expect(result.current.response.generatedText).not.toBe("Unexpected text");
  });
  it("preserves a validated provider result", async () => {
    aiAssistantService.draftCopy.mockResolvedValue({ enabled: true, source: "AI_PROVIDER", provider: "openai", generatedText: "Verified generated copy" });
    const { result } = renderHook(useAiAssistant);
    await act(() => result.current.generate("copy", form));
    expect(result.current.response).toMatchObject({ source: "AI_PROVIDER", generatedText: "Verified generated copy" });
  });
  it("keeps a usable, labeled local draft during a transport outage", async () => {
    aiAssistantService.draftCopy.mockRejectedValue(new Error("Service unavailable"));
    const { result } = renderHook(useAiAssistant);
    await act(() => result.current.generate("copy", form));
    expect(result.current.response).toMatchObject({ enabled: false, source: "LOCAL_TEMPLATE" });
    expect(result.current.response.generatedText).toContain("Known couple");
    expect(result.current.error).toContain("Service unavailable");
  });
});
