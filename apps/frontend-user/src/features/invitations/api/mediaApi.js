import { api } from "@/shared/api/httpClient";
import { toQuery, unwrap } from "@/shared/api/helpers";
import { getDraft } from "@/shared/storage/weddingStorage";

function isLocalDraftId(id) {
  return !id || (typeof id === "string" && (id.startsWith("wed-") || !/^\d+$/.test(id)));
}

function emptyMediaResponse() {
  return {
    coverImage: null,
    galleryImages: [],
    video: null,
    backgroundMusic: null,
    all: [],
    photos: [],
    cover: null,
    music: null,
  };
}

function publicParams(params) {
  if (typeof params === "string") {
    return { token: params };
  }
  return params || {};
}

function fileForm(file) {
  const formData = new FormData();
  formData.append("file", file);
  return formData;
}

function galleryForm(files, sortOrder) {
  const formData = new FormData();
  Array.from(files || []).forEach((file) => formData.append("files", file));
  if (sortOrder !== undefined && sortOrder !== null && sortOrder !== "") {
    formData.append("sortOrder", sortOrder);
  }
  return formData;
}

export const mediaService = {
  list: (invitationId) => {
    if (isLocalDraftId(invitationId)) {
      const draft = typeof invitationId === "string" ? getDraft(invitationId) : null;
      if (draft) {
        const coverUrl = draft.coverImage || draft.uploadedCoverUrl || draft.coverUrl || null;
        const coverImage = coverUrl
          ? { id: "draft-cover", fileUrl: coverUrl, mediaType: "COVER_IMAGE" }
          : null;
        const galleryImages = (draft.photos || []).map((photo, idx) => {
          const url = typeof photo === "string" ? photo : photo?.url;
          return {
            id: photo?.id || `draft-gallery-${idx}`,
            fileUrl: url,
            mediaType: "GALLERY_IMAGE",
          };
        });
        const backgroundMusic = draft.musicUrl
          ? { id: "draft-music", fileUrl: draft.musicUrl, mediaType: "BACKGROUND_MUSIC" }
          : null;
        return Promise.resolve({
          coverImage,
          galleryImages,
          video: null,
          backgroundMusic,
          all: [coverImage, ...galleryImages, backgroundMusic].filter(Boolean),
          photos: draft.photos || [],
          cover: coverImage,
          music: backgroundMusic,
        });
      }
      return Promise.resolve(emptyMediaResponse());
    }
    return api.get(`/v1/invitations/${invitationId}/media`).then(unwrap);
  },
  publicBySlug: (slug, params) =>
    api
      .get(`/v1/public/invitations/${encodeURIComponent(slug)}/media${toQuery(publicParams(params))}`, { skipAuth: true })
      .then(unwrap),
  uploadCover: (invitationId, file) => {
    if (isLocalDraftId(invitationId)) {
      const fileUrl = typeof file === "string" ? file : URL.createObjectURL(file);
      return Promise.resolve({ id: "local-cover", fileUrl, mediaType: "COVER_IMAGE" });
    }
    return api.post(`/v1/invitations/${invitationId}/media/cover`, fileForm(file)).then(unwrap);
  },
  uploadGallery: (invitationId, files, sortOrder) => {
    if (isLocalDraftId(invitationId)) {
      const list = Array.from(files || []).map((f, idx) => ({
        id: `local-gallery-${Date.now()}-${idx}`,
        fileUrl: typeof f === "string" ? f : URL.createObjectURL(f),
        mediaType: "GALLERY_IMAGE",
      }));
      return Promise.resolve(list);
    }
    return api.post(`/v1/invitations/${invitationId}/media/gallery`, galleryForm(files, sortOrder)).then(unwrap);
  },
  uploadVideo: (invitationId, file) => {
    if (isLocalDraftId(invitationId)) {
      const fileUrl = typeof file === "string" ? file : URL.createObjectURL(file);
      return Promise.resolve({ id: "local-video", fileUrl, mediaType: "VIDEO" });
    }
    return api.post(`/v1/invitations/${invitationId}/media/video`, fileForm(file)).then(unwrap);
  },
  uploadMusic: (invitationId, file) => {
    if (isLocalDraftId(invitationId)) {
      const fileUrl = typeof file === "string" ? file : URL.createObjectURL(file);
      return Promise.resolve({ id: "local-music", fileUrl, mediaType: "BACKGROUND_MUSIC" });
    }
    return api.post(`/v1/invitations/${invitationId}/media/music`, fileForm(file)).then(unwrap);
  },
  replace: (invitationId, mediaId, file) => {
    if (isLocalDraftId(invitationId)) {
      const fileUrl = typeof file === "string" ? file : URL.createObjectURL(file);
      return Promise.resolve({ id: mediaId, fileUrl });
    }
    return api.put(`/v1/invitations/${invitationId}/media/${mediaId}/replace`, fileForm(file)).then(unwrap);
  },
  remove: (invitationId, mediaId) => {
    if (isLocalDraftId(invitationId)) {
      return Promise.resolve(true);
    }
    return api.delete(`/v1/invitations/${invitationId}/media/${mediaId}`).then(unwrap);
  },
};

export default mediaService;
