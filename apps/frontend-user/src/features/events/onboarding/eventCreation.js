import { eventFields } from "./eventFields.js";

export function validateEventForm(form, type, { draft = false, en = true } = {}) {
  const errors = {};
  for (const [key, kh, english, , required = true] of eventFields(type)) {
    const value = String(form[key] || "").trim();
    if (!value && required && (!draft || key === "title")) errors[key] = en ? `${english} is required.` : `សូមបំពេញ ${kh}។`;
    if (value.length > (key === "venueAddress" ? 1000 : 255)) errors[key] = en ? "This value is too long." : "ព័ត៌មាននេះវែងពេក។";
  }
  if (form.eventDate) {
    const date = new Date(`${form.eventDate}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.eventDate) || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== form.eventDate) errors.eventDate = en ? "Enter a valid date." : "សូមបញ្ចូលកាលបរិច្ឆេទត្រឹមត្រូវ។";
  }
  if (form.eventTime && !/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(form.eventTime)) errors.eventTime = en ? "Enter a valid time." : "សូមបញ្ចូលម៉ោងត្រឹមត្រូវ។";
  if (form.googleMapUrl) {
    try {
      const url = new URL(form.googleMapUrl);
      const hosts = ["google.com", "www.google.com", "maps.google.com", "google.com.kh", "www.google.com.kh", "maps.google.com.kh", "goo.gl", "maps.app.goo.gl"];
      if (url.protocol !== "https:" || url.username || url.password || !hosts.includes(url.hostname)) throw new Error();
    }
    catch { errors.googleMapUrl = en ? "Enter a valid HTTPS Google Maps link." : "សូមបញ្ចូលតំណ Google Maps ដែលមាន HTTPS ត្រឹមត្រូវ។"; }
  }
  return errors;
}
