import RouteLoadingSkeleton from "@/shared/ui/RouteLoadingSkeleton";
import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";

import NotFoundPage from "../pages/marketing/NotFoundPage";
import { authRoutes } from "./routes/authRoutes";
import { builderRoutes } from "./routes/builderRoutes";
import { hostRoutes } from "./routes/hostRoutes";
import { marketingRoutes } from "./routes/marketingRoutes";

export default function AppRouter() {
  return (
    <Suspense fallback={<RouteLoadingSkeleton />}>
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
