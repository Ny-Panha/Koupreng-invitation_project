import { normalizeDressColors } from "../experience/config/templateExperienceContent";

/**
 * Normalizes template, draft, or invitation data into a predictable view-model
 * for all dedicated layout templates.
 */
export function normalizeTemplateViewModel(tpl = {}, content = {}) {
  const merged = { ...tpl, ...content };

  const groom = merged.groom || merged.groomName || "កូនកំលោះ";
  const bride = merged.bride || merged.brideName || "កូនក្រមុំ";
  const groomEn = merged.groomEn || merged.groomNameEn || "";
  const brideEn = merged.brideEn || merged.brideNameEn || "";

  // Parents
  const couple = merged.couple || {};
  const groomFather = merged.groomFather || couple.groomFather || "";
  const groomMother = merged.groomMother || couple.groomMother || "";
  const brideFather = merged.brideFather || couple.brideFather || "";
  const brideMother = merged.brideMother || couple.brideMother || "";
  const groomParents = [groomFather, groomMother].filter(Boolean).join(" និង ") || couple.groomParents || "";
  const brideParents = [brideFather, brideMother].filter(Boolean).join(" និង ") || couple.brideParents || "";

  // Dates
  const dateText = merged.dateText || merged.weddingDateText || merged.weddingDate || "ថ្ងៃសៅរ៍ ទី២៨ ខែវិច្ឆិកា ឆ្នាំ២០២៦";
  const dateTextEn = merged.dateTextEn || merged.weddingDateTextEn || "";
  const targetDate = merged.targetDate || merged.weddingDate || "2026-11-28T17:00:00+07:00";

  // Venue
  const venueObj = merged.venue || {};
  const venueName = merged.venueName || venueObj.name || "The Premier Center Sen Sok";
  const venueHall = merged.venueHall || venueObj.hall || "Grand Ballroom";
  const venueAddress = merged.venueAddress || venueObj.address || "រាជធានីភ្នំពេញ";
  const rawMap = merged.googleMapsUrl || merged.googleMapUrl || merged.mapQuery || venueObj.mapLink || venueObj.mapEmbedUrl || "";
  let googleMapsUrl = "";
  if (rawMap && typeof rawMap === "string" && rawMap.trim()) {
    const trimmed = rawMap.trim();
    googleMapsUrl = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmed)}`;
  } else if (venueName) {
    googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([venueName, venueAddress].filter(Boolean).join(" "))}`;
  }
  const sketchMapImage = merged.sketchMapImage || venueObj.sketchMapImage || null;

  // Gallery
  const rawGallery = merged.gallery || merged.galleryImages || [];
  const gallery = rawGallery.map((img, i) => {
    if (typeof img === "string") {
      return { src: img, alt: `Wedding photo ${i + 1}`, span: ["tall", "wide", "small", "small"][i % 4] };
    }
    return {
      src: img.src || img.url || img.preview || "",
      alt: img.alt || `Wedding photo ${i + 1}`,
      span: img.span || ["tall", "wide", "small", "small"][i % 4],
    };
  });

  // Schedule
  const rawSchedule = merged.schedule || [];
  const schedule = rawSchedule.map((item, i) => ({
    id: item.id || `schedule-${i}`,
    time: item.time || "០៧:០០",
    title: item.title || "កម្មវិធីមង្គល",
    titleEn: item.titleEn || "",
    description: item.description || item.desc || "",
    location: item.location || "",
  }));

  // Gift & QR
  const rawGift = (Array.isArray(merged.gift) ? merged.gift[0] : merged.gift) || {};
  const giftBank = rawGift.bank || merged.bankName || "";
  const giftNumber = rawGift.number || merged.bankAccountNumber || merged.accountNumber || "";
  const giftAccountName = rawGift.account || merged.bankAccountName || merged.accountName || "";
  const bankAccount = {
    bank: giftBank,
    accountNumber: giftNumber,
    accountName: giftAccountName,
    qrUrl: rawGift.qrImage || rawGift.qrUrl || merged.qrGiftUrl || merged.qrUrl || "",
    qrValue: rawGift.qrValue || merged.qrValue || [giftBank, giftAccountName, giftNumber].filter(Boolean).join(" | "),
  };

  // Dress code
  const rawDressColors = (merged.dressCode && Array.isArray(merged.dressCode.colors) && merged.dressCode.colors.length)
    ? merged.dressCode.colors
    : (Array.isArray(merged.dressCode) && merged.dressCode.length)
      ? merged.dressCode
      : (Array.isArray(merged.dressColors) && merged.dressColors.length)
        ? merged.dressColors
        : (Array.isArray(merged.design?.dressColors) && merged.design.dressColors.length)
          ? merged.design.dressColors
          : null;

  const normalizedColors = rawDressColors
    ? normalizeDressColors(rawDressColors)
    : [
        { name: "មាសប្រណិត", hex: "#D4AF37" },
        { name: "ក្រហមទុំ", hex: "#8B1E2D" },
        { name: "សំបកពងមាន់", hex: "#F5ECD7" },
        { name: "ខៀវចាស់", hex: "#1E293B" },
      ];

  const colorNames = normalizedColors.map((c) => c.name).filter(Boolean);
  const dynamicDressName = colorNames.length > 0 ? colorNames.join(" ") : "DRESS CODE PALETTE";
  const dynamicDressNote = dynamicDressName && dynamicDressName !== "DRESS CODE PALETTE"
    ? `សូមជ្រើសរើសសម្លៀកបំពាក់ពណ៌ ${dynamicDressName} ដើម្បីសមនឹងបរិយាកាសនៃពិធីមង្គលការ។`
    : "";

  const dressCode = (merged.dressCode && typeof merged.dressCode === "object" && !Array.isArray(merged.dressCode))
    ? {
        ...merged.dressCode,
        name: merged.dressCode.name || dynamicDressName,
        description: merged.dressCode.description || dynamicDressNote,
        colors: normalizedColors,
      }
    : {
        name: dynamicDressName,
        description: dynamicDressNote,
        colors: normalizedColors,
      };

  // Music
  const music = merged.music?.url || (typeof merged.music === "string" ? merged.music : null);

  // Message
  const blessingMessage = (typeof merged.message === "string" && merged.message.trim())
    ? merged.message
    : (merged.blessingMessage || merged.message?.text || "សូមគោរពអញ្ជើញឯកឧត្តម លោកជំទាវ លោក លោកស្រី អ្នកនាង កញ្ញា ចូលរួមជាអធិបតី និងជាភ្ញៀវកិត្តិយសក្នុងពិធីមង្គលការរបស់យើងខ្ញុំ។");

  return {
    ...merged,
    groom,
    groomEn,
    bride,
    brideEn,
    groomFather,
    groomMother,
    brideFather,
    brideMother,
    groomParents,
    brideParents,
    dateText,
    dateTextEn,
    targetDate,
    venueName,
    venueHall,
    venueAddress,
    googleMapsUrl,
    sketchMapImage,
    gallery,
    schedule,
    bankAccount,
    dressCode,
    music,
    blessingMessage,
  };
}
