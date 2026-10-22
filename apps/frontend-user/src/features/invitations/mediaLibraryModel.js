export const MEDIA_CATEGORIES = {
  cover: { type: 'image', field: 'coverImage', limit: 5, accept: 'image/jpeg,image/png,image/webp', extensions: ['jpg', 'jpeg', 'png', 'webp'] },
  gallery: { type: 'image', field: 'galleryImages', limit: 5, accept: 'image/jpeg,image/png,image/webp', extensions: ['jpg', 'jpeg', 'png', 'webp'] },
  video: { type: 'video', field: 'video', limit: 50, accept: 'video/mp4,video/webm', extensions: ['mp4', 'webm'] },
  music: { type: 'audio', field: 'backgroundMusic', limit: 15, accept: 'audio/mpeg,audio/mp3,audio/wav,audio/ogg', extensions: ['mp3', 'wav', 'ogg'] },
};

export function validateLibraryFile(file, category) {
  const config = MEDIA_CATEGORIES[category];
  if (!file.size || file.size > config.limit * 1024 * 1024) return 'sizeError';
  const extension = file.name.split('.').at(-1).toLowerCase();
  const mime = { jpg: ['image/jpeg'], jpeg: ['image/jpeg'], png: ['image/png'], webp: ['image/webp'], mp4: ['video/mp4'], webm: ['video/webm'], mp3: ['audio/mpeg', 'audio/mp3'], wav: ['audio/wav'], ogg: ['audio/ogg'] }[extension];
  if (!config.extensions.includes(extension) || !mime?.includes(file.type)) return 'formatError';
  return '';
}

export function invitationMediaReferences(invitation) {
  const refs = new Set();
  const visit = (value, path = '') => {
    if (typeof value === 'string' && /image|photo|gallery|music|video/i.test(path) && /^(https?:\/\/|\/)/.test(value)) refs.add(value);
    else if (Array.isArray(value)) value.forEach(item => visit(item, path));
    else if (value && typeof value === 'object') Object.entries(value).forEach(([key, item]) => visit(item, `${path}.${key}`));
  };
  for (const field of ['designJson', 'contentJson']) {
    try { visit(typeof invitation?.[field] === 'string' ? JSON.parse(invitation[field]) : invitation?.[field]); } catch { /* Preserve malformed saved content; Studio owns its repair. */ }
  }
  if (invitation?.coverUrl) refs.add(invitation.coverUrl);
  return refs;
}
