import { installIdentityFixtures, identityCatalog } from "./templateIdentityFixtures.js";
import { fixtureToken } from "./fixtureToken.js";

// This is an in-memory browser contract boundary, never a production service.
export async function installPhase2Fixtures(page, { anonymous = false } = {}) {
  const identity = await installIdentityFixtures(page);
  const created = [];
  if (anonymous) await page.addInitScript(() => {
    if (!sessionStorage.getItem("phase2.fixture.authenticated")) {
      sessionStorage.removeItem("koupreng.auth");
      localStorage.removeItem("koupreng.auth");
    }
  });
  await page.route("**/api/**", async route => {
    const request = route.request(), url = new URL(request.url()), path = url.pathname;
    const reply = (data, status = 200) => route.fulfill({ status, contentType: "application/json", body: JSON.stringify({ data }) });
    if (["/api/auth/login", "/api/auth/register"].includes(path) && request.method() === "POST") {
      // AuthController returns AuthResponse directly, unlike enveloped catalog DTOs.
      return route.fulfill({ contentType: "application/json", body: JSON.stringify({ accessToken: fixtureToken, user: { id: 7, fullName: "Audit Host", email: "audit@example.test", role: "USER" } }) });
    }
    if (path === "/api/v1/templates/recommendations") {
      const type = url.searchParams.get("eventType"), language = url.searchParams.get("language");
      return reply(identityCatalog.filter(t => t.supportedEventTypes.includes(type) && t.supportedLanguages.includes(language)).map(template => ({ template, styleMatch: true, score: 100 })));
    }
    if (path === "/api/v1/invitations" && request.method() === "POST") {
      const body = request.postDataJSON(), template = identityCatalog.find(t => t.id === body.templateId);
      if (body.templateId && (!template || !template.supportedEventTypes.includes(body.eventType))) return reply({ message: "Incompatible template" }, 400);
      if (template?.premium) return reply({ message: "Premium access is required" }, 403);
      let event = created.find(e => e.clientRequestId === body.clientRequestId);
      if (!event) {
        event = { ...body, userId: 7, id: 301 + created.length, templateCode: template?.code, status: "DRAFT", slug: "phase2-fixture-event" };
        created.push(event); identity.events.set(event.id, event);
      }
      return reply(event, 201);
    }
    if (path === "/api/v1/invitations/my") return reply([...identity.events.values()]);
    const eventRoute = path.match(/^\/api\/v1\/invitations\/(30\d)(?:\/(.*))?$/);
    if (eventRoute) {
      const id = Number(eventRoute[1]); let event = identity.events.get(id);
      if (!event) return reply(null, 404);
      if (request.method() === "PUT" && !eventRoute[2]) {
        const payload = request.postDataJSON();
        event = { ...event, ...payload, templateCode: identityCatalog.find(t => t.id === payload.templateId)?.code || event.templateCode };
        identity.events.set(id, event); identity.writes.push({ id, payload });
      }
      if (!eventRoute[2] || eventRoute[2] === "preview") return reply(event);
      if (eventRoute[2] === "access") return reply({ owner: true, permissions: [], ownerFeatures: ["QR_INVITATIONS"] });
      if (eventRoute[2] === "publish" && request.method() === "POST") {
        event = { ...event, status: "PUBLISHED" }; identity.events.set(id, event); return reply(event);
      }
      return reply(eventRoute[2].includes("summary") || eventRoute[2] === "dashboard" ? {} : []);
    }
    return route.fallback();
  });
  // No unhandled writes can reach a backend or an external provider.
  await page.route("**/*", route => {
    const request = route.request(), path = new URL(request.url()).pathname;
    const syntheticWrite = /^\/api\/auth\/(?:login|register)$/.test(path)
      || /^\/api\/v1\/invitations(?:\/30\d(?:\/publish)?)?$/.test(path);
    return ["GET", "HEAD", "OPTIONS"].includes(request.method()) || syntheticWrite ? route.fallback() : route.abort("blockedbyclient");
  });
  return { ...identity, created };
}
