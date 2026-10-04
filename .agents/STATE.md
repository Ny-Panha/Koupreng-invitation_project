# STATE.md — Koupreng Invitation Project

## Last Session
- **Source:** Antigravity IDE
- **Timestamp:** 2026-10-04T17:40:00+07:00
- **Summary:**
  - **Implemented Phase 1 of Modular Block CMS in `apps/frontend-user`**:
    1. **Branch**: Created `feature/block-cms` tracking `origin/main`.
    2. **Block Types & Registry**:
       - Created [blockTypes.js](file:///home/kali/Desktop/Koupreng-invitation_project-backup/apps/frontend-user/src/features/templates/blocks/blockTypes.js) defining canonical `BLOCK_TYPES` (`HERO_COVER`, `CUSTOM_IMAGE`, `CUSTOM_TEXT`, `HORIZONTAL_SCROLL_SHOWCASE`, `SCHEDULE`, `GALLERY`, `BANK_QR`, `RSVP`, `MAP`, `COUNTDOWN`, `LEGACY_TEMPLATE`).
       - Created [blockRegistry.js](file:///home/kali/Desktop/Koupreng-invitation_project-backup/apps/frontend-user/src/features/templates/blocks/blockRegistry.js) and [StandardBlocks.jsx](file:///home/kali/Desktop/Koupreng-invitation_project-backup/apps/frontend-user/src/features/templates/blocks/StandardBlocks.jsx) mapping every block type to its component.
    3. **Block Components**:
       - Created [HorizontalScrollSection.jsx](file:///home/kali/Desktop/Koupreng-invitation_project-backup/apps/frontend-user/src/features/templates/blocks/HorizontalScrollSection.jsx):
         * Desktop (`min-width: 1024px` AND no reduced motion): pinned horizontal scroll with dynamic `ResizeObserver` travel measurement, `cards.length * 100dvh` (min 200dvh), and sticky `100dvh` viewport.
         * Mobile / Reduced Motion: native swipe carousel with `overflow-x-auto`, `scroll-snap-x`, cards `w-[78vw] max-w-[380px]`.
         * Gated via `useMediaQuery` and `usePrefersReducedMotion`.
       - Created [CustomImageBlock.jsx](file:///home/kali/Desktop/Koupreng-invitation_project-backup/apps/frontend-user/src/features/templates/blocks/CustomImageBlock.jsx): full-width responsive image with optional caption overlay.
       - Created [CustomTextBlock.jsx](file:///home/kali/Desktop/Koupreng-invitation_project-backup/apps/frontend-user/src/features/templates/blocks/CustomTextBlock.jsx): aligned text section.
       - Created [LegacyTemplateBlock.jsx](file:///home/kali/Desktop/Koupreng-invitation_project-backup/apps/frontend-user/src/features/templates/blocks/LegacyTemplateBlock.jsx): wraps existing templates via `getDedicatedTemplateComponent` preserving 100% legacy compatibility.
       - Created [BlockErrorBoundary.jsx](file:///home/kali/Desktop/Koupreng-invitation_project-backup/apps/frontend-user/src/features/templates/blocks/BlockErrorBoundary.jsx): class error boundary isolating crashes per block.
       - Created [DynamicTemplateRenderer.jsx](file:///home/kali/Desktop/Koupreng-invitation_project-backup/apps/frontend-user/src/features/templates/blocks/DynamicTemplateRenderer.jsx): renders ordered sections wrapped in `BlockErrorBoundary` with read-side tolerance.
    4. **Wiring in TemplateExperience**:
       - In [TemplateExperience.jsx](file:///home/kali/Desktop/Koupreng-invitation_project-backup/apps/frontend-user/src/features/templates/experience/TemplateExperience.jsx): added single branch for non-empty `sections` array before `DedicatedComponent` resolution.
    5. **Tests & Build Verification**:
       - Added [DynamicTemplateRenderer.test.jsx](file:///home/kali/Desktop/Koupreng-invitation_project-backup/apps/frontend-user/src/features/templates/blocks/DynamicTemplateRenderer.test.jsx) and [HorizontalScrollSection.test.jsx](file:///home/kali/Desktop/Koupreng-invitation_project-backup/apps/frontend-user/src/features/templates/blocks/HorizontalScrollSection.test.jsx).
       - All 84 template tests pass across 11 test files (`npx vitest run src/features/templates/`).
       - `npm run build` in `apps/frontend-user` passes cleanly.

## Active Environment
- Branch: `feature/block-cms`
- Frontend User UI: `http://localhost:5173`
- Backend API: `http://localhost:8080`

## Next Steps
- Push `feature/block-cms` to origin.
- Begin Phase 2: Integrate block authoring controls and presets into the Admin Template Builder.
