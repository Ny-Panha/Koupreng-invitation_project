import { lazy } from "react";
import { useEventWorkspace } from "./EventContext";
const WeddingEditor = lazy(() => import("@/features/invitations/InvitationEditFeature"));
const EventDetails = lazy(() => import("../onboarding/EventDetails"));
export default function EventInvitation() {
  const { event } = useEventWorkspace();
  return event.eventType === "WEDDING" && event.templateCode !== "event-essential" ? <WeddingEditor /> : <EventDetails />;
}
