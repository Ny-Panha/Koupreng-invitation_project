# Application tokens

`application.css` owns management/marketing color, focus, radius and motion roles for both Vite applications. User `semantic-tokens.css` and admin root variables adapt these roles to existing components. Template-owned theme variables and artwork stay independent. Decorative gold may be lighter than actionable gold; controls use `--ui-action` with `--ui-on-action`.

Run `node scripts/sync-design-tokens.cjs` after editing the source, and `node scripts/sync-design-tokens.cjs --check` to check drift. The generated copies keep each application's existing isolated Docker build context self-contained. The user Vitest suite also checks these exports against the canonical source.
