# Shared loading components

`Skeleton`, `SkeletonCard`, and `SkeletonTable` retain their existing exports and props. They are decorative. Tables now preserve explicit column geometry and clamp rendering to ten rows/eight columns; card grids clamp to eight cards. No random widths, fake values, focusable controls, new animation library, or fetch delay was introduced.

User compositions live in `src/shared/ui/LoadingState.jsx`: `LoadingRegion`, `PageSkeleton`, `CardGridSkeleton`, `InvitationStudioSkeleton`. Supported layouts cover forms, lists, tables, event/template/gallery/pricing cards, dashboards, charts, public previews and tickets. One visible localized status labels a busy region; decorative descendants are hidden from assistive technology. Existing semantic color/radius tokens are reused.

Studio reserves toolbar, six sidebar groups, field labels/inputs and a phone aspect ratio. It reads the existing saved split preference without changing it. Below 1024px the desktop sidebar/preview shapes disappear, matching the editor-first mobile view. Actual editor state, language switching, autosave and preview frame identity are untouched.

`MediaImage` provides a local image placeholder, real load/error events, a 15-second failure deadline, retry, source-key isolation and timeout cleanup. Ticket canvas placeholders are initial-only; the last rendered canvas stays mounted during updates. Existing ticket image/font timeouts and export readiness remain authoritative.

Admin has a small independent `AdminSkeleton` using admin tokens. Existing `Loading` and `LoadingState` delegate to it, so admin/user bundles do not import one another. `RefreshStatus` communicates refresh/error without replacing verified records. Transform-only shimmer stops completely under reduced motion. Loading ancestors skip entrance fades so labels maintain contrast immediately.
