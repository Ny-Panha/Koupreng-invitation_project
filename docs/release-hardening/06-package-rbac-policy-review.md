# Package and RBAC policy review

The historical FREE 20 / BASIC 3 catalog is **not** the fresh current-main migration catalog. The new task-owned MySQL instance reports:

| Code | Price | Currency | Invitations | Account guest records | Per-event guest records | QR invitations | Check-in |
| --- | ---: | --- | ---: | ---: | ---: | --- | --- |
| FREE | 0.00 | USD | 1 | 40 | 40 | Yes | No |
| BASIC | 0.01 | USD | 1 | 40 | 40 | Yes | No |
| PRO | 199.00 | USD | 20 | 2,000 | 500 | Yes | Yes |
| PREMIUM | 499.00 | USD | 999 | 99,999 | 5,000 | Yes | Yes |

These are **development seed values**, not authenticated production pricing or permission to change economics. FREE/BASIC guest limits are equal here, so the historical inverse-quota anomaly is not reproduced. BASIC's USD 0.01 and equal limits still merit owner confirmation against the intended deployed catalog. No catalog price/quota mutation was introduced by this work. Isolated security tests create their own test plans, which are not public product policy.

The new HTTP test reads `/api/v1/public/packages`, compares each plan's current price/currency and each distinct quota/QR flag with its persisted record, checks authenticated `/api/v1/me/entitlements`, and confirms USER receives 403 from `/api/v1/admin/packages`. It does not hardcode product prices or grant roles from tiers.

Existing real HTTP cases retain owner-based entitlements, explicit collaborator permission, one-time purchases, expired grants, quota details only after authorization, and Premium media/design checks. Frontend regression expectations use the current **Explore eligible packages** dialog, verified offers and explicit template checkout metadata; unknown prices/currencies must not fabricate purchase links. Current package/upsell component tests remain mandatory.

QR invitation links, QR check-in, ticket presentation and gift-payment QR remain distinct contracts. Pending browser payment evidence never activates a subscription. No application enforcement or settlement rule was changed. Final regression results and unverified manual/provider checks appear in 08–11.
