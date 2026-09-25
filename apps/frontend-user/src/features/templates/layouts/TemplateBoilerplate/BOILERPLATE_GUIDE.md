# 🚀 មគ្គុទ្ទេសក៍បង្កើត Template ថ្មីៗយ៉ាងឆាប់រហ័ស (Template Boilerplate Guide)

ប្រព័ន្ធនេះត្រូវបានរៀបចំជា **Template Starter Architecture**។ នៅពេល Nha ចង់បង្កើត Template ថ្មី ១ ឬ ១០ ទៀត គឺចំណាយពេលត្រឹមតែ **១០ ទៅ ១៥ នាទី** ក្នុង ១ Template ប៉ុណ្ណោះ ដោយអនុវត្តតាម **៣ ជំហានងាយៗ** ខាងក្រោម៖

---

## ជំហានទី ១: ចម្លង (Duplicate) Folder Boilerplate
ចូលទៅកាន់ Folder:
`apps/frontend-user/src/features/templates/layouts/`

ធ្វើការ Copy folder `TemplateBoilerplate` ហើយប្តូរឈ្មោះទៅតាម Template ថ្មីដែល Nha ចង់បាន ឧទាហរណ៍៖
- `layouts/RoyalRubyWedding/`
- ប្តូរឈ្មោះ file ខាងក្នុង៖
  - `RoyalRubyLayout.jsx`
  - `royal-ruby.css`

---

## ជំហានទី ២: កែប្រែពណ៌ & CSS Theme ក្នុង file `.css`
គ្រាន់តែកែប្រែ **CSS Variables** នៅក្បាល file `.css` នោះរូបរាង Template ទាំងមូលនឹងប្តូរភ្លាម៖

```css
.tpl-boilerplate {
  --tpl-primary: #e11d48;         /* ពណ៌មេ (ឧ. ក្រហម Ruby, មាស Gold, បៃតង Emerald) */
  --tpl-bg: #0f172a;              /* ពណ៌ផ្ទៃខាងក្រោយ Dark ឬ Light */
  --tpl-surface: rgba(30, 41, 59, 0.8); /* ផ្ទៃកាត Glassmorphism */
  --tpl-border: rgba(225, 29, 72, 0.3); /* បន្ទាត់គែម */
  --tpl-font-khmer: "Moul", serif;      /* ពុម្ពអក្សរខ្មែរ */
}
```

---

## ជំហានទី ៣: ចុះឈ្មោះក្នុង `templateRegistry.js`
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
1. **Live Preview Sync ស្រាប់:** នៅពេលកែប្រែក្នុង Admin Studio វានឹង update ទៅ Simulator Iframe ដោយស្វ័យប្រវត្តិ។
2. **Drag & Drop Sections ស្រាប់:** គាំទ្រការរៀបលំដាប់លំដោយ និងបិទ/បើក Section ពី Admin ដោយមិនបាច់សរសេរកូដបន្ថែម។
3. **Mobile-First Responsive:** ទំហំ Shell ធានាថាមើលលើទូរស័ព្ទដៃស្អាត ១០០%។
4. **Music & Lightbox:** មានកូដចាក់ភ្លេង និងចុចពង្រីករូបថត Gallery (Lightbox) រួចជាស្រេច។
