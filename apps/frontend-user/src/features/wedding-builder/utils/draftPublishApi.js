import { invitationService } from "../../invitations/api/invitationApi";
import { mediaService } from "../../invitations/api/mediaApi";
import templateService from "../../templates/api/templateService";
import { loadGallery, saveGallery } from "../../../shared/storage/galleryStorage";
import {
  deleteDraftMediaFile,
  loadDraftMediaFiles,
} from "../../../shared/storage/draftMediaStorage";
import {
  draftMediaSignature,
  draftToInvitationPayload,
  isDataUrl,
} from "./invitationDraftAdapter";

function dataUrlToFile(dataUrl, fallbackName) {
  const [meta, payload] = String(dataUrl).split(",");
  const mime = meta.match(/data:([^;]+)/)?.[1] || "application/octet-stream";
  const binary = atob(payload || "");
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new File([bytes], fallbackName, { type: mime });
}

function extensionForDataUrl(dataUrl, fallback = "bin") {
  const mime = String(dataUrl).match(/data:([^;]+)/)?.[1] || "";
  if (mime.includes("jpeg")) return "jpg";
  if (mime.includes("png")) return "png";
  if (mime.includes("webp")) return "webp";
  if (mime.includes("gif")) return "gif";
  if (mime.includes("mp4")) return "mp4";
  if (mime.includes("mpeg")) return "mp3";
  if (mime.includes("mp3")) return "mp3";
  if (mime.includes("m4a")) return "m4a";
  return fallback;
}

function localGalleryFiles(gallery = []) {
  return gallery
    .map((item, index) => {
      const preview = typeof item === "string" ? item : item?.preview;
      if (!isDataUrl(preview)) return null;
      const name = item?.name || `gallery-${index + 1}.${extensionForDataUrl(preview, "jpg")}`;
      return dataUrlToFile(preview, name);
    })
    .filter(Boolean);
}

async function resolveBackendTemplateId(templateReference) {
  const templateKey = String(templateReference || "garden-royal-khmer-wedding").trim();
  const template = /^\d+$/.test(templateKey)
    ? await templateService.getPublic(templateKey)
    : await templateService.getPublicBySlug(templateKey);
  if (!template?.id) throw new Error(`Template "${templateKey}" is not available from the backend.`);
  return template.id;
}

function remoteGalleryItem(item, index) {
  return {
    id: item.id || `remote-gallery-${index}`,
    name: item.originalFilename || `Gallery ${index + 1}`,
    type: "image",
    preview: item.fileUrl,
  };
}

async function uploadDraftMedia(invitationId, draft) {
  if (!invitationId) return { media: null, mediaSynced: false };
  const [pendingMedia, loadedGallery] = await Promise.all([
    draft.id ? loadDraftMediaFiles(draft.id).catch(() => ({})) : Promise.resolve({}),
    draft.id ? loadGallery(draft.id).catch(() => draft.gallery || []) : Promise.resolve(draft.gallery || []),
  ]);
  const storedGallery = loadedGallery?.length ? loadedGallery : (draft.gallery || []);
  let mediaSynced = false;

  const removedMedia = draft.removedMedia || {};
  const removedGalleryMediaIds = Array.from(new Set(draft.removedGalleryMediaIds || []));
  if (removedMedia.cover || removedMedia.openingVideo || removedMedia.music || removedGalleryMediaIds.length) {
    const existing = await mediaService.list(invitationId);
    const removalIds = [
      removedMedia.cover ? existing?.coverImage?.id : null,
      removedMedia.openingVideo ? existing?.video?.id : null,
      removedMedia.music ? existing?.backgroundMusic?.id : null,
      ...removedGalleryMediaIds,
    ].filter(Boolean);
    for (const mediaId of new Set(removalIds)) {
      await mediaService.remove(invitationId, mediaId);
    }
    mediaSynced = removalIds.length > 0;
  }

  if (pendingMedia.cover?.file) {
    await mediaService.uploadCover(invitationId, pendingMedia.cover.file);
    await deleteDraftMediaFile(draft.id, "cover");
    mediaSynced = true;
  } else if (isDataUrl(draft.coverImage)) {
    await mediaService.uploadCover(
      invitationId,
      dataUrlToFile(draft.coverImage, `cover.${extensionForDataUrl(draft.coverImage, "jpg")}`)
    );
    mediaSynced = true;
  }

  const galleryFiles = localGalleryFiles(storedGallery);
  if (galleryFiles.length) {
    const uploaded = await mediaService.uploadGallery(invitationId, galleryFiles);
    const retained = storedGallery.filter((item) => {
      const preview = typeof item === "string" ? item : item?.preview;
      return !isDataUrl(preview);
    });
    await saveGallery(draft.id, [
      ...retained,
      ...uploaded.map(remoteGalleryItem),
    ]);
    mediaSynced = true;
  }

  if (draft.openingVideoEnabled !== false && pendingMedia.openingVideo?.file) {
    await mediaService.uploadVideo(invitationId, pendingMedia.openingVideo.file);
    await deleteDraftMediaFile(draft.id, "openingVideo");
    mediaSynced = true;
  } else if (draft.openingVideoEnabled !== false && isDataUrl(draft.openingVideo?.url)) {
    await mediaService.uploadVideo(
      invitationId,
      dataUrlToFile(
        draft.openingVideo.url,
        draft.openingVideo.name || `opening-video.${extensionForDataUrl(draft.openingVideo.url, "mp4")}`
      )
    );
    mediaSynced = true;
  }

  if (pendingMedia.music?.file) {
    await mediaService.uploadMusic(invitationId, pendingMedia.music.file);
    await deleteDraftMediaFile(draft.id, "music");
    mediaSynced = true;
  } else if (isDataUrl(draft.music?.url)) {
    await mediaService.uploadMusic(
      invitationId,
      dataUrlToFile(
        draft.music.url,
        draft.music.name || `background-music.${extensionForDataUrl(draft.music.url, "mp3")}`
      )
    );
    mediaSynced = true;
  }

  return {
    media: await mediaService.list(invitationId),
    mediaSynced,
  };
}

function responsePatch(response, remoteDraft, signature, mediaSynced) {
  return {
    backendInvitationId: response.id,
    backendTemplateId: response.templateId || null,
    backendStatus: response.status || "DRAFT",
    slug: response.slug || "",
    publishedAt: response.publishedAt ? Date.parse(response.publishedAt) : undefined,
    remoteMediaSignature: signature,
    remoteMediaSyncedAt: mediaSynced ? Date.now() : undefined,
    coverImage: remoteDraft.coverImage,
    gallery: remoteDraft.gallery,
    music: remoteDraft.music,
    openingVideo: remoteDraft.openingVideo,
    openingVideoEnabled: remoteDraft.openingVideoEnabled,
    pendingMedia: {},
    removedMedia: {},
    removedGalleryMediaIds: [],
  };
}

function recoveryPatch(response, backendTemplateId) {
  return {
    backendInvitationId: response.id,
    backendTemplateId: response.templateId || backendTemplateId || null,
    backendStatus: response.status || "DRAFT",
    slug: response.slug || "",
    publishedAt: null,
  };
}

function withPartialPatch(error, partialPatch) {
  const failure = error instanceof Error ? error : new Error(String(error || "Backend operation failed."));
  failure.partialPatch = {
    ...(failure.partialPatch || {}),
    ...partialPatch,
  };
  return failure;
}

function draftWithRemoteMedia(draft, media) {
  const cover = media?.coverImage?.fileUrl || (isDataUrl(draft.coverImage) ? "" : draft.coverImage || "");
  const gallery = (media?.galleryImages || []).filter((item) => item?.fileUrl).map(remoteGalleryItem);
  const openingVideo = media?.video?.fileUrl
    ? {
        id: media.video.id || "uploaded-opening-video",
        name: media.video.originalFilename || "Opening video",
        url: media.video.fileUrl,
      }
    : (isDataUrl(draft.openingVideo?.url) ? null : draft.openingVideo || null);
  const music = media?.backgroundMusic?.fileUrl
    ? {
        id: media.backgroundMusic.id || "uploaded-music",
        name: media.backgroundMusic.originalFilename || "Background music",
        url: media.backgroundMusic.fileUrl,
      }
    : (isDataUrl(draft.music?.url) ? null : draft.music || null);

  return {
    ...draft,
    coverImage: cover,
    gallery: gallery.length ? gallery : (draft.gallery || []).filter((item) => !isDataUrl(item?.preview || item)),
    openingVideo,
    music,
    pendingMedia: {},
    removedMedia: {},
    removedGalleryMediaIds: [],
  };
}

export function validateDraftForPublish(draft) {
  const missing = [];
  if (!draft?.templateId) missing.push("គំរូសន្លឹកការ");
  if (!draft?.couple?.groom?.trim()) missing.push("ឈ្មោះកូនកំលោះ");
  if (!draft?.couple?.bride?.trim()) missing.push("ឈ្មោះកូនក្រមុំ");
  if (!draft?.event?.date) missing.push("ថ្ងៃកម្មវិធី");
  if (!draft?.event?.venueName?.trim()) missing.push("ទីតាំងកម្មវិធី");
  if (missing.length) {
    throw new Error(`សូមបំពេញព័ត៌មានចាំបាច់៖ ${missing.join(", ")}`);
  }
}

export function isBackendUnavailable(error) {
  return !error?.status && /network|timeout|failed to fetch|request failed/i.test(error?.message || "");
}

export async function persistWeddingDraft(draft, { publish = false } = {}) {
  if (publish) validateDraftForPublish(draft);
  const templateId = await resolveBackendTemplateId(draft.templateId);
  const payload = draftToInvitationPayload(draft, templateId);
  const saved = draft.backendInvitationId
    ? await invitationService.update(draft.backendInvitationId, payload)
    : await invitationService.create(payload);
  let partialPatch = recoveryPatch(saved, templateId);

  try {
    const { media, mediaSynced } = await uploadDraftMedia(saved.id, draft);
    const remoteDraft = draftWithRemoteMedia(draft, media);
    const updated = await invitationService.update(saved.id, draftToInvitationPayload(remoteDraft, templateId));
    const signature = draftMediaSignature(remoteDraft);
    partialPatch = {
      ...responsePatch(updated, remoteDraft, signature, mediaSynced),
      backendStatus: updated.status || "DRAFT",
      publishedAt: null,
    };

    if (!publish) {
      const drafted = await invitationService.saveDraft(updated.id);
      return {
        response: drafted,
        patch: {
          ...responsePatch(drafted, remoteDraft, signature, mediaSynced),
          publishedAt: null,
        },
      };
    }

    const published = await invitationService.publish(updated.id);
    return {
      response: published,
      patch: responsePatch(published, remoteDraft, signature, mediaSynced),
    };
  } catch (error) {
    throw withPartialPatch(error, partialPatch);
  }
}
