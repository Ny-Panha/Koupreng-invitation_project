# Route registry identity and 38 alias coverage

Audit started 18 November 2026; continued 19 November 2026 (Asia/Bangkok). Independent local fixture/source evidence only.

Current route factories are checked against the 111 customer + 24 admin = 135 leaf route contract matrix. The full unit runs include both inventory tests; [route/family/alias data](evidence/route-family-alias-matrix.json) carries every row rather than sampling route names.

Actual customer surfaces include `/templates`, `/templates/:id`, `/templates/:id/demo`, `/templates/:id/preview`, guarded `/templates/browse`, `/templates/:templateId/checkout`, published `/w/:slug` and `/i/:slug`, local `/preview/:draftId`, and owner workspace/preview aliases. Admin routes use their own app origin, including `/templates/:templateId`; a literal `/admin` prefix is not assumed.

All 38 source aliases have explicit equivalence assertions in `Phase10Identity.test.jsx`; stable slug identity beats numeric collisions. Unknown stable code + ID7 fails closed, and trusted explicit preset metadata still selects its authorized renderer. This contract selects art only; it never grants ownership, purchase, publish or entitlement. No alias was removed.

| Family | Component | Aliases |
| --- | --- | --- |
| khmer-floral-gold | KhmerFloralGoldLayout | khmer-floral-gold, KHMER_FLORAL_GOLD |
| royal-garden-cinematic | RoyalGardenCinematicLayout | royal-garden-cinematic, ROYAL_GARDEN_CINEMATIC |
| silk-heritage | SilkHeritageLayout | silk-heritage, SILK_HERITAGE |
| template-boilerplate | TemplateBoilerplateLayout | template-boilerplate, custom-starter |
| khmer-celestial | KhmerCelestialLayout | khmer-celestial, KHMER_CELESTIAL, 10, royal-khmer-wedding, 1, royal-khmer, RUBY_RED, ROYAL_KHMER |
| the-digital-yes-wedding | DigitalYesLayout | the-digital-yes-wedding, 7, digital-yes, GOLD_LUXURY |
| emerald-canva-luxe-wedding | EmeraldLuxeLayout | emerald-canva-luxe-wedding, emerald_royal_luxe, emerald-royal-luxe, emerald royal luxe, emerald-luxe-wedding, 9, 2, emerald-luxe, EMERALD_GREEN |
| withjoy-modern-portal | WithJoyPortalLayout | withjoy-modern-portal, 3 |
| bliss-editorial-wedding | BlissEditorialLayout | bliss-editorial-wedding, 4 |
| khmer-golden-canva-inspired-wedding | CanvaKhmerWeddingTemplate | khmer-golden-canva-inspired-wedding, cover-khmer-golden-wedding, 5, CHAMPAGNE, KHMER_GOLDEN |

Inventory/unit equivalence is separate from rendered coverage. Ten canonical family demo routes are painted; all 38 aliases are not individually painted across every device and state. Shared IDs and fallback keep separate rows and distinct contracts.
