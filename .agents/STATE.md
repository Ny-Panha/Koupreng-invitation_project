# STATE.md — Koupreng Invitation Project

## Last Session
- **Source:** Antigravity IDE
- **Timestamp:** 2026-10-04T17:55:00+07:00
- **Summary:**
  - **Implemented Phase 2 — Admin Block Builder for Modular Block CMS**:
    1. **Branch**: Active on `feature/block-cms`.
    2. **Admin Block Pure Helpers & Tests**:
       - Created [blockHelpers.js](file:///home/kali/Desktop/Koupreng-invitation_project-backup/apps/frontend-admin/src/features/templates/components/blockHelpers.js) with `addBlock`, `moveBlock`, `removeBlock`, `validateBlocks`, and `generateBlockId` (`block-<Date.now()>-<random>`).
       - Enforced CMS validation rules: $\le 20$ blocks total, `CUSTOM_IMAGE` requires `imageUrl`, `CUSTOM_TEXT` requires `heading` or `body`, and `HORIZONTAL_SCROLL_SHOWCASE` requires $\ge 1$ card with `img`.
       - Created [blockHelpers.test.js](file:///home/kali/Desktop/Koupreng-invitation_project-backup/apps/frontend-admin/src/features/templates/components/blockHelpers.test.js) with 18 comprehensive unit tests. All 18 tests pass.
    3. **Admin Studio Block Builder Component**:
       - Created [TemplateBlocksManager.jsx](file:///home/kali/Desktop/Koupreng-invitation_project-backup/apps/frontend-admin/src/features/templates/components/TemplateBlocksManager.jsx):
         * Block palette buttons with counter: `+ រូបភាព (Image)`, `+ អត្ថបទ (Text)`, `+ Cinematic Scroll (Showcase)` styled in zinc + amber accents.
         * Block list with reordering (`ArrowUp`, `ArrowDown`), deletion (`Trash2`), and collapsible settings form.
         * `ImageUploaderInput` reusing native `FileReader` dataURL + URL input pattern.
         * Collapsible settings forms for `CUSTOM_IMAGE` (URL/upload, caption, alt), `CUSTOM_TEXT` (heading, body, align left/center/right), and `HORIZONTAL_SCROLL_SHOWCASE` (heading, cards manager up to 10 cards).
    4. **Admin Studio Integration**:
       - Updated [AdminTemplateEditFeature.jsx](file:///home/kali/Desktop/Koupreng-invitation_project-backup/apps/frontend-admin/src/features/templates/AdminTemplateEditFeature.jsx):
         * Added `customBlocks` state (`const [customBlocks, setCustomBlocks] = useState([])`).
         * Rendered `<TemplateBlocksManager>` inside `settingsSubTab === "sections"` below `TemplateSectionOrderManager`.
         * Real-time preview: included `sections: customBlocks` in `LIVE_PREVIEW_SYNC` message payload sent via `postIframePreview`.
         * Save: serialized `sections: customBlocks` into `description` JSON payload.
         * Load: parsed existing `description` JSON on edit and restored `customBlocks`.
    5. **Frontend User Wiring & Appending Engine**:
       - Updated [TemplateExperience.jsx](file:///home/kali/Desktop/Koupreng-invitation_project-backup/apps/frontend-user/src/features/templates/experience/TemplateExperience.jsx):
         * Removed early-return replacement.
         * Appended `<DynamicTemplateRenderer sections={customSections} content={content} />` AFTER legacy invitation content (`DedicatedComponent` or default layout) but BEFORE the footer and floating actions.
         * Propagated `sections` through `content` useMemo and fallback resolution.
       - Updated [templateExperienceContent.js](file:///home/kali/Desktop/Koupreng-invitation_project-backup/apps/frontend-user/src/features/templates/experience/config/templateExperienceContent.js) and [templatesData.js](file:///home/kali/Desktop/Koupreng-invitation_project-backup/apps/frontend-user/src/features/templates/data/templatesData.js) to map `sections` from JSON `description`.
    6. **Test Suites & Build Verification**:
       - Added tests to [TemplateExperience.test.jsx](file:///home/kali/Desktop/Koupreng-invitation_project-backup/apps/frontend-user/src/features/templates/experience/TemplateExperience.test.jsx) covering zero regression (empty blocks), custom block appending after legacy content, and JSON `description` parsing.
       - All 87 tests passed across all 11 template test suites in `apps/frontend-user`.
       - All 18 tests passed in `apps/frontend-admin`.
       - `npm run build` passed cleanly in both `apps/frontend-admin` and `apps/frontend-user`.

## Active Environment
- Branch: `feature/block-cms`
- Frontend User UI: `http://localhost:5173`
- Frontend Admin UI: `http://localhost:5174`
- Backend API: `http://localhost:8080`

## Next Steps
- Commit changes and push `feature/block-cms` to origin.
- Phase 3: Free interleaving of custom blocks between legacy fixed sections.
