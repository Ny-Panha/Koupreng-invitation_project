import { api } from "@/shared/api/httpClient";
import { toQuery, unwrap } from "@/shared/api/helpers";
import { getDraft, saveDraft, deleteDraft } from "@/shared/storage/weddingStorage";

function publicParams(params) {
  if (typeof params === "string") {
    return { token: params };
  }
  return params || {};
}

function isLocalDraftId(id) {
  return typeof id === "string" && (id.startsWith("wed-") || !/^\d+$/.test(id));
}

export const invitationService = {
  listMine: (status) => api.get(`/v1/invitations/my${toQuery({ status })}`).then(unwrap),
  createDraft: (templateId = null) => api.post("/v1/invitations", {
    title: "សិរីមង្គលអាពាហ៍ពិពាហ៍ថ្មី",
    eventType: "WEDDING",
    templateId: Number(templateId) || null,
    visibility: "PRIVATE",
  }).then(unwrap),
  get: (id) => {
    if (isLocalDraftId(id)) {
      const draft = getDraft(id);
      if (draft) return Promise.resolve(draft);
    }
    return api.get(`/v1/invitations/${id}`).then(unwrap).catch((err) => {
      const draft = getDraft(id);
      if (draft) return draft;
      throw err;
    });
  },
  create: (data) => api.post("/v1/invitations", data).then(unwrap),
  update: (id, data) => {
    if (isLocalDraftId(id)) {
      return Promise.resolve(saveDraft({ ...data, id }));
    }
    return api.put(`/v1/invitations/${id}`, data).then(unwrap);
  },
  remove: (id) => {
    if (isLocalDraftId(id)) {
      deleteDraft(id);
      return Promise.resolve(true);
    }
    return api.delete(`/v1/invitations/${id}`).then(unwrap);
  },
  saveDraft: (id) => {
    if (isLocalDraftId(id)) return Promise.resolve(getDraft(id));
    return api.patch(`/v1/invitations/${id}/draft`).then(unwrap);
  },
  publish: (id) => {
    if (isLocalDraftId(id)) return Promise.resolve(getDraft(id));
    return api.patch(`/v1/invitations/${id}/publish`).then(unwrap);
  },
  unpublish: (id) => {
    if (isLocalDraftId(id)) return Promise.resolve(getDraft(id));
    return api.patch(`/v1/invitations/${id}/unpublish`).then(unwrap);
  },
  preview: (id) => {
    if (isLocalDraftId(id)) return Promise.resolve(getDraft(id));
    return api.get(`/v1/invitations/${id}/preview`).then(unwrap);
  },
  publicBySlug: (slug, params) =>
    api
      .get(`/v1/public/invitations/${encodeURIComponent(slug)}${toQuery(publicParams(params))}`, { skipAuth: true })
      .then(unwrap),
  publicGuestView: (slug, params) =>
    api
      .get(`/v1/public/invitations/${encodeURIComponent(slug)}/guest-view${toQuery(publicParams(params))}`, { skipAuth: true })
      .then(unwrap),
  verifyPublicAccess: (slug, data) =>
    api.post(`/v1/public/invitations/${encodeURIComponent(slug)}/access/verify`, data, { skipAuth: true }).then(unwrap),
};

export default invitationService;
