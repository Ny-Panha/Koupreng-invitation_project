import { useState, useEffect } from "react";
import { ScrollReveal } from "../../shared/ui/ScrollReveal";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useParams, useNavigate } from "react-router-dom";

// Import Background ដូច Homepage
import heroBg from "../../assets/icons/background.png";
import { useBackendMessages } from "../../shared/i18n/useBackendMessages";

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
  const { text: t } = useBackendMessages("venues");
  const venues = getVenues(t);
  const [searchTerm, setSearchTerm] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedVenue, setSelectedVenue] = useState(null);

  useEffect(() => {
    if (id) {
      const found = venues.find((v) => String(v.id) === String(id));
      if (found) {
        setSelectedVenue(found);
      }
    }
  }, [id, venues]);

  const handleOpenVenue = (venue) => {
    setSelectedVenue(venue);
    navigate(`/venues/${venue.id}`, { replace: true });
  };

  const handleCloseVenue = () => {
    setSelectedVenue(null);
    navigate("/venues", { replace: true });
  };

  const filteredVenues = venues.filter(
    (v) =>
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.location.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="venues-page-wrapper">
      {/* Background Section ដូច Homepage */}
      <div className="fixed-bg-overlay">
        <div
          className="bg-image"
          style={{ backgroundImage: `url(${heroBg})` }}
        ></div>
        <div className="bg-gradient-cover"></div>
      </div>

      <main className="venues-content">
        <div className="container">
          <ScrollReveal>
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

              {/* Modern Search Bar */}
              <div className="search-box-wrapper">
                <div className="search-box">
                  <input
                    type="text"
                    placeholder={t("searchPlaceholder") || "ស្វែងរកតាមឈ្មោះ ឬទីតាំង..."}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button className="btn-search">{t("searchBtn") || "ស្វែងរក"}</button>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <div className="venues-grid">
            {filteredVenues.map((venue, i) => (
              <ScrollReveal key={venue.id} delay={i * 0.1}>
                <motion.div whileHover={{ y: -10 }} className="venue-card">
                  <div className="venue-image-container">
                    <img
                      src={venue.image}
                      alt={venue.name}
                      className="venue-img"
                    />
                    <div className="venue-tags">
                      {venue.tags.map((tag) => (
                        <span key={tag} className="tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="img-overlay"></div>
                  </div>

                  <div className="venue-info">
                    <h3 className="venue-name">{venue.name}</h3>
                    <div className="venue-meta">
                      <p>
                        <span className="icon">📍</span> {venue.location}
                      </p>
                      <p>
                        <span className="icon">👥</span> {t("capacity") || "ចំណុះ:"} {venue.capacity}
                      </p>
                      <p>
                        <span className="icon">💰</span> {t("priceRangeText") || "កម្រិតតម្លៃ:"}{" "}
                        <span className="gold-text-bold">
                          {venue.priceRange}
                        </span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleOpenVenue(venue)}
                      className="view-detail-btn"
                      style={{ width: "100%", cursor: "pointer" }}
                    >
                      {t("viewDetail") || "មើលព័ត៌មានលម្អិត"}
                    </button>
                  </div>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* Venue Detail Modal */}
        <AnimatePresence>
          {selectedVenue && (
            <div className="venue-modal-backdrop" onClick={handleCloseVenue}>
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 20 }}
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
                  aria-label="Close"
                >
                  ✕
                </button>
                <div className="venue-modal-image-wrapper">
                  <img
                    src={selectedVenue.image}
                    alt={selectedVenue.name}
                    className="venue-modal-img"
                  />
                  <div className="venue-modal-tags">
                    {selectedVenue.tags.map((tag) => (
                      <span key={tag} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="venue-modal-body">
                  <span className="venue-modal-kicker">VENUE DETAIL • ព័ត៌មានលម្អិត</span>
                  <h2 className="venue-modal-title">{selectedVenue.name}</h2>
                  <div className="venue-modal-meta-grid">
                    <div className="venue-modal-meta-item">
                      <span className="meta-icon">📍</span>
                      <div>
                        <small>ទីតាំង / Location</small>
                        <strong>{selectedVenue.location}</strong>
                      </div>
                    </div>
                    <div className="venue-modal-meta-item">
                      <span className="meta-icon">👥</span>
                      <div>
                        <small>ចំណុះ / Capacity</small>
                        <strong>{selectedVenue.capacity}</strong>
                      </div>
                    </div>
                    <div className="venue-modal-meta-item">
                      <span className="meta-icon">💰</span>
                      <div>
                        <small>តម្លៃ / Price Range</small>
                        <strong className="gold-text-bold">{selectedVenue.priceRange}</strong>
                      </div>
                    </div>
                  </div>
                  <div className="venue-modal-actions">
                    <Link to="/contact" className="venue-modal-contact-btn" onClick={handleCloseVenue}>
                      ទំនាក់ទំនងសាកសួរ / Inquire Venue
                    </Link>
                    <button type="button" className="venue-modal-secondary-btn" onClick={handleCloseVenue}>
                      បិទ / Close
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>

      <style>{`
        .venues-page-wrapper {
          min-height: 100vh;
          background-color: #fffcf7;
          font-family: 'Kantumruy Pro', sans-serif;
          position: relative;
        }

        /* Fixed Background Style ដូច Homepage */
        .fixed-bg-overlay {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
        }
        .bg-image {
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
        }
        .bg-gradient-cover {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(252, 248, 242, 0.4) 0%, rgba(252, 248, 242, 1) 1000%);
        }

        .venues-content {
          position: relative;
          z-index: 10;
          padding: 160px 20px 100px;
        }

        .container {
          max-width: 1300px;
          margin: 0 auto;
        }
        
        .header-content { text-align: center; margin-bottom: 80px; }
        
        .sub-title { 
          font-size: 11px; 
          font-weight: 800; 
          color: #B0926A; 
          letter-spacing: 4px; 
          display: block;
          margin-bottom: 10px;
        }

        .main-title { 
          font-family: 'Moul', serif; 
          font-size: clamp(28px, 5vw, 45px); 
          color: #222; 
          line-height: 1.6;
        }

        .gold-text { color: #B0926A; margin-left: 15px; }

        .divider-modern { 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          gap: 20px; 
          margin: 25px 0; 
        }
        .divider-modern span { width: 80px; height: 1px; background: linear-gradient(to right, transparent, #B0926A, transparent); }
        .diamond { width: 10px; height: 10px; background: #B0926A; transform: rotate(45deg); box-shadow: 0 0 10px rgba(176,146,106,0.5); }

        /* Search Box ឱ្យស៊ីជាមួយ Modern Theme */
        .search-box-wrapper { display: flex; justify-content: center; margin-top: 40px; }
        .search-box { 
          width: 100%;
          max-width: 550px; 
          display: flex; 
          gap: 5px; 
          background: white; 
          padding: 6px; 
          border-radius: 20px; 
          box-shadow: 0 15px 35px rgba(176,146,106,0.1); 
          border: 1px solid white;
        }
        .search-box input { 
          flex: 1; border: none; padding: 12px 20px; outline: none; 
          font-family: 'Kantumruy Pro'; font-size: 14px; background: transparent; color: #444;
        }
        .btn-search { 
          background: #1a1a1a; color: white; border: none; padding: 10px 35px; 
          border-radius: 15px; font-weight: 700; cursor: pointer; transition: 0.3s;
        }
        .btn-search:hover { background: #B0926A; transform: scale(1.02); }

        /* Venue Grid Style */
        .venues-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); 
          gap: 40px; 
        }
        
        .venue-card { 
          background: rgba(255, 255, 255, 0.9); 
          backdrop-filter: blur(10px);
          border-radius: 35px; 
          overflow: hidden; 
          border: 1px solid white;
          box-shadow: 0 10px 30px rgba(0,0,0,0.03);
          transition: 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .venue-image-container { 
          height: 260px; 
          position: relative; 
          overflow: hidden; 
        }
        .venue-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: 1s;
        }
        .venue-card:hover .venue-img { transform: scale(1.1); }

        .img-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.2), transparent);
        }

        .venue-tags { position: absolute; top: 20px; left: 20px; display: flex; gap: 8px; z-index: 5; }
        .tag { 
          background: white; 
          color: #B0926A; 
          padding: 6px 15px; 
          border-radius: 50px; 
          font-size: 10px; 
          font-weight: 800; 
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          text-transform: uppercase;
        }

        .venue-info { padding: 30px; text-align: center; }
        .venue-name { 
          font-family: 'Moul'; 
          font-size: 18px; 
          color: #222; 
          margin-bottom: 20px; 
          line-height: 1.6; 
        }
        
        .venue-meta { margin-bottom: 25px; }
        .venue-meta p { 
          font-size: 14px; 
          color: #666; 
          margin-bottom: 10px; 
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .gold-text-bold { color: #B0926A; font-weight: 800; }
        
        .view-detail-btn { 
          display: block; 
          padding: 15px; 
          background: #f8f8f8;
          color: #333; 
          text-decoration: none; 
          border-radius: 18px; 
          font-size: 13px; 
          font-weight: 800; 
          transition: 0.3s;
          border: 1px solid #eee;
        }
        .view-detail-btn:hover { 
          background: #1a1a1a; 
          color: white; 
          border-color: #1a1a1a;
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }

        @media (max-width: 768px) {
          .venues-grid { grid-template-columns: 1fr; }
          .venues-content { padding-top: 120px; }
          .main-title { font-size: 24px; }
        }

        /* Venue Modal Styles */
        .venue-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 4000;
          background: rgba(15, 12, 9, 0.7);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .venue-modal-card {
          position: relative;
          background: #fff;
          border-radius: 28px;
          max-width: 580px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 25px 60px rgba(0,0,0,0.3);
          border: 1px solid rgba(176, 146, 106, 0.3);
        }
        .venue-modal-close {
          position: absolute;
          top: 16px;
          right: 16px;
          z-index: 10;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.55);
          color: #fff;
          border: none;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: 0.2s;
        }
        .venue-modal-close:hover {
          background: rgba(0, 0, 0, 0.85);
          transform: scale(1.08);
        }
        .venue-modal-image-wrapper {
          position: relative;
          height: 260px;
          width: 100%;
          overflow: hidden;
          border-radius: 28px 28px 0 0;
        }
        .venue-modal-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .venue-modal-tags {
          position: absolute;
          bottom: 14px;
          left: 18px;
          display: flex;
          gap: 8px;
        }
        .venue-modal-body {
          padding: 28px;
        }
        .venue-modal-kicker {
          font-size: 11px;
          font-weight: 800;
          color: #B0926A;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .venue-modal-title {
          font-family: 'Moul', serif;
          font-size: 20px;
          color: #1a1a1a;
          margin: 8px 0 20px;
          line-height: 1.5;
        }
        .venue-modal-meta-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          background: #faf7f2;
          padding: 16px;
          border-radius: 18px;
          margin-bottom: 24px;
          border: 1px solid rgba(176, 146, 106, 0.15);
        }
        .venue-modal-meta-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .venue-modal-meta-item .meta-icon {
          font-size: 22px;
        }
        .venue-modal-meta-item small {
          display: block;
          font-size: 11px;
          color: #888;
        }
        .venue-modal-meta-item strong {
          font-size: 14px;
          color: #222;
        }
        .venue-modal-actions {
          display: flex;
          gap: 12px;
        }
        .venue-modal-contact-btn {
          flex: 1;
          text-align: center;
          padding: 14px 20px;
          background: linear-gradient(135deg, #B0926A 0%, #7D6443 100%);
          color: #fff;
          text-decoration: none;
          border-radius: 16px;
          font-weight: 700;
          font-size: 14px;
          box-shadow: 0 4px 15px rgba(176, 146, 106, 0.3);
          transition: 0.2s;
        }
        .venue-modal-contact-btn:hover {
          opacity: 0.92;
          transform: translateY(-1px);
        }
        .venue-modal-secondary-btn {
          padding: 14px 20px;
          background: #f1ede6;
          color: #555;
          border: none;
          border-radius: 16px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: 0.2s;
        }
        .venue-modal-secondary-btn:hover {
          background: #e5dfd5;
        }
      `}</style>
    </div>
  );
};

export default VenuesPage;
