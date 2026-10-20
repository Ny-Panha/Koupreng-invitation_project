import { dataUrlToFile } from "../invitationPayloadUtils";

export function replaceMediaReferences(value, replacements) {
  if (typeof value === "string") return replacements.get(value) || value;
  if (Array.isArray(value)) return value.map(item => replaceMediaReferences(item, replacements));
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, replaceMediaReferences(item, replacements)]));
}
export async function uploadInlineReferences(value, upload) {
  const urls = new Set();
  function visit(item) {
    if (typeof item === "string" && /^(data:|blob:)/.test(item)) urls.add(item);
    else if (Array.isArray(item)) item.forEach(visit);
    else if (item && typeof item === "object") Object.values(item).forEach(visit);
  }
  visit(value);
  const replacements = new Map();
  for (const url of urls) {
    const blob = url.startsWith("blob:") ? await fetch(url).then(response => response.blob()) : null;
    const extension = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }[blob?.type] || "png";
    const file = blob ? new File([blob], `studio-image.${extension}`, { type: blob.type }) : dataUrlToFile(url, "studio-image.jpg");
    if (!file || !["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) throw new Error("Choose JPEG, PNG or WebP images under 5 MB.");
    const uploaded = await upload([file]);
    const media = (Array.isArray(uploaded) ? uploaded : uploaded?.items || uploaded?.data || [])[0];
    if (!media?.fileUrl) throw new Error("The image upload did not return a saved URL. Retry saving.");
    replacements.set(url, media.fileUrl);
  }
  return replacements;
}
