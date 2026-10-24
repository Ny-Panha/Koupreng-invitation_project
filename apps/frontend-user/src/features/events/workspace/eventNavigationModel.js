import { Armchair, ChartColumn, ClipboardCheck, Eye, Gift, Images, LayoutDashboard, MessageCircleHeart, Palette, QrCode, ScanLine, Send, Settings, Sparkles, Ticket, Users, Wallet } from "lucide-react";

// Every destination maps to an existing child route in hostRoutes.jsx.
export const PRIMARY_EVENT_LINKS = [
  { path: "", en: "Dashboard", km: "ផ្ទាំងគ្រប់គ្រង", Icon: LayoutDashboard },
  { path: "invitation", en: "Invitation Studio", km: "រចនាធៀបអញ្ជើញ", Icon: Palette },
  { path: "guests", en: "Guests", km: "បញ្ជីភ្ញៀវ", Icon: Users },
  { path: "rsvp", en: "RSVP", km: "ការឆ្លើយតប", Icon: ClipboardCheck },
  { path: "delivery", en: "Delivery", km: "ការផ្ញើធៀប", Icon: Send },
];

export const EVENT_LINK_GROUPS = [
  { key: "invitation", en: "Invitation", km: "ធៀបអញ្ជើញ", items: [
    { path: "tickets/design", en: "Digital tickets", km: "កាតអញ្ជើញឌីជីថល", Icon: Ticket },
    { path: "preview", en: "Preview", km: "មើលជាមុន", Icon: Eye },
    { path: "media", en: "Media", km: "រូបភាព", Icon: Images },
  ] },
  { key: "attendance", en: "Attendance", km: "ការចូលរួម", items: [
    { path: "seating", en: "Seating", km: "រៀបចំកន្លែងអង្គុយ", Icon: Armchair },
    { path: "check-in", en: "Check-in", km: "កត់ត្រាវត្តមាន", Icon: ScanLine },
  ] },
  { key: "operations", en: "Management", km: "ការគ្រប់គ្រង", items: [
    { path: "gifts", en: "Gifts", km: "ចំណងដៃ", Icon: Gift },
    { path: "budget", en: "Budget", km: "គម្រោងថវិកា", Icon: Wallet },
    { path: "reports", en: "Reports", km: "របាយការណ៍", Icon: ChartColumn },
  ] },
  { key: "other", en: "More", km: "ផ្សេងទៀត", items: [
    { path: "qr", en: "QR Code", km: "កូដ QR", Icon: QrCode },
    { path: "wishes", en: "Wishes", km: "សារជូនពរ", Icon: MessageCircleHeart },
    { path: "settings", en: "Settings", km: "ការកំណត់", Icon: Settings },
    { path: "team", en: "Event team", km: "ក្រុមកម្មវិធី", Icon: Users },
    { path: "assistant", en: "Assistant", km: "ជំនួយការសរសេរ", Icon: Sparkles },
  ] },
];
export const ALL_EVENT_LINKS = [...PRIMARY_EVENT_LINKS, ...EVENT_LINK_GROUPS.flatMap(group => group.items)];

// UI affordances follow the explicit API grant; the server still authorizes every request.
export function moduleAllowed(path, owner, permissions = []) {
  if (owner) return true;
  const required = { '': 'VIEW_EVENT', invitation: 'EDIT_EVENT', preview: 'VIEW_EVENT', media: 'MANAGE_INVITATION', guests: 'MANAGE_GUESTS', rsvp: 'MANAGE_RSVP', wishes: 'MANAGE_RSVP', seating: 'MANAGE_SEATING', 'check-in': 'MANAGE_CHECKIN', analytics: 'VIEW_REPORTS' }[path];
  return Boolean(required && permissions.includes(required));
}

export function eventStatus(event, en) {
  const known = {
    PUBLISHED: ["Published", "បានផ្សាយ", "published"],
    DRAFT: ["Draft", "ព្រាង", "draft"],
    UNPUBLISHED: ["Unpublished", "ផ្អាកផ្សាយ", "unpublished"],
  }[event?.status];
  return known ? { label: known[en ? 0 : 1], tone: known[2] }
    : { label: event?.status || (en ? "Status unavailable" : "មិនទាន់មានស្ថានភាព"), tone: "unknown" };
}
