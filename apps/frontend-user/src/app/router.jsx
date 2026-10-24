import { useUiCopy } from "@/shared/i18n/useUiCopy";
import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";

import NotFoundPage from "../pages/marketing/NotFoundPage";
import { authRoutes } from "./routes/authRoutes";
import { builderRoutes } from "./routes/builderRoutes";
import { hostRoutes } from "./routes/hostRoutes";
import { marketingRoutes } from "./routes/marketingRoutes";

function RouteLoading() {
  const uiCopy = useUiCopy();
  return <main role="status" aria-live="polite">{uiCopy("កំពុងផ្ទុកទំព័រ...", "Loading page...")}</main>;
}

export default function AppRouter() {
  return (
    <Suspense fallback={<RouteLoading />}>
    <Routes>
      {builderRoutes()}
      {marketingRoutes()}
      {authRoutes()}
      {hostRoutes()}

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    </Suspense>
  );
}
