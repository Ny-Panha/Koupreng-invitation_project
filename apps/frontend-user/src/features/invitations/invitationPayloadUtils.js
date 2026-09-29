export function stripInlineMedia(value) {
  if (typeof value === "string") {
    return /^(?:data:|blob:)/i.test(value) ? null : value;
  }
  if (Array.isArray(value)) return value.map(stripInlineMedia);
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [key, stripInlineMedia(entry)])
  );
}

export function dataUrlToFile(value, filename) {
  if (typeof value !== "string" || !value.startsWith("data:")) return null;
  const [metadata, encoded] = value.split(",", 2);
  if (!metadata || !encoded) return null;

  const mimeType = metadata.match(/^data:([^;]+)/)?.[1] || "application/octet-stream";
  const extension = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  }[mimeType.toLowerCase()];
  const outputName = extension ? filename.replace(/\.[^.]+$/, `.${extension}`) : filename;
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new File([bytes], outputName, { type: mimeType });
}
