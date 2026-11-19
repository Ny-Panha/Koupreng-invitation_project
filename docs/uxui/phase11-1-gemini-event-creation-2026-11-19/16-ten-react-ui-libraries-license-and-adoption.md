# 16 — Ten React UI Libraries License and Adoption Matrix

**Phase:** `11.1`  
**Decision Matrix Evidence:** [ten-library-decision-matrix.json](file:///d:/Koupreng-invitation_project/docs/uxui/phase11-1-gemini-event-creation-2026-11-19/evidence/ten-library-decision-matrix.json)

---

## 1. Ten Candidate Libraries Evaluation

In accordance with Phase 11.1 requirements, 10 leading React UI libraries and frameworks were evaluated:

| # | Library / Tool | Version | License | Architectural Role | Phase 11.1 Decision |
|---|---|---|---|---|---|
| 1 | **Radix UI Primitives** | 1.1.x | MIT | Unstyled, accessible primitives | Pattern inspired; zero external package added |
| 2 | **Shadcn UI** | Latest | MIT | Composable Tailwind components | Aesthetic styling inspired; pure CSS utilized |
| 3 | **Lucide React** | 0.4x | ISC | Vector icon primitives | Existing project dependency used for icons |
| 4 | **Tailwind CSS** | 3.4.x | MIT | Utility-first CSS engine | Utility classes paired with scoped CSS |
| 5 | **TanStack Form** | 0.x | MIT | Headless form state manager | Evaluated; native React state preferred for bundle size |
| 6 | **React Hook Form** | 7.x | MIT | Performant form validation | Evaluated; custom zero-dependency validation chosen |
| 7 | **Framer Motion** | 11.x | MIT | Motion & animation engine | Evaluated; pure CSS transitions chosen for budget |
| 8 | **Mantine Core** | 7.x | MIT | Comprehensive component suite | Evaluated; rejected to avoid heavy bundle overhead |
| 9 | **Chakra UI** | 2.x | MIT | Modular component library | Evaluated; rejected due to CSS-in-JS runtime cost |
| 10 | **Ant Design** | 5.x | MIT | Enterprise UI system | Evaluated; rejected due to aesthetic mismatch with Atelier |

---

## 2. Adoption Rationale

To maintain Koupreng's strict performance budget (< 150 kB bundle chunk) and avoid licensing risks, **zero new npm dependencies** were installed. Architectural patterns from Radix UI (accessible ARIA contracts) and Shadcn UI (token-based component composition) were implemented directly in pure React and CSS.
