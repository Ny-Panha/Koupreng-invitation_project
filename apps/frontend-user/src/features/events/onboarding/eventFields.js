export const EVENT_TYPES = [
  ["WEDDING", "អាពាហ៍ពិពាហ៍", "Wedding"], ["ENGAGEMENT", "ភ្ជាប់ពាក្យ", "Engagement"],
  ["BIRTHDAY", "ខួបកំណើត", "Birthday"], ["ANNIVERSARY", "ខួបអនុស្សាវរីយ៍", "Anniversary"],
  ["CORPORATE", "កម្មវិធីក្រុមហ៊ុន", "Corporate"], ["OTHER", "ផ្សេងៗ", "Other"],
];
export const STYLE_LABELS = {
  TRADITIONAL: ["ប្រពៃណីខ្មែរ", "Traditional Khmer"], MODERN: ["ទំនើប", "Modern"],
  MINIMALIST: ["សាមញ្ញ", "Minimalist"], FLORAL: ["ផ្កា", "Floral"], LUXURY: ["ប្រណីត", "Luxury"], OTHER: ["ផ្សេងៗ", "Other"],
};
export function eventFields(type) {
  const participants = type === "WEDDING" ? [["groomName", "ឈ្មោះកូនកំលោះ", "Groom name"], ["brideName", "ឈ្មោះកូនក្រមុំ", "Bride name"]]
    : type === "ENGAGEMENT" || type === "ANNIVERSARY" ? [["hostName", "ឈ្មោះគូស្នេហ៍ទី១", "First participant"], ["partnerName", "ឈ្មោះគូស្នេហ៍ទី២", "Second participant"]]
    : type === "BIRTHDAY" ? [["hostName", "ឈ្មោះម្ចាស់ខួប", "Celebrant name"]]
    : type === "CORPORATE" ? [["hostName", "អង្គភាព ឬម្ចាស់កម្មវិធី", "Organization or host"]]
    : [["hostName", "ម្ចាស់កម្មវិធី", "Host name"]];
  return [["title", "ឈ្មោះកម្មវិធី", "Event title"], ...participants,
    ["eventDate", "កាលបរិច្ឆេទ", "Event date", "date"], ["eventTime", "ម៉ោង", "Event time", "time"],
    ["venueName", "ទីកន្លែង", "Venue"], ["venueAddress", "អាសយដ្ឋាន (អាចបំពេញពេលក្រោយ)", "Address (optional)", "text", false],
    ["googleMapUrl", "តំណ Google Maps (មិនបាច់បំពេញ)", "Google Maps link (optional)", "url", false]];
}
export function eventPayload(form, type) {
  const fields = ["templateId", "organizationId", "title", "eventDate", "eventTime", "venueName", "venueAddress",
    "googleMapUrl", "hostName", "partnerName", "groomName", "brideName", "storyText", "languageMode",
    "designJson", "contentJson", "customColors", "customFonts", "enabledSections", "layoutSettings", "visibility", "accessPassword", "rsvpDeadline"];
  const payload = { ...Object.fromEntries(fields.filter(key => form[key] !== undefined).map(key => [key, form[key]])), eventType: type,
    groomName: type === "WEDDING" || type === "ENGAGEMENT" ? form.groomName || form.hostName || "" : "",
    brideName: type === "WEDDING" || type === "ENGAGEMENT" ? form.brideName || form.partnerName || "" : "",
    hostName: type === "WEDDING" ? form.groomName : form.hostName,
    partnerName: type === "WEDDING" ? form.brideName : form.partnerName || "",
  };
  if (form.contentJson) {
    try {
      const content = JSON.parse(form.contentJson);
      payload.contentJson = JSON.stringify({ ...content, title: payload.title, venueName: payload.venueName,
        venueAddress: payload.venueAddress, eventDateText: payload.eventDate,
        couple: { ...content.couple, groom: payload.groomName || payload.hostName, bride: payload.brideName || payload.partnerName },
        event: { ...content.event, title: payload.title, date: payload.eventDate, receptionTime: payload.eventTime, venueName: payload.venueName, venueAddress: payload.venueAddress } });
    } catch { /* Retain legacy content when it cannot be parsed safely. */ }
  }
  return payload;
}
