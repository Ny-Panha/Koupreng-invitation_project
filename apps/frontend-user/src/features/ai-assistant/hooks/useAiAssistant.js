import { useState } from "react";
import { feedback } from '@/shared/feedback/feedback';
import { useEventWorkspace } from '@/features/events/workspace/EventContext';
import { aiAssistantService } from "../api/aiAssistantApi";
import { isVerifiedAiResponse } from "../model/responseSource";

function buildLocalTemplateText(action, request) {
  const isKhmer = (request.language || "Khmer").toLowerCase().includes("khmer");
  const couple = request.coupleNames || request.hostName || "សាមីខ្លួន";
  const date = request.eventDate || "ថ្ងៃមង្គល";
  const venue = request.venueName || "រោងពិធី";
  const notes = request.notes || "";
  const eventType = (request.eventType || "WEDDING").toUpperCase();

  const eventLabelKh = {
    WEDDING: "ពិធីរៀបអាពាហ៍ពិពាហ៍",
    ENGAGEMENT: "ពិធីភ្ជាប់ពាក្យ",
    BIRTHDAY: "ពិធីខួបកំណើត",
    ANNIVERSARY: "ពិធីខួបអនុស្សាវរីយ៍",
    CORPORATE: "កម្មវិធីជួបជុំក្រុមហ៊ុន",
    OTHER: "កម្មវិធីពិសេស",
  }[eventType] || "ពិធីមង្គល";

  const eventLabelEn = {
    WEDDING: "wedding ceremony",
    ENGAGEMENT: "engagement celebration",
    BIRTHDAY: "birthday celebration",
    ANNIVERSARY: "anniversary celebration",
    CORPORATE: "corporate event",
    OTHER: "special celebration",
  }[eventType] || "celebration";

  if (isKhmer) {
    switch (action) {
      case "story":
        return `យើងខ្ញុំ (${couple}) បានឆ្លងកាត់ការចងចាំដ៏ល្អប្រសើរបំផុត។ នៅថ្ងៃទី ${date} ខាងមុខនេះ យើងខ្ញុំមានសេចក្តីរីករាយយ៉ាងក្រៃលែងក្នុងការអញ្ជើញលោកអ្នកចូលរួមក្នុង${eventLabelKh}របស់យើងខ្ញុំនៅ ${venue}។ ${notes}`;
      case "formalText":
        return `សិរីសួស្តី\nសូមគោរពអញ្ជើញ លោក/លោកស្រី ចូលរួមជាអធិបតី និងប្រសិទ្ធពរជ័យ ក្នុង${eventLabelKh} (${couple}) ដែលនឹងប្រព្រឹត្តទៅនៅ ${venue} នា ${date}។ ${notes}`;
      case "translate":
        return `Dear Guests, You are cordially invited to celebrate the ${eventLabelEn} of (${couple}) at ${venue} on ${date}. ${notes}`;
      case "timeline":
        return eventType === "BIRTHDAY"
          ? `កម្មវិធីសង្ខេប៖\n- 05:30 PM: ទទួលភ្ញៀវកិត្តិយស\n- 06:30 PM: ពិធីផ្លុំទៀនខួបកំណើត\n- 07:00 PM: ពិសាភោជនាហារនៅ ${venue}`
          : eventType === "CORPORATE"
          ? `កម្មវិធីសង្ខេប៖\n- 08:30 AM: ចុះឈ្មោះ និងទទួលកាហ្វេ\n- 09:30 AM: សុន្ទរកថាបើកកម្មវិធី\n- 12:00 PM: អាហារថ្ងៃត្រង់នៅ ${venue}`
          : `កម្មវិធីសង្ខេប៖\n- 07:00 AM: ពិធីហែជំនូន\n- 09:00 AM: ពិធីកាត់សក់បង្កក់សិរី\n- 05:00 PM: ពិធីពិសាភោជនាហារ និងបាញ់កាំជ្រួចនៅ ${venue}`;
      case "copy":
      default:
        return `យើងខ្ញុំសូមគោរពអញ្ជើញ ឯកឧត្តម លោកជំទាវ លោក លោកស្រី អញ្ជើញចូលរួម${eventLabelKh} (${couple}) នៅ ${venue} នា ${date}។`;
    }
  } else {
    switch (action) {
      case "story":
        return `We (${couple}) are thrilled to invite you to share in our special day as we gather for our ${eventLabelEn}. Join us on ${date} at ${venue}. ${notes}`;
      case "formalText":
        return `Together with our families, (${couple}) invite you to celebrate their ${eventLabelEn} on ${date} at ${venue}. ${notes}`;
      case "translate":
        return `សូមគោរពអញ្ជើញភ្ញៀវកិត្តិយសទាំងអស់ ចូលរួមក្នុង${eventLabelKh}របស់ (${couple}) នៅ ${venue} នា ${date}។ ${notes}`;
      case "timeline":
        return eventType === "BIRTHDAY"
          ? `Event Schedule:\n- 05:30 PM: Guest Arrival\n- 06:30 PM: Cake Cutting Ceremony\n- 07:00 PM: Dinner Reception at ${venue}`
          : eventType === "CORPORATE"
          ? `Event Schedule:\n- 08:30 AM: Registration & Welcome\n- 09:30 AM: Keynote & Presentation\n- 12:00 PM: Networking Lunch at ${venue}`
          : `Event Schedule:\n- 07:00 AM: Morning Ceremony & Reception\n- 09:00 AM: Hair Cutting Ceremony\n- 05:00 PM: Evening Celebration at ${venue}`;
      case "copy":
      default:
        return `You are cordially invited to celebrate the ${eventLabelEn} of (${couple}) on ${date} at ${venue}.`;
    }
  }
}

export function useAiAssistant() {
  const event = useEventWorkspace();
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
      if ([401,403].includes(err?.status)) feedback.explain(err, { event, feature: 'AI_ASSISTANT', permission: 'MANAGE_INVITATION' });
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
