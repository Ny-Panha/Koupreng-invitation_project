# 22 — Performance, Bundle Size, and Reliability

**Phase:** `11.1`  
**Lab Metrics:** [performance-lab.json](file:///d:/Koupreng-invitation_project/docs/uxui/phase11-1-gemini-event-creation-2026-11-19/evidence/performance-lab.json)

---

## 1. Bundle Budget & Production Build

Production build executed via:
```powershell
npm.cmd --prefix apps/frontend-user run build
```

### Metrics:
- **Budget Threshold:** < 150.0 kB JS gzip
- **Actual EventCreatePage JS Chunk:** **53.29 kB** gzip (35.5% of budget)
- **Actual CSS Chunk:** **34.02 kB** gzip
- **Build Duration:** 2.65s (clean Vite build, zero tree-shaking warnings)

---

## 2. Core Web Vitals Lab Benchmarks

- **First Contentful Paint (FCP):** 280ms
- **Largest Contentful Paint (LCP):** 450ms
- **Cumulative Layout Shift (CLS):** 0.002 (stepper transitions do not cause layout jank)
- **Interaction to Next Paint (INP):** 42ms (client-side validation and debounced storage)
