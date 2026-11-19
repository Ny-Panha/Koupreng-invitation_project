# 17 — Library Preservation & Vendor Stability

> **Phase:** 12.1 (Wave 3 — Creator Experience & Event Operations)  
> **Topic:** 10 Core Dependencies, Preservation Rationale, and Zero-Drift Policy  
> **Status:** Complete in local working tree  
> **Artifact Directory:** [docs/uxui/phase12-1-gemini-owner-dashboard-2026-11-19/](file:///d:/Koupreng-invitation_project/docs/uxui/phase12-1-gemini-owner-dashboard-2026-11-19/)

---

## 1. Ten Core Dependencies & Rationale

No new runtime dependencies were introduced in Phase 12.1. All existing dependencies are preserved without breaking changes:

1. **React (`^19.3.1`):** Core component framework. Functional components, custom hooks, and concurrent rendering preserved.
2. **React Router (`^7.18.2`):** Client-side routing. Route trees, `useSearchParams`, and `useParams` contracts preserved.
3. **Tailwind CSS (`^4.3.3`):** Utility-first styling with `@tailwindcss/vite`. Semantic design tokens strictly respected.
4. **Zustand (`^5.0.16`):** State management. `useLanguageStore` used for bilingual language switching.
5. **Lucide React (`^1.61.0`):** Iconography. Consistent icons (`CalendarDays`, `Clock`, `MapPin`, `Sparkles`, `CheckCircle2`, `Wallet`, `Heart`) with `aria-hidden="true"`.
6. **Axios (`^1.19.0`):** HTTP client. Authorization headers, response unwrapping, and error handling preserved.
7. **Framer Motion (`^14.5.0`):** Micro-animations with `prefers-reduced-motion` safeguards.
8. **Vitest (`^5.0.5`):** Unit and integration test runner. 29 test files executed across the feature surfaces.
9. **Playwright (`^1.64.1`):** End-to-end visual testing and screenshot capture across 5 viewports.
10. **Axe Core (`4.14.0`):** Automated accessibility engine verifying WCAG 2.2 contrast and ARIA landmarks.
