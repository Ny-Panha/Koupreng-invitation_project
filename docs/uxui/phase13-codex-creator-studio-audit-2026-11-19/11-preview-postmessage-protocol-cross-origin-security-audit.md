# Report 11: Preview postMessage Protocol & Cross-Origin Security Audit

> **Target:** `previewMessaging.js`, LivePhoneSimulator Iframe Bridge & Nonce Protocol  
> **Auditor:** Codex (Senior Security Engineer)  
> **Date:** 2026-11-19T21:30:00+07:00

---

## 1. Threat Model & Injection Vectors

The Live Phone Simulator embeds wedding templates inside an `<iframe>`. Because iframes can be targets or vectors for clickjacking, cross-origin data exfiltration, or malicious script execution via `window.postMessage`, a strict bidirectional messaging protocol is required.

---

## 2. Protocol Security Architecture

The communication protocol in `shared/preview/previewMessaging.js` enforces four defensive boundaries:

```text
Editor Window (Parent)                       Preview Simulator (Child Iframe)
┌───────────────────────┐                    ┌──────────────────────────────┐
│ Generate Session Nonce│                    │ Receives handshake           │
│ eventId: 101          │                    │ validates targetOrigin       │
│ nonce: "rnd_39fa8"    │──── Handshake ────>│ captures session nonce       │
│ origin: window.origin │                    │                              │
│                       │                    │                              │
│ Validates Child Ack   │<─── HandshakeAck ──│ Echoes nonce & origin        │
│                       │                    │                              │
│ Dispatches live diffs │                    │ Applies diff to DOM          │
│ checks message schema │──── UPDATE_PREV ──>│ rejects proto pollution      │
│                       │                    │                              │
│ Filters late messages │<─── USER_INTERACT ─│ Dispatches sanitized actions│
└───────────────────────┘                    └──────────────────────────────┘
```

### Verified Protections (Negative Test N13-09)
1. **Target Origin Strictness:** Messages originating from mismatched origins (e.g. `https://malicious-site.com`) are immediately dropped.
2. **Session Nonce Validation:** Each mounted simulator generates a cryptographic UUID nonce. Messages carrying foreign nonces are discarded.
3. **Prototype Pollution Guard:** Payload sanitization blocks keys like `__proto__`, `constructor`, and `prototype`.
4. **Session Isolation Between Events (N13-02):** When switching between Event A and Event B, late-arriving messages from Event A cannot bleed into Event B's preview session.
