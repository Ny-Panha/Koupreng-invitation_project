# Phase 6 baseline and impact

Baseline: `76412b523bfc4b22e1f6fa918a0318e0e9bb2f4b`, branch
`feat/phase5-user-workspace`, no upstream. Pre-existing untracked directory:
`apps/backend/target_test-classes/` (untouched). Work proceeds on
`feat/phase6-integrity-entitlements`. Phase 5 reports, API/source metadata and
representative cover/seating screenshots were reviewed.

## Reproduction (real Chromium, fictional intercepted HTTP contracts)

`PHASE6_BASELINE=true npm --prefix apps/frontend-user run test:e2e -- phase6-baseline.spec.js --project=desktop-chromium --workers=1`
passed 1/1 against the baseline. Saving `schedule[0].date=2028-02-29`
reached the PUT payload but the live program omitted the date. The Celestial
section navigation had no Our story button. Screenshot:
`D:/Koupreng-UXUI-Phase6/screenshots/before/studio-schedule-missing-date-story.png`.

## Source and expected contract

* `InvitationForm.jsx`: flat `contentJson.schedule[]` already persists row dates;
  no separate day or period control exists. Preserve this JSON contract and all
  legacy ceremony text; add optional day/period/end-time fields rather than a
  competing schedule schema. Blank dates follow the event calendar date (Day 2
  follows the next local calendar date); explicit dates remain independent.
* `templateExperienceContent.js`: schedule normalization loses metadata and
  prefers template schedule headings over host headings.
* `TemplateExperience.jsx`: live schedule mapping discards dates; story mapping
  ignores `storyChapters`, replacing the story with invitation-message text.
* `templateFormFlowConfig.js`: Celestial excludes story despite its renderer
  supporting it. Unsupported renderers must hide editing and explain support.
* Preview and public rendering must consume the same row/chapters data,
  including explicit empty arrays and disabled section flags.

## Isolation and regression boundaries

No production DB or existing accounts will be modified. Docker is unavailable;
native MySQL will be initialized under a new private Phase 6 directory, bound
to loopback on a dedicated port. No outbound email/SMS/payment is authorized.
Existing V1–V43 migrations, Phase 5 import receipts, covers, seating versions,
gift identities and address/map semantics remain preserved.
