# Semantic token reference

**Edit only** `apps/frontend-user/src/shared/styles/semantic-tokens.css` for shared roles. Run `node scripts/sync-design-tokens.cjs`; commit the generated `apps/frontend-admin/src/styles/application-tokens.css`; verify with `node scripts/sync-design-tokens.cjs --check`. The two copies after the first comment line are byte-equivalent in the test. No runtime cross-app import is required.

| Role family | Light | Dark | Use |
|---|---|---|---|
| `--ui-theme-canvas` | `#fbf6ee` | `#172019` | Application page background |
| `--ui-theme-surface` | `#ffffff` | `#202a24` | Cards, menus, form surface |
| `--ui-theme-subtle` | `#f6f1e9` | `#28352c` | Secondary regions |
| `--ui-theme-raised` | `#ffffff` | `#304034` | Raised controls and overlays |
| `--ui-theme-ink` | `#1f2421` | `#f0f3ee` | Primary body and headings |
| `--ui-theme-muted` | `#59615c` | `#b9c7ba` | Secondary text |
| `--ui-theme-action` / `--ui-theme-on-action` | `#2e433a` / white | `#b7d2b8` / `#19271e` | Main action pair |
| `--ui-theme-gold` | `#926c34` | `#d9b879` | Restrained accent and link |
| `--ui-theme-focus` | `#0f766e` | `#ffd18a` | Visible focus ring |
| `--ui-theme-border` / control border | `#e6dccb` / `#95836c` | `#425447` / `#829883` | Standard and stronger input boundary |
| `--ui-theme-danger` / soft | `#b91c1c` / `#fff0ed` | `#ffb4ab` / `#402826` | Error text/surface |
| `--ui-theme-warning` / soft | `#92400e` / `#fff5e6` | `#ffd18a` / `#3b2c11` | Warning text/surface |
| `--ui-theme-success` / soft | `#166534` / `#e8f5e9` | `#a9e0c7` / `#1e3b2f` | Success text/surface |
| `--ui-theme-info` / soft | `#1d5c77` / `#eaf4f8` | `#9edbf2` / `#193441` | Informational text/surface |

Other roles in source: `overlay`, `inset`, `selection`, `interactive`, `inverse`, `tertiary`, `inverse-ink`, `link`, `placeholder`, `icon`, `disabled`, `secondary-action`, `on-secondary-action`, `danger-action`, `on-danger-action`, `pending`, `review`, `verified`, `manual`, `divider`, `border-strong`, `shadow`. Pending/review/verified/manual are visual categories only; text and payment status remain server-owned. Use words and icons in addition to color. Disabled controls should retain readable labels; their disabled behavior comes from components, not a token.

Typography roles: `--ui-font-management`, `--ui-font-khmer`, `--ui-font-latin`, `--ui-font-display`, `--ui-leading-khmer: 1.8`, `--ui-leading-latin: 1.5`, body/emphasis weights. Layout roles: `--ui-space-1/2/3/4/6/8/12`, `--ui-page-gutter`, `--ui-text-measure`, `--ui-radius-control/compact/panel`, `--ui-icon-size`, `--ui-target-comfort`. Studio roles: `--ui-studio-*` for dark authoring chrome only. Existing `--ui-duration-*` and `--ui-ease-standard` respect reduced motion.

```css
.account-panel { background: var(--ui-theme-surface); color: var(--ui-theme-ink); border: 1px solid var(--ui-theme-border); padding: var(--ui-space-6); }
.account-panel button { min-height: var(--ui-target-comfort); background: var(--ui-theme-action); color: var(--ui-theme-on-action); }
.account-panel button:focus-visible { outline: 3px solid var(--ui-theme-focus); outline-offset: 3px; }
```

Compatibility: old `--ui-canvas/surface/ink/muted/action/focus` retain values and must not be globally rebound to dark roles. Within owner `.dash-wrapper` they map through `--app-*` intentionally. Existing `--kp-*` stays confined to marketing, `--ws-*` to workspace, and wedding template variables to renderer roots. Do not use raw `--ui-palette-*` for component states; use semantic roles. Full component variants and feedback adoption are Phase 04.
