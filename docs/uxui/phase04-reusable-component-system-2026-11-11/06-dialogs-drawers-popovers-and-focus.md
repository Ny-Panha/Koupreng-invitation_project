# 06 — dialogs, drawers, popovers and focus

User `Modal.jsx` already owns stack order, inert background handling, Escape, Tab cycling including iframe, scroll lock and trigger focus return. `ConfirmDialog.jsx` uses `LoadingButton` and guards duplicate confirmation. Both remain unchanged. Existing shared UI tests and admin layout tests passed in the full suites; these establish the tested contracts, not every overlay permutation. Admin shell drawer/search focus behavior stays under `AdminLayout.test.jsx`.

Phase 04 browser checks the existing Studio Edit/Preview pointer/Enter path at 844×390, with no fixture writes. The responsive probe also checks scroll extents at 844×390, 820×430 and 768×390. It does not fully certify focus trapping, screen reader narration, or every nested popover. A full cross-app overlay/tooltip audit and mobile physical touch pass remain later acceptance work.
