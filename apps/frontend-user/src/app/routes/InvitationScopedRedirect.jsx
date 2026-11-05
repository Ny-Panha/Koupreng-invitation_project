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
  // Only operational context belongs in the host workspace; guest credentials do not.
  const destination = new URL(target, "https://koupreng.invalid");
  for (const key of ["guestId", "q", "status", "type", "sort", "page", "tab", "mode"]) {
    const value = query.get(key);
    if (value) destination.searchParams.set(key, value);
  }
  if (/^#[a-z][a-z0-9_-]*$/i.test(location.hash)) destination.hash = location.hash;
  return <Navigate to={destination.pathname + destination.search + destination.hash} replace state={location.state} />;
}
