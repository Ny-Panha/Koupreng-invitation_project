import { useMemo, useState } from "react";
import { Loading, ErrorState, Empty } from "../../components/States";
import { useResource } from "../../hooks/useResource";
import { formatDateTime } from "../../lib/format";
import { useAdminLanguage } from "../../app/providers/AdminLanguageProvider";
import adminManagementService from "./adminManagementService";
import "./AdminFeature.css";

export default function AdminSystemLogsPage() {
  const { lang, t } = useAdminLanguage();
  const { data, loading, error, reload } = useResource(adminManagementService.systemLogs);
  const [query, setQuery] = useState("");

  const logs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data || []).filter((log) => {
      if (!q) return true;
      return [log.action, log.resourceType, log.actorEmail, log.description]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q));
    });
  }, [data, query]);

  return (
    <div>
      <div className="page-head">
        <div>
          <h2 className="page-title">{t("systemLogs.title", "System logs")}</h2>
          <p className="page-subtitle">{t("systemLogs.subtitle", "Auditable admin and system events.")}</p>
        </div>
      </div>

      <section className="card">
        <div className="toolbar">
          <input
            className="text-input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("systemLogs.searchPlaceholder", "Search logs...")}
          />
          <button type="button" className="btn btn-ghost" onClick={reload}>
            {t("common.refresh", "Refresh")}
          </button>
        </div>
        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorState onRetry={reload} />
        ) : logs.length === 0 ? (
          <Empty label={lang === "en" ? "No logs found" : "មិនមានកំណត់ហេតុទេ"} />
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>{t("systemLogs.colTimestamp", "Time")}</th>
                  <th>{lang === "en" ? "Actor" : "អ្នកធ្វើសកម្មភាព"}</th>
                  <th>{lang === "en" ? "Action" : "សកម្មភាព"}</th>
                  <th>{lang === "en" ? "Resource" : "ធនធាន"}</th>
                  <th>{lang === "en" ? "Description" : "ពិពណ៌នា"}</th>
                  <th>{lang === "en" ? "IP" : "IP"}</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>{formatDateTime(log.createdAt)}</td>
                    <td>{log.actorEmail || log.actorUserId || (lang === "en" ? "System" : "ប្រព័ន្ធ")}</td>
                    <td>{log.action}</td>
                    <td>{log.resourceType || "—"} {log.resourceId || ""}</td>
                    <td>{log.description || "—"}</td>
                    <td>{log.ipAddress || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
