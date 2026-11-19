# Khmer/English typography and theme QA

Source HEAD: `2429b76545b683fad2a0a6f328bee3264875edc3` plus preserved, uncommitted Phase 07 work. No commit, push or deployment.

Locale remains in the existing Zustand language store; form/search UI state remains local and venue selection is URL-derived. A shell-owned contact draft survives marketing navigation and clears at account boundaries; no global persistence library or duplicate server-price store was introduced. EN headings use existing locally licensed Koupreng Editorial (Cormorant 600); body uses the current core fonts. Khmer display/body fallbacks remain Moul/Kantumruy Pro under current tokens. No template font files or registry faces were edited.

All capture rows list actually loaded faces/weights. EN/KM + light/dark + normal/reduced home sampling covers 320/390/768/1440/1920, with other owned routes sampled and responsive cases covering additional breakpoints. Source fallbacks remain operational when backend translations are empty in fixtures. The original en-dash repairs in marketingMessages are preserved.

Native Khmer terms, diacritic shaping, pronunciation, long names, synthetic weights and physical platform rendering require a qualified reviewer. A numeric 100% language guarantee was removed. The report's font list is based on current declarations/loaded faces, not Gemini's proposed Playfair/Cinzel/Inter palette. [after capture](../../../output/phase07-codex-2026-11-18/after/home-_-initial-390-km-dark-reduce.png) / [after capture](../../../output/phase07-codex-2026-11-18/after/home-_-initial-1440-en-light-reduce.png).
