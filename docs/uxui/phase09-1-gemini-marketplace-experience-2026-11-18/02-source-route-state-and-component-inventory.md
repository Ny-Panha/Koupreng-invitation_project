# Chapter 02 — Source Route, State & Component Inventory

## 1. Master Route Reconciliation

The master route factory was checked against `batch11RouteInventory.test.jsx`:
- `apps/frontend-user`: exactly **111 leaf routes**, with every `/app/*` leaf guarded by authentication.
- `apps/frontend-admin`: exactly **24 leaf routes**, with every administrative leaf guarded.
- Total inventory: **135 routes, 62 feature groups, 63 app/group pairs**.

## 2. Phase 09 Route Surfaces

| Route | Guard | Component | Status | Verified States |
|---|---|---|---|---|
| `/templates` | Public (`MarketingShell`) | `TemplatesPage` -> `TemplatesFeature` -> `TemplateGrid` | UPGRADED | Loading skeleton, ready, empty search, demo fallback, category filter, price filter, sorting, dark mode, Khmer |
| `/templates/:id` | Public (standalone) | `TemplateDemoPage` | PRESERVED + VERIFIED | Demo render, iframe sandbox, escape return |
| `/templates/:id/demo` | Public (standalone) | `TemplateDemoPage` | PRESERVED + VERIFIED | Alias redirect/mount |
| `/templates/browse` | Guarded (`RequireAuth`, `HostShell`) | `BrowseTemplatesPage` -> `BrowseTemplatesFeature` | UPGRADED | Authenticated view, KPI stats, paid filter, clear search, dark mode |
| `/templates/browse/:id` | Guarded (`RequireAuth`) | `HostTemplateDemoPage` | PRESERVED + VERIFIED | Host preview with event selection |
| `/templates/:templateId/checkout` | Guarded (`RequireAuth`, `MarketingShell`) | `TemplateCheckoutPage` | PRESERVED + VERIFIED | Template match, server price review, ABA PayWay notice, order creation |
| `/pricing` | Public (`MarketingShell`) | `PricingPage` -> `PricingFeature` | PRESERVED + VERIFIED | Public package catalog, USD/KHR formatting, limits, comparison table, FAQ |
| `/app/packages` | Guarded (`RequireAuth`, `HostShell`) | `SubscriptionPackagesPage` -> `SubscriptionPackagesFeature` | PRESERVED + VERIFIED | Active plan, pending orders, demo grant, target package selection |
| `/dashboard/packages` | Guarded (`RequireAuth`) | `AccountRedirect` -> `/app/packages` | PRESERVED + VERIFIED | Query preservation redirect |
| `/app/templates/paid` | Guarded (`RequireAuth`, `HostShell`) | `PaidTemplatesPage` | PRESERVED + VERIFIED | Owned template list |
| `/` | Public (`MarketingShell`) | `HomePage` -> `LandingFeaturedTemplates` | PRESERVED + VERIFIED | Curated preview of 3 designs |
