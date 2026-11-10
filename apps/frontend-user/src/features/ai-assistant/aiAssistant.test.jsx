import { cleanup, render, screen, fireEvent, renderHook, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useLanguageStore } from '@/stores/useLanguageStore';
import AssistantComposer from "./components/AssistantComposer";
import AssistantResult from "./components/AssistantResult";
import { useAiAssistant } from "./hooks/useAiAssistant";
import { toInvitationStoryUpdate } from "./model/invitationContent";
afterEach(cleanup);
beforeEach(() => useLanguageStore.setState({lang:'en'}));

vi.mock("@/features/invitations/api/invitationApi", () => ({
  invitationService: {
    get: vi.fn().mockResolvedValue({
      id: 1,
      title: "Dara & Sophea Wedding",
      groomName: "Dara",
      brideName: "Sophea",
      venueName: "Himawari Hotel",
      weddingDate: "2026-03-15",
    }),
    update: vi.fn().mockResolvedValue({ id: 1 }),
  },
}));

describe("AI Invitation Assistant Module", () => {
  describe("AssistantComposer", () => {
    it("renders input fields and submits form data", () => {
      const setForm = vi.fn();
      const handleSubmit = vi.fn((e) => e.preventDefault());

      render(
        <AssistantComposer
          form={{
            action: "copy",
            coupleNames: "Dara & Sophea",
            hostName: "Host",
            eventDate: "2026-03-15",
            venueName: "Himawari",
            language: "Khmer",
            tone: "formal",
            notes: "",
          }}
          setForm={setForm}
          loading={false}
          onSubmit={handleSubmit}
        />
      );

      expect(screen.getByDisplayValue("Dara & Sophea")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Himawari")).toBeInTheDocument();
      
      const submitBtn = screen.getByRole("button", { name: "Generate content" });
      fireEvent.click(submitBtn);

      expect(handleSubmit).toHaveBeenCalled();
    });
  });

  describe("AssistantResult", () => {
    it("renders generated text and handles apply callback", async () => {
      const handleApply = vi.fn();
      const sampleResponse = {
        enabled: true,
        source: "AI_PROVIDER",
        provider: "openai",
        generatedText: "សិរីសួស្តី អាពាហ៍ពិពាហ៍ Dara & Sophea",
        suggestions: ["Keep short for mobile"],
      };

      render(<AssistantResult response={sampleResponse} onApply={handleApply} />);

      expect(screen.getByDisplayValue("សិរីសួស្តី អាពាហ៍ពិពាហ៍ Dara & Sophea")).toBeInTheDocument();
      expect(screen.getByText("Keep short for mobile")).toBeInTheDocument();

      const applyBtn = screen.getByRole('button', {name:'Apply to invitation'});
      fireEvent.click(applyBtn);

      expect(handleApply).toHaveBeenCalledWith("សិរីសួស្តី អាពាហ៍ពិពាហ៍ Dara & Sophea");
    });

    it("discloses local fallback copy and backend warnings", () => {
      render(
        <AssistantResult
          response={{
            enabled: false,
            source: "LOCAL_TEMPLATE",
            generatedText: "Built-in draft",
            warnings: ["AI provider adapter is not implemented yet."],
          }}
        />,
      );

      expect(screen.getByText(/Local template draft/)).toBeInTheDocument();
      expect(screen.getByText(/No external AI provider was used/)).toBeInTheDocument();
      expect(screen.getByText("AI provider adapter is not implemented yet.")).toBeInTheDocument();
    });
  });

  describe("invitation update contract", () => {
    it("maps applied copy to storyText without leaking response-only fields", () => {
      expect(toInvitationStoryUpdate({
        id: 42,
        title: "Dara & Sophea",
        eventType: "WEDDING",
        storyText: "Old story",
        status: "DRAFT",
        slug: "dara-sophea",
      }, "  New story  ")).toEqual({
        title: "Dara & Sophea",
        eventType: "WEDDING",
        storyText: "New story",
      });
    });
  });

  describe("U-13 Event type contextual generation", () => {
    it("renders all 6 supported event types in AssistantComposer", () => {
      render(
        <AssistantComposer
          form={{
            action: "copy",
            eventType: "BIRTHDAY",
            coupleNames: "Visal",
            hostName: "Sokha",
            eventDate: "2026-03-15",
            venueName: "Himawari",
            language: "Khmer",
            tone: "formal",
            notes: "",
          }}
          setForm={vi.fn()}
          loading={false}
          onSubmit={vi.fn()}
        />
      );

      expect(screen.getByRole("combobox", { name: /Event type|ប្រភេទកម្មវិធី/ })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: /Birthday/i })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: /Corporate/i })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: /Engagement/i })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: /Anniversary/i })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: /Other/i })).toBeInTheDocument();
    });

    it("generates contextual non-wedding copy for BIRTHDAY", async () => {
      const { result } = renderHook(() => useAiAssistant());
      let res;
      await act(async () => {
        res = await result.current.generate("copy", {
          action: "copy",
          eventType: "BIRTHDAY",
          coupleNames: "Visal",
          language: "English",
          eventDate: "2026-12-25",
          venueName: "Rosewood",
        });
      });

      expect(res.generatedText).toContain("birthday celebration");
      expect(res.generatedText).not.toContain("wedding");
    });

    it("generates contextual corporate schedule for CORPORATE", async () => {
      const { result } = renderHook(() => useAiAssistant());
      let res;
      await act(async () => {
        res = await result.current.generate("timeline", {
          action: "timeline",
          eventType: "CORPORATE",
          coupleNames: "Tech Summit",
          language: "English",
          eventDate: "2026-11-20",
          venueName: "Sofitel",
        });
      });

      expect(res.generatedText).toContain("Registration & Welcome");
      expect(res.generatedText).not.toContain("Hair Cutting Ceremony");
    });
  });
});
