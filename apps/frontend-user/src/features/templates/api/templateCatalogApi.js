import { api } from "@/shared/api/httpClient";
import { getStoredLang, unwrap } from "@/shared/api/helpers";

const catalogCache = new Map();
const TTL_MS = 30_000;

export const templateCatalogService = {
    list: ({ force = false } = {}) => {
        const key = getStoredLang();
        const cached = catalogCache.get(key);
        if (cached?.pending) return cached.pending;
        if (!force && cached && cached.expiresAt > Date.now()) return Promise.resolve(cached.items);
        const entry = {};
        const pending = api.get("/v1/templates", { skipAuth: true, headers: { "Accept-Language": key } })
            .then(unwrap)
            .then((items) => {
                const list = Array.isArray(items)
                    ? items
                    : Array.isArray(items?.data)
                        ? items.data
                        : Array.isArray(items?.items)
                            ? items.items
                            : Array.isArray(items?.content)
                                ? items.content
                                : [];
                return list.map((t) => {
                    const isPrem = Boolean(t.premium || t.isPremium || (Number(t.price) > 0));
                    return {
                        ...t,
                        premium: isPrem,
                        isPremium: isPrem,
                    };
                });
            }).then((items) => {
                entry.items = items; entry.expiresAt = Date.now() + TTL_MS; entry.pending = null;
                return items;
            }).catch((error) => {
                if (catalogCache.get(key) === entry) catalogCache.delete(key);
                throw error;
            });
        entry.pending = pending;
        catalogCache.set(key, entry);
        return pending;
    },
};

export default templateCatalogService;

