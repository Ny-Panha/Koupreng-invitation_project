/* eslint-disable react-refresh/only-export-components */
import { lazy } from "react";
import { Navigate, Route, useLocation, useParams } from "react-router-dom";
import { PaidTemplatesPage, BrowseTemplatesPage, ChangePasswordPage, DashboardPage, EventsPage, ExpensesPage, GuestsPage, HostTemplateDemoPage, InvitationEditPage, InvitationMediaPage, InvitationPreviewPage, InvitationDeliveryPage, InvitationCheckInPage, NotificationsPage, PaymentHistoryPage, PaymentReceiptPage, ProfilePage, SeatingPage, SubscriptionPackagesPage, WeddingGiftPage, OrganizationPage, OrganizationDetailPage, AiAssistantPage, RsvpDashboardPage, FinancialReport, QrPage, WishesPage } from "./lazyRoutePages";
import RequireAuth from "./RequireAuth";
import InvitationScopedRedirect from "./InvitationScopedRedirect";
const HostShell = lazy(() => import("../../layouts/HostShell"));
const EventWorkspace = lazy(() => import("../../features/events/workspace/EventWorkspace"));
const EventCreatePage = lazy(() => import("../../features/events/onboarding/EventCreatePage"));
const EventDetails = lazy(() => import("../../features/events/onboarding/EventDetails"));
const EventInvitation = lazy(() => import("../../features/events/workspace/EventInvitation"));
const TicketDesigner = lazy(() => import("../../features/tickets/TicketDesigner"));
const EventTeamPanel = lazy(() => import("../../features/events/workspace/EventTeamPanel"));
const AttendanceAnalytics = lazy(() => import("../../features/events/workspace/AttendanceAnalytics"));

function LegacyEditor({ preview = false }) {
  const { id } = useParams();
  if (/^[1-9]\d*$/.test(String(id || ""))) return <InvitationScopedRedirect targetSubPath={preview ? "preview" : "invitation"} />;
  return preview ? <InvitationPreviewPage /> : <InvitationEditPage />;
}
function AccountRedirect() {
  const location = useLocation();
  return <Navigate to={location.pathname.replace(/^\/dashboard/, "/app") + location.search + location.hash} replace />;
}

export function hostRoutes() {
  const accountPages = [
    ["profile", <ProfilePage />], ["change-password", <ChangePasswordPage />],
    ["notifications", <NotificationsPage />], ["packages", <SubscriptionPackagesPage />],
    ["payments", <PaymentHistoryPage />], ["payments/:orderCode", <PaymentReceiptPage />],
    ["organizations", <OrganizationPage />], ["organizations/:organizationId", <OrganizationDetailPage />],
    ["templates/paid", <PaidTemplatesPage />],
  ];
  return <>
    <Route element={<RequireAuth><HostShell /></RequireAuth>}>
      <Route path="/app/events" element={<EventsPage />} />
      <Route path="/app/events/new" element={<EventCreatePage />} />
      <Route path="/app/events/:eventId" element={<EventWorkspace />}>
        <Route index element={<DashboardPage />} />
        <Route path="invitation" element={<EventInvitation />} />
        <Route path="tickets/design" element={<TicketDesigner />} />
        <Route path="settings" element={<EventDetails />} />
        <Route path="team" element={<EventTeamPanel />} />
        <Route path="analytics" element={<AttendanceAnalytics />} />
        <Route path="preview" element={<InvitationPreviewPage />} />
        <Route path="guests" element={<GuestsPage />} />
        <Route path="rsvp" element={<RsvpDashboardPage />} />
        <Route path="gifts" element={<WeddingGiftPage />} />
        <Route path="budget" element={<ExpensesPage />} />
        <Route path="seating" element={<SeatingPage />} />
        <Route path="check-in" element={<InvitationCheckInPage />} />
        <Route path="reports" element={<FinancialReport />} />
        <Route path="delivery" element={<InvitationDeliveryPage />} />
        <Route path="media" element={<InvitationMediaPage />} />
        <Route path="qr" element={<QrPage />} />
        <Route path="wishes" element={<WishesPage />} />
        <Route path="assistant" element={<AiAssistantPage />} />
      </Route>
      {accountPages.map(([path, page]) => <Route key={path} path={`/app/${path}`} element={page} />)}
      {accountPages.map(([path]) => <Route key={`old-${path}`} path={`/dashboard/${path}`} element={<AccountRedirect />} />)}
      <Route path="/dashboard" element={<InvitationScopedRedirect />} />
      <Route path="/dashboard/events" element={<Navigate to="/app/events" replace />} />
      <Route path="/dashboard/invitations" element={<Navigate to="/app/events" replace />} />
      <Route path="/dashboard/invitations/new" element={<Navigate to="/app/events/new" replace />} />
      <Route path="/dashboard/invitations/design" element={<InvitationEditPage />} />
      <Route path="/dashboard/invitations/edit" element={<InvitationEditPage />} />
      <Route path="/dashboard/invitations/:id/edit" element={<LegacyEditor />} />
      <Route path="/dashboard/invitations/:id/preview" element={<LegacyEditor preview />} />
      <Route path="/dashboard/invitations/:id" element={<InvitationScopedRedirect />} />
      {["guests", "rsvp", "gifts", "budget", "seating", "check-in", "reports", "qr", "wishes", "assistant", "delivery", "media"].map(module =>
        <Route key={module} path={`/dashboard/invitations/:invitationId/${module}`} element={<InvitationScopedRedirect targetSubPath={module} />} />)}
      {["guests", "rsvp", "gifts", "budget", "seating", "check-in", "reports", "delivery", "media"].map(module =>
        <Route key={`global-${module}`} path={`/dashboard/${module}`} element={<InvitationScopedRedirect targetSubPath={module} />} />)}
      <Route path="/dashboard/expenses" element={<InvitationScopedRedirect targetSubPath="budget" />} />
      <Route path="/dashboard/share" element={<InvitationScopedRedirect targetSubPath="delivery" />} />
      {["/events", "/event/list"].map(path => <Route key={path} path={path} element={<Navigate to="/app/events" replace />} />)}
      {[["/guests", "guests"], ["/expenses", "budget"], ["/gift", "gifts"], ["/gifts", "gifts"], ["/reports", "reports"]].map(([path, module]) =>
        <Route key={path} path={path} element={<InvitationScopedRedirect targetSubPath={module} />} />)}
      <Route path="/profile" element={<Navigate to="/app/profile" replace />} />
      <Route path="/templates/browse" element={<BrowseTemplatesPage />} />
    </Route>
    <Route path="/templates/browse/:id" element={<RequireAuth><HostTemplateDemoPage /></RequireAuth>} />
  </>;
}
