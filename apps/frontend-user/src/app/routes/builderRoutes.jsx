import { PaymentCancelPage, PaymentStatusPage, PaymentSuccessPage, WeddingSite, PublicInvitationPage, WeddingPreviewPage, InvitationEditPage } from "./lazyRoutePages";
import { Navigate, Route } from "react-router-dom";








import RequireAuth from "./RequireAuth";

export function builderRoutes() {
  return (
    <>
      <Route path="/templates/:id/preview" element={<WeddingSite />} />
      <Route path="/create/wedding" element={<Navigate to="/dashboard/events" replace />} />
      <Route path="/event/create" element={<Navigate to="/dashboard/events" replace />} />
      <Route path="/dashboard/events/create" element={<Navigate to="/dashboard/events" replace />} />
      <Route
        path="/create/wedding/:id"
        element={
          <RequireAuth>
            <InvitationEditPage />
          </RequireAuth>
        }
      />
      <Route
        path="/event/:id/manage"
        element={
          <RequireAuth>
            <InvitationEditPage />
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
