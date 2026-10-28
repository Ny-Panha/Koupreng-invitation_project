# Entitlements and RBAC

These are the actual locally reviewed package records and existing enforcement rules, not inferred tier names. Evidence: [sanitized policy records](evidence/baseline-product-policy.json), [public API](evidence/baseline-public-packages.json), and the disposable real-policy HTTP test in `Phase7CollaborationMySqlTests`.

| Capability | FREE | BASIC | PRO | PREMIUM |
| --- | --- | --- | --- | --- |
| Public purchasable catalog | No | Yes | Yes | Yes |
| Price / currency | 0 USD | 0.01 USD | 199 USD | 499 USD |
| Invitations / account guest records / event guest records | 1 / 20 / 20 | 1 / 3 / 3 | 20 / 2000 / 500 | 999 / 99999 / 5000 |
| Team capacity | 1 | 1 | 5 | 25 |
| Ordinary invitation QR | Yes | Yes | Yes | Yes |
| QR check-in | No | No | Yes | Yes |
| Seating | No | No | Yes | Yes |
| Advanced analytics | No | No | Yes | Yes |
| Custom branding | No | No | Yes | Yes |
| Team members | No | No | Yes | Yes |
| AI assistant | No | No | Yes | Yes |
| All premium templates | No | No | Yes | Yes |
| Video, monogram, illustrated map | No | No | No | Activated Premium snapshot only |

Guest import follows the existing `featuresJson.guestImport` opt-out rule. An individual active template purchase is independently valid without the all-template benefit. The exact Premium-only snapshot rule remains in `EntitlementService.featuresForPackage`; it has not been generalized to all paid plans.

## Event role boundary

| Actor | Existing effective event authority |
| --- | --- |
| Owner | Existing owner-managed tools; server feature/quota checks still apply |
| Accepted active ADMIN / MANAGER member | View/edit invitation, guests, RSVP, seating, check-in, reports as explicitly granted |
| Accepted DESIGNER | View/edit invitation |
| Accepted CHECK_IN_STAFF | View/check-in |
| Accepted VIEWER | View/reports |
| Unknown role | View only |
| Unaccepted, inactive, removed member / unrelated user | No event grant |

Collaboration additionally requires a valid owner-linked organization, owner team entitlement and capacity. Platform USER/STAFF/ADMIN roles do not purchase benefits and do not override event ownership. Account upgrade dialogs never offer to upgrade a collaborator's personal subscription to unlock somebody else's event.

Frontend order is authentication, event availability, permission/ownership, capability compatibility, verified benefits, capacity. This is a UX hint only: every mutation remains server-authorized. Access refreshes on identity/focus, rejection and a 60-second interval; obsolete background responses cannot restore revoked UI permission. An already-open Studio keeps its authored recovery copy, with save/template/publish disabled.

`PackageSnapshot.eligible` remains authoritative: status/activity/date validity and trusted PAID or the pre-existing explicit demo-admin-grant path. Pending/review/browser evidence does not activate features. USD/KHR and gift instruments remain separate.
