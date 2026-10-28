import { readFile } from "node:fs/promises";
import { installUxFixtures, uxEvents } from "./uxFixtures.js";

export const qrPayload = "https://koupreng.example/i/wedding-sok-sophea-2026-12-20-phnom-penh?token=59d9cb1e-86b4-4d38-b531-d6c9034a17ea";
export async function fixtures(page, lang = "en", options = {}) {
  await installUxFixtures(page, lang, options);
  const qrCodeDataUri = `data:image/png;base64,${(await readFile(new URL("./fixtures/ticket-qr.png", import.meta.url))).toString("base64")}`;
  let design = { version: 0, layout: "GOLD", accent: "#956d2c", font: "MOUL", frame: "DOUBLE", header: "សូមគោរពអញ្ជើញ", footer: "សូមបង្ហាញកាតនេះនៅច្រកចូល · Present at the entrance", backgroundMediaId: null, coverMediaId: null, showGroup: false, showTable: true, showSeatCount: true };
  const template = { id: 10, code: "khmer-celestial", name: "Khmer Celestial", status: "ACTIVE", premium: false, supportedEventTypes: ["WEDDING"], supportedLanguages: ["KH", "EN", "BOTH"] };
  let event = { ...uxEvents[0], templateId: 10, templateCode: "khmer-celestial", partnerName: "ស្រីពេជ្រ", hostName: "សុខ", groomName: "សុខ", brideName: "ស្រីពេជ្រ", title: "សិរីមង្គលអាពាហ៍ពិពាហ៍", slug: "audit-event", visibility: "PUBLIC" };
  const writes = [];
  await page.route("**/api/v1/**", async route => {
    const request = route.request(), url = new URL(request.url()), pathname = url.pathname;
    const reply = (data, status = 200) => route.fulfill({ status, contentType: "application/json", body: JSON.stringify({ data }) });
    const appearance = () => ({ schemaVersion: 1, design, backgroundUrl: null, coverUrl: null });
    const ticket = personal => ({ kind: personal ? "GUEST" : "GENERAL", title: event.title, hostName: event.hostName, partnerName: event.partnerName, eventDate: event.eventDate, eventTime: event.eventTime, venueName: "សាលមង្គលការ ភ្នំពេញ · Phnom Penh", guestName: personal ? "លោក សុខ សុវណ្ណ និងលោកស្រី ស្រីពេជ្រ ព្រមទាំងក្រុមគ្រួសារ" : null, tableName: personal ? "Lotus 8" : null, seatCount: personal ? 2 : null, invitationUrl: qrPayload, qrPayload, qrCodeDataUri, appearance: appearance() });
    if (pathname.endsWith("/ticket-design")) {
      if (request.method() === "PUT") { design = { ...request.postDataJSON(), version: design.version + 1 }; writes.push({ kind: "design", design }); }
      return reply(appearance());
    }
    if (pathname.endsWith("/ticket")) return reply(ticket(pathname.includes("/guests/") || url.searchParams.has("token")));
    if (pathname === "/api/v1/invitations/101") {
      if (request.method() === "PUT") { event = { ...event, ...request.postDataJSON() }; writes.push({ kind: "invitation", event }); }
      return reply(event);
    }
    if (pathname.endsWith("/invitations/my")) return reply([event, uxEvents[1]]);
    if (pathname === "/api/v1/templates") return reply([template]);
    if (pathname.includes("/templates/slug/") || pathname === "/api/v1/templates/10" || pathname === "/api/v1/templates/khmer-celestial") return reply(template);
    if (pathname === "/api/v1/public/invitations/audit-event") return reply({ ...event, status: "PUBLISHED" });
    return route.fallback();
  });
  return { writes };
}
