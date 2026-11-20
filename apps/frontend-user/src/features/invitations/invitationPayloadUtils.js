const unsafeKeys = new Set(['__proto__', 'prototype', 'constructor']);
const isRecord = value => value && typeof value === 'object' && !Array.isArray(value)
  && [Object.prototype, null].includes(Object.getPrototypeOf(value));

// Preserve future object fields in the Studio's content/design documents.
// Edited arrays replace arrays: never restore removed/reordered rows by index.
export function preserveStudioJson(previous, edited) {
  if (!isRecord(edited)) return edited;
  const before = isRecord(previous) ? previous : {};
  return Object.fromEntries([...new Set([...Object.keys(before), ...Object.keys(edited)])]
    .filter(key => !unsafeKeys.has(key))
    .map(key => [key, edited[key] === undefined ? before[key]
      : isRecord(edited[key]) ? preserveStudioJson(before[key], edited[key]) : edited[key]]));
}

export function studioGallery(photos, previous = []) {
  const byId = new Map((Array.isArray(previous) ? previous : []).filter(row => row?.id != null).map(row => [String(row.id), row]));
  return photos.filter(photo => photo?.url).map(({ id, url }) => ({
    ...(byId.get(String(id)) || {}), id, preview: url, type: 'image',
  }));
}

export function acknowledgeStudioMedia(current, sent, field, savedUrl) {
  return current[field] === sent[field] ? { ...current, [field]: savedUrl } : current;
}

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
