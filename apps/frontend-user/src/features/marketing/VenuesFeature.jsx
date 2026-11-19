import { useUiCopy } from "@/shared/i18n/useUiCopy";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { Search, MapPin, Users, Banknote, X } from "lucide-react";
import { EmptyState } from "@/shared/ui/vendor";
import { usePrefersReducedMotion } from "../../shared/hooks/usePrefersReducedMotion";

// Import Background ដូច Homepage
import heroBg from "../../assets/icons/background.png";
import { useBackendMessages } from "../../shared/i18n/useBackendMessages";
import "./VenuesFeature.css";

const getVenues = (t) => [
  {
    id: 1,
    name: t("venue1Name") || "សាលមហោស្រព កោះពេជ្រ",
    location: t("phnomPenh") || "ភ្នំពេញ",
    capacity: t("venue1Capacity") || "៥០០ - ២០០០ នាក់",
    priceRange: "$$$",
    image:
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1000&auto=format&fit=crop",
    tags: [t("tagPopular") || "ពេញនិយម", t("tagBigHall") || "សាលធំ"],
  },
  {
    id: 2,
    name: t("venue2Name") || "The Premier Centre Sen Sok",
    location: t("phnomPenh") || "ភ្នំពេញ",
    capacity: t("venue2Capacity") || "៣០០ - ១៥០០ នាក់",
    priceRange: "$$$",
    image:
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1000&auto=format&fit=crop",
    tags: [t("tagModern") || "ទំនើប", t("tagGoodService") || "សេវាកម្មល្អ"],
  },
  {
    id: 3,
    name: t("venue3Name") || "សណ្ឋាគារ រ៉េស៊ីដង់ សុខា",
    location: t("siemReap") || "សៀមរាប",
    capacity: t("venue3Capacity") || "២០០ - ៨០០ នាក់",
    priceRange: "$$$$",
    image:
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=1000&auto=format&fit=crop",
    tags: [t("tagLuxuryEng") || "Luxury", t("tagLuxury") || "ប្រណីត"],
  },
  {
    id: 4,
    name: t("venue4Name") || "Classy Hotel & Spa",
    location: t("battambang") || "បាត់ដំបង",
    capacity: t("venue4Capacity") || "១៥០ - ៥០០ នាក់",
    priceRange: "$$",
    image:
      "https://images.unsplash.com/photo-1543157145-f78c636d023d?q=80&w=1000&auto=format&fit=crop",
    tags: [t("battambang") || "បាត់ដំបង", t("tagAffordable") || "តម្លៃសមរម្យ"],
  },
];

const VenuesPage = () => {
  const uiCopy = useUiCopy();
  const { text: t, lang } = useBackendMessages("venues");
  const venues = useMemo(() => getVenues(t), [t]);
  const [searchTerm, setSearchTerm] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const reduced = usePrefersReducedMotion();
  const selectedVenue = id ? venues.find(venue => String(venue.id) === id) || null : null;
  const dialogRef = useRef(null);
  const triggerRef = useRef(null);
  const searchRef = useRef(null);
  const [failedImages, setFailedImages] = useState({});
  const media = (venue, detail = false) => <>
    <img src={venue.image} alt="" className={detail ? "venue-modal-img" : "venue-img"}
      loading={detail ? "eager" : "lazy"} decoding="async" hidden={failedImages[venue.id]}
      onError={() => setFailedImages(current => ({ ...current, [venue.id]: true }))} />
    {failedImages[venue.id] && <span className="venue-photo-fallback">{uiCopy("មិនមានរូបភាព", "Photo unavailable")}</span>}
    <span className="venue-photo-caption">{uiCopy("រូបភាពសម្រាប់បង្ហាញប៉ុណ្ណោះ", "Illustrative photo · not a verified venue photograph")}</span>
  </>;

  const handleOpenVenue = (venue, event) => {
    triggerRef.current = event.currentTarget;
    navigate(`/venues/${venue.id}`, { state: { venueDirectory: true } });
  };

  const handleCloseVenue = useCallback(() => {
    if (location.state?.venueDirectory) navigate(-1);
    else navigate("/venues", { replace: true });
  }, [navigate, location.state]);

  useEffect(() => {
    if (!selectedVenue) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const dialog = dialogRef.current;
    const search = searchRef.current;
    dialog.showModal();
    const focusable = () => [...dialog.querySelectorAll('button:not([disabled]),a[href],input,select,textarea,[tabindex="0"]')];
    focusable()[0]?.focus();
    const handleKeys = (event) => {
      if (event.key === "Escape") { event.preventDefault(); handleCloseVenue(); }
      if (event.key !== "Tab") return;
      const items = focusable(), first = items[0], last = items.at(-1);
      if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
        event.preventDefault(); last?.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
        event.preventDefault(); first?.focus();
      }
    };
    document.addEventListener("keydown", handleKeys);
    return () => {
      document.removeEventListener("keydown", handleKeys);
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (triggerRef.current?.isConnected) triggerRef.current.focus();
      else search?.focus({ preventScroll: true });
    };
  }, [selectedVenue, handleCloseVenue]);

  const filteredVenues = venues.filter(
    (v) =>
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.location.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="venues-page-wrapper" lang={lang}>
      {/* Background Section ដូច Homepage */}
      <div className="fixed-bg-overlay">
        <div
          className="bg-image"
          style={{ backgroundImage: `url(${heroBg})` }}
        ></div>
        <div className="bg-gradient-cover"></div>
      </div>

      <section className="venues-content" aria-label={lang === "en" ? "Venues" : "ទីតាំង"}>
        <div className="container">
          <div>
            <div className="header-content">
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="sub-title"
              >
                {t("subtitle") || "FIND YOUR PERFECT VENUE"}
              </motion.span>
              <h1 className="main-title">
                {t("titleFind") || "ស្វែងរក"}<span className="gold-text">{t("titleVenues") || "ទីកន្លែងមង្គល"}</span>
              </h1>
              <div className="divider-modern">
                <span></span>
                <div className="diamond"></div>
                <span></span>
              </div>
              <p className="venue-directory-note">{uiCopy("បញ្ជីទីតាំងសម្រាប់ជាឯកសារយោង។ សូមបញ្ជាក់ព័ត៌មាន និងការកក់ដោយផ្ទាល់ជាមួយទីតាំង។", "An editorial starting point. Confirm capacity, prices and availability directly with each venue. Koupreng does not book venues.")}</p>
              {id && !venues.some(venue => String(venue.id) === id) && <div className="venue-missing" role="status">
                <h2>{uiCopy("រកមិនឃើញទីតាំង", "Venue not found")}</h2>
                <Link to="/venues" replace className="view-detail-btn">{uiCopy("មើលទីតាំង", "Browse venues")}</Link>
              </div>}

              {/* Modern Search Bar */}
              <div className="search-box-wrapper">
                <div className="search-box">
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchTerm}
                    aria-label={t("searchPlaceholder")}
                    placeholder={t("searchPlaceholder") || "ស្វែងរកតាមឈ្មោះ ឬទីតាំង..."}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button type="button" className="btn-search" onClick={() => searchRef.current?.focus()}>{t("searchBtn") || "ស្វែងរក"}</button>
                </div>
              </div>
            </div>
          </div>

          {filteredVenues.length === 0 ? (
            <EmptyState
              icon={Search}
              headline={t("noVenuesFound") || (lang === "en" ? "No venues found" : "រកមិនឃើញទីតាំងមង្គលទេ")}
              description={lang === "en" ? "Try searching for another city, province or venue name." : "សូមសាកល្បងស្វែងរកឈ្មោះខេត្ត ក្រុង ឬឈ្មោះសាលផ្សេងទៀត។"}
              primaryAction={
                searchTerm ? (
                  <button
                    type="button"
                    className="kp-button"
                    onClick={() => { setSearchTerm(""); searchRef.current?.focus(); }}
                  >
                    {lang === "en" ? "Clear search" : "សម្អាតការស្វែងរក"}
                  </button>
                ) : undefined
              }
            />
          ) : (
            <div className="venues-grid">
            {filteredVenues.map((venue) => (
              <div key={venue.id}>
                <motion.div whileHover={reduced ? undefined : { y: -4 }} className="venue-card">
                  <div className="venue-image-container">
                    {media(venue)}
                    <div className="venue-tags">
                      {venue.tags.map((tag) => (
                        <span key={tag} className="venue-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="venue-img-overlay"></div>
                  </div>

                  <div className="venue-info">
                    <h2 className="venue-name">{venue.name}</h2>
                    <div className="venue-meta">
                      <p>
                        <MapPin size={16} aria-hidden="true" /> {venue.location}
                      </p>
                      <p>
                        <Users size={16} aria-hidden="true" /> {t("capacity") || "ចំណុះ:"} {venue.capacity}
                      </p>
                      <p>
                        <Banknote size={16} aria-hidden="true" /> {t("priceRangeText") || "កម្រិតតម្លៃ:"}{" "}
                        <span className="venue-gold-text">
                          {venue.priceRange}
                        </span>
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-haspopup="dialog"
                      onClick={(event) => handleOpenVenue(venue, event)}
                      className="view-detail-btn"
                      style={{ width: "100%", cursor: "pointer" }}
                    >
                      {t("viewDetail") || "មើលព័ត៌មានលម្អិត"}
                    </button>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
          )}
        </div>

        {/* Venue Detail Modal */}
        {typeof document !== "undefined" &&
          createPortal(
              selectedVenue && (
                <dialog ref={dialogRef} className="venue-modal-backdrop" aria-modal="true" aria-labelledby="public-venue-title" lang={lang}
                  onCancel={event => { event.preventDefault(); handleCloseVenue(); }}
                  onClick={event => { if (event.target === event.currentTarget) handleCloseVenue(); }}>
              <motion.div
                initial={reduced ? false : { opacity: 0, scale: 0.98, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 20 }}
                transition={{ duration: 0.22 }}
                className="venue-modal-card"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  className="venue-modal-close"
                  onClick={handleCloseVenue}
                  aria-label={uiCopy("បិទព័ត៌មានទីតាំង", "Close venue details")}
                >
                  <X size={18} aria-hidden="true" />
                </button>
                <div className="venue-modal-image-wrapper">
                  {media(selectedVenue, true)}
                  <div className="venue-modal-tags">
                    {selectedVenue.tags.map((tag) => (
                      <span key={tag} className="venue-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="venue-modal-body">
                  <span className="venue-modal-kicker">{uiCopy("ព័ត៌មានទីតាំងលម្អិត", "VENUE DETAILS")}</span>
                  <h2 id="public-venue-title" className="venue-modal-title">{selectedVenue.name}</h2>
                  <div className="venue-modal-meta-grid">
                    <div className="venue-modal-meta-item">
                      <MapPin size={22} aria-hidden="true" />
                      <div>
                        <small>{uiCopy("ទីតាំង", "Location")}</small>
                        <strong>{selectedVenue.location}</strong>
                      </div>
                    </div>
                    <div className="venue-modal-meta-item">
                      <Users size={22} aria-hidden="true" />
                      <div>
                        <small>{uiCopy("ចំណុះ", "Capacity")}</small>
                        <strong>{selectedVenue.capacity}</strong>
                      </div>
                    </div>
                    <div className="venue-modal-meta-item">
                      <Banknote size={22} aria-hidden="true" />
                      <div>
                        <small>{uiCopy("តម្លៃ", "Price range")}</small>
                        <strong className="venue-gold-text">{selectedVenue.priceRange}</strong>
                      </div>
                    </div>
                  </div>
                  <div className="venue-modal-actions">
                    <Link to="/contact" className="venue-modal-contact-btn">
                      {uiCopy("ទំនាក់ទំនង", "Contact Koupreng")}
                    </Link>
                    <button type="button" className="venue-modal-secondary-btn" onClick={handleCloseVenue}>
                      {uiCopy("បិទ", "Close")}
                    </button>
                  </div>
                </div>
              </motion.div>
            </dialog>
          ),
        document.body
      )}
      </section>
    </div>
  );
};

export default VenuesPage;
