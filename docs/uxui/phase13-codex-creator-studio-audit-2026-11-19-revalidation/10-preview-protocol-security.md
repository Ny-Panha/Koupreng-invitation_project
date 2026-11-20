# Preview origin, source, session and edit targets

Independent revalidation: 19 November 2026, Asia/Bangkok. Scope: local source, adapters and named fixtures.

The preview channel validates origin, source Window, per-editor session and allowed message shape. Recursive data validation rejects forbidden prototype keys, excessive nesting/arrays and oversized strings. postPreviewMessage supplies an explicit target origin; no wildcard was introduced. Only STUDIO_EDIT_SECTIONS can navigate the inspector, and click editing excludes links, buttons, inputs, media, summary and role=button controls.

The current application constructs same-origin template preview URLs from registry identities. buildPreviewUrl permits HTTP(S) URLs generally, so safety also depends on these controlled callers; this is not represented as a general untrusted-URL sanitizer. Unit negatives cover schema/channel contracts, with real iframe interactions in the browser. No owner credential, customer guest token or real account was added to evidence.

Evidence:

- [negative-tests.json](evidence/negative-tests.json)
- [source-routes.json](evidence/source-routes.json)
- [test-runs.json](evidence/test-runs.json)

[Report index](README.md).
