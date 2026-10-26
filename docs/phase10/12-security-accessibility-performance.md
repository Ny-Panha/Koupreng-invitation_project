# Security, accessibility and performance

No payment, settlement, QR admission, server price, token-expiration, ownership or subscription policy changed. Preview editing retains strict origin/source/session checks and a fixed ID allowlist. All authored text is rendered as React text. No rich HTML, arbitrary iframe selectors, private video URLs or financial state is introduced.

Both dependency audits initially reported existing advisories. Compatible lockfile updates resolved Vite/follow-redirects and related transitive findings; the remaining test-only Happy DOM advisory required 21.0.4. Both apps now use that patched test dependency, and full audits report zero vulnerabilities. References: [maintainer advisory](https://github.com/capricorn86/happy-dom/security/advisories/GHSA-834v-8h66-3h79), [Vite advisory](https://github.com/vitejs/vite/security/advisories/GHSA-rq7h-c2jc-7f22). No application framework was added.

Checked accessibility includes a named keyboard separator, measured value bounds, focus, pointer alternatives via presets, 44px form controls, reduced motion, decorative hiding, native Settings validation and scoped WCAG 2/2.1/2.2 A/AA axe scans. Full WCAG conformance, human screen-reader coverage and physical touch hardware are not claimed.

Before main JS: 443.36kB / 129.81kB gzip. The final font build measured 444.89kB / 130.52kB gzip (about 0.35% / 0.55% higher). New on-demand Khmer faces add 209,064 WOFF2 bytes; matching local Latin/Koulen defaults bring the total to 488,380 bytes and remove a route-blocking remote CSS dependency. SVGs are inline, effects are bounded/paused, and no new heavy motion library or iframe resize loop was added. No Lighthouse/CPU/CLS scores are asserted.
