import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useBackendMessages } from "../../shared/i18n/useBackendMessages";
import { useEvents } from "./hooks/useEvents";
import { EventCard } from "./components/EventCard";
import { EventDeleteModal } from "./components/EventDeleteModal";
import { toast } from "../../shared/ui/toast";
import { CalendarHeart } from "lucide-react";
import "./EventsFeature.css";
import "./workspace/EventWorkspace.css";
import { backendEventId, eventPath, EVENT_MODULES } from "./workspace/eventRoutes";
import { useLanguageStore } from "@/stores/useLanguageStore";

export function EventsFeature() {
    const navigate = useNavigate();
    const en = useLanguageStore(s => s.lang) === "en";
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [sort, setSort] = useState("newest");
    const [page, setPage] = useState(0);
    const location = useLocation();
    const hasTriggeredRef = useRef(false);
    const { text: t } = useBackendMessages("events");
    const { text: tDash } = useBackendMessages("dashboard");

    useEffect(() => {
        if (location.state?.savedSuccess && !hasTriggeredRef.current) {
            hasTriggeredRef.current = true;
            toast(location.state.message || "បានរក្សាទុកដោយជោគជ័យ!", location.state.syncFailed ? "warning" : "success");
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, navigate, location.pathname]);
    const {
        drafts, loading, error, reload,
        draftToDelete,
        isDeleting,
        handleDeleteClick,
        cancelDelete,
        confirmDelete,
    } = useEvents(t);

    const handleDashboard = (draft) => {
        const id = backendEventId(draft);
        const module = new URLSearchParams(location.search).get("module");
        if (id) navigate(eventPath(id, EVENT_MODULES.includes(module) ? module : ""));
        else handleEdit(draft);
    };

    const handleEdit = (draft) => {
        const id = backendEventId(draft);
        navigate(id ? eventPath(id, "invitation") : `/dashboard/invitations/${draft.id}/edit`);
    };

    const filtered = drafts.filter(draft => (!status || (draft.status || "DRAFT") === status)
      && [draft.title, draft.venueName, draft.groomName, draft.brideName].filter(Boolean).join(" ").toLocaleLowerCase().includes(search.toLocaleLowerCase()))
      .sort((a, b) => sort === "title" ? String(a.title || "").localeCompare(String(b.title || ""))
        : sort === "date" ? String(a.eventDate || "9999").localeCompare(String(b.eventDate || "9999"))
        : 0); // Both providers already return their records in recent-first order.
    const visible = filtered.slice(page * 12, (page + 1) * 12);
    const createBtnText = (t("createBtn") || "បង្កើតកម្មវិធី").replace(/^\+*\s*/, "");
    const emptyActionText = (t("goToCreate") || t("createBtn") || "បង្កើតកម្មវិធីថ្មី").replace(/^\+*\s*/, "");

    return (
        <main className="events-page">
            <header className="events-page-header">
                <div>
                    <span>{t("brandKicker") || `${tDash("brand")} invitations`}</span>
                    <h1>{t("title")}</h1>
                    <p>{t("subtitle")}</p>
                </div>
                <Link to="/app/events/new" state={{ from: "/dashboard/events" }} className="events-create-btn">
                    + {createBtnText}
                </Link>
            </header>

            {error && <div role="alert"><p>{error}</p><button type="button" onClick={reload}>{en ? "Try again" : "ព្យាយាមម្ដងទៀត"}</button></div>}
            <div className="events-filters">
              <label>{en ? "Search events" : "ស្វែងរកកម្មវិធី"}<input type="search" value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} /></label>
              <label>{en ? "Status" : "ស្ថានភាព"}<select value={status} onChange={e => { setStatus(e.target.value); setPage(0); }}><option value="">{en ? "All statuses" : "គ្រប់ស្ថានភាព"}</option><option value="DRAFT">{en ? "Draft" : "ព្រាង"}</option><option value="PUBLISHED">{en ? "Published" : "បានផ្សាយ"}</option><option value="UNPUBLISHED">{en ? "Unpublished" : "ផ្អាកផ្សាយ"}</option></select></label>
              <label>{en ? "Sort" : "តម្រៀប"}<select value={sort} onChange={e => { setSort(e.target.value); setPage(0); }}><option value="newest">{en ? "Newest" : "ថ្មីបំផុត"}</option><option value="date">{en ? "Event date" : "កាលបរិច្ឆេទ"}</option><option value="title">{en ? "Title" : "ឈ្មោះ"}</option></select></label>
            </div>
            {loading && <p role="status">{en ? "Loading your events…" : "កំពុងទាញយកកម្មវិធី…"}</p>}
            {!loading && drafts.length === 0 ? (
                <div className="events-empty-state">
                    <div className="events-empty-icon">
                        <CalendarHeart size={32} strokeWidth={1.75} aria-hidden="true" />
                    </div>
                    <div className="events-empty-title">{t("emptyTitle")}</div>
                    <div className="events-empty-desc">{t("emptySubtitle")}</div>
                    <Link to="/app/events/new" state={{ from: "/dashboard/events" }} className="events-empty-action">
                        + {emptyActionText}
                    </Link>
                </div>
            ) : (
                <div className="events-grid">
                    {visible.map((draft) => (
                        <EventCard
                            key={draft.id}
                            draft={draft}
                            onManage={handleDashboard}
                            onEdit={handleEdit}
                            onDelete={handleDeleteClick}
                            onPreview={draft => { const id = backendEventId(draft); if (id) navigate(eventPath(id, "preview")); else navigate(`/preview/${draft.id}`); }}
                            t={t}
                        />
                    ))}
                </div>
            )}

            {!loading && drafts.length > 0 && filtered.length === 0 && <p>{en ? "No events match your filters." : "គ្មានកម្មវិធីត្រូវនឹងការស្វែងរក។"}</p>}
            {filtered.length > 12 && <nav aria-label={en ? "Event pages" : "ទំព័រកម្មវិធី"}><button disabled={page === 0} onClick={() => setPage(p => p - 1)}>{en ? "Previous" : "មុន"}</button> <span>{page + 1} / {Math.ceil(filtered.length / 12)}</span> <button disabled={(page + 1) * 12 >= filtered.length} onClick={() => setPage(p => p + 1)}>{en ? "Next" : "បន្ទាប់"}</button></nav>}
            <EventDeleteModal
                draftToDelete={draftToDelete}
                onCancel={cancelDelete}
                onConfirm={confirmDelete}
                isDeleting={isDeleting}
                t={t}
            />
        </main>
    );
}

export default EventsFeature;
