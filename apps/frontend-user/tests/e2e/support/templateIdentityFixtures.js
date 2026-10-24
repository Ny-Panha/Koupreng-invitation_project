import { fixtures } from "./studioFixtures.js";

// IDs reproduce the read-only local catalog captured on 21 October 2026.
// All events, names, writes and sessions remain synthetic browser fixtures.
export const identityCatalog = [
  { id: 4, code: "khmer-celestial", name: "Khmer Celestial", description: '{"presetId":"KHMER_CELESTIAL"}' },
  { id: 2, code: "garden-royal-khmer-wedding", name: "Garden Royal Khmer Wedding" },
  { id: 5, code: "silk-heritage", name: "Silk Heritage", description: '{"presetId":"SILK_HERITAGE"}' },
  { id: 27, code: "emerald-canva-luxe-wedding", name: "Emerald Luxe", premium: true },
].map(t => ({ status: "ACTIVE", supportedEventTypes: ["WEDDING"], supportedLanguages: ["KH", "EN", "BOTH"], ...t }));

export async function installIdentityFixtures(page, { catalog = identityCatalog, delay = 0, denyPremium = false } = {}) {
  await fixtures(page);
  const events = new Map([101, 102].map((id, i) => [id, {
    id, userId: 7, title: i ? "Garden celebration" : "Celestial celebration", eventType: "WEDDING",
    templateId: i ? 2 : 4, templateCode: i ? "garden-royal-khmer-wedding" : "khmer-celestial",
    groomName: i ? "Garden host" : "Celestial host", brideName: "Review partner", hostName: "Review host", partnerName: "Review partner",
    status: "DRAFT", slug: i ? "review-garden" : "review-celestial", languageMode: "EN", visibility: "PUBLIC",
    eventDate: "2026-12-20", eventTime: "17:30", venueName: "Review venue",
    // Deliberately stale customization must not override the server association.
    designJson: JSON.stringify({ templateId: "garden-royal-khmer-wedding", presetId: "GARDEN_ROYAL" }),
  }]));
  const writes = [];
  await page.route("**/api/v1/**", async route => {
    const path = new URL(route.request().url()).pathname;
    const reply = (data, status=200) => route.fulfill({ status, contentType:"application/json", body:JSON.stringify({data}) });
    if (path === "/api/v1/templates") { if (delay) await new Promise(r => setTimeout(r,delay)); return reply(catalog); }
    if (path.startsWith("/api/v1/templates/")) {
      const key = decodeURIComponent(path.split("/").pop());
      return reply(catalog.find(t => t.code === key || String(t.id) === key) || null, catalog.some(t => t.code === key || String(t.id) === key) ? 200 : 404);
    }
    if (path === "/api/v1/invitations/my") return reply([...events.values()]);
    const match = path.match(/^\/api\/v1\/invitations\/(101|102)(\/preview)?$/);
    if (match) {
      const id=Number(match[1]);
      if (route.request().method() === "PUT") {
        const payload=route.request().postDataJSON();
        writes.push({id,payload});
        if (denyPremium && payload.templateId===27) return reply({message:"Premium template access is required"},403);
        const template=catalog.find(t=>t.id===payload.templateId);
        events.set(id,{...events.get(id),...payload,templateCode:template?.code});
      }
      return reply(events.get(id));
    }
    if (path === "/api/v1/public/invitations/review-celestial") return reply({...events.get(101),status:"PUBLISHED"});
    if (path.startsWith("/api/v1/public/invitations/review-celestial/")) return reply(path.endsWith("/media")?{}:[]);
    return route.fallback();
  });
  return {events,writes};
}
