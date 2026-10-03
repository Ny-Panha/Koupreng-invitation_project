import { api } from "@/shared/api/httpClient";
import { toQuery, unwrap } from "@/shared/api/helpers";

const RSVP_KEY_PREFIX = "koupreng:rsvps";
const LEGACY_RSVP_KEY = "koupreng.wedding.rsvps";

function scopedRsvpKey(targetId) {
  return `${RSVP_KEY_PREFIX}:${targetId}`;
}

function readLegacy(targetId) {
  try {
    const raw = localStorage.getItem(LEGACY_RSVP_KEY);
    const all = raw ? JSON.parse(raw) : {};
    return all[targetId] || [];
  } catch {
    return [];
  }
}

export function listRsvps(targetId) {
  if (!targetId) return [];

  try {
    const raw = localStorage.getItem(scopedRsvpKey(targetId));
    return raw ? JSON.parse(raw) : readLegacy(targetId);
  } catch {
    return readLegacy(targetId);
  }
}

export async function submitRsvp(payload) {
  const slug = payload.slug;
  if (!slug) {
    throw new Error("A published invitation is required before an RSVP can be submitted");
  }
  return rsvpService.submitPublic(slug, payload);
}

export function listRsvpByInvitation(invitationId) {
  return listRsvps(invitationId);
}

function publicParams(params) {
  if (typeof params === "string") {
    return { token: params };
  }
  return params || {};
}

export const rsvpService = {
  update: (invitationId, rsvpId, payload) => api.patch(`/v1/invitations/${invitationId}/rsvps/${rsvpId}`, payload).then(unwrap),
  remove: (invitationId, rsvpId) => api.delete(`/v1/invitations/${invitationId}/rsvps/${rsvpId}`).then(unwrap),
  submitPublic: (slug, data, params) =>
    api
      .post(`/v1/public/invitations/${encodeURIComponent(slug)}/rsvp${toQuery(publicParams(params))}`, data, { skipAuth: true })
      .then(unwrap),
  submitPublicWithToken: (slug, token, data, params) =>
    api
      .post(
        `/v1/public/invitations/${encodeURIComponent(slug)}/guests/${encodeURIComponent(token)}/rsvp${toQuery(publicParams(params))}`,
        data,
        { skipAuth: true },
      )
      .then(unwrap),
  publicWishes: (slug, params) =>
    api.get(`/v1/public/invitations/${encodeURIComponent(slug)}/wishes${toQuery(publicParams(params))}`, { skipAuth: true }).then(unwrap),
  wishes: (invitationId) => {
    if (!invitationId || (typeof invitationId === "string" && !/^\d+$/.test(invitationId))) {
      return Promise.resolve([]);
    }
    return api.get(`/v1/invitations/${invitationId}/wishes`).then(unwrap);
  },
  listByInvitation: (invitationId) => {
    if (!invitationId || (typeof invitationId === "string" && !/^\d+$/.test(invitationId))) {
      return Promise.resolve([]);
    }
    return api.get(`/v1/invitations/${invitationId}/rsvps`).then(unwrap);
  },
  summary: (invitationId) => {
    if (!invitationId || (typeof invitationId === "string" && !/^\d+$/.test(invitationId))) {
      return Promise.resolve(null);
    }
    return api.get(`/v1/invitations/${invitationId}/rsvps/summary`).then(unwrap);
  },
};

export default rsvpService;
