import { TemplateCheckoutPage, HomePage, PricingPage, ContactPage, TemplateDemoPage, TemplatesPage, VenuesPage } from "./lazyRoutePages";
import { Navigate, Route } from "react-router-dom";

import MarketingShell from "../../layouts/MarketingShell";







import RequireAuth from "./RequireAuth";

export function marketingRoutes() {
  return (
    <>
      <Route element={<MarketingShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route
          path="/templates/:templateId/checkout"
          element={
            <RequireAuth>
              <TemplateCheckoutPage />
            </RequireAuth>
          }
        />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/venues" element={<VenuesPage />} />
        <Route path="/venues/:id" element={<VenuesPage />} />
        <Route path="/about" element={<Navigate to="/contact" replace />} />
        <Route path="/help" element={<Navigate to="/contact" replace />} />
      </Route>
      <Route path="/templates/:id" element={<TemplateDemoPage />} />
      <Route path="/templates/:id/demo" element={<TemplateDemoPage />} />
    </>
  );
}