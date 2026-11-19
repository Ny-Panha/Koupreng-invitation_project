# 14 — EN/KM Language and Cultural Review

**Phase:** `11.1`  
**Localization:** English (`en`) and Khmer (`km`)

---

## 1. Cultural Dignity & Khmer Wedding Terminology

Koupreng respects the sacred and formal nature of Cambodian weddings. Terminology has been rigorously audited against traditional Cambodian etiquette:
- **មង្គលការ (Wedding Ceremony):** Used for official wedding celebrations.
- **កូនកំលោះ (Groom) & កូនក្រមុំ (Bride):** Standard respectful designations.
- **មាតាបិតាខាងប្រុស (Groom's Parents) & មាតាបិតាខាងស្រី (Bride's Parents):** Honorific terminology for parents.
- **ពិធីសូត្រមន្ត / បុណ្យចម្រើនព្រះបរិត្ត (Monk Blessing / Merit Making):** Proper Buddhist terminology.

---

## 2. Typography & Diacritic Rendering

Khmer script utilizes upper vowels (e.g. ិ, ី, ឹ) and subscript consonants (ជើងអក្សរ e.g. ្ក, ្ខ). If line-height is set to standard English values (1.2–1.4), these subscripts are frequently clipped.
- In `EventCreatePage.css`, line-height for Khmer text is enforced at `1.6` to `1.8`.
- Form inputs feature generous vertical padding (`padding: 12px 16px`) to ensure subscripts render cleanly.
