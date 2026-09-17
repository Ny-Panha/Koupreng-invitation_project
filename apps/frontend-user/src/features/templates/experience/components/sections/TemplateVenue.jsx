import { useState, useMemo } from "react";
import { IoLogoFacebook, IoLocationSharp, IoMapOutline, IoNavigate, IoRestaurantOutline } from "react-icons/io5";

import TemplateReveal from "../shared/TemplateReveal";
import TemplateImage from "../shared/TemplateImage";
import TemplateSectionHeader from "../shared/TemplateSectionHeader";
import { templateIcons } from "../../config/templateIcons";
import { SeatingFloorPlanModal } from "@/features/seating/components/SeatingFloorPlanModal";

/**
 * TemplateVenue — venue panel with name, address, decorative image.
 * Direction button appears only when a usable map link exists; otherwise a
 * clear disabled-state line is shown.
 */
export default function TemplateVenue({ content }) {
    const { venue } = content;
    const [showFloorPlan, setShowFloorPlan] = useState(false);
    const hasMap = Boolean(venue.mapLink);
    const hasFacebook = Boolean(content.contact?.facebook);

    const venueTables = useMemo(() => {
        if (content.seatingTables && content.seatingTables.length > 0) {
            return content.seatingTables;
        }
        // Fallback realistic banquet tables for wedding preview
        const names = ["តុ ១", "តុ ២", "តុ ៣", "តុ ៤", "តុ ៥", "តុ ៦", "តុ VIP ១", "តុ VIP ២"];
        if (content.guestTable && !names.includes(content.guestTable)) {
            names.push(content.guestTable);
        }
        return names.map((name, i) => ({
            id: `tbl-${i + 1}`,
            tableName: name,
            tableLabel: name.includes("VIP") ? "មេបា / VIP" : `ជួរទី ${Math.floor(i / 2) + 1}`,
            capacity: 10,
            assignedSeats: 8,
        }));
    }, [content.seatingTables, content.guestTable]);

    return (
        <section className="tx-section tx-venue" data-tx-section="venue" aria-labelledby="tx-venue-title">
            <div className="tx-shell">
                <TemplateSectionHeader
                    id="tx-venue-title"
                    icon={templateIcons.venue}
                    kicker="ផែនទី និងទីតាំង"
                    title="ទីតាំងប្រារព្ធពិធី"
                    subtitle="LOCATION & DIRECTIONS"
                />

                <div className="tx-venue__grid">
                    <TemplateReveal className="tx-venue__media">
                        {venue.mapEmbedUrl ? (
                            <iframe
                                src={venue.mapEmbedUrl}
                                title={`ផែនទី ${venue.name || "ទីតាំងពិធី"}`}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            />
                        ) : (
                            <TemplateImage src={venue.image} alt={venue.name || "ទីតាំងពិធី"} />
                        )}
                        <span className="tx-venue__media-frame" aria-hidden="true" />
                    </TemplateReveal>

                    <TemplateReveal className="tx-venue__body" delay={0.08}>
                        <span className="tx-venue__pin" aria-hidden="true">
                            <IoMapOutline />
                        </span>
                        <h3 className="tx-section__title tx-venue__name">
                            {venue.name || "ទីតាំងពិធីមង្គលការ"}
                        </h3>

                        {venue.address && (
                            <p className="tx-venue__address">
                                <IoLocationSharp aria-hidden="true" />
                                <span>{venue.address}</span>
                            </p>
                        )}

                        {content.guestTable && (
                            <div style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "10px",
                                flexWrap: "wrap",
                                margin: "6px 0 16px"
                            }}>
                                <div style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    padding: "8px 14px",
                                    borderRadius: "10px",
                                    background: "rgba(185, 139, 66, 0.12)",
                                    border: "1px solid rgba(185, 139, 66, 0.28)",
                                    color: "#b98b42",
                                    fontSize: "0.875rem",
                                    fontWeight: 700,
                                }}>
                                    <IoRestaurantOutline style={{ fontSize: "1.1rem" }} />
                                    <span>កន្លែងអង្គុយ៖ {content.guestTable} {content.guestSeat ? `(កៅអី ${content.guestSeat})` : ""}</span>
                                </div>

                                <button
                                    type="button"
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "6px",
                                        padding: "8px 14px",
                                        borderRadius: "10px",
                                        background: "#ffffff",
                                        border: "1px solid rgba(185, 139, 66, 0.4)",
                                        color: "#b98b42",
                                        fontSize: "0.85rem",
                                        fontWeight: 700,
                                        cursor: "pointer",
                                    }}
                                    onClick={() => setShowFloorPlan(true)}
                                >
                                    <IoMapOutline />
                                    <span>🗺️ មើលទីតាំងតុក្នុងសាល</span>
                                </button>
                            </div>
                        )}

                        <div className="tx-venue__actions">
                            {hasMap ? (
                                <a
                                    className="tx-btn tx-btn--solid tx-venue__cta"
                                    href={venue.mapLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <IoNavigate aria-hidden="true" />
                                    បើកផែនទី <span>/ Open Map</span>
                                </a>
                            ) : (
                                <p className="tx-venue__no-map">ព័ត៌មានទីតាំងលម្អិតនឹងបញ្ជាក់បន្ថែម</p>
                            )}
                            {(content.sketchMapImage || venue.sketchMapImage) && (
                                <a
                                    className="tx-btn tx-btn--ghost"
                                    href={content.sketchMapImage || venue.sketchMapImage}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <IoMapOutline aria-hidden="true" />
                                    ប្លង់បង្ហាញផ្លូវ <span>/ Sketch Map</span>
                                </a>
                            )}
                            {hasFacebook && (
                                <a
                                    className="tx-btn tx-btn--ghost tx-venue__facebook"
                                    href={content.contact.facebook}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <IoLogoFacebook aria-hidden="true" />
                                    Facebook
                                </a>
                            )}
                        </div>
                    </TemplateReveal>
                </div>
                <span className="tx-venue__divider" aria-hidden="true" />
            </div>

            {/* Guest Seating Floor Plan Modal */}
            <SeatingFloorPlanModal
                isOpen={showFloorPlan}
                onClose={() => setShowFloorPlan(false)}
                tables={venueTables}
                guestTable={content.guestTable}
                guestSeat={content.guestSeat}
                venueName={venue.name || "ទីតាំងពិធីមង្គលការ"}
                invitationId={content.id || content.invitationId}
            />
        </section>
    );
}
