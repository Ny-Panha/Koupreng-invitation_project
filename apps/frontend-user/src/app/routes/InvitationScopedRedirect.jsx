import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { invitationService } from "@/features/invitations/api/invitationApi";
import { listDrafts } from "@/shared/storage/weddingStorage";
import { getActiveEventId } from "@/shared/storage/hostPlanningStorage";
import { useAuth } from "@/features/auth/hooks/useAuth";

export default function InvitationScopedRedirect({ targetSubPath }) {
  const [targetUrl, setTargetUrl] = useState(null);
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    let active = true;
    const resolve = async () => {
      const activeId = getActiveEventId();
      if (activeId) {
        if (active) setTargetUrl(`/dashboard/invitations/${activeId}/${targetSubPath}`);
        return;
      }

      try {
        const res = await invitationService.listMine().catch(() => []);
        const list = Array.isArray(res) ? res : res?.data || [];
        const drafts = listDrafts(user?.id || user?.userId);
        const first = list[0] || drafts[0];
        const id = first?.id || first?.invitationId;
        if (active) {
          if (id) {
            setTargetUrl(`/dashboard/invitations/${id}/${targetSubPath}`);
          } else {
            setTargetUrl("/dashboard/events");
          }
        }
      } catch {
        if (active) setTargetUrl("/dashboard/events");
      }
    };
    resolve();
    return () => {
      active = false;
    };
  }, [targetSubPath, user?.id, user?.userId]);

  if (!targetUrl) {
    return (
      <main className="enterprise-page" style={{ padding: "60px 20px", textAlign: "center", color: "#64748b" }}>
        <div>កំពុងរៀបចំទំព័រ...</div>
      </main>
    );
  }

  return <Navigate to={targetUrl} replace state={location.state} />;
}
