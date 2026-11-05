/**
 * Security and privacy sanitization utility for audit logs, API telemetry, and exported diagnostics.
 * Redacts tokens, passwords, authorization headers, private guest tokens, and sensitive query strings.
 */

const SENSITIVE_QUERY_REGEX = /([?&](?:token|password|secret|key|qrToken|auth|access_token|refresh_token|apiKey)=)[^&\s"']*/gi;
const INLINE_KEY_VALUE_REGEX = /(\b[a-zA-Z0-9_-]*(?:token|password|secret|key|qrToken|credential)[a-zA-Z0-9_-]*\s*[:=]\s*)(?!Bearer\b)[^&\s"',]+/gi;
const BEARER_AUTH_REGEX = /\bBearer\s+[A-Za-z0-9_\-.]+/gi;
const SENSITIVE_JSON_KEY_REGEX = /"(password|token|secret|access_token|refresh_token|apiKey|qrToken|authorization|cardNumber|cvv)"\s*:\s*"[^"]*"/gi;

/**
 * Redacts secrets from unstructured descriptions, cURL commands, and metadata strings.
 */
export function redactSecrets(text) {
  if (text == null) return "";
  let s = String(text);
  s = s.replace(BEARER_AUTH_REGEX, "Bearer [REDACTED]");
  s = s.replace(INLINE_KEY_VALUE_REGEX, "$1[REDACTED]");
  s = s.replace(SENSITIVE_QUERY_REGEX, "$1[REDACTED]");
  s = s.replace(SENSITIVE_JSON_KEY_REGEX, '"$1": "[REDACTED]"');
  return s;
}

/**
 * Sanitizes URLs or request paths to ensure query secrets are masked.
 */
export function sanitizePath(path) {
  if (!path) return "";
  return String(path).replace(SENSITIVE_QUERY_REGEX, "$1[REDACTED]");
}

/**
 * Safely parses and redacts a JSON metadata string for pretty display.
 */
export function formatAndRedactMetadata(metadataJson) {
  if (!metadataJson || !metadataJson.trim()) return null;
  try {
    const parsed = JSON.parse(metadataJson);
    const scrub = (obj) => {
      if (!obj || typeof obj !== "object") return obj;
      if (Array.isArray(obj)) return obj.map(scrub);
      const res = {};
      for (const [k, v] of Object.entries(obj)) {
        if (/password|token|secret|auth|qrToken|apiKey|key/i.test(k) && typeof v === "string") {
          res[k] = "[REDACTED]";
        } else if (typeof v === "object" && v !== null) {
          res[k] = scrub(v);
        } else {
          res[k] = v;
        }
      }
      return res;
    };
    return JSON.stringify(scrub(parsed), null, 2);
  } catch {
    return redactSecrets(metadataJson);
  }
}
