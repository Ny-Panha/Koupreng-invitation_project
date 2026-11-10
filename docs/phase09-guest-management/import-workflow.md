# Workstream B — CSV/Excel Import & Mobile Safari Web Crypto Mitigation

## 1. 5-Step Import Experience

The guest import modal (`GuestImportModal.jsx`) implements a progressive disclosure wizard:
1. **Choose Source:** Upload CSV or XLSX workbook (max 5 MB, up to 1,000 rows). Sample downloadable files in `.csv` and `.xlsx` formats are provided.
2. **Map Columns:** Automatic mapping of Khmer (`ឈ្មោះភ្ញៀវ`, `លេខទូរស័ព្ទ`, `ចំនួនកៅអី`) and English column headers, with validation preventing duplicate mappings.
3. **Review Rows:** Visual table showing parsed records, highlighting duplicates, missing names, or formula cells. Problematic rows can be edited or excluded directly.
4. **Confirm:** Pre-commit summary displaying ready rows, skipped rows, and batch identifier.
5. **Results:** Authoritative server-side commit response detailing `importedCount`, `updatedCount`, `skippedCount`, and `failedCount`.

---

## 2. Critical Mobile Safari Web Crypto Investigation & Solution

### Root Cause Analysis
- In W3C standards, `window.crypto.subtle` is strictly restricted to **Secure Contexts** (`window.isSecureContext === true`).
- When a developer or host accesses the development environment from a physical iPhone or mobile device over a non-loopback LAN HTTP origin (e.g., `http://192.168.1.50:5173/`), `isSecureContext` is `false`.
- Consequently, `window.crypto.subtle` evaluates to `undefined`.
- Calling `await crypto.subtle.digest('SHA-256', bytes)` in `batchIdentity` resulted in an unhandled exception: `TypeError: Cannot read properties of undefined (reading 'digest')`.

### Engineering Solution
`computeDigestHex` wraps the digest logic with feature detection and a deterministic fallback:
```javascript
function fallbackDeterministicHash(string) {
  let h1 = 0xdeadbeef, h2 = 0x41c64e6d;
  for (let i = 0; i < string.length; i++) {
    const ch = string.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
}

async function computeDigestHex(payloadString) {
  if (typeof crypto !== 'undefined' && crypto.subtle && typeof crypto.subtle.digest === 'function') {
    try {
      const bytes = new TextEncoder().encode(payloadString);
      const buffer = await crypto.subtle.digest('SHA-256', bytes);
      return Array.from(new Uint8Array(buffer), byte => byte.toString(16).padStart(2, '0')).join('');
    } catch {
      // Fall through to deterministic fallback if subtle throws in insecure context
    }
  }
  return fallbackDeterministicHash(payloadString);
}
```
- **Security Invariant:** Cryptographic randomness for the batch UUID itself continues to be generated using `generateSecureUuid()`, ensuring batch uniqueness and idempotency without weakening security.
- **Verified:** Tested in `serverTools.test.jsx` with an emulated insecure context (`crypto.subtle === undefined`), proving 100% pass rate.

---

## 3. CSV Formula Injection Defense

Exported and imported guest text is protected using `safeCsvCell` in `guestImport.js`:
- Formula trigger characters (`=`, `+`, `-`, `@`, `\t`, `\r`) are sanitized by prepending a single quote (`'`), ensuring Microsoft Excel and Google Sheets treat them strictly as plaintext rather than executable macros or DDE commands.

---

## 4. Evaluation of VCF / vCard Contact Import

- **Feasibility Findings:** Comprehensive `.vcf` parsing requires handling vCard 2.1, 3.0, and 4.0 specifications with base64 embedded photos, multiple phone numbers, address blocks, and character encoding variations.
- **Decision:** As recommended by prompt guidelines, direct `.vcf` parsing is placed on the post-Phase 09 roadmap. Users are guided to export contacts to standard CSV or Excel files, preserving phone leading zeros and Khmer names.
