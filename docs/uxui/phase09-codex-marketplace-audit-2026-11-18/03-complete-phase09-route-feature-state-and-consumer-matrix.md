# Chapter 03 — Complete Phase 09 Route, Feature, State & Consumer Matrix

## 1. Inventory Alignment

The repository maintains an authoritative inventory of **135 route patterns** (111 customer, 24 admin) across **62 feature groups** and **63 app-group pairs**, verified via `batch11RouteInventory.test.jsx` in both user and admin applications.

## 2. Phase 09 Active Routes & Lifecycle States

| Route ID | Path | Guard | Component | Significant States Verified |
|---|---|---|---|---|
| R-09-01 | `/templates` | Public | `BrowseTemplatesFeature` | Initial, loading skeleton, ready (grid), empty search, error fallback, category filtered, price filtered, sorted A-Z/Z-A, dark mode, Khmer locale |
| R-09-02 | `/templates/:id` | Public | `TemplateDemoPage` | Fullscreen demo, iframe render, ESC to exit, back to catalog, language switch |
| R-09-03 | `/templates/:id/demo` | Public | `TemplateDemoPage` | Isolated demo view, parameter synchronization, embedded preview |
| R-09-04 | `/templates/:id/preview` | Guarded / Protocol | `TemplateExperience` | PostMessage validation, origin/nonce verification, sandboxed execution |
| R-09-05 | `/templates/:templateId/checkout` | RequireAuth | `TemplateCheckoutPage` | Verified quote, ABA PayWay disclosure, pending settlement handling, back link |
| R-09-06 | `/templates/browse` | RequireAuth | `BrowseTemplatesFeature` | Host stats KPIs, Paid Templates filter, owned badges, unowned preview CTAs |
| R-09-07 | `/pricing` | Public | `PricingFeature` | Public packages, USD/KHR pricing, feature table keyboard scroll, safe sign-in continuation |
| R-09-08 | `/app/packages` | RequireAuth | `SubscriptionPackagesPage` | Current subscription tier, upgrade options, payment redirect safety |
