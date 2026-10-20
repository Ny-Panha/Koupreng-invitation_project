/* eslint-disable react-refresh/only-export-components */
import { PaymentCancelPage, PaymentStatusPage, PaymentSuccessPage, WeddingSite, PublicInvitationPage, WeddingPreviewPage, InvitationEditPage } from "./lazyRoutePages";
import { Navigate, Route, useParams } from "react-router-dom";
import InvitationScopedRedirect from "./InvitationScopedRedirect";








import RequireAuth from "./RequireAuth";

function LegacyBuilder() {
  const { id } = useParams();
  return /^[1-9]\d*$/.test(String(id || "")) ? <InvitationScopedRedirect targetSubPath="invitation" /> : <InvitationEditPage />;
}

export function builderRoutes() {
  return (
    <>
      <Route path="/templates/:id/preview" element={<WeddingSite />} />
      <Route path="/create/wedding" element={<Navigate to="/app/events/new" replace />} />
      <Route path="/event/create" element={<Navigate to="/app/events/new" replace />} />
      <Route path="/dashboard/events/create" element={<Navigate to="/app/events/new" replace />} />
      <Route
        path="/create/wedding/:id"
        element={
          <RequireAuth>
            <LegacyBuilder />
          </RequireAuth>
        }
      />
      <Route
        path="/event/:id/manage"
        element={
          <RequireAuth>
            <LegacyBuilder />
          </RequireAuth>
        }
      />
      <Route path="/event/:draftId" element={<WeddingPreviewPage />} />
      <Route path="/preview/:draftId" element={<WeddingPreviewPage />} />
      <Route path="/payments/:orderCode/status" element={<PaymentStatusPage />} />
      <Route path="/payments/success" element={<PaymentSuccessPage />} />
      <Route path="/payments/return" element={<PaymentSuccessPage />} />
      <Route path="/payments/cancel" element={<PaymentCancelPage />} />
      <Route path="/w/:slug" element={<PublicInvitationPage />} />
      <Route path="/i/:slug" element={<PublicInvitationPage />} />
    </>
  );
}
