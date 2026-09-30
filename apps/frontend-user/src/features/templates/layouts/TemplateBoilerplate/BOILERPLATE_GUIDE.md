# 🚀 មគ្គុទ្ទេសក៍បង្កើត Template ថ្មីៗយ៉ាងឆាប់រហ័ស (Template Boilerplate Guide)

ប្រព័ន្ធនេះត្រូវបានរៀបចំជា **Template Starter Architecture & Universal Contract**។ នៅពេល Nha ចង់បង្កើត Template ថ្មី ១ ឬ ១០ ទៀត គឺចំណាយពេលត្រឹមតែ **១០ ទៅ ១៥ នាទី** ក្នុង ១ Template ប៉ុណ្ណោះ ដោយអនុវត្តតាម **៤ ជំហានងាយៗ** ខាងក្រោម៖

---

## ជំហានទី ១: ចម្លង (Duplicate) Folder Boilerplate
ចូលទៅកាន់ Folder:
`apps/frontend-user/src/features/templates/layouts/`

ធ្វើការ Copy folder `TemplateBoilerplate` ហើយប្តូរឈ្មោះទៅតាម Template ថ្មីដែល Nha ចង់បាន ឧទាហរណ៍៖
- `layouts/RoyalRubyWedding/`
- ប្តូរឈ្មោះ file ខាងក្នុង៖
  - `RoyalRubyLayout.jsx`
  - `royal-ruby.css`
  - `template.json`

---

## ជំហានទី ២: កំណត់ Manifest ក្នុង `template.json`
កែសម្រួលព័ត៌មាន template និង default cover ក្នុង `template.json`:

```json
{
  "slug": "royal-ruby",
  "name": "Royal Ruby Wedding",
  "version": "1.0.0",
  "cover": {
    "type": "image",
    "src": "/facebook/all/03-card/cover-card.jpg",
    "poster": "/facebook/all/03-card/cover-card.jpg"
  }
}
```

---

## ជំហានទី ៣: កែប្រែ Design Tokens & CSS Theme ក្នុង file `.css`
គ្រប់ Template ទាំងអស់ប្រើប្រាស់ **CSS Design Tokens & Asset Slots**៖

```css
.tpl-boilerplate {
  /* 1. Global Color Palette Tokens */
  --tpl-primary: #e11d48;               /* ពណ៌មេ (ឧ. ក្រហម Ruby, មាស Gold, បៃតង Emerald) */
  --tpl-secondary: #fecdd3;             /* ពណ៌រង Secondary */
  --tpl-bg: #0f172a;                    /* ពណ៌ផ្ទៃខាងក្រោយ Dark ឬ Light */
  --tpl-surface: rgba(30, 41, 59, 0.8); /* ផ្ទៃកាត Glassmorphism */
  --tpl-border: rgba(225, 29, 72, 0.3); /* បន្ទាត់គែម */
  --tpl-font-khmer: "Moul", serif;      /* ពុម្ពអក្សរខ្មែរ */

  /* 2. Contextual Tokens (សម្រួល Theme ក្នុង Section) */
  --tpl-tone: var(--tpl-text-primary);
  --tpl-accent: var(--tpl-primary);

  /* 3. Asset Slots (បាត់រូបមិនបែក Layout) */
  --asset-hero: none;
  --asset-hero-ratio: 4 / 5;
  --asset-frame: none;
  --asset-frame-ratio: 16 / 9;
}
```

---

## ជំហានទី ៤: ចុះឈ្មោះក្នុង `templateRegistry.js`
បើក file `apps/frontend-user/src/features/templates/registry/templateRegistry.js`:

```javascript
import RoyalRubyLayout from "../layouts/RoyalRubyWedding/RoyalRubyLayout";

export const templateRegistry = {
  "royal-ruby": RoyalRubyLayout, // ដាក់ slug របស់ template ថ្មី
  // ...
};
```

---

## 🌟 អត្ថប្រយោជន៍នៃ Boilerplate នេះ (Built-in Superpowers)
1. **Universal CoverBackground ស្រាប់:** ប្រើប្រាស់ `<CoverBackground>` ដោយស្វ័យប្រវត្តិ — គាំទ្ររូបភាព Full-bleed, វីដេអូ Looping Playback, និង Smart Contrast Scrim ដោយមិនបាច់សរសេរកូដ Cover ឡើងវិញទេ។
2. **Live Preview Sync ស្រាប់:** នៅពេលកែប្រែក្នុង Admin Studio វានឹង update ទៅ Simulator Iframe ដោយស្វ័យប្រវត្តិ។
3. **Graceful Asset Slots:** រូបភាពតុបតែងទាំងអស់ប្រើ CSS variables បើ User មិនដាក់រូប វានឹងក្លាយជាចន្លោះទទេស្អាត មិនបែកបាក់រចនាសម្ព័ន្ធទំព័រឡើយ។
4. **Drag & Drop Sections ស្រាប់:** គាំទ្រការរៀបលំដាប់លំដោយ និងបិទ/បើក Section ពី Admin ដោយមិនបាច់សរសេរកូដបន្ថែម។
5. **Mobile-First Responsive:** ទំហំ Shell ធានាថាមើលលើទូរស័ព្ទដៃស្អាត ១០០%។
6. **Music & Lightbox:** មានកូដចាក់ភ្លេង និងចុចពង្រីករូបថត Gallery (Lightbox) រួចជាស្រេច។
