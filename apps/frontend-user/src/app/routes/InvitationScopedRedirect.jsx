import { Navigate, useLocation, useParams } from "react-router-dom";
import { eventPath } from "@/features/events/workspace/eventRoutes";

export default function InvitationScopedRedirect({ targetSubPath = "" }) {
  const params = useParams();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const id = params.eventId || params.invitationId || params.id || query.get("id") || query.get("invitationId");
  const target = /^[1-9]\d*$/.test(String(id || ""))
    ? eventPath(id, targetSubPath)
    : `/app/events${targetSubPath ? `?module=${encodeURIComponent(targetSubPath)}` : ""}`;
  return <Navigate to={target} replace state={location.state} />;
}
