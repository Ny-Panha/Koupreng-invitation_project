import { PaidTemplatesPage, BrowseTemplatesPage, BudgetPage, ChangePasswordPage, DashboardPage, EventsPage, ExpensesPage, GuestsPage, HostTemplateDemoPage, InvitationCheckInPage, InvitationCreatePage, InvitationEditPage, InvitationMediaPage, InvitationPreviewPage, InvitationDeliveryPage, NotificationsPage, PaymentHistoryPage, PaymentReceiptPage, ProfilePage, SeatingPage, SubscriptionPackagesPage, WeddingGiftPage, OrganizationPage, OrganizationDetailPage, AiAssistantPage, RsvpDashboardPage, FinancialReport, QrPage, WishesPage } from "./lazyRoutePages";
/* eslint-disable react-refresh/only-export-components */
import { Navigate, Route, useParams } from "react-router-dom";

function InvitationBareRedirect() {
  const { id } = useParams();
  return <Navigate to={`/dashboard/invitations/${id}/edit`} replace />;
}


import HostShell from "../../layouts/HostShell";





















import RequireAuth from "./RequireAuth";







import InvitationScopedRedirect from "./InvitationScopedRedirect";

export function hostRoutes() {
  return (
    <>
      <Route
        element={
          <RequireAuth>
            <HostShell />
          </RequireAuth>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/events" element={<EventsPage />} />
        <Route path="/dashboard/invitations" element={<Navigate to="/dashboard/events" replace />} />
        <Route path="/dashboard/invitations/new" element={<InvitationCreatePage />} />
        <Route path="/dashboard/invitations/design" element={<InvitationEditPage />} />
        <Route path="/dashboard/invitations/edit" element={<InvitationEditPage />} />
        <Route path="/dashboard/invitations/:id/edit" element={<InvitationEditPage />} />
        <Route path="/dashboard/invitations/:id/preview" element={<InvitationPreviewPage />} />
        <Route path="/dashboard/invitations/:id" element={<InvitationBareRedirect />} />
      <Route path="/dashboard/invitations/:invitationId/assistant" element={<AiAssistantPage />} />
      <Route path="/dashboard/invitations/:invitationId/guests" element={<GuestsPage />} />
      <Route path="/dashboard/invitations/:invitationId/rsvp" element={<RsvpDashboardPage />} />
      <Route path="/dashboard/invitations/:id/delivery" element={<InvitationDeliveryPage />} />
      <Route path="/dashboard/invitations/:id/media" element={<InvitationMediaPage />} />
      <Route path="/dashboard/invitations/:invitationId/budget" element={<BudgetPage />} />
      <Route path="/dashboard/invitations/:invitationId/check-in" element={<InvitationCheckInPage />} />
      <Route path="/dashboard/invitations/:invitationId/seating" element={<SeatingPage />} />
      <Route path="/dashboard/invitations/:invitationId/reports" element={<FinancialReport />} />
      <Route path="/dashboard/invitations/:invitationId/qr" element={<QrPage />} />
      <Route path="/dashboard/invitations/:invitationId/wishes" element={<WishesPage />} />
      <Route path="/dashboard/reports" element={<InvitationScopedRedirect targetSubPath="reports" />} />
      <Route path="/reports" element={<InvitationScopedRedirect targetSubPath="reports" />} />
      <Route path="/dashboard/guests" element={<GuestsPage />} />
      <Route path="/dashboard/seating" element={<InvitationScopedRedirect targetSubPath="seating" />} />
      <Route path="/dashboard/check-in" element={<InvitationScopedRedirect targetSubPath="check-in" />} />
      <Route path="/dashboard/rsvp" element={<InvitationScopedRedirect targetSubPath="rsvp" />} />
      <Route path="/dashboard/media" element={<InvitationScopedRedirect targetSubPath="media" />} />
      <Route path="/dashboard/delivery" element={<InvitationScopedRedirect targetSubPath="delivery" />} />
      <Route path="/dashboard/share" element={<InvitationScopedRedirect targetSubPath="delivery" />} />
      <Route path="/dashboard/budget" element={<Navigate to="/dashboard/expenses" replace />} />
      <Route path="/dashboard/expenses" element={<ExpensesPage />} />
      <Route path="/dashboard/gifts" element={<WeddingGiftPage />} />
      <Route path="/dashboard/templates/paid" element={<PaidTemplatesPage />} />
      <Route path="/dashboard/profile" element={<ProfilePage />} />
      <Route path="/dashboard/change-password" element={<ChangePasswordPage />} />
      <Route path="/dashboard/notifications" element={<NotificationsPage />} />
      <Route path="/dashboard/organizations" element={<OrganizationPage />} />
      <Route path="/dashboard/organizations/:organizationId" element={<OrganizationDetailPage />} />
      <Route path="/dashboard/packages" element={<SubscriptionPackagesPage />} />
      <Route path="/dashboard/payments" element={<PaymentHistoryPage />} />
      <Route path="/dashboard/payments/:orderCode" element={<PaymentReceiptPage />} />
      
      {/* Legacy Route Aliases Redirects */}
      <Route path="/events" element={<Navigate to="/dashboard/events" replace />} />
      <Route path="/event/list" element={<Navigate to="/dashboard/events" replace />} />
      <Route path="/guests" element={<Navigate to="/dashboard/guests" replace />} />
      <Route path="/expenses" element={<Navigate to="/dashboard/expenses" replace />} />
      <Route path="/gift" element={<Navigate to="/dashboard/gifts" replace />} />
      <Route path="/gifts" element={<Navigate to="/dashboard/gifts" replace />} />
      <Route path="/profile" element={<Navigate to="/dashboard/profile" replace />} />
      <Route path="/templates/browse" element={<BrowseTemplatesPage />} />
    </Route>
    <Route
      path="/templates/browse/:id"
      element={
        <RequireAuth>
          <HostTemplateDemoPage />
        </RequireAuth>
      }
    />
  </>
  );
}
