/** Privacy filtering for displayed and exported diagnostics, not a general DLP guarantee. */
const REDACTED = "[REDACTED]";

function decodedKey(key) {
  let value = String(key);
  for (let i = 0; i < 3; i++) {
    try {
      const decoded = decodeURIComponent(value);
      if (decoded === value) break;
      value = decoded;
    } catch { break; }
  }
  return value.replace(/[^a-z0-9]/gi, "").toLowerCase();
}

function sensitiveKey(key) {
  const normalized = decodedKey(key);
  return /token|password|passwd|secret|credential|authorization|cookie|apikey/.test(normalized)
    || /^(?:key|auth|apikey|privatekey|clientkey|signature|cvv|cardnumber|paymentref(?:erence)?|providerref(?:erence)?|transactionref(?:erence)?|transactionid|bankref(?:erence)?)$/.test(normalized);
}

/** Keep useful path/filter context; decode keys before checking mixed or encoded names. */
export function sanitizePath(path) {
  if (path == null) return "";
  const redactUrl = value => value
    .replace(/(\/public\/invitations\/[^/?#\s"']+\/guests\/)[^/?#\s"']+/gi, `$1${REDACTED}`)
    .replace(/([?&#])([^?&#=\s"']+)=([^&#\s"']*)/g,
    (match, separator, key) => sensitiveKey(key) ? `${separator}${key}=${REDACTED}` : match);
  let value = redactUrl(String(path));
  let decoded = value;
  for (let i = 0; i < 3 && /%[0-9a-f]{2}/i.test(decoded); i++) {
    try { decoded = decodeURIComponent(decoded); } catch { break; }
    // Encoded whole URLs can occur inside error descriptions. Decode only when filtering a secret.
    const filtered = redactUrl(decoded);
    if (filtered !== decoded) value = filtered;
  }
  return redactUrl(value);
}

export function redactSecrets(text) {
  if (text == null) return "";
  let value = sanitizePath(text);
  value = value.replace(/\bBearer\s+[^\s"',;]+/gi, `Bearer ${REDACTED}`);
  value = value.replace(/(["']?)([a-zA-Z0-9_%.-]+)\1\s*([:=])\s*("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|[^&\s,;}]+)/g,
    (match, quote, key, separator, payload) => sensitiveKey(key)
      ? `${quote}${key}${quote}${separator}${payload.startsWith('"') ? ' "' + REDACTED + '"' : payload.startsWith("'") ? " '" + REDACTED + "'" : REDACTED}`
      : match);
  // Header values can contain spaces and punctuation; redact the whole header line.
  value = value.replace(/\b(Authorization|Proxy-Authorization|Cookie|Set-Cookie|X-Api-Key)\s*:\s*[^\r\n]+/gi,
    (_, key) => `${key}: ${key.toLowerCase().includes("authorization") ? "Bearer " : ""}${REDACTED}`);
  return value;
}

/** Scrub values at every depth, including array/number/object secrets and free-text notes. */
export function redactDiagnosticValue(value, key = "") {
  if (sensitiveKey(key)) return REDACTED;
  if (typeof value === "string") return redactSecrets(value);
  if (Array.isArray(value)) return value.map(item => redactDiagnosticValue(item));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([name, item]) => [name, redactDiagnosticValue(item, name)]));
  }
  return value;
}

export function formatAndRedactMetadata(metadataJson) {
  if (metadataJson == null || !String(metadataJson).trim()) return null;
  try {
    return JSON.stringify(redactDiagnosticValue(JSON.parse(metadataJson)), null, 2);
  } catch {
    return redactSecrets(metadataJson);
  }
}
