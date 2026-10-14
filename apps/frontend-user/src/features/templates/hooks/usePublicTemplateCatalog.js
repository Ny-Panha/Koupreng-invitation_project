import { useEffect, useState } from "react";
import { templateService } from "../api/templateService";

export function usePublicTemplateCatalog(lang) {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading");
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    setStatus("loading");
    templateService.listPublic({ force: revision > 0 }).then((result) => {
      if (!active) return;
      if (!Array.isArray(result)) throw new Error("Invalid template catalog");
      setItems(result);
      setStatus("ready");
    }).catch(() => { if (active) { setItems([]); setStatus("error"); } });
    return () => { active = false; };
  }, [lang, revision]);
  return { items, status, retry: () => setRevision((value) => value + 1) };
}
