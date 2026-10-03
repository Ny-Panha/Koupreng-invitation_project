import { useState } from "react";
import { aiAssistantService } from "../api/aiAssistantApi";
import { isVerifiedAiResponse } from "../model/responseSource";

function buildLocalTemplateText(action, request) {
  const isKhmer = (request.language || "Khmer").toLowerCase().includes("khmer");
  const couple = request.coupleNames || request.hostName || "សាមីខ្លួន";
  const date = request.eventDate || "ថ្ងៃមង្គល";
  const venue = request.venueName || "រោងពិធី";
  const notes = request.notes || "";

  if (isKhmer) {
    switch (action) {
      case "story":
        return `យើងខ្ញុំទាំងពីរ (${couple}) បានជួបគ្នានិងឆ្លងកាត់ការចងចាំដ៏ល្អប្រសើរបំផុត។ នៅថ្ងៃទី ${date} ខាងមុខនេះ យើងខ្ញុំមានសេចក្តីរីករាយយ៉ាងក្រៃលែងក្នុងការអញ្ជើញលោកអ្នកចូលរួមក្នុងថ្ងៃមង្គលការរបស់យើងខ្ញុំនៅ ${venue}។ ${notes}`;
      case "formalText":
        return `សិរីសួស្តី អាពាហ៍ពិពាហ៍\nសូមគោរពអញ្ជើញ លោក/លោកស្រី ចូលរួមជាអធិបតី និងប្រសិទ្ធពរជ័យ ក្នុងពិធីរៀបអាពាហ៍ពិពាហ៍ រវាង (${couple}) ដែលនឹងប្រព្រឹត្តទៅនៅ ${venue} នា ${date}។ ${notes}`;
      case "translate":
        return `Dear Guests, You are cordially invited to celebrate the Wedding Ceremony of (${couple}) at ${venue} on ${date}. ${notes}`;
      case "timeline":
        return `កម្មវិធីសង្ខេប៖\n- 07:00 AM: ពិធីហែជំនូន\n- 09:00 AM: ពិធីកាត់សក់បង្កក់សិរី\n- 05:00 PM: ពិធីពិសាភោជនាហារ និងបាញ់កាំជ្រួចនៅ ${venue}`;
      case "copy":
      default:
        return `យើងខ្ញុំសូមគោរពអញ្ជើញ ឯកឧត្តម លោកជំទាវ លោក លោកស្រី អញ្ជើញចូលរួមពិសាភោជនាហារ ក្នុងពិធីមង្គលការ (${couple}) នៅ ${venue} នា ${date}។`;
    }
  } else {
    switch (action) {
      case "story":
        return `We (${couple}) are thrilled to invite you to share in our special day as we unite in marriage. Join us on ${date} at ${venue}. ${notes}`;
      case "formalText":
        return `Together with our families, (${couple}) invite you to celebrate their wedding on ${date} at ${venue}. ${notes}`;
      case "translate":
        return `សូមគោរពអញ្ជើញភ្ញៀវកិត្តិយសទាំងអស់ ចូលរួមក្នុងពិធីមង្គលការរបស់ (${couple}) នៅ ${venue} នា ${date}។ ${notes}`;
      case "timeline":
        return `Event Schedule:\n- 07:00 AM: Morning Ceremony & Reception\n- 09:00 AM: Hair Cutting Ceremony\n- 05:00 PM: Evening Celebration at ${venue}`;
      case "copy":
      default:
        return `You are cordially invited to celebrate the wedding of (${couple}) on ${date} at ${venue}.`;
    }
  }
}

export function useAiAssistant() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [response, setResponse] = useState(null);

  const generate = async (action, request) => {
    setLoading(true);
    setError("");
    setResponse(null);

    try {
      let apiResult;
      switch (action) {
        case "story":
          apiResult = await aiAssistantService.generateStory(request);
          break;
        case "formalText":
          apiResult = await aiAssistantService.formalText(request);
          break;
        case "translate":
          apiResult = await aiAssistantService.translate(request);
          break;
        case "timeline":
          apiResult = await aiAssistantService.timelineSuggestion(request);
          break;
        case "copy":
        default:
          apiResult = await aiAssistantService.draftCopy(request);
          break;
      }

      let generatedText = apiResult?.generatedText;
      const usedLocalTemplate = !isVerifiedAiResponse(apiResult);
      if (usedLocalTemplate) {
        generatedText = buildLocalTemplateText(action, request);
      }

      const finalResponse = {
        ...apiResult,
        enabled: !usedLocalTemplate,
        generatedText,
        source: usedLocalTemplate ? "LOCAL_TEMPLATE" : "AI_PROVIDER",
      };

      setResponse(finalResponse);
      return finalResponse;
    } catch (err) {
      setError(err?.message || "Could not generate text suggestions");
      const fallback = { enabled: false, source: "LOCAL_TEMPLATE", provider: "local-template",
        generatedText: buildLocalTemplateText(action, request), suggestions: [],
        warnings: ["The AI service is unavailable. This editable draft uses the built-in local template."] };
      setResponse(fallback);
      return fallback;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    response,
    generate,
  };
}
