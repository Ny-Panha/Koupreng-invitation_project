# Chapter 07 — Pricing & Public Package Comparison

## 1. Authoritative Commercial Truth

- Packages fetched directly from `subscriptionService.publicPackages()`.
- Strict currency separation: USD (`$XX.00`) and KHR (`XX,XXX ៛`) never mixed or converted.
- Missing or invalid amounts return `null` and render "Price unavailable" with link to `/contact`.
- Responsive comparison table:
  - Desktop: Keyboard scrollable table with `tabIndex={0}`, `role="region"`, and header scopes.
  - Mobile: Clean accordion view displaying complete included/excluded feature lists.
- Honest FAQ explaining package vs individual template differences and verification prerequisites.
