import { ForgotPasswordPage, LoginPage, RegisterPage, ResetPasswordPage } from "./lazyRoutePages";
import { Route } from "react-router-dom";

import AuthShell from "../../layouts/AuthShell";





export function authRoutes() {
  return (
    <Route element={<AuthShell />}>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
    </Route>
  );
}
