import { api } from "@/shared/api/httpClient";
import { unwrap } from "@/shared/api/helpers";

const basePath = "/v1/organizations";

export const organizationService = {
  listMine: () => api.get(basePath).then(unwrap),
  get: (organizationId) => api.get(`${basePath}/${organizationId}`).then(unwrap),
  create: (name) => api.post(basePath, { name }).then(unwrap),
  acceptInvitation: token => api.post(`${basePath}/invitations/accept`, { token }).then(unwrap),
  addMember: (organizationId, payload) =>
    api.post(`${basePath}/${organizationId}/members`, payload).then(unwrap),
  updateMemberRole: (organizationId, memberId, role) =>
    api.patch(`${basePath}/${organizationId}/members/${memberId}/role`, { role }).then(unwrap),
  removeMember: (organizationId, memberId) =>
    api.delete(`${basePath}/${organizationId}/members/${memberId}`).then(unwrap),
};

export default organizationService;
