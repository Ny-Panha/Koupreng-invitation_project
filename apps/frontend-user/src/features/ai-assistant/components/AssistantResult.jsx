import { useLanguageStore } from "@/stores/useLanguageStore";
import { useEffect, useState } from "react";
import { IoCheckmark, IoCopyOutline, IoInformationCircleOutline, IoSparklesOutline } from "react-icons/io5";
import { FormField, LoadingButton, toast } from "@/shared/ui";
import { isVerifiedAiResponse } from "../model/responseSource";

export default function AssistantResult({
  response,
  onApply,
}) {
  const en = useLanguageStore(state => state.lang) === "en";
  const copy = (kh, english) => en ? english : kh;
  const [editedText, setEditedText] = useState(response?.generatedText || "");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setEditedText(response?.generatedText || "");
  }, [response]);

  if (!response) return null;

  const isLocalTemplate = !isVerifiedAiResponse(response);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedText);
      setCopied(true);
      toast.success("បានចម្លងអត្ថបទរួចរាល់ / Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("មិនអាចចម្លងអត្ថបទបានទេ");
    }
  };

  return (
    <article
      className="pe-ai-result"
    >
      <div className="pe-ai-result-header">
        <h3>
          <IoSparklesOutline aria-hidden="true" />
          <span>
            {isLocalTemplate
              ? copy("ពុម្ពអត្ថបទជំនួយ", "Local template draft")
              : copy("លទ្ធផលអត្ថបទ AI", "AI-generated result")}
          </span>
        </h3>
      </div>

      {isLocalTemplate && (
        <div role="status" className="pe-ai-source-notice">
          <IoInformationCircleOutline aria-hidden="true" />
          <span>{copy("អត្ថបទនេះបង្កើតពីពុម្ពក្នុង Koupreng។ មិនបានប្រើសេវា AI ខាងក្រៅទេ។", "This draft was created from Koupreng's built-in template. No external AI provider was used.")}</span>
        </div>
      )}

      {response.warnings?.length > 0 && (
        <div role="alert" className="pe-ai-warning-list">
          <strong>{copy("សេចក្ដីជូនដំណឹងសេវា", "Service notice")}</strong>
          <ul>
            {response.warnings.map((warning) => <li key={warning}>{warning}</li>)}
          </ul>
        </div>
      )}

      <FormField label={copy("កែសម្រួលអត្ថបទមុនប្រើប្រាស់", "Review and edit the draft")}>
        <textarea
          rows="6"
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
          style={{ fontFamily: "var(--font-sans)", lineHeight: "1.6" }}
        />
      </FormField>

      {response.suggestions?.length > 0 && (
        <div className="pe-ai-suggestions">
          <strong>
            <IoInformationCircleOutline aria-hidden="true" />
            <span>{copy("អនុសាសន៍បន្ថែម", "Suggestions")}</span>
          </strong>
          <ul style={{ margin: 0, paddingLeft: "1.25rem", fontSize: "0.875rem", color: "var(--brand-text)" }}>
            {response.suggestions.map((s, idx) => (
              <li key={idx}>{s}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="pe-ai-result-actions">
        <button type="button" className="pe-secondary-btn" onClick={handleCopy}>
          {copied ? <IoCheckmark aria-hidden="true" /> : <IoCopyOutline aria-hidden="true" />}
          <span>{copied ? copy("បានចម្លង", "Copied") : copy("ចម្លងអត្ថបទ", "Copy text")}</span>
        </button>
        {onApply && (
          <LoadingButton
            type="button"
            className="pe-primary-btn"
            onClick={() => onApply(editedText)}
          >
            {copy("យកទៅប្រើក្នុងធៀប", "Apply to invitation")}
          </LoadingButton>
        )}
      </div>
    </article>
  );
}
