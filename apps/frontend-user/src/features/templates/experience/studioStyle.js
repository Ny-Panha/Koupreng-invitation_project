export function celestialStudioStyle(value = {}) {
  const colors = { primary: "--kc-green", accent: "--kc-gold", text: "--kc-ink", background: "--kc-ivory", border: "--kc-line" };
  const result = {};
  Object.entries(colors).forEach(([key, variable]) => { if (/^#[0-9a-f]{6}$/i.test(value[key])) result[variable] = value[key]; });
  if (["Kantumruy Pro", "DM Sans"].includes(value.bodyFont)) result["--kc-khmer-body"] = `"${value.bodyFont}", "Kantumruy Pro", sans-serif`;
  if (["left", "center", "right"].includes(value.align)) result["--studio-message-align"] = value.align;
  if (["small", "normal", "large"].includes(value.messageSize)) result["--studio-message-size"] = { small: "15px", normal: "18px", large: "21px" }[value.messageSize];
  if (Number.isFinite(value.portraitY)) result["--studio-portrait-position"] = `50% ${Math.max(0, Math.min(100, value.portraitY))}%`;
  return result;
}
