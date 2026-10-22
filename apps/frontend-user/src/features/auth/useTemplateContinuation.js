import { useEffect } from "react";
import { clearTemplateIntent, saveTemplateIntent, templateIntentFromParams } from "../templates/model/templateIntent";
import { resolveAuthDestination } from "./safeRedirect";

export function useTemplateContinuation(searchParams) {
  const destination = resolveAuthDestination(searchParams);
  useEffect(() => {
    const params = new URL(destination, "https://koupreng.invalid").searchParams;
    const key = templateIntentFromParams(params);
    if (key) saveTemplateIntent(key);
    else if (["template", "templateCode", "templateId", "tpl"].some(name => params.has(name) || searchParams.has(name))) {
      clearTemplateIntent();
    }
  }, [destination, searchParams]);
  return destination;
}
