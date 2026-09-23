# Security Policy

## Reporting a vulnerability

Do not open a public issue containing credentials, private data, exploit details, or production logs. Prefer a private GitHub security advisory for this repository. If private advisories are unavailable, contact the repository maintainers through a private channel and provide only the minimum reproduction data needed.

## Supported code

Security fixes target the `main` branch and active release branches. Historical branches and local development artifacts are not supported deployment targets.

## Credential handling

- Keep real values only in ignored local environment files or the deployment provider's secret store.
- Examples must use unmistakable placeholders.
- Never log tokens, passwords, reset links, private keys, authorization headers, or complete request bodies.
- A deleted credential must be rotated at its provider; Git deletion is not revocation.

## Open incident action

The 2026-07-21 cleanup found a Telegram bot credential in Git history. The current tree is redacted, but release remains blocked until a maintainer rotates the token through BotFather, updates every deployment secret, verifies the old token no longer works, and coordinates the history rewrite described in `docs/security/credential-incident-response.md`. Other historical findings must be triaged before the rewritten history is force-pushed.

## Release security gates

Required gates include current-tree Gitleaks, backend security/static tests, frontend dependency audits, Python Ruff/Bandit/pip-audit, a fresh-database migration, production builds, and controlled browser tests. Provider configuration, CORS/CSP, trusted proxy headers, payment callbacks, email, storage, and Telegram behavior still require staging/production validation.
