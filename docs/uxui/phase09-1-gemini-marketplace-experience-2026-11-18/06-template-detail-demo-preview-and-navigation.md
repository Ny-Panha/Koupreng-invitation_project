# Chapter 06 — Template Detail, Demo, Preview & Navigation

## 1. Renderer Boundaries

- All **10 dedicated renderer families**, **38 static aliases**, and **two shared renderer IDs** remain untouched and independent.
- Preview iframe protocol: Origin, session, nonce, and postMessage trust protocol are completely preserved without relaxation.
- Preview modal supports keyboard `Escape` to close, returns focus to triggering card, and respects `prefers-reduced-motion`.
- Preview does not grant entitlement: client-side preview state cannot unlock features or bypass server purchase.
