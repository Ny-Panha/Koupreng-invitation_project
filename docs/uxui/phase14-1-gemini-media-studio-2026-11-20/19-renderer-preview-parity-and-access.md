# Phase 14.1 — Renderer and Preview Parity and Access

## 1. Renderer Family Support
Media managed in the Atelier feeds all ten KoupReng renderer families:
1. Traditional Gold (វិមានមាស)
2. Modern Minimal (បុប្ផាថ្មី)
3. Royal Palace (រាជវាំង)
4. Lotus Romance (ផ្កាឈូក)
5. Angkor Splendor (អង្គរ)
6. Sunset Silk (សូត្រមាស)
7. Emerald Garden (មរកត)
8. Silver Elegance (ប្រាក់)
9. Champagne Luxury (ស្រាសំប៉ាញ)
10. Monochrome Classic (បុរាណ)

## 2. Guest Privacy Isolation
Guest view endpoints (`/invitations/:slug`) are strictly read-only and have zero access to media upload, replacement, or deletion endpoints.

- [Machine Evidence: Renderer Media Matrix](evidence/renderer-media-matrix.json)
- [Negative Test: N14-41](26-n14-negative-case-matrix.md)
