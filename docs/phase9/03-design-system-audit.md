# Existing visual system

The user application already imports `shared/styles/semantic-tokens.css`; workspace roles alias it in `workspace-ui.css`. These are the authority for canvas, surface, ink, muted text, action/hover, borders, focus and status colors. Gold action `#926c34` has an established readable white foreground. Preserve this palette instead of introducing a competing Burgundy layer.

Marketing, authentication and host workspace each have legitimate shell differences. Shared buttons, Modal, ErrorState, skeletons, responsive tables and status badges are preferable to replacing page families. The admin root currently defines separate cool gray surfaces and orange actions; map its existing semantic variables to the shared recipe, retaining its dark mode and data visualization semantics.

Application text uses DM Sans/Kantumruy Pro/local Khmer font assets. Keep generous Khmer line height and wrapping; ceremonial fonts/artwork remain template-owned. Studio parent navigation and disclosures need 44px targets, visible focus, understandable headings, native keyboard controls and no hidden editor remounts. Ticket preview remains the same canvas as export.

Baseline screenshots must be produced from the preserved initial production build, with fictional API fixtures explicitly labeled as such. Current screenshots and automated axe results provide scoped evidence; physical devices, manual screen readers and Khmer editorial review remain separate gates.
