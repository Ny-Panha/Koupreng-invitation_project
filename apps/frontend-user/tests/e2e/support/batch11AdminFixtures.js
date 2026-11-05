import { fixtureToken } from "./fixtureToken.js";

// Browser contract fixture only. Unrecognized writes fail closed; no external dispatch.
export async function installBatch11Admin(page, { role = "ADMIN", lang = "en", expired = false, customerSessionOnly = false } = {}) {
  const writes = [];
  const user = { id: 1101, fullName: "Batch 11 fictional account", email: "batch11@example.test", role, status: "ACTIVE" };
  const template = { id: 30, code: "event-essential", name: "Batch 11 fixture template", status: "ACTIVE", category: "MINIMALIST", premium: false, description: "Fixture template", thumbnailUrl: "/templates/event-essential.svg" };
  await page.addInitScript(({ user, lang, token, expired, customerSessionOnly }) => {
    if (window !== window.top) return;
    const auth = JSON.stringify({ accessToken: expired ? `e30.${btoa(JSON.stringify({ exp: 1 }))}.` : token, user });
    localStorage.setItem(customerSessionOnly ? "koupreng.auth" : "koupreng.admin.auth", auth);
    if (!localStorage.getItem("koupreng.admin.lang")) localStorage.setItem("koupreng.admin.lang", lang);
  }, { user, lang, token: fixtureToken, expired, customerSessionOnly });
  await page.route("**/api/**", async route => {
    const request = route.request(), pathname = new URL(request.url()).pathname;
    const reply = (data, status = 200) => route.fulfill({ status, contentType: "application/json", body: JSON.stringify({ data }) });
    if (request.method() !== "GET") {
      writes.push({ path: pathname, body: request.postDataJSON() });
      if (pathname.endsWith("/admin/notifications")) return reply({ id: 1199, ...request.postDataJSON(), status: "PENDING" }, 201);
      return reply({ message: "Unexpected fixture write" }, 400);
    }
    if (pathname.endsWith("/admin/users/1101/invitations")) return reply([]);
    if (pathname.endsWith("/admin/users/1101")) return reply(user);
    if (pathname.endsWith("/admin/templates/30")) return reply(template);
    if (pathname.endsWith("/admin/templates")) return reply([template]);
    if (pathname.endsWith("/admin/packages")) return reply([{ id: 1101, code: "BASIC", packageName: "Fixture Basic", price: 10, currency: "USD", active: true, publicVisible: false, maxInvitations: 1, maxGuests: 40 }]);
    if (pathname.endsWith("/i18n/messages")) return reply({ messages: {} });
    return reply([]);
  });
  return { writes };
}
