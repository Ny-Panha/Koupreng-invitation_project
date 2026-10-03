import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, QueryProvider, AdminLanguageProvider } from "./providers";
import RequireAdmin from "./guards/RequireAdmin";
import AdminLayout from "../layouts/AdminLayout";
const LoginPage = lazy(() => import("../pages/auth/LoginPage"));

// Admin Pages from pages/...
const DashboardPage = lazy(() => import("../pages/dashboard/AdminDashboardPage"));
const UsersPage = lazy(() => import("../pages/users/AdminUsersPage"));
const UserDetailPage = lazy(() => import("../pages/users/AdminUserDetailPage"));
const TemplatesPage = lazy(() => import("../pages/templates/AdminTemplatesPage"));
const TemplateEditPage = lazy(() => import("../pages/templates/AdminTemplateEditPage"));
const PaymentsPage = lazy(() => import("../pages/payments/AdminPaymentsPage"));
const PackagesPage = lazy(() => import("../pages/payments/AdminPackagesPage"));
const NotificationsPage = lazy(() => import("../pages/notifications/AdminNotificationsPage"));
const SystemLogsPage = lazy(() => import("../pages/system-logs/AdminSystemLogsPage"));
const ReportsPage = lazy(() => import("../pages/reports/AdminReportsPage"));

import { ADMIN_ROUTE_PATHS } from "./routes";

import "../styles/App.css";

export default function App() {
  return (
    <AuthProvider>
      <QueryProvider>
        <AdminLanguageProvider>
          <BrowserRouter>
            <Suspense fallback={<main role="status" aria-live="polite">Loading page...</main>}>
            <Routes>
              <Route path={ADMIN_ROUTE_PATHS.login} element={<LoginPage />} />
              {/* Standalone Fullscreen Template Visual Studio */}
              <Route
                path={ADMIN_ROUTE_PATHS.templateNew}
                element={
                  <RequireAdmin>
                    <TemplateEditPage />
                  </RequireAdmin>
                }
              />
              <Route
                path={ADMIN_ROUTE_PATHS.templateEdit}
                element={
                  <RequireAdmin>
                    <TemplateEditPage />
                  </RequireAdmin>
                }
              />

              <Route
                element={
                  <RequireAdmin>
                    <AdminLayout />
                  </RequireAdmin>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path={ADMIN_ROUTE_PATHS.dashboard} element={<DashboardPage />} />
                <Route path={ADMIN_ROUTE_PATHS.users} element={<UsersPage />} />
                <Route path={ADMIN_ROUTE_PATHS.userDetail} element={<UserDetailPage />} />
                <Route path={ADMIN_ROUTE_PATHS.templates} element={<TemplatesPage />} />
                <Route path={ADMIN_ROUTE_PATHS.payments} element={<PaymentsPage />} />
                <Route path={ADMIN_ROUTE_PATHS.packages} element={<PackagesPage />} />
                <Route path={ADMIN_ROUTE_PATHS.notifications} element={<NotificationsPage />} />
                <Route path={ADMIN_ROUTE_PATHS.systemLogs} element={<SystemLogsPage />} />
                <Route path={ADMIN_ROUTE_PATHS.reports} element={<ReportsPage />} />
                <Route path={ADMIN_ROUTE_PATHS.reportDetail} element={<ReportsPage />} />

                {/* Legacy /admin Route Aliases */}
                <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
                <Route path="/admin/dashboard" element={<Navigate to="/dashboard" replace />} />
                <Route path="/admin/users" element={<Navigate to="/users" replace />} />
                <Route path="/admin/templates" element={<Navigate to="/templates" replace />} />
                <Route path="/admin/payments" element={<Navigate to="/payments" replace />} />
                <Route path="/admin/packages" element={<Navigate to="/packages" replace />} />
                <Route path="/admin/notifications" element={<Navigate to="/notifications" replace />} />
                <Route path="/admin/reports" element={<Navigate to="/reports" replace />} />
                <Route path="/admin/system-logs" element={<Navigate to="/system-logs" replace />} />
              </Route>
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
            </Suspense>
          </BrowserRouter>
        </AdminLanguageProvider>
      </QueryProvider>
    </AuthProvider>
  );
}
