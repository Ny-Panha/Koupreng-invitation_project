# Chapter 08 — Authenticated Package Selection & Entitlements

## 1. Management at `/app/packages`

- Authenticated route behind `RequireAuth` in `hostRoutes.jsx`.
- Pre-selects package from query parameter `?package=CODE` passed safely from `/pricing`.
- Distinct order lifecycle stages: `waiting`, `review`, `success`, `expired`, `failed`, `grant`, `grant-ended`.
- Concurrency protection: `loadGeneration` ref prevents stale responses from overwriting active state upon identity switch.
- Unlocks occur only upon server verification (`active === true && status === 'ACTIVE' && paymentStatus === 'PAID'`).
