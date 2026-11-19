# Report 15: Responsive Layouts & 844x390 Landscape Geometry Audit

> **Target:** Responsive Breakpoints, 844x390 Landscape & 320px Narrow Viewports  
> **Auditor:** Codex (Senior Mobile UX Engineer)  
> **Date:** 2026-11-19T21:30:00+07:00

---

## 1. Breakpoint Architecture

The Studio Chrome implements a multi-tier responsive strategy across five device profiles:

| Viewport Profile | Width / Dimensions | Behavior & Visual Mode | Screenshot Evidence |
|---|---|---|---|
| **Large Desktop** | 1920x1080 | 2-column split pane (60% editor, 40% phone simulator) | `05-desktop-1920-en-light.png` |
| **Standard Desktop** | 1440x900 | 2-column split pane with draggable resizer divider | `01-desktop-1440-en-light.png` |
| **Tablet Portrait** | 768x1024 | Single column editor with toolbar Preview modal action | `06-tablet-768-en-light.png` |
| **Mobile Portrait** | 393x852 (iPhone) | Fullscreen editor, compact tab dropdown, bottom action bar | `08-mobile-393-en-light.png` |
| **Narrow Mobile** | 320x568 (iPhone SE) | Ultra-compact padding, 44px minimum touch targets | `11-narrow-mobile-320-en-light.png` |
| **Mobile Landscape** | 844x390 (iPhone 14) | Compressed 54px toolbar, 15px titles, maximized scroll | `13-short-landscape-844x390-en.png` |

---

## 2. 844x390 Short Landscape Engineering

When an author rotates their phone horizontally into landscape mode (844px wide by 390px high), standard 80px toolbars consume more than 20% of total screen height, severely hindering form editing.

### Dedicated CSS Optimization (`StudioChrome.css` lines 538-550)
```css
@media (orientation: landscape) and (max-height: 500px) {
  .invitation-studio .studio-toolbar,
  #invitation-studio-toolbar .studio-toolbar {
    min-height: 54px;
    padding: 4px 12px;
  }
  .invitation-studio .studio-document h1 {
    font-size: 15px;
  }
  .invitation-studio .pe-editor-scroll-body {
    padding: 12px 16px 80px;
  }
}
```

### Verification
- Tested in Playwright visual tests 13 (`844x390 EN`) and 14 (`844x390 KM`).
- Output: The toolbar renders at exactly 54px, title text remains legible at 15px, and all form controls remain easily accessible and scrollable.
