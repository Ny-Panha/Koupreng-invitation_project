# 06 — Studio Top Toolbar, Save, Publish, and History

## 1. Anatomy of StudioToolbar
- **Event Identity & Back:** Back button with confirmation if dirty; event title and current template tag.
- **Truthful Status Indicator:**
  - `saved`: "Saved to server" / "បានរក្សាទុក" (Green Check icon)
  - `saving`: "Saving…" / "កំពុងរក្សាទុក…" (Animated LoaderCircle)
  - `unsaved`: "Unsaved changes" / "មិនទាន់រក្សាទុក" (Subtle indicator)
  - `offline`: "Offline" / "គ្មានអ៊ីនធឺណិត" (CloudOff icon)
  - `failed`: "Save failed" / "រក្សាទុកបរាជ័យ" (AlertTriangle)
  - `conflict`: "Newer version on server" (Blocked)
  - `expired`: "Session expired" (Blocked)
- **Actions:**
  - Save: Ctrl+S / Cmd+S shortcut, primary button.
  - Preview: Eye icon, triggers modal sheet on mobile or focus on desktop.
  - Publish: Distinct gold button for eligible events.
  - More Menu: Document Undo (Ctrl+Z), Redo (Ctrl+Shift+Z / Ctrl+Y), and Reset.

## 2. Keyboard & Touch Verification
- Native text input undo/redo is preserved when focused in an `<input>` or `<textarea>`.
- Document-level shortcuts operate when not typing.
- All controls have min-height 44px+ touch targets.

See [Screenshots](evidence/screenshots/01-desktop-1440-en-light.png) and [Toolbar Tests](evidence/exact-command-results.json).
