import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import AssistantComposer from "./components/AssistantComposer";
import AssistantResult from "./components/AssistantResult";
import { toInvitationStoryUpdate } from "./model/invitationContent";
afterEach(cleanup);

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
      
      const submitBtn = screen.getByRole("button", { name: /Generate Content/ });
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

      const applyBtn = screen.getByText("យកទៅប្រើក្នុងធៀប / Apply to Invitation");
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
});
