# Project-wide presentation and preferences

The expanded brief covers landing, My Events, event overview and the 17 event tools. The work keeps the existing routes, information architecture, data services and invitation renderers. It removes the guest explanation and quota panels specifically marked by the user; capacity enforcement remains on the server.

## Visual direction

Use a quiet cream canvas, white surfaces, forest actions and restrained brass accents. Dark mode uses deep green charcoal, raised green surfaces, off-white text and light sage actions. These roles are defined once in `shared/styles/app-experience.css` and consumed by existing workspace, guest, Studio and marketing components. The goal is readable operational screens with clear primary actions, visible borders and compact headers, without decorative charts or invented statistics.

The existing landing brand and Khmer typography remain the reference. Dashboard layout inspiration was reviewed at [Dribbble](https://dribbble.com/), including [Dashboard UI by Digital Product Lab](https://dribbble.com/shots/25520224-Dashboard-UI). No reference assets or fictional dashboard statistics were copied into the product.

## Implementation

- Shared semantic roles connect the rail, navigation, tables, cards, forms, finance tools and dialogs. Legacy fixed colors in gifts, expenses, wishes and check-in are replaced with theme roles.
- `DisplayPreferences` places Khmer/English and a light/dark toggle in the host navbar, mobile marketing navbar, Studio header and invitation-preview controls. Desktop marketing retains its existing language pair with a theme toggle alongside it.
- `useAppearanceStore` persists only `koupreng.colorMode`. The small external `color-mode.js` restores it before React paints. The ThemeProvider synchronizes changes between tabs. Light mode is the default.
- Changing the interface language or theme preserves controlled edits and the existing desktop Studio iframe. Interface preference is separate from authored invitation language and publication settings.
- Invitation artwork, ticket design, QR image quiet zone, map canvas and printable report paper retain their authored colors. Dark mode styles the tools around them. Financial screen colors are scoped to screen media and exclude print preview.
- Management route entrances use a short 180ms opacity/5px transition. Legacy page reveal effects are skipped for management routes; public cinematic behavior remains. Reduced-motion preferences disable the new entrance and control transitions.
- Responsive navigation and forms are checked at 320/390/768/1440px, with the contextual dialog matrix also covering 375/430/1024/1366/1920px. The route loading screen uses the selected theme.

## Verification contract

`project-wide-ui.spec.js` waits for each actual tool, records light desktop and dark mobile/tablet/desktop screenshots, checks document reflow and runs Axe on every dark management content region. It also checks persistent preferences and retained Studio edits. Four Windows Chromium pixel baselines cover My Events in English and mobile event overview in Khmer in both modes. Baselines are generated, visually inspected and then compared in a separate run without updating them.

The first visual pass found fixed white finance/scanner surfaces and several low-contrast legacy labels. The second pass corrects those issues and replaces loading-only QR/team captures with actual rendered modules. Evidence is under `output/playwright/next-studio-ux/project-wide/`; the final QA report records the exact final results and any remaining limits.
