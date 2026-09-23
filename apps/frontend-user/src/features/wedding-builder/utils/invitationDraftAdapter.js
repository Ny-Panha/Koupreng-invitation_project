import {
  KEEP_TEMPLATE_CODE,
  normalizeOpeningCopy,
  normalizeOpeningDesign,
  resolveOpeningVideo,
} from "@/features/templates";


export function safeJson(value, fallback = {}) {
  if (!value) return fallback;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function timeValue(value) {
  return value ? String(value).slice(0, 5) : "";
}

export function isDataUrl(value) {
  return typeof value === "string" && value.startsWith("data:");
}

export function isLocalPreviewUrl(value) {
  return typeof value === "string" && (value.startsWith("data:") || value.startsWith("blob:"));
}

function normalizeGalleryItem(item, index) {
  if (!item) return null;
  if (typeof item === "string") {
    return { id: `gallery-${index}`, preview: item, type: "image" };
  }
  const preview = item.preview || item.src || item.fileUrl || item.url || "";
  if (!preview) return null;
  return {
    id: item.id || `gallery-${index}`,
    name: item.name || item.originalFilename || `Gallery ${index + 1}`,
    type: item.type || (item.mimeType?.startsWith("video/") ? "video" : "image"),
    preview,
  };
}

function mediaGallery(media) {
  return (media?.galleryImages || [])
    .filter((item) => item?.fileUrl)
    .map((item, index) => normalizeGalleryItem(item, index))
    .filter(Boolean);
}

export function toTemplateLanguageMode(value) {
  const normalized = String(value || "").toLowerCase();
  if (normalized === "kh" || normalized === "km" || normalized === "khmer") return "km";
  if (normalized === "en" || normalized === "english") return "en";
  return "both";
}

export function toBackendLanguageMode(value) {
  const normalized = toTemplateLanguageMode(value);
  if (normalized === "km") return "KH";
  if (normalized === "en") return "EN";
  return "BILINGUAL";
}

function publicMediaRef(value) {
  if (!value || isLocalPreviewUrl(value.url)) return null;
  return {
    id: value.id || "",
    name: value.name || "",
    description: value.description || "",
    url: value.url || null,
  };
}

function compactObject(value) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined)
  );
}

export function publicInvitationToDraft(invitation, media) {
  const content = safeJson(invitation?.contentJson);
  const design = safeJson(invitation?.designJson);
  const enabled = safeJson(invitation?.enabledSections);
  const layout = safeJson(invitation?.layoutSettings);
  const contentCouple = content.couple || {};
  const contentEvent = content.event || {};
  const invitationGallery = invitation?.galleryImages
    || invitation?.gallery_urls
    || invitation?.gallery
    || design.gallery
    || design.photos
    || [];
  const gallery = mediaGallery(media);
  const savedGallery = Array.isArray(invitationGallery)
    ? invitationGallery.map(normalizeGalleryItem).filter(Boolean)
    : [];
  const eventTime = timeValue(invitation?.eventTime);
  const mediaCover = media?.coverImage?.fileUrl || "";
  const mediaMusic = media?.backgroundMusic?.fileUrl
    ? {
        id: "uploaded-music",
        name: media.backgroundMusic.originalFilename || "Background music",
        url: media.backgroundMusic.fileUrl,
      }
    : null;
  const mediaOpeningVideo = media?.video?.fileUrl
    ? {
        id: "uploaded-opening-video",
        name: media.video.originalFilename || "Opening video",
        url: media.video.fileUrl,
      }
    : null;

  const normalizedDesign = normalizeOpeningDesign({
    ...design,
    openingVideoEnabled: layout.openingVideoEnabled
      ?? design.openingVideoEnabled
      ?? Boolean(mediaOpeningVideo || design.openingVideoUrl || content.openingVideo),
  });
  const openingVideoEnabled = layout.openingVideoEnabled
    ?? normalizedDesign.openingVideoEnabled
    ?? Boolean(mediaOpeningVideo || design.openingVideoUrl || content.openingVideo);
  const reconstructedOpeningVideo = resolveOpeningVideo({
    mediaVideo: mediaOpeningVideo,
    configuredVideo: design.openingVideoUrl,
    contentVideo: content.openingVideo,
    enabled: openingVideoEnabled,
  });

  return {
    id: invitation?.id || invitation?.slug || "public-invitation",
    backendInvitationId: invitation?.id || null,
    slug: invitation?.slug || "",
    templateId: invitation?.templateCode || content.templateId || design.templateId || KEEP_TEMPLATE_CODE,
    templateCode: invitation?.templateCode || "",
    templateThumbnailUrl: invitation?.templateThumbnailUrl || "",
    couple: {
      ...contentCouple,
      groom: contentCouple.groom || invitation?.groomName || invitation?.hostName || "",
      bride: contentCouple.bride || invitation?.brideName || invitation?.partnerName || "",
    },
    event: {
      ...contentEvent,
      title: contentEvent.title || invitation?.title || "",
      date: contentEvent.date || invitation?.eventDate || "",
      ceremonyTime: contentEvent.ceremonyTime || eventTime,
      receptionTime: contentEvent.receptionTime || eventTime,
      venueName: contentEvent.venueName || invitation?.venueName || "",
      venueAddress: contentEvent.venueAddress || invitation?.venueAddress || "",
      mapLink: contentEvent.mapLink || invitation?.googleMapUrl || "",
    },
    contact: content.contact || {},
    message: content.message || invitation?.title || "",
    story: content.story || content.storyText || invitation?.storyText || "",
    storyChapters: Array.isArray(content.storyChapters) ? content.storyChapters : [],
    schedule: Array.isArray(content.schedule) ? content.schedule : [],
    party: Array.isArray(content.party) ? content.party : (Array.isArray(design.party) ? design.party : []),
    gift: Array.isArray(content.gift) ? content.gift : [],
    faq: Array.isArray(content.faq) ? content.faq : (Array.isArray(design.faq) ? design.faq : []),
    dressCode: content.dressCode || design.dressCode || (content.dressColors?.length ? { colors: content.dressColors } : null),
    dressColors: content.dressColors || design.dressColors || content.dressCode?.colors || [],
    showDressCode: content.showDressCode ?? design.showDressCode ?? enabled.dressCode,
    showParty: content.showParty ?? design.showParty ?? enabled.party,
    showFaq: content.showFaq ?? design.showFaq ?? enabled.faq,
    coverImage: mediaCover || invitation?.coverUrl || invitation?.media?.coverImage?.fileUrl || content.coverImage || invitation?.templateThumbnailUrl || "",
    gallery: gallery.length
      ? gallery
      : (Array.isArray(content.gallery)
        ? content.gallery.map(normalizeGalleryItem).filter(Boolean)
        : savedGallery),
    music: mediaMusic || content.music || null,
    openingVideo: reconstructedOpeningVideo,
    openingVideoEnabled,
    rsvp: {
      ...(content.rsvp || {}),
      enabled: enabled.rsvp !== false,
      deadline: content.rsvp?.deadline || invitation?.rsvpDeadline || "",
    },
    design: normalizedDesign,
    opening: normalizeOpeningCopy(content.opening),
    guest: invitation?.guest?.guestName
      ? {
          guestName: invitation.guest.guestName,
          guestGroup: invitation.guest.guestGroup || "",
          seatCount: invitation.guest.seatCount ?? null,
          tableName: invitation.guest.tableName || invitation.guest.tableNumber || "",
          seatLabel: invitation.guest.seatLabel || "",
        }
      : null,
    extras: {
      ...(content.extras || {}),
      languageMode: toTemplateLanguageMode(invitation?.languageMode || content.extras?.languageMode),
    },
    enabledSections: {
      ...enabled,
      rsvp: enabled.rsvp !== false,
    },
  };
}

function titleForDraft(draft) {
  const groom = draft?.couple?.groom || "";
  const bride = draft?.couple?.bride || "";
  return (
    draft?.event?.title ||
    [groom, bride].filter(Boolean).join(" & ") ||
    draft?.message ||
    "Koupreng Wedding Invitation"
  );
}

function normalizeTime(value) {
  const trimmed = timeValue(value);
  return trimmed || null;
}

function serializableGallery(gallery = []) {
  return gallery
    .map(normalizeGalleryItem)
    .filter((item) => item?.preview && !isLocalPreviewUrl(item.preview));
}

export function draftToInvitationPayload(draft, backendTemplateId) {
  const event = draft?.event || {};
  const couple = draft?.couple || {};
  const extras = draft?.extras || {};
  const enabledSections = {
    ...(draft?.enabledSections || {}),
    rsvp: draft?.rsvp?.enabled !== false && draft?.enabledSections?.rsvp !== false,
  };
  const languageMode = extras.languageMode || "both";
  const coverImage = draft?.coverImage && !isLocalPreviewUrl(draft.coverImage) ? draft.coverImage : "";
  const content = compactObject({
    templateId: draft?.templateId || KEEP_TEMPLATE_CODE,
    couple,
    event,
    contact: draft?.contact || {},
    message: draft?.message || "",
    story: draft?.story || "",
    storyText: draft?.story || "",
    storyChapters: draft?.storyChapters || [],
    schedule: draft?.schedule || [],
    party: draft?.party || [],
    gift: draft?.gift || [],
    faq: draft?.faq || [],
    dressCode: draft?.dressCode || null,
    dressColors: draft?.dressColors || draft?.dressCode?.colors || [],
    showDressCode: draft?.showDressCode,
    showParty: draft?.showParty,
    showFaq: draft?.showFaq,
    gallery: serializableGallery(draft?.gallery || []),
    coverImage,
    music: publicMediaRef(draft?.music),
    openingVideo: draft?.openingVideoEnabled === false ? null : publicMediaRef(draft?.openingVideo),
    opening: normalizeOpeningCopy(draft?.opening),
    rsvp: draft?.rsvp || { enabled: true },
    extras: {
      ...extras,
      languageMode,
    },
  });
  const design = normalizeOpeningDesign({
    templateId: draft?.templateId || KEEP_TEMPLATE_CODE,
    ...(draft?.design || {}),
    openingVideoEnabled:
      draft?.openingVideoEnabled !== false && Boolean(draft?.openingVideo || draft?.design?.openingVideoUrl),
  });
  const layout = {
    openingVideoEnabled:
      draft?.openingVideoEnabled !== false && Boolean(draft?.openingVideo || draft?.design?.openingVideoUrl),
  };

  return {
    templateId: backendTemplateId || null,
    title: titleForDraft(draft),
    eventType: "WEDDING",
    eventDate: event.date || null,
    eventTime: normalizeTime(event.ceremonyTime || event.receptionTime),
    venueName: event.venueName || null,
    venueAddress: event.venueAddress || null,
    googleMapUrl: event.mapLink || null,
    hostName: couple.groom || null,
    partnerName: couple.bride || null,
    groomName: couple.groom || null,
    brideName: couple.bride || null,
    storyText: draft?.story || draft?.message || null,
    languageMode: toBackendLanguageMode(languageMode),
    designJson: JSON.stringify(design),
    contentJson: JSON.stringify(content),
    enabledSections: JSON.stringify(enabledSections),
    layoutSettings: JSON.stringify(layout),
    visibility: "PUBLIC",
    accessPassword: null,
    rsvpDeadline: draft?.rsvp?.deadline || null,
  };
}

function mediaValueSignature(value) {
  if (!value) return "";
  const source = typeof value === "string" ? value : value.preview || value.url || "";
  if (!source) return "";
  if (isDataUrl(source)) {
    return `${source.slice(0, 48)}:${source.length}:${source.slice(-24)}`;
  }
  return source;
}

export function draftMediaSignature(draft) {
  return JSON.stringify({
    cover: mediaValueSignature(draft?.coverImage),
    gallery: (draft?.gallery || []).map(mediaValueSignature),
    music: mediaValueSignature(draft?.music),
    openingVideo: draft?.openingVideoEnabled === false ? "" : mediaValueSignature(draft?.openingVideo),
  });
}
