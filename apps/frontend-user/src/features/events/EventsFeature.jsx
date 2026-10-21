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
    const currentPage = Math.min(page, Math.max(0, Math.ceil(filtered.length / 12) - 1));
    const visible = filtered.slice(currentPage * 12, (currentPage + 1) * 12);
    const createBtnText = (t("createBtn") || (en ? "Create Event" : "បង្កើតកម្មវិធី")).replace(/^\+*\s*/, "");
    const emptyActionText = (t("goToCreate") || t("createBtn") || (en ? "Create First Event" : "បង្កើតកម្មវិធីថ្មី")).replace(/^\+*\s*/, "");

    return (
        <main className="events-page workspace-page">
            <header className="events-page-header">
                <div>
                    <span>{t("brandKicker") || `${tDash("brand") || "Koupreng"} ${en ? "invitations" : "ធៀបអញ្ជើញ"}`}</span>
                    <h1>{t("title") || (en ? "My Events" : "កម្មវិធីរបស់ខ្ញុំ")}</h1>
                    <p>{t("subtitle") || (en ? "Manage your weddings, invitations, guest lists, and digital tickets in one place." : "គ្រប់គ្រងកម្មវិធី ធៀបការ បញ្ជីភ្ញៀវ និងកាតអញ្ជើញឌីជីថលរបស់អ្នកនៅកន្លែងតែមួយ។")}</p>
                </div>
                <Link to="/app/events/new" state={{ from: "/dashboard/events" }} className="events-create-btn">
                    + {createBtnText}
                </Link>
            </header>

            {error && (
                <div role="alert" className="workspace-notice" style={{ color: "#a52838", marginBottom: "20px" }}>
                    <p>{error}</p>
                    <button type="button" className="workspace-button" style={{ marginTop: "10px" }} onClick={reload}>
                        {en ? "Try again" : "ព្យាយាមម្ដងទៀត"}
                    </button>
                </div>
            )}

            <div className="events-filters">
              <label>
                {en ? "Search events" : "ស្វែងរកកម្មវិធី"}
                <input
                    type="search"
                    placeholder={en ? "Filter by name or venue…" : "ស្វែងរកតាមឈ្មោះ ឬទីតាំង…"}
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(0); }}
                />
              </label>
              <label>
                {en ? "Status" : "ស្ថានភាព"}
                <select value={status} onChange={e => { setStatus(e.target.value); setPage(0); }}>
                    <option value="">{en ? "All statuses" : "គ្រប់ស្ថានភាព"}</option>
                    <option value="DRAFT">{en ? "Draft" : "ព្រាង"}</option>
                    <option value="PUBLISHED">{en ? "Published" : "បានផ្សាយ"}</option>
                    <option value="UNPUBLISHED">{en ? "Unpublished" : "ផ្អាកផ្សាយ"}</option>
                </select>
              </label>
              <label>
                {en ? "Sort" : "តម្រៀប"}
                <select value={sort} onChange={e => { setSort(e.target.value); setPage(0); }}>
                    <option value="newest">{en ? "Newest" : "ថ្មីបំផុត"}</option>
                    <option value="date">{en ? "Event date" : "កាលបរិច្ឆេទ"}</option>
                    <option value="title">{en ? "Title" : "ឈ្មោះ"}</option>
                </select>
              </label>
            </div>

            {loading && <p role="status" className="workspace-muted">{en ? "Loading your events…" : "កំពុងទាញយកកម្មវិធី…"}</p>}

            {!loading && drafts.length === 0 ? (
                <div className="events-empty-state">
                    <div className="events-empty-icon">
                        <CalendarHeart size={36} strokeWidth={1.75} aria-hidden="true" />
                    </div>
                    <div className="events-empty-title">{t("emptyTitle") || (en ? "No Events Yet" : "មិនទាន់មានកម្មវិធីនៅឡើយទេ")}</div>
                    <div className="events-empty-desc">{t("emptySubtitle") || (en ? "Create your first digital invitation event to get started." : "ចាប់ផ្ដើមដោយបង្កើតកម្មវិធី និងធៀបអញ្ជើញឌីជីថលដំបូងរបស់អ្នក។")}</div>
                    <Link to="/app/events/new" state={{ from: "/dashboard/events" }} className="events-empty-action">
                        + {emptyActionText}
                    </Link>
                </div>
            ) : filtered.length === 1 ? (
                <div className="events-featured-container">
                    <EventCard
                        key={visible[0].id}
                        draft={visible[0]}
                        onManage={handleDashboard}
                        onEdit={handleEdit}
                        onDelete={handleDeleteClick}
                        onPreview={draft => {
                            const id = backendEventId(draft);
                            if (id) navigate(eventPath(id, "preview"));
                            else navigate(`/preview/${draft.id}`);
                        }}
                        t={t}
                        featured={true}
                    />
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
                            onPreview={draft => {
                                const id = backendEventId(draft);
                                if (id) navigate(eventPath(id, "preview"));
                                else navigate(`/preview/${draft.id}`);
                            }}
                            t={t}
                            featured={false}
                        />
                    ))}
                </div>
            )}

            {!loading && drafts.length > 0 && filtered.length === 0 && (
                <div className="workspace-notice" style={{ marginTop: "24px" }}>
                    <p>{en ? "No events match your search or filter." : "គ្មានកម្មវិធីត្រូវនឹងការស្វែងរក ឬចម្រោះនេះទេ។"}</p>
                </div>
            )}

            {filtered.length > 12 && (
                <nav className="events-pagination" aria-label={en ? "Event pages" : "ទំព័រកម្មវិធី"}>
                    <button disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)} className="workspace-button">
                        {en ? "Previous" : "មុន"}
                    </button>
                    <span className="events-pagination-info">{currentPage + 1} / {Math.ceil(filtered.length / 12)}</span>
                    <button disabled={(currentPage + 1) * 12 >= filtered.length} onClick={() => setPage(currentPage + 1)} className="workspace-button">
                        {en ? "Next" : "បន្ទាប់"}
                    </button>
                </nav>
            )}

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
