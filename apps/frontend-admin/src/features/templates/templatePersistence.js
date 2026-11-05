const CATALOG_FIELDS = new Set(['id', 'name', 'category', 'status', 'premium', 'price', 'thumbnailUrl', 'previewUrl', 'createdAt', 'updatedAt', '__proto__', 'constructor', 'prototype']);

// Preserve authored fields/extensions; catalog authority stays in the top-level DTO.
export function serializeTemplateConfig(form, normalized) {
  const design = Object.fromEntries(Object.entries(form).filter(([key]) => !CATALOG_FIELDS.has(key)));
  return JSON.stringify({ ...design, ...normalized });
}
