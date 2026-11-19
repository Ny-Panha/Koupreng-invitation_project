# Chapter 13 — Motion, Images, Network Payload & Performance

## 1. Build Payload Accounting

- **Frontend User Build:**
  - Total transform modules: 3,095
  - `dist/assets/index-*.js`: 477.66 kB (gzip: 142.10 kB)
  - Build execution time: 3.20s
- **Frontend Admin Build:**
  - Total transform modules: 2,122
  - `dist/assets/index-*.js`: 285.33 kB (gzip: 90.66 kB)
  - Build execution time: 613ms

## 2. Motion & Image Loading

- **Reduced Motion:** Verified with `reducedMotion: 'reduce'`; transitions gracefully fall back to instantaneous states without blocking UI interaction.
- **Image Optimization:** Cards use `loading="lazy"` and `decoding="async"`, except priority above-the-fold hero cards which use eager loading.
