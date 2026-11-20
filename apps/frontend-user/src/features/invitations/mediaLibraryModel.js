export const MEDIA_CATEGORIES = {
  cover: { type: 'image', field: 'coverImage', limit: 5, accept: 'image/jpeg,image/png,image/webp', extensions: ['jpg', 'jpeg', 'png', 'webp'] },
  gallery: { type: 'image', field: 'galleryImages', limit: 5, accept: 'image/jpeg,image/png,image/webp', extensions: ['jpg', 'jpeg', 'png', 'webp'] },
  video: { type: 'video', field: 'video', limit: 50, accept: 'video/mp4,video/webm', extensions: ['mp4', 'webm'] },
  music: { type: 'audio', field: 'backgroundMusic', limit: 15, accept: 'audio/mpeg,audio/mp3,audio/wav,audio/ogg', extensions: ['mp3', 'wav', 'ogg'] },
  ticket: { type: 'image', field: 'ticketImage', limit: 5, accept: 'image/jpeg,image/png,image/webp', extensions: ['jpg', 'jpeg', 'png', 'webp'] },
  preWeddingVideo: { type: 'video', field: 'preWeddingVideo', limit: 50, accept: 'video/mp4,video/webm', extensions: ['mp4', 'webm'] },
};

export const EXECUTABLE_EXTENSIONS = new Set([
  'exe', 'bat', 'cmd', 'com', 'js', 'jar', 'msi', 'ps1', 'scr', 'sh'
]);

export const ALLOWED_EXTENSIONS_BY_CATEGORY = {
  cover: ['jpg', 'jpeg', 'png', 'webp'],
  gallery: ['jpg', 'jpeg', 'png', 'webp'],
  ticket: ['jpg', 'jpeg', 'png', 'webp'],
  video: ['mp4', 'webm'],
  preWeddingVideo: ['mp4', 'webm'],
  music: ['mp3', 'wav', 'ogg']
};

export const CONTENT_TYPES_BY_EXTENSION = {
  jpg: ['image/jpeg'],
  jpeg: ['image/jpeg'],
  png: ['image/png'],
  webp: ['image/webp'],
  mp4: ['video/mp4'],
  webm: ['video/webm'],
  mp3: ['audio/mpeg', 'audio/mp3'],
  wav: ['audio/wav'],
  ogg: ['audio/ogg']
};

export const MEDIA_LIFECYCLE_STAGES = Object.freeze({
  SELECTED: 'selected',
  VALIDATED: 'validated',
  QUEUED: 'queued',
  TRANSFERRING: 'transferring',
  FINALIZING: 'finalizing',
  SERVER_CONFIRMED: 'server_confirmed',
  PREVIEW_VERIFIED: 'preview_verified',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  OFFLINE: 'offline',
  LOCAL_DRAFT: 'local_draft'
});

export function chunkBatch(items, batchSize = 5) {
  if (!Array.isArray(items)) return [];
  const batches = [];
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }
  return batches;
}

export function validateLibraryFile(file, category) {
  const config = MEDIA_CATEGORIES[category] || MEDIA_CATEGORIES.cover;
  if (!file) return 'emptyError';
  if (file.size === 0) return 'emptyError';
  if (file.size > config.limit * 1024 * 1024) return 'sizeError';

  const rawName = typeof file.name === 'string' ? file.name.trim() : '';
  if (!rawName || rawName.length > 255 || rawName.includes('/') || rawName.includes('\\') || rawName.includes('..')) {
    return 'filenameError';
  }

  const lastDot = rawName.lastIndexOf('.');
  if (lastDot < 0 || lastDot === rawName.length - 1) {
    return 'formatError';
  }
  const extension = rawName.slice(lastDot + 1).toLowerCase();

  if (EXECUTABLE_EXTENSIONS.has(extension)) return 'executableError';
  if (extension === 'heic' || extension === 'heif') return 'heicError';

  const allowedExtensions = ALLOWED_EXTENSIONS_BY_CATEGORY[category] || config.extensions;
  if (!allowedExtensions.includes(extension)) return 'formatError';

  const allowedMimes = CONTENT_TYPES_BY_EXTENSION[extension];
  const fileType = (file.type || '').trim().toLowerCase();
  if (!allowedMimes || !fileType || !allowedMimes.includes(fileType)) {
    return 'formatError';
  }
  return '';
}

export function invitationMediaReferences(invitation) {
  const refs = new Set();
  const visit = (value, path = '') => {
    if (typeof value === 'string' && /image|photo|gallery|music|video|picture|cover|portrait|ticket/i.test(path) && /^(https?:\/\/|\/|blob:|data:)/i.test(value)) {
      refs.add(value);
    } else if (Array.isArray(value)) {
      value.forEach(item => visit(item, path));
    } else if (value && typeof value === 'object') {
      Object.entries(value).forEach(([key, item]) => visit(item, `${path}.${key}`));
    }
  };
  for (const field of ['designJson', 'contentJson', 'layoutSettings']) {
    try {
      const parsed = typeof invitation?.[field] === 'string' ? JSON.parse(invitation[field]) : invitation?.[field];
      visit(parsed);
    } catch {
      /* Preserve malformed saved content; Studio owns its repair. */
    }
  }
  if (invitation?.coverUrl) refs.add(invitation.coverUrl);
  if (invitation?.coverImageUrl) refs.add(invitation.coverImageUrl);
  if (invitation?.coverBackgroundImage) refs.add(invitation.coverBackgroundImage);
  if (invitation?.backgroundImage) refs.add(invitation.backgroundImage);
  return refs;
}

export function reorderGalleryItems(items, fromIndex, toIndex) {
  if (!Array.isArray(items) || fromIndex < 0 || fromIndex >= items.length || toIndex < 0 || toIndex >= items.length) {
    return items || [];
  }
  const result = [...items];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
}

export function focalPointStyle(focalPoint, fit = 'cover') {
  const x = Math.min(100, Math.max(0, Number(focalPoint?.x ?? 50)));
  const y = Math.min(100, Math.max(0, Number(focalPoint?.y ?? 50)));
  return {
    objectPosition: `${x}% ${y}%`,
    objectFit: fit === 'contain' ? 'contain' : 'cover'
  };
}
