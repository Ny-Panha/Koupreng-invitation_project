import { AdminSkeleton } from '../shared/ui/AdminSkeleton';
import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider, QueryProvider, AdminLanguageProvider, useAdminLanguage } from "./providers";
import RequireAdmin from "./guards/RequireAdmin";
import AdminLayout from "../layouts/AdminLayout";
const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const NotFoundPage = lazy(() => import("../pages/notFound/AdminNotFoundPage"));

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
const ApiMonitorPage = lazy(() => import("../pages/dev/ApiMonitorPage"));

import { ADMIN_ROUTE_PATHS } from "./routes";

import "../styles/App.css";

function AdminTitleAndFocus() {
  const { pathname } = useLocation();
  const { lang } = useAdminLanguage();
  const isEn = lang === "en";

  useEffect(() => {
    let title = isEn ? "Admin Dashboard | Koupreng" : "ផ្ទាំងគ្រប់គ្រង Admin | គូព្រេង";
    if (pathname.includes("/users/")) title = isEn ? "User Detail | Koupreng Admin" : "ព័ត៌មានលម្អិតអ្នកប្រើប្រាស់ | គូព្រេង Admin";
    else if (pathname.startsWith("/users")) title = isEn ? "Users Management | Koupreng Admin" : "គ្រប់គ្រងអ្នកប្រើប្រាស់ | គូព្រេង Admin";
    else if (pathname.startsWith("/templates")) title = isEn ? "Template Studio | Koupreng Admin" : "គ្រប់គ្រងគំរូសំបុត្រអញ្ជើញ | គូព្រេង Admin";
    else if (pathname.startsWith("/payments")) title = isEn ? "Payments & Orders | Koupreng Admin" : "ការទូទាត់ និងការបញ្ជាទិញ | គូព្រេង Admin";
    else if (pathname.startsWith("/packages")) title = isEn ? "Subscription Packages | Koupreng Admin" : "កញ្ចប់សេវាកម្ម | គូព្រេង Admin";
    else if (pathname.startsWith("/notifications")) title = isEn ? "Notifications | Koupreng Admin" : "ការជូនដំណឹង | គូព្រេង Admin";
    else if (pathname.startsWith("/system-logs")) title = isEn ? "System Audit Logs | Koupreng Admin" : "កំណត់ហេតុប្រព័ន្ធ | គូព្រេង Admin";
    else if (pathname.startsWith("/reports")) title = isEn ? "Platform Reports | Koupreng Admin" : "របាយការណ៍ប្រព័ន្ធ | គូព្រេង Admin";
    else if (pathname.startsWith("/api-monitor")) title = isEn ? "API Monitor | Koupreng Admin" : "ត្រួតពិនិត្យ API | គូព្រេង Admin";
    else if (pathname.startsWith("/login")) title = isEn ? "Admin Login | Koupreng" : "ចូលប្រព័ន្ធ Admin | គូព្រេង";

    document.title = title;
  }, [pathname, lang, isEn]);

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <QueryProvider>
        <AdminLanguageProvider>
          <BrowserRouter>
            <AdminTitleAndFocus />
            <Suspense fallback={<AdminSkeleton />}>
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
                <Route path={ADMIN_ROUTE_PATHS.apiMonitor} element={<ApiMonitorPage />} />

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
              {/* Catch-all for unknown admin URLs renders 404 (A-06) */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
            </Suspense>
          </BrowserRouter>
        </AdminLanguageProvider>
      </QueryProvider>
    </AuthProvider>
  );
}
