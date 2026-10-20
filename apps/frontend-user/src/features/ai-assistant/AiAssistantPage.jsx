import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { IoArrowBackOutline, IoSparklesOutline } from "react-icons/io5";
import { ErrorState, SkeletonCard, toast } from "@/shared/ui";
import { invitationService } from "@/features/invitations/api/invitationApi";
import { useAiAssistant } from "./hooks/useAiAssistant";
import AssistantComposer from "./components/AssistantComposer";
import AssistantResult from "./components/AssistantResult";
import { toInvitationStoryUpdate } from "./model/invitationContent";
import "./AiAssistantPage.css";

export default function AiAssistantPage() {
  const { eventId, id = eventId, invitationId: paramInvId } = useParams();
  const invitationId = id || paramInvId;
  const navigate = useNavigate();

  const [invitation, setInvitation] = useState(null);
  const [invLoading, setInvLoading] = useState(true);
  const [invError, setInvError] = useState("");

  const { loading, error: aiError, response, generate } = useAiAssistant();

  const [form, setForm] = useState({
    action: "copy",
    coupleNames: "",
    hostName: "",
    eventDate: "",
    venueName: "",
    language: "Khmer",
    tone: "formal",
    notes: "",
  });

  useEffect(() => {
    let active = true;
    if (!invitationId) {
      setInvLoading(false);
      return;
    }

    setInvLoading(true);
    setInvError("");

    invitationService
      .get(invitationId)
      .then((data) => {
        if (!active) return;
        setInvitation(data);
        setForm((prev) => ({
          ...prev,
          coupleNames: data.title || data.slug || "",
          hostName: data.groomName || data.brideName || "",
          venueName: data.venueName || "",
          eventDate: data.eventDate || "",
        }));
      })
      .catch((err) => {
        if (active) setInvError(err?.message || "Could not load invitation context");
      })
      .finally(() => {
        if (active) setInvLoading(false);
      });

    return () => {
      active = false;
    };
  }, [invitationId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    generate(form.action, {
      language: form.language,
      tone: form.tone,
      eventType: "Wedding",
      coupleNames: form.coupleNames,
      hostName: form.hostName,
      venueName: form.venueName,
      eventDate: form.eventDate,
      notes: form.notes,
    });
  };

  const handleApply = async (appliedText) => {
    if (!invitationId) return;
    try {
      if (invitation) {
        await invitationService.update(
          invitationId,
          toInvitationStoryUpdate(invitation, appliedText),
        );
      }
      toast.success("បានរក្សាទុកក្នុងផ្នែករឿងរ៉ាវ / Saved to invitation story");
      navigate(`/dashboard/invitations/${invitationId}/edit`);
    } catch {
      toast.error("មិនអាចរក្សាទុកអត្ថបទបានទេ");
    }
  };

  return (
    <main className="dash-main pe-ai-page">
      <div>
        <Link
          to={invitationId ? `/dashboard/invitations/${invitationId}/edit` : "/dashboard/invitations"}
          className="pe-ai-back-link"
        >
          <IoArrowBackOutline aria-hidden="true" />
          <span>ត្រឡប់ទៅការកែប្រែធៀប / Back to Invitation Editor</span>
        </Link>
      </div>

      <header className="dash-page-header">
        <div>
          <span className="dash-kicker" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
            <IoSparklesOutline /> AI Writing Helper
          </span>
          <h1>ជំនួយការសរសេរខ្លឹមសារធៀបការ</h1>
          <p>បង្កើតអត្ថបទអញ្ជើញ រឿងរ៉ាវស្នេហា និងលិខិតផ្លូវការដោយស្វ័យប្រវត្ត និងងាយស្រួល។</p>
        </div>
      </header>

      {invError ? (
        <ErrorState message={invError} />
      ) : invLoading ? (
        <SkeletonCard height="240px" />
      ) : (
        <div className={`pe-ai-layout${response ? " has-result" : ""}`}>
          <section className="pe-ai-panel">
            <AssistantComposer
              form={form}
              setForm={setForm}
              loading={loading}
              onSubmit={handleSubmit}
            />
          </section>

          {response && (
            <section>
              <AssistantResult response={response} onApply={handleApply} />
            </section>
          )}
        </div>
      )}

      {aiError && <ErrorState message={aiError} />}
    </main>
  );
}
