# Report 26: Design Token Sync & CSS Variable Contract Audit

> **Target:** Design Tokens Synchronization, CSS Custom Properties & Typography Contracts  
> **Auditor:** Codex (Senior Design System Engineer)  
> **Date:** 2026-11-19T21:30:00+07:00

---

## 1. Token Verification Script Execution

The repository maintains an automated token contract script:
```powershell
node scripts/sync-design-tokens.cjs --check
```

### Execution Output
```text
Verified 2 application token exports.
(Exit code: 0)
```

The script verified that design token definitions in `apps/frontend-user/src/shared/styles/designTokens.js` and `apps/frontend-admin/src/shared/styles/designTokens.js` remain in exact synchronization.

---

## 2. Studio Palette & CSS Custom Properties

`StudioChrome.css` scopes the Studio chrome variables cleanly under `:is(.invitation-studio, .event-workspace.is-studio)`:

```css
:is(.invitation-studio,.event-workspace.is-studio) {
  --studio-ink: #17372d;          /* Deep Forest Ink (WCAG AAA) */
  --studio-gold: #98743b;         /* Royal Cambodian Wedding Gold */
  --ws-border: #e0e7e2;           /* Soft Border */
  --ws-border-strong: #cbd6ce;    /* Emphasized Divider */
  --ws-ink: #17372d;              /* Primary Typography */
  --ws-muted: #627168;            /* Secondary Meta Typography */
  color: var(--studio-ink);
}
```

### Style Isolation Guarantee
- The CSS rule specifically notes: `Management chrome only. Public invitation artwork owns its own theme.`
- Scoping prevents Studio management variables from leaking into or overriding public template styles rendered inside the simulator or standalone invitation viewports.
