# Verified bugs, repairs and reproduction

Source HEAD: `2429b76545b683fad2a0a6f328bee3264875edc3` plus preserved, uncommitted Phase 07 work. No commit, push or deployment.

Severity P2 means material accessibility/navigation/content trust; P3 means polish. Each row has a reproduced starting or intermediate failure, a focused source repair and named fixture evidence. Open external rights/copy/device certification is separate from fixed local behavior. No P0/P1 was identified in this marketing diff.

| ID | Severity | User-visible defect | Current source | Reproduction / test |
|---|---|---|---|---|
| M07-015 | P3 | Fixed support launcher obscured the last Khmer footer credit | [MarketingChrome.css:257](../../../apps/frontend-user/src/layouts/components/MarketingChrome.css#L257) | footer credits remain readable above the support launcher |
| M07-001 | P2 | Venue background could receive focus despite aria-modal | [VenuesFeature.jsx:96](../../../apps/frontend-user/src/features/marketing/VenuesFeature.jsx#L96) | venue modal isolates background |
| M07-002 | P2 | Venue selection replaced history; selected state could survive WebKit Back | [VenuesFeature.jsx:67](../../../apps/frontend-user/src/features/marketing/VenuesFeature.jsx#L67) | venue click creates history |
| M07-003 | P2 | Clear search restored cards but retained visible query and lost task focus | [VenuesFeature.jsx:167](../../../apps/frontend-user/src/features/marketing/VenuesFeature.jsx#L167) | venue search reset |
| M07-004 | P2 | Unknown venue ID silently showed a directory; direct dismissal lacked a focus target | [VenuesFeature.jsx:157](../../../apps/frontend-user/src/features/marketing/VenuesFeature.jsx#L157) | venue direct entry |
| M07-005 | P2 | Broken venue imagery lacked fallback and generic stock photos implied specific venues | [VenuesFeature.jsx:76](../../../apps/frontend-user/src/features/marketing/VenuesFeature.jsx#L76) | venue failed photos; slow illustrative photos |
| M07-006 | P2 | Dark metric text and white vendor surfaces were unreadable | [MarketingFeature.css:1860](../../../apps/frontend-user/src/features/marketing/MarketingFeature.css#L1860) | marketing reflow and axe: dark/en; dark/km |
| M07-007 | P2 | Contact light eyebrow missed normal-text contrast | [MarketingPages.css:11](../../../apps/frontend-user/src/features/marketing/MarketingPages.css#L11) | marketing reflow and axe: light/en; light/km |
| M07-008 | P2 | Direct route titles were overwritten; contact description/canonical absent | [MarketingMetadata.jsx:7](../../../apps/frontend-user/src/features/marketing/MarketingMetadata.jsx#L7) | about/help redirects; contact title; metadata unit tests |
| M07-009 | P3 | Claimed editorial Latin face was overridden by body font | [MarketingFeature.css:42](../../../apps/frontend-user/src/features/marketing/MarketingFeature.css#L42) | before/after home capture pairs; loaded-font manifests |
| M07-014 | P2 | Marketing navigation discarded an unsent contact draft | [ContactDraftProvider.jsx:4](../../../apps/frontend-user/src/features/marketing/ContactDraftProvider.jsx#L4) | contact draft survives marketing Back; draft boundary unit |
| M07-013 | P2 | Native venue shell was visible before its modal open state | [VenuesFeature.css:352](../../../apps/frontend-user/src/features/marketing/VenuesFeature.css#L352) | native-ready-repeat; venue direct entry |
| M07-012 | P2 | Dark contact validation messages failed contrast | [MarketingPages.css:12](../../../apps/frontend-user/src/features/marketing/MarketingPages.css#L12) | contact invalid state contrast |
| M07-011 | P2 | Populated featured/catalog Preview hover became illegible in dark mode | [MarketingChrome.css:589](../../../apps/frontend-user/src/layouts/components/MarketingChrome.css#L589) | featured collection hover and discovery |
| M07-010 | P2 | Unsubstantiated first/premier, 100% and seven-viewport marketing claims | [LandingHero.jsx:13](../../../apps/frontend-user/src/features/marketing/components/LandingHero.jsx#L13) | home EN/KM screenshots; renderer-registry.json |

[Machine defect register](evidence/defect-register.json). Baseline browser result: FAIL (exit 1); Running 15 tests using 2 workers; 9 failed; 6 passed (49.0s); one of its nine failures was our contact selector error, not a product defect. Subsequent scans exposed the contact contrast failure; WebKit diagnosis exposed stale derived state. Initial and intermediate logs/traces are preserved, not rewritten as passes. Additional selector namespacing and immediate venue paint are preventive containment improvements, not invented confirmed cross-renderer bugs.
