# Design system and ten-library audit

Current source has a semantic management token sheet in `apps/frontend-user/src/shared/styles/semantic-tokens.css`: cream `#fbf6ee`, ink `#1f2421`, forest `#2e433a`, gold action `#926c34`, 44px minimum controls, 160/200ms feedback/overlay durations and reduced-motion overrides. Admin imports a separate `styles/index.css`; template layout styling stays independent. Font declarations include DM Sans and Khmer fallbacks, with `Noto Sans Khmer` in `assets/fonts/fonts.css`. Keep this foundation and test actual rendered light/dark contrasts, zoom and long Khmer strings before token changes.

The table is an **inspiration and due-diligence ledger**, based on the November 10 [candidate analysis](../phase01-2026-11-10/07-ui-library-evaluation.md) and the current manifest. No upstream component was installed or re-licensed in this audit. License status below is a historical lead; exact source revision, current terms and template-export rights must be rechecked before source adoption.

| Candidate | Relevant pattern / benefit | Compatibility, accessibility and runtime gate | Source/rights decision |
|---|---|---|---|
| Animate UI | Drawer/tabs/feedback in Studio | Match existing Motion; verify focus, names and reduced motion | Historical MIT + Commons Clause; inspiration pending exact terms |
| Badtz UI | Expandable template/landing cards | Tap and keyboard alternative to hover/3D; avoid heavy shaders | Historical modification restriction; original implementation preferred |
| Lightswind UI | Wizard, upload and dashboard layout | Avoid added GSAP/WebGL engines; test Vite/React 19 | Site/source terms historically conflicted for builders; source adoption deferred |
| Kokonut UI | Media upload/status and account menu | Preserve existing modal/media contracts, test focus | Historical free MIT vs separate Pro; exact component review required |
| Untitled UI | Forms, filters, data tables | React Aria/theme helpers can duplicate current primitives | Historical free MIT vs Pro; no global reset adoption |
| shadcn/ui | Combobox, dialog, sheet and field | Primitive choice varies; check Tailwind 4 and JSX adaptation | Historical MIT core; selective gap only |
| React Bits | Invitation reveals/gallery | Khmer text remains semantic; static/no-motion alternative; avoid OGL cost | Historical MIT + Commons Clause/Pro distinctions |
| Aceternity UI | Landing timeline and gallery | Tap, focus, low-power budgets and export rights | Historical custom marketplace restrictions; original patterns preferred |
| Magic UI | Stable metrics/notifications | Use real server values; announce final status, not frames | Historical MIT core, Pro separate |
| Skiper UI | Optional carousel/context controls | Verify drag alternative and source/dependency rights | Historical free/Pro terms unresolved for builder reuse |

No blanket installation follows from this comparison. A future adoption must cite pinned source, exact license, commercial/export permission, dependencies, semantic token fit, keyboard/touch/reduced-motion evidence and bundle cost. Existing vendor adaptations are documented in `docs/design/THIRD_PARTY_UI_LICENSES.md`; they are not proof that all new upstream snippets are safe to redistribute.
