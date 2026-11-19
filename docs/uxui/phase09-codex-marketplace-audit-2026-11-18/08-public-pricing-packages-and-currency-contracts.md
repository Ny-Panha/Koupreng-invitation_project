# Chapter 08 — Public Pricing, Packages & Currency Contracts

## 1. Contract-Driven Packages

Public packages render from `subscriptionService.publicPackages()` backend DTOs.
- **Tier 1 (Free / Starter):** 1 event, basic templates, standard guest management.
- **Tier 2 (Standard):** Full-featured tier with custom audio, QR check-in, and premium templates.
- **Tier 3 (Premium / Deluxe):** Unlimited guests, VIP seating, custom domain, priority support.

## 2. Honest Pricing & Currency Separation

- **USD / KHR Independence:** USD amounts (e.g., $35.00) and KHR amounts (e.g., 140,000 ៛) are rendered from explicit backend fields without unapproved client-side FX conversions.
- **Missing Price Handling:** If price is null or invalid, the UI displays neutral copy ("Included with Premium access" or contact sales) rather than synthesizing a false $0.00 price.
- **Marketing Claims (P09-006):** Replaced unverified "Popular choice" badge with neutral, factual "Full-featured tier" copy.
