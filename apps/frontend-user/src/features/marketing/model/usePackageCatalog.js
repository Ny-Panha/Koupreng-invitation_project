import { useCallback, useEffect, useState } from "react";
import subscriptionService from "../../subscriptions/subscriptionService";
import { useLanguageStore } from "../../../stores/useLanguageStore";

export function usePackageCatalog() {
  const lang = useLanguageStore(state => state.lang);
  const [catalog, setCatalog] = useState({ status: "loading", items: [] });
  const [attempt, setAttempt] = useState(0);
  const reload = useCallback(() => setAttempt(value => value + 1), []);
  useEffect(() => {
    let active = true;
    setCatalog({ status: "loading", items: [] });
    subscriptionService.publicPackages({ suppressAuthRedirect: true }).then(items => {
      if (active) setCatalog({ status: "ready", items: Array.isArray(items) ? items.filter(plan => plan.active !== false && !["INACTIVE", "DISABLED"].includes(String(plan.status || "").toUpperCase())) : [] });
    }).catch(failure => {
      if (active) setCatalog({ status: [401, 403].includes(failure?.status) ? "restricted" : "error", items: [] });
    });
    return () => { active = false; };
  }, [attempt, lang]);
  return { catalog, reload };
}
