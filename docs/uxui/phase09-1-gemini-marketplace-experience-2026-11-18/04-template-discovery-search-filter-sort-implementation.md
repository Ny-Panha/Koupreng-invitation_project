# Chapter 04 — Template Discovery, Search, Filter & Sort Implementation

## 1. Filter Dimensions

1. **Category Navigation:**
   - 6 authentic categories: Khmer tradition (`ancient`), Modern (`modern`), Contemporary (`contemporary`), Luxury (`luxury`), Minimalist (`minimalist`), Floral (`floral`).
   - Categorized chips feature `aria-pressed` states and clear active gold outlines.

2. **Price Preferences:**
   - Pills for "All", "Free", and "Premium".
   - Enforces backend truth: missing amounts are never synthesized into Free.

3. **Deterministic Sorting:**
   - Options: Curated default, Name (A–Z), Name (Z–A).
   - Uses `localeCompare` respecting Khmer Unicode sorting rules.
   - Strictly avoids fake popularity, rating, or countdown rankings.

4. **Unicode Search & Clear Button:**
   - Case-insensitive, accent-insensitive search over localized name, category, and style description.
   - Accessible clear button restores catalog without page reload or focus loss.
