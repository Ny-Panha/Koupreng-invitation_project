# Shared application visual roles

The existing warm ivory, charcoal, antique gold and teal recipe is retained. A new Burgundy layer would have competed with already established application styles and template themes. Gold remains the primary filled action/accent; body text, borders and form surfaces use their semantic roles. Dark gold is used for small accent text against ivory when ordinary action gold would fall below the contrast threshold.

`packages/design-tokens/application.css` is the canonical source. `scripts/sync-design-tokens.cjs` exports it into each frontend's existing isolated Docker build context. User `semantic-tokens.css` and admin `application-tokens.css` are generated copies, checked by the user Vitest suite and the generator's `--check` mode. Neither frontend requires an import outside its container build context.

User workspace roles continue to alias `--ui-*`; marketing canvas/text/surfaces and primary actions now use the same recipe. Authentication uses the shared canvas. Admin root variables, shell, shared page headings, primary/secondary actions and search controls use semantic roles. Common controls have visible focus and 44px targets. Existing dark-mode semantic variables remain in place.

Rendered admin checks found real low-contrast dashboard labels and an unfocusable horizontal table region. These were corrected with readable muted/status colors and a named keyboard-focusable region. Dashboard/report amounts, currencies, dates, queries and business behavior were not changed. Scoped admin axe checks pass in English/Khmer at 390 and 1440px.

Invitation skins, ceremonial fonts, floral imagery, customized colors and cover artwork remain owned by each template. Before/after evidence uses the preserved initial user production build and an exact Git archive of the initial admin source. User visual fixtures and actual disposable admin data are labeled separately in the evidence report.
