import { api } from "./httpClient";
export async function downloadCsv(path, filename) {
  const blob = await api.get(path, { responseType: "blob" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  try { link.href = url; link.download = filename; document.body.appendChild(link); link.click(); }
  finally { link.remove(); URL.revokeObjectURL(url); }
}
