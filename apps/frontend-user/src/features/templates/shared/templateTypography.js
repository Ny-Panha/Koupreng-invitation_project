const LOCAL_FONTS = ['Moul', 'Bayon', 'Kantumruy Pro', 'Cormorant Garamond', 'DM Sans', 'Battambang', 'Noto Sans Khmer', 'Cinzel', 'Playfair Display', 'Koulen'];
export function isLocalTemplateFont(font) { return LOCAL_FONTS.includes(font); }

export function authoredHeadingStyle(content, text, defaultKhmer = 'Moul') {
  const khmer = /[\u1780-\u17ff]/.test(text || '');
  const font = khmer ? content.fontKhmer || defaultKhmer : content.fontLatin;
  return {
    ...(font ? { fontFamily: `${JSON.stringify(font)}, "Noto Sans Khmer", ${khmer ? 'serif' : 'Georgia, serif'}` } : {}),
    ...(khmer ? { lineHeight: 1.7, letterSpacing: 'normal', overflowWrap: 'anywhere' } : {}),
  };
}
