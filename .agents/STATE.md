# STATE.md — Koupreng Invitation Project

## Last Session
- **Source:** Antigravity IDE (Replaced Out-of-Scope Restaurant "On The Pass" Grid with Authentic Wedding "Recent Invitations" Component)
- **Timestamp:** 2026-10-23T01:28:00+07:00
- **Summary:**
  - **Removed Restaurant Pass Mockup**:
    1. Eliminated `LiveServicePassGrid.jsx` which was an out-of-domain restaurant KDS / kitchen pass mockup with fake items (`#INV-1061`, pastel food tickets) and unclickable buttons.
    2. Created [RecentInvitationsCard.jsx](file:///c:/Users/nhastar/Desktop/Project/Koupreng-invitation_project-backup/apps/frontend-admin/src/features/dashboard/components/RecentInvitationsCard.jsx) tailored specifically to digital wedding invitations.
    3. Displayed real invitations from backend `data.recentInvitations` with fallback sample previews, showing bride/groom names, template name, owner, event date, and published/draft status.
    4. Added working navigation links: `+` directs to `/templates/new` and `↗` / `View` directs to `/templates`.
    5. Updated [AdminDashboardPage.jsx](file:///c:/Users/nhastar/Desktop/Project/Koupreng-invitation_project-backup/apps/frontend-admin/src/features/dashboard/AdminDashboardPage.jsx) header and section labels to match ("Revenue Trend & Recent Invitations" / "និន្នាការចំណូល និងធៀបការថ្មីៗ").
  - **Verified Quality**:
    - `npm run build` in `apps/frontend-admin` passed in 2.98s.
    - All 19 test files (116 tests) passed in Vitest with 0 failures.
- **Active Environment:**
  - Frontend Admin: `http://localhost:5174`
  - Frontend User: `http://localhost:5173`
  - Backend API: `http://localhost:8080`
- **Next Steps:**
  - User to refresh (`Ctrl + Shift + R`) the Admin dashboard at `http://localhost:5174` to view the new luxury Recent Invitations board.



## Previous Sessions
  - **Resolved all 15 Git Merge Conflicts caused by auto-stash pop**:
    1. `apps/frontend-user/src/app/routes/InvitationScopedRedirect.jsx`: Restored canonical routing from `main` (removed conflict markers, fixed Vite 500 error).
    2. Checked out `--ours` for all 14 `apps/frontend-user` conflicted modules (`GuestsPage.jsx`, `GuestFilters.jsx`, `GuestTable.jsx`, `ExpensesPage.css`, `ExpenseFormModal.jsx`, `useExpenses.js`, `expenses.test.jsx`, `GiftsFeature.css`, `GiftsFeature.jsx`, `gifts.test.jsx`, `SubscriptionPackagesPage.jsx`, `SubscriptionPackagesPage.css`, `messagesDictionary.js`).
    3. `scripts/maintenance/dev/dev.ps1`: Resolved conflict to support both native Windows Java and WSL Java 25 runtime fallback.
    4. Verified Vite production bundle: `npm run build` in `apps/frontend-user` passed in 2.14s with 0 errors.
    5. Verified Vitest suite: 9 test files / 45 tests in `src/features/guests` and `src/features/expenses` passed cleanly.

  - **Implemented Phase 3 — Full Interleave: Modular Block CMS**:
    1. **Branch**: Active on `feature/block-cms`.
    2. **Frontend User (`apps/frontend-user`)**:
       - Added `LEGACY_SECTION: 'LEGACY_SECTION'` to `blockTypes.js`.
       - Created [LegacySectionBlock.jsx](file:///home/kali/Desktop/Koupreng-invitation_project-backup/apps/frontend-user/src/features/templates/blocks/LegacySectionBlock.jsx) mapping all 11 legacy sections:
         * `family` → `TemplateCouple`
         * `invitation` → `TemplateMessage`
         * `countdown` → `TemplateCountdown`
         * `schedule` → `TemplateSchedule`
         * `map` → `TemplateVenue`
         * `gallery` → `TemplateGallery`
         * `story` → `TemplateStory` (returns `null` when `!content.story?.length`)
         * `gift` → `TemplateGift`
         * `dressCode` → `TemplateDressCode`
         * `faq` → `TemplateFaq`
         * `rsvp` → replicates `TemplateExperience` RSVP children wrapper / `TemplateRsvp`
         * `hero` → `TemplateHero` (kept for completeness)
         * `party` → dev warning + `null` (no component exists)
         * Respects `enabled !== false` and `content.enabledSections[sectionKey] !== false`.
       - Registered `LEGACY_SECTION` in [blockRegistry.js](file:///home/kali/Desktop/Koupreng-invitation_project-backup/apps/frontend-user/src/features/templates/blocks/blockRegistry.js) and exported via [index.js](file:///home/kali/Desktop/Koupreng-invitation_project-backup/apps/frontend-user/src/features/templates/blocks/index.js).
       - Added optional `blockProps = {}` to [DynamicTemplateRenderer.jsx](file:///home/kali/Desktop/Koupreng-invitation_project-backup/apps/frontend-user/src/features/templates/blocks/DynamicTemplateRenderer.jsx).
       - Updated [TemplateExperience.jsx](file:///home/kali/Desktop/Koupreng-invitation_project-backup/apps/frontend-user/src/features/templates/experience/TemplateExperience.jsx):
         * Computed `unifiedMode = customSections.some(b => b?.type === 'LEGACY_SECTION')`.
         * In unified mode: `TemplateHero` renders fixed first, followed by `<DynamicTemplateRenderer>` with `customSections`, followed by `TemplateFooter`.
         * Derived `TemplateQuickNav` enabled sections from present legacy sections in the unified array.
         * Retained zero-regression hardcoded fallback for templates without sections, and Phase-2 append behavior for dedicated monolithic layouts (e.g. `KhmerCelestial`).
       - Unit tests:
         * Created [LegacySectionBlock.test.jsx](file:///home/kali/Desktop/Koupreng-invitation_project-backup/apps/frontend-user/src/features/templates/blocks/LegacySectionBlock.test.jsx) (15 tests passing).
         * Extended [TemplateExperience.test.jsx](file:///home/kali/Desktop/Koupreng-invitation_project-backup/apps/frontend-user/src/features/templates/experience/TemplateExperience.test.jsx) with unified interleave test suite (24 tests passing).
         * All 103 tests in `src/features/templates` passed.
         * `npm run build` passed cleanly.
    3. **Frontend Admin (`apps/frontend-admin`)**:
       - Extracted reusable editors to [BlockEditors.jsx](file:///home/kali/Desktop/Koupreng-invitation_project-backup/apps/frontend-admin/src/features/templates/components/BlockEditors.jsx) (`ImageUploaderInput`, `CustomImageBlockEditor`, `CustomTextBlockEditor`, `ShowcaseBlockEditor`, `UniversalBlockEditor`).
       - Refactored [TemplateBlocksManager.jsx](file:///home/kali/Desktop/Koupreng-invitation_project-backup/apps/frontend-admin/src/features/templates/components/TemplateBlocksManager.jsx) to share `UniversalBlockEditor`.
       - Extended [blockHelpers.js](file:///home/kali/Desktop/Koupreng-invitation_project-backup/apps/frontend-admin/src/features/templates/components/blockHelpers.js):
         * Added `CMS_BLOCK_TYPES.LEGACY_SECTION`, `DEFAULT_SECTION_KEYS`.
         * `buildUnifiedSections({ sectionOrder, enabledSections, customBlocks })`.
         * `parseUnifiedSections(sections, savedSectionOrder, savedEnabledSections)` handling 3 cases: unified, Phase-2 migration, and absent/default.
         * `moveUnifiedItem(list, index, dir)`.
         * `toggleUnifiedSectionEnabled(list, id)`.
         * Updated `validateBlocks` for $\le 30$ total items and valid legacy section keys.
       - Extended [blockHelpers.test.js](file:///home/kali/Desktop/Koupreng-invitation_project-backup/apps/frontend-admin/src/features/templates/components/blockHelpers.test.js) (25 tests passing).
       - Created [TemplateUnifiedSectionsManager.jsx](file:///home/kali/Desktop/Koupreng-invitation_project-backup/apps/frontend-admin/src/features/templates/components/TemplateUnifiedSectionsManager.jsx):
         * Unified ordered list with up/down arrows, eye visibility toggle, and tab jumping for legacy sections.
         * Palette buttons at top (`+ Image`, `+ Text`, `+ Cinematic Scroll`) inserting at end of list.
         * Collapsible inline editors for custom blocks.
       - Integrated in [AdminTemplateEditFeature.jsx](file:///home/kali/Desktop/Koupreng-invitation_project-backup/apps/frontend-admin/src/features/templates/AdminTemplateEditFeature.jsx):
         * Single state `unifiedSections`.
         * Live sync sends `sections: unifiedSections`, `sectionOrder`, and `enabledSections`.
         * Save validates items and saves `sections: unifiedSections` plus backward-compatible `sectionOrder` and `enabledSections`.
         * Load parses description via `parseUnifiedSections`.
       - All 74 tests in `apps/frontend-admin` passed.
       - `npm run build` passed cleanly.

## Active Environment
- Branch: `feature/block-cms`
- Frontend User UI: `http://localhost:5173`
- Frontend Admin UI: `http://localhost:5174`
- Backend API: `http://localhost:8080`

## Latest Features Added (2026-10-05)
- Drag-and-Drop: Mouse grab handle with `@dnd-kit/core` and `@dnd-kit/sortable`
- Delete Section: Trash icon on every section (both legacy and custom CMS blocks)
- Clear All: `🗑️ សម្អាតទាំងអស់` button to clear default sections completely
- Add Legacy Section: `+ ផ្នែកធៀបការ (+ Section)` dropdown picker to re-add deleted legacy sections
- Cinematic Scroll starter data: 3 dark luxury sample cards pre-populated with images so new blocks show immediately in simulator

## Next Steps
- Admin tests drag-and-drop & deleting defaults in `http://localhost:5174/templates/new`.
- Verify live mobile preview responsiveness.

