import { readStoredAuth } from "./authStorage";

const KEY = "koupreng.wedding.drafts";

function currentOwnerUserId() {
  const user = readStoredAuth()?.user;
  return user?.id ?? user?.userId ?? null;
}

function resolveOwnerUserId(ownerUserId) {
  return ownerUserId ?? currentOwnerUserId();
}

function readAll() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeAll(map) {
  try {
    localStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    // localStorage may be full or disabled.
  }
}

function generateId() {
  return `wed-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function listDrafts(ownerUserId = null) {
  const drafts = Object.values(readAll());
  const resolvedOwnerUserId = resolveOwnerUserId(ownerUserId);
  const scoped = resolvedOwnerUserId == null
    ? []
    : drafts.filter((draft) => String(draft.ownerUserId) === String(resolvedOwnerUserId));
  return scoped.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}

export function getDraft(draftId, ownerUserId = null) {
  if (!draftId) return null;
  const all = readAll();
  const draft = all[draftId] || null;
  const resolvedOwnerUserId = resolveOwnerUserId(ownerUserId);
  if (!draft || resolvedOwnerUserId == null || String(draft.ownerUserId) !== String(resolvedOwnerUserId)) return null;
  return draft;
}

export function getDraftBySlug(slug, ownerUserId = null) {
  if (!slug) return null;
  const all = readAll();
  const resolvedOwnerUserId = resolveOwnerUserId(ownerUserId);
  if (resolvedOwnerUserId == null) return null;
  return Object.values(all).find((draft) => draft.slug === slug
    && String(draft.ownerUserId) === String(resolvedOwnerUserId)) || null;
}

export function saveDraft(draft) {
  const all = readAll();
  const id = draft.id || generateId();
  const ownerUserId = draft.ownerUserId ?? currentOwnerUserId();
  const next = { ...draft, ownerUserId, id, updatedAt: Date.now() };
  all[id] = next;
  writeAll(all);
  return next;
}

export function deleteDraft(draftId) {
  const all = readAll();
  delete all[draftId];
  writeAll(all);
}

export function createDraft(initial = {}) {
  return saveDraft({
    templateId: initial.templateId || "garden-royal-khmer-wedding",
    slug: initial.slug || "",
    couple: {
      groom: "",
      bride: "",
      groomNickname: "",
      brideNickname: "",
      groomIntro: "",
      brideIntro: "",
      groomParents: "",
      brideParents: "",
      ...initial.couple,
    },
    event: {
      title: "",
      date: "",
      ceremonyTime: "",
      receptionTime: "",
      venueName: "",
      venueAddress: "",
      mapLink: "",
      ...initial.event,
    },
    contact: { phone: "", telegram: "", email: "", facebook: "", ...initial.contact },
    message: initial.message || "",
    story: initial.story || "",
    storyChapters: initial.storyChapters || [],
    schedule: initial.schedule || [],
    party: initial.party || [],
    gift: initial.gift || [],
    faq: initial.faq || [],
    design: {
      monogramText: "",
      primaryColor: "#6F1D2B",
      accentColor: "#C99A3D",
      openingStyle: "khmer-royal",
      openingOverlayOpacity: 0.48,
      frameStyle: "double-gold",
      ornamentStyle: "khmer-corner-01",
      ornamentTheme: "royal-floral",
      ...initial.design,
    },
    opening: {
      heading: "សិរីមង្គលអាពាហ៍ពិពាហ៍",
      invitationText: "យើងខ្ញុំមានកិត្តិយសសូមគោរពអញ្ជើញ",
      genericGuestText: "លោកអ្នក និងក្រុមគ្រួសារ",
      openButtonText: "បើកសំបុត្រអញ្ជើញ",
      ...initial.opening,
    },
    enabledSections: {
      countdown: true,
      story: true,
      gallery: true,
      schedule: true,
      map: true,
      party: true,
      dressCode: true,
      gift: true,
      wish: true,
      faq: true,
      rsvp: true,
      ...initial.enabledSections,
    },
    coverImage: initial.coverImage || "",
    gallery: initial.gallery || [],
    openingVideo: initial.openingVideo || null,
    openingVideoEnabled: initial.openingVideoEnabled ?? Boolean(initial.openingVideo),
    pendingMedia: initial.pendingMedia || {},
    rsvp: { enabled: true, deadline: "", ...initial.rsvp },
    extras: {
      playlistLink: "",
      videoLink: "",
      giftInfo: "",
      accommodationInfo: "",
      transportationNote: "",
      guestNote: "",
      languageNote: "",
      languageMode: "both",
      storyTextEn: "",
      ...initial.extras,
    },
    ...initial,
  });
}

export default {
  listDrafts,
  getDraft,
  getDraftBySlug,
  saveDraft,
  deleteDraft,
  createDraft,
};
