import "./InvitationPages.css";
import { EVENT_TYPE_LABELS, formatDate, formatTime } from "./invitationUtils";

function displayNames(invitation) {
    if (invitation.groomName || invitation.brideName) {
        return [invitation.groomName, invitation.brideName].filter(Boolean).join(" & ");
    }
    if (invitation.hostName || invitation.partnerName) {
        return [invitation.hostName, invitation.partnerName].filter(Boolean).join(" & ");
    }
    return invitation.title;
}

export default function InvitationDisplay({ invitation, media, preview = false, children }) {
    const mapHref = invitation.googleMapUrl || "";
    const dateText = formatDate(invitation.eventDate);
    const timeText = formatTime(invitation.eventTime);
    const coverUrl = media?.coverImage?.fileUrl
        || invitation?.coverUrl
        || invitation?.media?.coverImage?.fileUrl
        || invitation?.templateThumbnailUrl
        || invitation?.template?.thumbnailUrl
        || "";
    const galleryImages = media?.galleryImages || [];

    return (
        <main className="pub-invitation">
            <section className="pub-hero">
                <img className="pub-hero-image" src={coverUrl} alt="" />
                <div className="pub-hero-copy">
                    {preview && <span className="pub-preview-pill">Preview</span>}
                    <p className="pub-kicker">{EVENT_TYPE_LABELS[invitation.eventType] || "Invitation"}</p>
                    <h1>{invitation.title}</h1>
                    <h2>{displayNames(invitation)}</h2>
                    <p>{dateText}{timeText ? ` at ${timeText}` : ""}</p>
                </div>
            </section>

            <section className="pub-section pub-intro">
                <p className="pub-kicker">You are invited</p>
                <h2>{displayNames(invitation)}</h2>
                <p>
                    {invitation.storyText
                        || "We would be honored to have you join us for this special celebration."}
                </p>
            </section>

            <section className="pub-section pub-details-grid">
                <article>
                    <span>Date</span>
                    <strong>{dateText}</strong>
                    {timeText && <p>{timeText}</p>}
                </article>
                <article>
                    <span>Venue</span>
                    <strong>{invitation.venueName || "Venue to be announced"}</strong>
                    <p>{invitation.venueAddress || "Address to be announced"}</p>
                    {mapHref && (
                        <a href={mapHref} target="_blank" rel="noreferrer">
                            Open Google Map
                        </a>
                    )}
                </article>
                <article>
                    <span>RSVP deadline</span>
                    <strong>{invitation.rsvpDeadline ? formatDate(invitation.rsvpDeadline) : "No deadline set"}</strong>
                </article>
            </section>

            {(galleryImages.length > 0 || media?.video || media?.backgroundMusic) && (
                <section className="pub-section pub-media-section">
                    {galleryImages.length > 0 && (
                        <div className="pub-gallery">
                            {galleryImages.map((item) => (
                                <img key={item.id} src={item.fileUrl} alt={item.originalFilename || "Invitation gallery"} />
                            ))}
                        </div>
                    )}
                    {media?.video && (
                        <video className="pub-video" src={media.video.fileUrl} controls />
                    )}
                    {media?.backgroundMusic && (
                        <div className="pub-audio">
                            <span>Background music</span>
                            <audio src={media.backgroundMusic.fileUrl} controls />
                        </div>
                    )}
                </section>
            )}

            {children && (
                <section className="pub-section pub-rsvp-section">
                    {children}
                </section>
            )}
        </main>
    );
}
