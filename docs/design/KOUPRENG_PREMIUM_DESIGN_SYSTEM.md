# Koupreng Premium Design System

Khmer Heritage × Contemporary Digital Luxury. Batch one, 2026-11-04. This extends the existing [StyleSeed lock](../STYLESEED.md), rather than replacing already working page systems. Full adoption remains tracked in the [coverage matrix](FULL_ROUTE_COVERAGE_MATRIX.md).

## Surface contracts

| Surface | Job | Visual direction | Current authority |
|---|---|---|---|
| Public invitations | Celebrate the couple; help guests attend | Authored ceremonial palettes, photographs, readable Khmer, selective opening choreography | Each existing template renderer and its local CSS |
| Customer operations | Create and manage real events | Warm hospitality, clear primary actions, comfortable density, forest/cream host recipe | `shared/styles/app-experience.css`, `workspace-ui.css`, existing `shared/ui` |
| Admin operations | Find records and act accurately | Quiet cream/gold chrome, dense content, visible navigation/focus, separate light/dark recipe | Admin `styles/index.css`, shared token export, `layouts/AdminLayout.css` |

## Semantic foundation

The canonical export is `apps/frontend-user/src/shared/styles/semantic-tokens.css`. Run `node scripts/sync-design-tokens.cjs` to generate the byte-equivalent admin export, and `--check` to verify it. The existing token synchronization test protects isolated Docker build contexts. Never hand-edit only the admin copy.

| Role | Existing base color | Usage |
|---|---|---|
| Canvas / surface | `#fbf6ee` / `#ffffff` | Operational background and raised information |
| Ink | `#1f2421` | Primary text |
| Action gold | `#926c34` | Action with white text; lighter gold stays decorative |
| Forest | `#2e433a` | Invitation control fallback and contextual hierarchy |
| Focus teal | `#0f766e` | Visible keyboard focus |
| Muted | `#59615c` | Supporting text on light surfaces |

Recipes may override these roles within their surface. Public invitations must not inherit management recoloring. Admin dark colors continue to come from the existing `.dark` recipe; customer dark colors from the existing `data-color-mode` recipe. Token presence is not evidence that every legacy control consumes it.

Batch one adds a 4px spacing scale (`--ui-space-1/2/3/4/6/8/12`), 44px control minimum, 8/12/20px radius roles, 1.75 body leading, restrained panel/overlay shadows, and shared feedback/overlay easing and duration. Existing radius values remain stable. Both exports are synchronized.

## Typography and layout

Keep local Khmer fonts and original names/content. The existing user UI uses DM Sans/Kantumruy Pro and template-specific Khmer display fonts; admin currently uses Inter/Kantumruy Pro and Moul. Family consolidation needs a measured later pass. Khmer display headings require at least 1.6 line height; body/control copy uses approximately 1.75. Do not apply character tracking or `break-all` to Khmer content. Do not truncate ceremonial names to force a layout.

At 320px, operational navigation becomes a named modal drawer with scrolling content. Desktop retains the compact rail and keyboard-visible route labels. Long forms use independently scrollable modal bodies and wrapping footer actions. Tables retain their existing data and semantics; adaptive row/card work remains pending.

## Components implemented in batch one

| Contract | Implementation | Observable behavior |
|---|---|---|
| Operational navigation | Admin header/sidebar, `adminNavigation.js`, `AdminNavigationSearch` | Names/paths filter actual routes; useful no-results state; create-template link opens the actual editor |
| Admin modal surface | `AdminDialog` | Native top-layer modal, background isolation, boundary focus wrapping, Escape, opener/scroll restoration |
| Customer modal | Existing `shared/ui/Modal` + CSS refinements | 44px close target, focus ring, safe-area padding, dynamic viewport maximum, scroll containment, wrapping actions; existing stack/focus logic retained |
| Recoverable error | Existing `ErrorState.css` | Retry has a 44px target and visible focus indicator |
| Invitation music | Existing controller + `FloatingAudioPlayer` | Native media errors/pause/ended reflected; pending/failed playback can retry; stale requests ignored; invitation locale determines labels |

The shared player is integrated into WithJoy and Bliss. The controller also serves existing TemplateExperience and Silk Heritage controls. There is no new animation engine or second general control library. Complete route, form, table, builder, checkout and template redesign remains subsequent work.

## State and business contracts

UI completion follows server-confirmed state. Keep pending payment, denied access, expired sessions and failed mutations visible. Never aggregate USD and KHR implicitly. Search in the admin shell is explicitly **page navigation**, not an unimplemented server record search. Notification indicators require real unread data. Audio failures do not block invitation content or imply RSVP completion.

See [motion/accessibility](MOTION_AND_ACCESSIBILITY_STANDARDS.md), [licensing](THIRD_PARTY_UI_LICENSES.md), and [verification](UI_MODERNIZATION_VERIFICATION.md).
