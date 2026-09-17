import { Route } from "react-router-dom";

import MarketingShell from "../../layouts/MarketingShell";
import TemplateCheckoutPage from "../../features/payments/TemplateCheckoutPage";
import HomePage from "../../pages/marketing/HomePage";
import PricingPage from "../../pages/marketing/PricingPage";
import ContactPage from "../../pages/marketing/ContactPage";
import TemplateDemoPage from "../../pages/marketing/TemplateDemoPage";
import TemplatesPage from "../../pages/marketing/TemplatesPage";
import VenuesPage from "../../pages/marketing/VenuesPage";
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
      </Route>
      <Route path="/templates/:id" element={<TemplateDemoPage />} />
    </>
  );
}