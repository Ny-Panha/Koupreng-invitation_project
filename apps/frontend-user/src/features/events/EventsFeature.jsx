import { CardGridSkeleton } from '@/shared/ui/LoadingState';
import { useEffect, useRef } from "react";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useBackendMessages } from "../../shared/i18n/useBackendMessages";
import { useEvents } from "./hooks/useEvents";
import { EventCard } from "./components/EventCard";
import { EventCalendar } from "./components/EventCalendar";
import { EventDeleteModal } from "./components/EventDeleteModal";
import { toast } from "../../shared/ui/toast";
import { CalendarHeart, Search, X, FilterX, LayoutList, CalendarDays, Plus, Sparkles, ArrowRight } from "lucide-react";
import "./EventsFeature.css";
import "./workspace/EventWorkspace.css";
import { backendEventId, eventPath, EVENT_MODULES } from "./workspace/eventRoutes";
import { useLanguageStore } from "@/stores/useLanguageStore";
import { EVENT_TYPES } from "./onboarding/eventFields";
import { compareEvents, eventDay, pageItems } from "./model/eventListModel";
import { localDateString } from "@/shared/utils/localDate";

export function EventsFeature() {
    const navigate = useNavigate();
    const en = useLanguageStore(s => s.lang) === "en";
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();
    const hasTriggeredRef = useRef(false);
    const searchInputRef = useRef(null);
    const resultsRef = useRef(null);
    const { text: t } = useBackendMessages("events");

    // Synchronize filters with URL search parameters
    const search = searchParams.get("q") || "";
    const status = ["DRAFT", "PUBLISHED", "UNPUBLISHED", "ARCHIVED"].includes(searchParams.get("status")) ? searchParams.get("status") : "";
    const eventType = EVENT_TYPES.some(item => item[0] === searchParams.get("type")) ? searchParams.get("type") : "";
    const sort = ["newest", "date", "title"].includes(searchParams.get("sort")) ? searchParams.get("sort") : "newest";
    const view = searchParams.get("view") === "calendar" ? "calendar" : "list"; // "list" | "calendar"
    const period = ["upcoming", "past"].includes(searchParams.get("period")) ? searchParams.get("period") : "all"; // "all" | "upcoming" | "past"
    const pageParam = Number(searchParams.get("page") || "1");
    const page = !Number.isSafeInteger(pageParam) || pageParam < 1 ? 0 : pageParam - 1;

    const updateFilter = (key, value) => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            if (value) next.set(key, value);
            else next.delete(key);
            next.delete("page"); // Reset to first page on filter change
            return next;
        }, { replace: key === "q" });
    };

    const setPage = (newPage) => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            if (newPage > 0) next.set("page", String(newPage + 1));
            else next.delete("page");
            return next;
        });
        requestAnimationFrame(() => resultsRef.current?.focus());
    };

    const resetAllFilters = () => {
        setSearchParams(prev => { const next = new URLSearchParams(prev); for (const key of ["q","status","type","sort","period","page"]) next.delete(key); return next; });
        searchInputRef.current?.focus();
    };

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

    const handleEdit = (draft) => {
        const id = backendEventId(draft);
        navigate(id ? eventPath(id, "invitation") : `/dashboard/invitations/${draft.id}/edit`);
    };

    const handleDashboard = (draft) => {
        const id = backendEventId(draft);
        const module = new URLSearchParams(location.search).get("module");
        if (id) navigate(eventPath(id, EVENT_MODULES.includes(module) ? module : ""));
        else handleEdit(draft);
    };

    const handlePreview = (draft) => {
        const id = backendEventId(draft);
        if (id) navigate(eventPath(id, "preview"));
        else navigate(`/preview/${draft.id}`);
    };

    const eventTypes = [...new Set(drafts.map(draft => draft.eventType).filter(Boolean))];

    const todayStr = localDateString(new Date());

    const filtered = drafts.filter(draft => {
      if (status && (draft.status || "DRAFT") !== status) return false;
      if (eventType && draft.eventType !== eventType) return false;
      if (search) {
        const query = search.trim().toLocaleLowerCase().normalize("NFC");
        const matches = [
          draft.title,
          draft.venueName,
          draft.event?.venueName,
          draft.groomName,
          draft.brideName,
          draft.hostNames,
          draft.celebrantName,
          draft.coupleNames,
          draft.event?.title,
        ]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase()
          .normalize("NFC")
          .includes(query);
        if (!matches) return false;
      }
      if (period === "upcoming") {
        const raw = eventDay(draft);
        return raw !== null && raw >= todayStr;
      }
      if (period === "past") {
        const raw = eventDay(draft);
        return raw !== null && raw < todayStr;
      }
      return true;
    })
      .sort((a,b) => compareEvents(a,b,sort,en ? "en" : "km"));

    const maxPage = Math.max(0, Math.ceil(filtered.length / 12) - 1);
    const currentPage = Math.min(page, maxPage);
    const visible = filtered.slice(currentPage * 12, (currentPage + 1) * 12);

    const hasActiveFilters = Boolean(search || status || eventType || sort !== "newest" || period !== "all");
    const createBtnText = (t("createBtn") || (en ? "Create Event" : "បង្កើតកម្មវិធី")).replace(/^\+*\s*/, "");
    const emptyActionText = (t("goToCreate") || t("createBtn") || (en ? "Create First Event" : "បង្កើតកម្មវិធីថ្មី")).replace(/^\+*\s*/, "");

    // Contextual "Continue where you left off" for pending local draft
    const resumeDraft = drafts.find(draft => !draft.shared && (
      draft.syncStatus === "LOCAL_ONLY" ||
      draft.syncStatus === "SYNC_FAILED" ||
      Boolean(draft.isLocal && draft.status !== "PUBLISHED") ||
      Boolean(String(draft.id || "").startsWith("draft-") && draft.status !== "PUBLISHED")
    ));

    return (
        <main className="events-page workspace-page">
            <header className="events-page-header">
                <div>
                    <h1>{en ? "My Events" : "កម្មវិធីរបស់ខ្ញុំ"}</h1>
                    <p>{en ? "Manage your weddings and celebrations, customize invitations, track guest RSVPs, and coordinate event logistics." : "គ្រប់គ្រងកម្មវិធីមង្គលការ និងពិធីផ្សេងៗ កែសម្រួលសំបុត្រអញ្ជើញ តាមដានភ្ញៀវ និងរៀបចំកាលវិភាគ។"}</p>
                </div>
                <div className="events-header-actions">
                    {/* View Mode Toggle: List vs Calendar */}
                    <div className="events-view-toggle" role="group" aria-label={en ? "View layout" : "ទម្រង់បង្ហាញ"}>
                        <button
                            type="button"
                            className={`events-view-btn ${view === "list" ? "is-active" : ""}`}
                            onClick={() => updateFilter("view", "")}
                            aria-label={en ? "List view" : undefined}
                            aria-pressed={view === "list"}
                        >
                            <LayoutList size={16} aria-hidden="true" />
                            <span>{en ? "List" : "បញ្ជី"}</span>
                        </button>
                        <button
                            type="button"
                            className={`events-view-btn ${view === "calendar" ? "is-active" : ""}`}
                            onClick={() => updateFilter("view", "calendar")}
                            aria-label={en ? "Calendar view" : "ប្រតិទិន"}
                            aria-pressed={view === "calendar"}
                        >
                            <CalendarDays size={16} aria-hidden="true" />
                            <span>{en ? "Calendar" : "ប្រតិទិន"}</span>
                        </button>
                    </div>

                    <Link to="/app/events/new" state={{ from: "/dashboard/events" }} className="events-create-btn">
                        + {createBtnText}
                    </Link>
                </div>
            </header>

            {error && (
                <div role="alert" className="workspace-notice" style={{ color: "#a52838", marginBottom: "20px" }}>
                    <p>{error}</p>
                    <button type="button" className="workspace-button" style={{ marginTop: "10px" }} onClick={reload}>
                        {en ? "Try again" : "ព្យាយាមម្ដងទៀត"}
                    </button>
                </div>
            )}

            {/* Contextual "Continue where you left off" Action */}
            {resumeDraft && !hasActiveFilters && (
                <div className="events-resume-banner" role="region" aria-label={en ? "Pending draft" : "សេចក្តីព្រាងមិនទាន់បញ្ចប់"}>
                    <div className="events-resume-content">
                        <div className="events-resume-icon-wrap" aria-hidden="true">
                            <Sparkles size={18} />
                        </div>
                        <div className="events-resume-text">
                            <span className="events-resume-kicker">{en ? "Continue where you left off" : "បន្តការរៀបចំកម្មវិធីចុងក្រោយរបស់អ្នក"}</span>
                            <strong className="events-resume-title">
                                {en ? "Draft: " : "សេចក្តីព្រាង៖ "}{resumeDraft.title || (en ? "Untitled Event Draft" : "សេចក្តីព្រាងកម្មវិធី")}
                            </strong>
                            <span className={`events-resume-status ${resumeDraft.syncStatus === "SYNC_FAILED" ? "is-failed" : "is-local"}`}>
                                {resumeDraft.syncStatus === "SYNC_FAILED"
                                    ? (en ? "Sync failed · Local copy retained" : "Sync បរាជ័យ · រក្សាទុកក្នុងឧបករណ៍")
                                    : (en ? "Saved in this browser only" : "រក្សាទុកក្នុងកម្មវិធីរុករកនេះ")}
                            </span>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="events-resume-action-btn"
                        onClick={() => handleEdit(resumeDraft)}
                    >
                        <span>{en ? "Resume draft" : "បន្តការព្រាង"}</span>
                        <ArrowRight size={15} aria-hidden="true" />
                    </button>
                </div>
            )}

            {/* Filter and Search Bar */}
            <div className="events-filters-container">
                {/* Period Quick Filter Tabs */}
                <div className="events-period-tabs" role="group" aria-label={en ? "Event period" : "កាលវេលាកម្មវិធី"}>
                    <button
                        type="button"
                        aria-pressed={period === "all"}
                        className={`events-period-tab ${period === "all" ? "is-active" : ""}`}
                        onClick={() => updateFilter("period", "")}
                    >
                        {en ? "All" : "ទាំងអស់"}
                    </button>
                    <button
                        type="button"
                        aria-pressed={period === "upcoming"}
                        className={`events-period-tab ${period === "upcoming" ? "is-active" : ""}`}
                        onClick={() => updateFilter("period", "upcoming")}
                    >
                        {en ? "Upcoming" : "នឹងមកដល់"}
                    </button>
                    <button
                        type="button"
                        aria-pressed={period === "past"}
                        className={`events-period-tab ${period === "past" ? "is-active" : ""}`}
                        onClick={() => updateFilter("period", "past")}
                    >
                        {en ? "Past" : "កន្លងមក"}
                    </button>
                </div>

                <div className="events-filters">
                    <label className="events-filter-search-label">
                        {en ? "Search events" : "ស្វែងរកកម្មវិធី"}
                        <div className="events-search-input-wrap">
                            <Search size={16} className="events-search-icon" aria-hidden="true" />
                            <input
                                ref={searchInputRef}
                                type="search"
                                placeholder={en ? "Filter by name or venue…" : "ស្វែងរកតាមឈ្មោះ ឬទីតាំង…"}
                                value={search}
                                onChange={e => updateFilter("q", e.target.value)}
                            />
                            {search && (
                                <button
                                    type="button"
                                    className="events-search-clear-btn"
                                    onClick={() => { updateFilter("q", ""); searchInputRef.current?.focus(); }}
                                    aria-label={en ? "Clear search query" : "លុបពាក្យស្វែងរក"}
                                >
                                    <X size={15} aria-hidden="true" />
                                </button>
                            )}
                        </div>
                    </label>

                    <label>
                        {en ? "Status" : "ស្ថានភាព"}
                        <select value={status} onChange={e => updateFilter("status", e.target.value)}>
                            <option value="">{en ? "All statuses" : "គ្រប់ស្ថានភាព"}</option>
                            <option value="DRAFT">{en ? "Draft" : "ព្រាង"}</option>
                            <option value="PUBLISHED">{en ? "Published" : "បានផ្សាយ"}</option>
                            <option value="UNPUBLISHED">{en ? "Unpublished" : "ផ្អាកផ្សាយ"}</option>
                        </select>
                    </label>

                    <label>
                        {en ? "Event type" : "ប្រភេទកម្មវិធី"}
                        <select
                            aria-label={en ? "Event type" : "ប្រភេទកម្មវិធី"}
                            value={eventType}
                            onChange={e => updateFilter("type", e.target.value)}
                        >
                            <option value="">{en ? "All event types" : "គ្រប់ប្រភេទកម្មវិធី"}</option>
                            {eventTypes.map(type => (
                                <option key={type} value={type}>
                                    {EVENT_TYPES.find(item => item[0] === type)?.[en ? 2 : 1] || type}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label>
                        {en ? "Sort" : "តម្រៀប"}
                        <select value={sort} onChange={e => updateFilter("sort", e.target.value)}>
                            <option value="newest">{en ? "Newest" : "ថ្មីបំផុត"}</option>
                            <option value="date">{en ? "Event date" : "កាលបរិច្ឆេទ"}</option>
                            <option value="title">{en ? "Title" : "ឈ្មោះ"}</option>
                        </select>
                    </label>

                    {hasActiveFilters && (
                        <div className="events-filter-reset-wrap">
                            <button
                                type="button"
                                className="events-filter-reset-btn"
                                onClick={resetAllFilters}
                                title={en ? "Reset all filters" : "សម្អាតការចម្រោះ"}
                            >
                                <FilterX size={15} aria-hidden="true" />
                                <span>{en ? "Clear filters" : "សម្អាតការចម្រោះ"}</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {hasActiveFilters && <div className="events-applied-filters" aria-label={en ? 'Applied filters' : 'ការចម្រោះដែលបានជ្រើសរើស'}>
                {[["q",search],["status",status],["type",eventType],["period",period !== 'all' ? period : '']].filter(([,value])=>value).map(([key,value]) =>
                    <button type="button" key={key} onClick={() => { updateFilter(key,''); searchInputRef.current?.focus(); }} aria-label={`${en ? 'Remove filter' : 'លុបការចម្រោះ'}: ${value}`}>
                        <span>{value}</span><X size={14} aria-hidden="true" />
                    </button>)}
            </div>}

            {/* Results Count Summary */}
            {!loading && drafts.length > 0 && (
                <div className="events-results-summary" ref={resultsRef} tabIndex={-1} aria-live="polite">
                    <span>
                        {en
                            ? `${filtered.length ? (view === 'calendar' ? 1 : currentPage * 12 + 1) : 0}–${view === "calendar" ? filtered.length : Math.min((currentPage + 1) * 12, filtered.length)} of ${filtered.length} matching events (${drafts.length} loaded)`
                            : `បង្ហាញ ${filtered.length} នៃ ${drafts.length} កម្មវិធី`}
                    </span>
                </div>
            )}

            {loading && drafts.length === 0 && <CardGridSkeleton variant="event" />}
            {loading && drafts.length > 0 && (
                <p role="status" className="workspace-muted">
                    {en ? "Loading your events…" : "កំពុងទាញយកកម្មវិធី…"}
                </p>
            )}

            {!loading && drafts.length === 0 ? (
                <div className="events-empty-state">
                    <div className="events-empty-icon">
                        <CalendarHeart size={36} strokeWidth={1.75} aria-hidden="true" />
                    </div>
                    <div className="events-empty-title">
                        {t("emptyTitle") || (en ? "No Events Yet" : "មិនទាន់មានកម្មវិធីនៅឡើយទេ")}
                    </div>
                    <div className="events-empty-desc">
                        {t("emptySubtitle") || (en ? "Create your first digital invitation event to get started." : "ចាប់ផ្ដើមដោយបង្កើតកម្មវិធី និងសំបុត្រអញ្ជើញឌីជីថលដំបូងរបស់អ្នក។")}
                    </div>
                    <Link to="/app/events/new" state={{ from: "/dashboard/events" }} className="events-empty-action">
                        + {emptyActionText}
                    </Link>
                </div>
            ) : view === "calendar" ? (
                <EventCalendar
                    events={filtered}
                    onManage={handleDashboard}
                    onPreview={handlePreview}
                    onEdit={handleEdit}
                />
            ) : filtered.length === 1 ? (
                <div className="events-featured-container">
                    <EventCard
                        key={visible[0].id}
                        draft={visible[0]}
                        onManage={handleDashboard}
                        onEdit={handleEdit}
                        onDelete={handleDeleteClick}
                        onReviewAccess={handleEdit}
                        onPreview={handlePreview}
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
                            onReviewAccess={handleEdit}
                            onPreview={handlePreview}
                            t={t}
                            featured={false}
                        />
                    ))}
                </div>
            )}

            {!loading && drafts.length > 0 && filtered.length === 0 && (
                <div className="workspace-notice events-no-match-notice">
                    <p>{en ? "No events match your search or filter." : "គ្មានកម្មវិធីត្រូវនឹងការស្វែងរក ឬចម្រោះនេះទេ។"}</p>
                    <button
                        type="button"
                        className="workspace-button"
                        onClick={resetAllFilters}
                        style={{ marginTop: "12px" }}
                    >
                        {en ? "Clear filters" : "សម្អាតការចម្រោះ"}
                    </button>
                </div>
            )}

            {view !== "calendar" && filtered.length > 12 && (
                <nav className="events-pagination" aria-label={en ? "Event pages" : "ទំព័រកម្មវិធី"}>
                    <button
                        type="button"
                        disabled={currentPage === 0}
                        onClick={() => setPage(currentPage - 1)}
                        className="workspace-button"
                    >
                        {en ? "Previous" : "មុន"}
                    </button>
                    <div className="events-pagination-pages">
                        {pageItems(currentPage, maxPage + 1).map(item => typeof item === 'number'
                            ? <button type="button" key={item} className="workspace-button" aria-label={`${en ? 'Page' : 'ទំព័រ'} ${item+1}`} aria-current={item===currentPage ? 'page' : undefined} onClick={()=>setPage(item)}>{item+1}</button>
                            : <span key={item} aria-hidden="true">…</span>)}
                    </div>
                    <button
                        type="button"
                        disabled={(currentPage + 1) * 12 >= filtered.length}
                        onClick={() => setPage(currentPage + 1)}
                        className="workspace-button"
                    >
                        {en ? "Next" : "បន្ទាប់"}
                    </button>
                </nav>
            )}

            {/* Mobile Floating Action Button (FAB) */}
            <Link
                to="/app/events/new"
                state={{ from: "/dashboard/events" }}
                className="events-mobile-fab"
                aria-label={en ? "Create new event" : "បង្កើតកម្មវិធីថ្មី"}
            >
                <Plus size={24} aria-hidden="true" />
            </Link>

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
