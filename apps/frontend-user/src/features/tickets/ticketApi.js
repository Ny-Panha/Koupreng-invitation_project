import { api } from "@/shared/api/httpClient";
import { unwrap, toQuery } from "@/shared/api/helpers";
export const ticketService = {
  design: id => api.get(`/v1/invitations/${id}/ticket-design`).then(unwrap),
  save: (id, value) => api.put(`/v1/invitations/${id}/ticket-design`, value).then(unwrap),
  ticket: (id, guestId) => api.get(`/v1/invitations/${id}${guestId ? `/guests/${guestId}` : ""}/ticket`).then(unwrap),
  publicTicket: (slug, params) => api.get(`/v1/public/invitations/${encodeURIComponent(slug)}/ticket${toQuery(params)}`, { skipAuth: true }).then(unwrap),
};
