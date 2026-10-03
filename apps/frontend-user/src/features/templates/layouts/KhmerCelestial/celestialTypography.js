export function celestialFont(font) {
  return typeof font === "string" && font.trim()
    ? `${JSON.stringify(font.trim())}, "Noto Sans Khmer", serif` : undefined;
}

export function celestialElementFont(content, element) {
  return { fontFamily: celestialFont(content.elementFonts?.[element] || content.fontKhmer) };
}
