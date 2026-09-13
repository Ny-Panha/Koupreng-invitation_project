import { cloneElement, isValidElement, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
    IoCalendarOutline,
    IoCallOutline,
    IoCameraOutline,
    IoCheckmarkOutline,
    IoChevronDownOutline,
    IoCopyOutline,
    IoGiftOutline,
    IoHeartOutline,
    IoLocationOutline,
    IoLogoFacebook,
    IoMailOutline,
    IoMusicalNotes,
    IoPaperPlaneOutline,
    IoPause,
    IoTimeOutline,
} from "react-icons/io5";
import { formatTime24toKhmer } from "@/shared/ui/TimePicker";

const ASSET_ROOT = "/invitations/canva-khmer";
const NAV_ITEMS = [
    { id: "program", label: "កម្មវិធី", icon: IoCalendarOutline, section: "schedule" },
    { id: "location", label: "ទីតាំង", icon: IoLocationOutline, section: "map" },
    { id: "gallery", label: "រូបភាព", icon: IoCameraOutline, section: "gallery" },
    { id: "gift", label: "ចំណងដៃ", icon: IoGiftOutline, section: "gift" },
    { id: "wish", label: "ជូនពរ", icon: IoHeartOutline, section: "wish" },
];

function cleanText(value) {
    return typeof value === "string" ? value.trim() : "";
}

function meaningful(value) {
    const text = cleanText(value);
    return text && !text.includes("...");
}

function mediaSource(value) {
    return typeof value === "string" ? value : value?.url || value?.preview || value?.src || value?.fileUrl || "";
}

function normalizeImageItem(value, index = 0) {
    const src = mediaSource(value);
    if (!src) return null;
    return {
        ...((value && typeof value === "object") ? value : {}),
        id: value?.id || `image-${index}`,
        src,
    };
}

function scheduleTime(item) {
    return item?.time || item?.startTime || item?.timeText || "";
}

function scheduleTitle(item) {
    return item?.title || item?.name || item?.label || "";
}

function giftAccountField(account, ...fields) {
    return fields.map((field) => cleanText(account?.[field])).find(Boolean) || "";
}

function CanvaKhmerImage({ src, alt, className = "", loading = "lazy", ...props }) {
    const [failed, setFailed] = useState(!src);

    useEffect(() => {
        setFailed(!src);
    }, [src]);

    if (failed) {
        return (
            <span className={`ck-image-fallback${className ? ` ${className}` : ""}`} role="img" aria-label={alt}>
                <span>រូបភាពអនុស្សាវរីយ៍</span>
            </span>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            className={className}
            loading={loading}
            onError={() => setFailed(true)}
            {...props}
        />
    );
}

function CanvaArtwork({ name, eager = false, className = "" }) {
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        setFailed(false);
    }, [name]);

    if (failed) {
        return (
            <span
                className={`ck-artwork ck-artwork-fallback ck-artwork-fallback--${name}${className ? ` ${className}` : ""}`}
                aria-hidden="true"
            />
        );
    }

    return (
        <img
            className={`ck-artwork${className ? ` ${className}` : ""}`}
            src={`${ASSET_ROOT}/sections/${name}.webp`}
            alt=""
            loading={eager ? "eager" : "lazy"}
            decoding={eager ? "sync" : "async"}
            fetchPriority={eager ? "high" : "auto"}
            aria-hidden="true"
            onError={() => setFailed(true)}
        />
    );
}

function SectionTitle({ english, children }) {
    return (
        <header className="ck-section-title">
            <small>{english}</small>
            <h2>{children}</h2>
        </header>
    );
}

function useCountdown(targetDate) {
    const target = useMemo(() => {
        const date = targetDate ? new Date(targetDate) : null;
        return date && !Number.isNaN(date.getTime()) ? date : null;
    }, [targetDate]);
    const [remaining, setRemaining] = useState(null);

    useEffect(() => {
        if (!target) {
            setRemaining(null);
            return undefined;
        }
        const update = () => {
            const distance = Math.max(0, target.getTime() - Date.now());
            setRemaining({
                days: Math.floor(distance / 86400000),
                hours: Math.floor((distance / 3600000) % 24),
                minutes: Math.floor((distance / 60000) % 60),
                seconds: Math.floor((distance / 1000) % 60),
            });
        };
        update();
        const timer = window.setInterval(update, 1000);
        return () => window.clearInterval(timer);
    }, [target]);

    return remaining;
}

function CanvaKhmerMusicButton({ src, audioRef }) {
    const [playing, setPlaying] = useState(false);
    const source = mediaSource(src);

    useEffect(() => {
        const audio = audioRef.current;
        return () => audio?.pause();
    }, [audioRef, source]);

    if (!source) return null;

    const toggle = async () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (!audio.paused) {
            audio.pause();
            setPlaying(false);
            return;
        }
        audio.volume = 0.45;
        try {
            await audio.play();
            setPlaying(true);
        } catch {
            setPlaying(false);
        }
    };

    return (
        <>
            <audio ref={audioRef} src={source} loop preload="none" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />
            <button
                type="button"
                className={`ck-music${playing ? " is-playing" : ""}`}
                onClick={toggle}
                aria-pressed={playing}
                aria-label={playing ? "បិទតន្ត្រី" : "បើកតន្ត្រី"}
            >
                {playing ? <IoPause aria-hidden="true" /> : <IoMusicalNotes aria-hidden="true" />}
                <span aria-hidden="true" />
            </button>
        </>
    );
}

function CanvaKhmerOpeningCover({ content, onOpen }) {
    const openingVideo = mediaSource(content.openingVideo);
    const [coverFailed, setCoverFailed] = useState(false);

    return (
        <motion.section
            className="ck-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.01 }}
            transition={{ duration: 0.5 }}
            aria-label="បើកសំបុត្រអញ្ចើញ"
        >
            {coverFailed ? (
                <span className="ck-cover__fallback" aria-hidden="true" />
            ) : (
                <img
                    className="ck-cover__art"
                    src={`${ASSET_ROOT}/CoverKhmer.svg`}
                    alt=""
                    fetchPriority="high"
                    onError={() => setCoverFailed(true)}
                />
            )}
            {openingVideo && (
                <video
                    className="ck-cover__video"
                    src={openingVideo}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    aria-label="វីដេអូបើកសំបុត្រអញ្ចើញ"
                />
            )}
            <div className="ck-cover__monogram" aria-label={`អក្សរកាត់ ${content.monogramText}`}>{content.monogramText}</div>
            <div className="ck-cover__title">
                <small>THE WEDDING INVITATION</small>
                <h1>{content.title || content.eventTitle || "សិរីមង្គលអាពាហ៍ពិពាហ៍"}</h1>
            </div>
            {!content.hideCoupleNameOnCover && (
                <p className="ck-cover__names">
                    <strong>{content.groom}</strong>
                    <span>❦</span>
                    <strong>{content.bride}</strong>
                </p>
            )}
            <button type="button" className="ck-cover__open" onClick={onOpen}>
                ចុចទីនេះដើម្បីមើលព័ត៌មានលម្អិត
                <IoChevronDownOutline aria-hidden="true" />
            </button>
            {content.dateText && (
                <time className="ck-cover__date">
                    {content.dateText}
                    {content.eventTime ? ` • ${formatTime24toKhmer(content.eventTime) || content.eventTime}` : ""}
                </time>
            )}
        </motion.section>
    );
}

function CanvaKhmerGardenHero({ content, sectionRef, onDetails }) {
    const nicknames = [content.groomNickname, content.brideNickname].filter(Boolean).join(" · ");
    const portrait = mediaSource(content.coverImage || content.portraitImage);
    return (
        <section id="ck-hero" className="ck-slice ck-hero" ref={sectionRef} data-ck-section="hero">
            <CanvaArtwork name="hero" eager />
            {portrait && (
                <div className="ck-hero__portrait">
                    <CanvaKhmerImage src={portrait} alt={`${content.groom} និង ${content.bride}`} loading="eager" />
                </div>
            )}
            <div className="ck-hero__copy">
                <p>THE WEDDING INVITATION</p>
                <div className="ck-hero__monogram">{content.monogramText}</div>
                <h1>{content.title || content.eventTitle || "សិរីមង្គលអាពាហ៍ពិពាហ៍"}</h1>
                {!content.hideCoupleNameOnCover && (
                    <div className="ck-hero__names"><strong>{content.groom}</strong><span>❦</span><strong>{content.bride}</strong></div>
                )}
                {nicknames && <small>{nicknames}</small>}
                {content.dateText && (
                    <time>
                        {content.dateText}
                        {content.eventTime ? ` • ${formatTime24toKhmer(content.eventTime) || content.eventTime}` : ""}
                    </time>
                )}
                {content.venue?.name && <b>{content.venue.name}</b>}
                <button type="button" onClick={onDetails}>{content.subtitle || "សូមគោរពអញ្ជើញ"}</button>
            </div>
        </section>
    );
}

function CanvaKhmerCountdown({ targetDate }) {
    const remaining = useCountdown(targetDate);
    if (!remaining) return null;
    const units = [
        [remaining.days, "ថ្ងៃ"],
        [remaining.hours, "ម៉ោង"],
        [remaining.minutes, "នាទី"],
        [remaining.seconds, "វិនាទី"],
    ];
    return (
        <div className="ck-countdown" aria-label="រាប់ថយក្រោយ">
            {units.map(([value, label]) => <div key={label}><strong>{String(value).padStart(2, "0")}</strong><small>{label}</small></div>)}
        </div>
    );
}

function CanvaKhmerDressCode({ content }) {
    const dress = content.dressCode;
    const colors = dress?.colors || content.dressColors || [
        { hex: "#FFFDF7", name: "ivory" },
        { hex: "#C99A3D", name: "មាស" },
        { hex: "#E9D0A2", name: "champagne" },
        { hex: "#4B2F1A", name: "ត្នោត" },
    ];
    if (!colors.length) return null;

    return (
        <div className="ck-dress-code" style={{ marginTop: "1.5rem", textAlign: "center" }}>
            <h4 style={{ fontSize: "0.85rem", color: "#854d0e", fontWeight: "700", marginBottom: "0.5rem" }}>
                {dress?.name || "ពណ៌សម្លៀកបំពាក់ (Dress Code)"}
            </h4>
            <div style={{ display: "flex", justifyContent: "center", gap: "0.75rem", flexWrap: "wrap", margin: "0.5rem 0" }}>
                {colors.map((c, idx) => (
                    <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                        <span
                            style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%",
                                backgroundColor: c.hex,
                                border: "2px solid #fff",
                                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                            }}
                        />
                        <span style={{ fontSize: "0.75rem", color: "#78350f", fontWeight: "600" }}>{c.name}</span>
                    </div>
                ))}
            </div>
            {dress?.description && (
                <p style={{ fontSize: "0.75rem", color: "#854d0e", marginTop: "0.5rem" }}>{dress.description}</p>
            )}
        </div>
    );
}

function CanvaKhmerInvitationDetails({ content, sectionRef, showCountdown, showDressCode }) {
    const parents = [
        ["មាតាបិតាកូនកំលោះ", content.couple?.groomParents],
        ["មាតាបិតាកូនក្រមុំ", content.couple?.brideParents],
    ].filter(([, value]) => meaningful(value));

    return (
        <section id="ck-details" className="ck-slice ck-details" ref={sectionRef} data-ck-section="details">
            <CanvaArtwork name="details" />
            <div className="ck-details__paper">
                <SectionTitle english="TOGETHER WITH OUR FAMILIES">{content.subtitle || "សូមគោរពអញ្ជើញ"}</SectionTitle>
                {parents.length > 0 && (
                    <div className="ck-details__parents">
                        {parents.map(([label, value]) => <p key={label}><small>{label}</small><strong>{value}</strong></p>)}
                    </div>
                )}
                <p className="ck-details__message">{content.message}</p>
                <div className="ck-details__names"><strong>{content.groom}</strong><span>❦</span><strong>{content.bride}</strong></div>
                <div className="ck-details__meta">
                    {content.dateText && <p><IoCalendarOutline />{content.dateText}</p>}
                    {content.ceremonyTime && <p><IoTimeOutline />ពិធីមង្គលការ {content.ceremonyTime}</p>}
                    {content.receptionTime && <p><IoTimeOutline />ពិធីជប់លៀង {content.receptionTime}</p>}
                    {content.venue?.name && <p><IoLocationOutline />{content.venue.name}</p>}
                </div>
                {showCountdown && <CanvaKhmerCountdown targetDate={content.targetDate} />}
                {showDressCode && <CanvaKhmerDressCode content={content} />}
            </div>
        </section>
    );
}

function CanvaKhmerProgram({ content }) {
    const items = useMemo(() => {
        if (content.schedule?.length) return content.schedule.slice(0, 7);
        return [
            content.ceremonyTime && { id: "ceremony", time: content.ceremonyTime, title: "ពិធីមង្គលការ" },
            content.receptionTime && { id: "reception", time: content.receptionTime, title: "ពិធីជប់លៀង" },
        ].filter(Boolean);
    }, [content.ceremonyTime, content.receptionTime, content.schedule]);

    if (!items.length) return null;
    return (
        <section id="ck-program" className="ck-slice ck-program" data-ck-section="program">
            <CanvaArtwork name="program" />
            <div className="ck-program__paper">
                <SectionTitle english="WEDDING PROGRAM">កម្មវិធីមង្គលការ</SectionTitle>
                {content.dateText && <time className="ck-program__date">{content.dateText}</time>}
                <div className="ck-program__list">
                    {items.map((item, index) => (
                        <article key={item.id || `${scheduleTime(item)}-${index}`}>
                            <div className="ck-program__icon"><IoTimeOutline /></div>
                            <div>
                                {scheduleTime(item) && <time>{scheduleTime(item)}</time>}
                                {scheduleTitle(item) && <h3>{scheduleTitle(item)}</h3>}
                                {item.description && <p>{item.description}</p>}
                                {item.location && <small>{item.location}</small>}
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}

function CanvaKhmerStory({ content }) {
    const chapters = content.story || [];
    const storyText = cleanText(content.message);
    if (!chapters.length && !storyText) return null;
    return (
        <div className="ck-story__paper">
            <SectionTitle english="OUR STORY">រឿងរ៉ាវរបស់យើង</SectionTitle>
            <div className="ck-story__chapters">
                {chapters.length ? chapters.map((chapter, index) => (
                    <article key={chapter.id || index}>
                        {chapter.kicker && <small>{chapter.kicker}</small>}
                        {chapter.title && <h3>{chapter.title}</h3>}
                        {chapter.date && <time>{chapter.date}</time>}
                        {chapter.text && <p>{chapter.text}</p>}
                    </article>
                )) : <p>{storyText}</p>}
            </div>
        </div>
    );
}

function CanvaKhmerLocation({ content, showLocation, showStory }) {
    const venue = content.venue || {};
    const hasLocation = showLocation && Boolean(venue.name || venue.address || venue.mapLink || venue.mapEmbedUrl);
    const hasStory = showStory && Boolean(content.story?.length || cleanText(content.message));
    const [mapState, setMapState] = useState(venue.mapEmbedUrl ? "loading" : "fallback");

    useEffect(() => {
        setMapState(venue.mapEmbedUrl ? "loading" : "fallback");
    }, [venue.mapEmbedUrl]);

    if (!hasLocation && !hasStory) return null;
    return (
        <section id={hasLocation ? "ck-location" : undefined} className={`ck-slice ck-location${hasStory ? "" : " ck-location--compact"}`} data-ck-section="location">
            <CanvaArtwork name="location" />
            {hasLocation && (
                <div className="ck-location__card">
                    <SectionTitle english="LOCATION">ទីតាំងកម្មវិធី</SectionTitle>
                    <div className="ck-location__map">
                        {venue.mapEmbedUrl && mapState !== "fallback" ? (
                            <iframe
                                src={venue.mapEmbedUrl}
                                title={`ផែនទី ${venue.name || "ទីតាំងកម្មវិធី"}`}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                onLoad={() => setMapState("ready")}
                                onError={() => setMapState("fallback")}
                            />
                        ) : (
                            <div className="ck-location__fallback"><IoLocationOutline aria-hidden="true" /><span>មើលទីតាំងនៅលើ Google Maps</span></div>
                        )}
                        {mapState === "loading" && <span className="ck-location__loading">កំពុងផ្ទុកផែនទី...</span>}
                    </div>
                    <div className="ck-location__info">
                        {venue.name && <h3>{venue.name}</h3>}
                        {venue.address && <p>{venue.address}</p>}
                        {venue.mapLink && <a href={venue.mapLink} target="_blank" rel="noopener noreferrer"><IoLocationOutline /> បើក Google Maps</a>}
                    </div>
                </div>
            )}
            {hasStory && <CanvaKhmerStory content={content} />}
        </section>
    );
}

const GALLERY_FRAMES = [
    { left: 4.5, top: 18.0, width: 91, height: 11.2 },
    { left: 3.5, top: 29.6, width: 44.3, height: 19.8 },
    { left: 50.4, top: 29.6, width: 44.3, height: 19.8 },
    { left: 3.5, top: 49.8, width: 44.3, height: 8.9 },
    { left: 50.4, top: 49.8, width: 44.3, height: 8.9 },
    { left: 3.5, top: 58.9, width: 44.3, height: 17.6 },
    { left: 50.4, top: 58.9, width: 44.3, height: 17.6 },
    { left: 3.5, top: 77.0, width: 44.3, height: 17.1 },
    { left: 50.4, top: 77.0, width: 44.3, height: 17.1 },
];

function CanvaKhmerGallery({ content }) {
    const images = (content.gallery?.length ? content.gallery : (content.coverImage ? [content.coverImage] : []))
        .map(normalizeImageItem)
        .filter(Boolean);
    const visibleImages = images.slice(0, GALLERY_FRAMES.length);
    const placeholderFrames = !visibleImages.length ? GALLERY_FRAMES.slice(0, 5) : [];
    const [active, setActive] = useState(null);
    useEffect(() => {
        if (active === null) return undefined;
        const close = (event) => event.key === "Escape" && setActive(null);
        document.addEventListener("keydown", close);
        return () => document.removeEventListener("keydown", close);
    }, [active]);

    return (
        <section id="ck-gallery" className="ck-slice ck-gallery" data-ck-section="gallery">
            <div className="ck-gallery__art" aria-hidden="true">
                <CanvaArtwork name="story" />
                <CanvaArtwork name="gallery" />
            </div>
            {visibleImages.map((image, index) => {
                const frame = GALLERY_FRAMES[index];
                return (
                    <button
                        type="button"
                        className="ck-gallery__photo"
                        style={{ left: `${frame.left}%`, top: `${frame.top}%`, width: `${frame.width}%`, height: `${frame.height}%` }}
                        key={`${image.src}-${index}`}
                        onClick={() => setActive(index)}
                        aria-label={`មើលរូបភាពទី ${index + 1}`}
                    >
                        <CanvaKhmerImage src={image.src} alt={`រូបភាពអនុស្សាវរីយ៍ទី ${index + 1}`} />
                        {index === GALLERY_FRAMES.length - 1 && images.length > GALLERY_FRAMES.length && <span>+{images.length - GALLERY_FRAMES.length}</span>}
                    </button>
                );
            })}
            {!visibleImages.length && (
                <>
                    {placeholderFrames.map((frame, index) => (
                        <div
                            className="ck-gallery__photo ck-gallery__placeholder"
                            style={{ left: `${frame.left}%`, top: `${frame.top}%`, width: `${frame.width}%`, height: `${frame.height}%` }}
                            key={`gallery-placeholder-${index}`}
                            aria-hidden="true"
                        >
                            <span className="ck-gallery__placeholder-inner">
                                <IoCameraOutline aria-hidden="true" />
                                <small>រូបភាពអនុស្សាវរីយ៍</small>
                            </span>
                        </div>
                    ))}
                    <div className="ck-gallery__empty">
                        <IoCameraOutline aria-hidden="true" />
                        <p>បន្ថែមរូបភាពក្នុង Builder ដើម្បីបង្ហាញជាស៊ុមអនុស្សាវរីយ៍លើសន្លឹកអញ្ជើញនេះ</p>
                    </div>
                </>
            )}
            {active !== null && images[active] && (
                <div className="ck-lightbox" role="dialog" aria-modal="true" onClick={() => setActive(null)}>
                    <button type="button" onClick={() => setActive(null)} aria-label="បិទ">×</button>
                    <div onClick={(event) => event.stopPropagation()}><CanvaKhmerImage src={images[active].src} alt="រូបភាពអនុស្សាវរីយ៍" /></div>
                </div>
            )}
        </section>
    );
}

function CanvaKhmerGift({ content }) {
    const accounts = content.gift || [];
    const [selected, setSelected] = useState(0);
    const [copied, setCopied] = useState(false);
    const account = accounts[selected] || accounts[0];
    const accountName = giftAccountField(account, "account", "accountName", "name");
    const accountNumber = giftAccountField(account, "number", "accountNumber", "phone");
    const qrImage = mediaSource(account?.qrImage || account?.qr || account?.qrUrl);

    useEffect(() => {
        if (selected >= accounts.length) setSelected(0);
    }, [accounts.length, selected]);

    if (!account) return null;

    const copyNumber = async () => {
        if (!accountNumber) return;
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(accountNumber);
            } else {
                const input = document.createElement("textarea");
                input.value = accountNumber;
                input.style.position = "fixed";
                input.style.opacity = "0";
                document.body.appendChild(input);
                input.select();
                document.execCommand("copy");
                input.remove();
            }
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
        } catch {
            setCopied(false);
        }
    };

    return (
        <section id="ck-gift" className="ck-slice ck-gift" data-ck-section="gift">
            <CanvaArtwork name="gift" />
            <div className="ck-gift__card">
                <SectionTitle english="A GIFT FROM THE HEART">ចំណងដៃ</SectionTitle>
                <p className="ck-gift__note">{account.note || "វត្តមាន និងពរជ័យរបស់លោកអ្នក គឺជាអំណោយដ៏មានតម្លៃបំផុត"}</p>
                <h3>{account.bank || "ធនាគារ"}</h3>
                {accountName && <p>{accountName}</p>}
                {accountNumber && <strong>{accountNumber}</strong>}
                <div className="ck-gift__qr">{qrImage ? <CanvaKhmerImage src={qrImage} alt={`QR ${account.bank || "ធនាគារ"}`} /> : <IoGiftOutline />}</div>
                {accountNumber && <button type="button" onClick={copyNumber}>{copied ? <IoCheckmarkOutline /> : <IoCopyOutline />}{copied ? "បានចម្លង" : "ចម្លងលេខគណនី"}</button>}
                {accounts.length > 1 && (
                    <div className="ck-gift__tabs">
                        {accounts.map((item, index) => <button type="button" className={selected === index ? "is-active" : ""} key={item.id || index} onClick={() => setSelected(index)}>{item.bank || index + 1}</button>)}
                    </div>
                )}
            </div>
        </section>
    );
}

function CanvaKhmerDemoRsvp({ useTemplateLink }) {
    return (
        <form className="ck-demo-rsvp" onSubmit={(event) => event.preventDefault()} aria-label="គំរូ RSVP សម្រាប់សន្លឹកការ">
            <div className="ck-demo-rsvp__grid">
                <label>
                    ឈ្មោះភ្ញៀវ
                    <input type="text" placeholder="បញ្ចូលឈ្មោះរបស់អ្នក" />
                </label>
                <label>
                    លេខទូរស័ព្ទ
                    <input type="tel" placeholder="012 345 678" />
                </label>
                <label>
                    ការចូលរួម
                    <select defaultValue="ATTENDING">
                        <option value="ATTENDING">ចូលរួម</option>
                        <option value="NOT_ATTENDING">មិនអាចចូលរួម</option>
                        <option value="MAYBE">ប្រហែលជាចូលរួម</option>
                    </select>
                </label>
                <label>
                    ចំនួនភ្ញៀវ
                    <input type="number" min="0" defaultValue="1" />
                </label>
            </div>
            <label>
                សារជូនពរ
                <textarea rows={3} placeholder="សូមសរសេរពាក្យជូនពរ..." />
            </label>
            {useTemplateLink ? (
                <Link to={useTemplateLink} className="ck-demo-rsvp__submit">
                    <IoHeartOutline aria-hidden="true" />
                    បើក RSVP ពិតប្រាកដ
                </Link>
            ) : (
                <button type="submit" className="ck-demo-rsvp__submit">
                    <IoHeartOutline aria-hidden="true" />
                    ផ្ញើការឆ្លើយតប
                </button>
            )}
        </form>
    );
}

function CanvaKhmerFaq({ items = [] }) {
    const defaultFaq = [
        { id: "f1", q: "តើមានចំណតរថយន្តដែរឬទេ?", a: "បាទ/ចាស មានចំណតរថយន្តធំទូលាយដោយឥតគិតថ្លៃសម្រាប់ភ្ញៀវកិត្តិយសទាំងអស់។" },
        { id: "f2", q: "តើអាចនាំកុមារតូចៗមកបានទេ?", a: "យើងខ្ញុំស្វាគមន៍វត្តមានកុមារតូចៗទាំងអស់ក្នុងពិធីមង្គលការ។" },
        { id: "f3", q: "តើកម្មវិធីចាប់ផ្ដើម និងបញ្ចប់នៅម៉ោងប៉ុន្មាន?", a: "កម្មវិធីទទួលភ្ញៀវចាប់ផ្ដើមពីម៉ោង ០៥:០០ ល្ងាច តទៅ។" },
    ];
    const sourceItems = items && items.length > 0 ? items : defaultFaq;
    const visibleItems = sourceItems
        .map((item, index) => ({
            id: item?.id || `faq-${index}`,
            question: cleanText(item?.q || item?.question || item?.title),
            answer: cleanText(item?.a || item?.answer || item?.description),
        }))
        .filter((item) => item.question && item.answer);

    if (!visibleItems.length) return null;

    return (
        <div className="ck-faq">
            <h3>សំណួរញឹកញាប់ (FAQ)</h3>
            {visibleItems.map((item) => (
                <details key={item.id}>
                    <summary>{item.question}</summary>
                    <p>{item.answer}</p>
                </details>
            ))}
        </div>
    );
}

function CanvaKhmerWishRsvp({ content, children, useTemplateLink, showRsvp, showFaq }) {
    const rsvpContent = children
        ? (isValidElement(children) ? cloneElement(children, { khmerLabels: true }) : children)
        : <CanvaKhmerDemoRsvp useTemplateLink={useTemplateLink} />;

    return (
        <section id="ck-wish" className="ck-slice ck-wish" data-ck-section="wish">
            <CanvaArtwork name="rsvp" />
            <div className="ck-wish__panel">
                <SectionTitle english="WISHES & RSVP">ជូនពរ</SectionTitle>
                {content.wish?.message && <blockquote><p>{content.wish.message}</p><cite>{content.groom} ❦ {content.bride}</cite></blockquote>}
                {showRsvp && (
                    <div className="ck-rsvp">
                        {content.rsvpDeadline && <p className="ck-rsvp__deadline">សូមឆ្លើយតបមុនថ្ងៃទី {content.rsvpDeadline}</p>}
                        {rsvpContent}
                    </div>
                )}
                {showFaq && <CanvaKhmerFaq items={content.faq} />}
            </div>
        </section>
    );
}

function CanvaKhmerFooter({ content }) {
    const contact = content.contact || {};
    return (
        <footer className="ck-slice ck-footer">
            <CanvaArtwork name="footer" />
            <div>
                <small>WITH LOVE AND GRATITUDE</small>
                <h2>សូមអរគុណ</h2>
                <p>{content.groom} <span>❦</span> {content.bride}</p>
                {content.dateText && <time>{content.dateText}</time>}
                <nav aria-label="ទំនាក់ទំនង">
                    {contact.telegram && <a href={contact.telegram} target="_blank" rel="noopener noreferrer" aria-label="Telegram"><IoPaperPlaneOutline /></a>}
                    {contact.phone && <a href={`tel:${contact.phone.replace(/\s+/g, "")}`} aria-label={contact.phone}><IoCallOutline /></a>}
                    {contact.email && <a href={`mailto:${contact.email}`} aria-label={contact.email}><IoMailOutline /></a>}
                    {contact.facebook && <a href={contact.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook"><IoLogoFacebook /></a>}
                </nav>
            </div>
        </footer>
    );
}

function CanvaKhmerBottomNav({ enabledSections, availableSections, onNavigate }) {
    const items = NAV_ITEMS.filter((item) => enabledSections?.[item.section] !== false && availableSections[item.id] !== false);
    if (!items.length) return null;
    return (
        <nav className="ck-bottom-nav" aria-label="រុករកសន្លឹកអញ្ជើញ" style={{ "--ck-nav-count": items.length }}>
            {items.map(({ id, label, icon: Icon }) => <button type="button" key={id} onClick={() => onNavigate(id)}><Icon /><span>{label}</span></button>)}
        </nav>
    );
}

export default function CanvaKhmerWeddingTemplate({
    content,
    useTemplateLink,
    backLink = "/templates",
    backLabel = "ត្រឡប់ទៅគំរូទាំងអស់",
    primaryCtaLabel = "ប្រើគំរូនេះ",
    preview = false,
    showActions = true,
    showStickyCta = true,
    children,
}) {
    const [opened, setOpened] = useState(() => Boolean(preview));
    const canvasRef = useRef(null);
    const musicRef = useRef(null);
    const heroRef = useRef(null);
    const detailRef = useRef(null);
    const sectionEnabled = useCallback((key) => content.enabledSections?.[key] !== false, [content.enabledSections]);
    const navigateTo = useCallback((id) => canvasRef.current?.querySelector(`#ck-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), []);
    const handleOpen = useCallback(() => {
        setOpened(true);
        const audio = musicRef.current;
        if (audio && content.music) {
            audio.volume = 0.45;
            audio.play().catch(() => undefined);
        }
    }, [content.music]);

    useEffect(() => {
        if (preview) setOpened(true);
    }, [preview]);

    useEffect(() => {
        if (!opened || preview) return undefined;
        const frame = window.requestAnimationFrame(() => heroRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
        return () => window.cancelAnimationFrame(frame);
    }, [opened, preview]);

    const availableSections = {
        program: Boolean(content.schedule?.length || content.ceremonyTime || content.receptionTime),
        location: Boolean(content.venue?.name || content.venue?.address || content.venue?.mapLink || content.venue?.mapEmbedUrl),
        gallery: sectionEnabled("gallery"),
        gift: Boolean(content.gift?.length),
        wish: sectionEnabled("wish") || sectionEnabled("rsvp"),
    };
    const navEnabledSections = {
        ...content.enabledSections,
        wish: sectionEnabled("wish") || sectionEnabled("rsvp"),
    };

    return (
        <div className={`ck-page${preview ? " ck-page--preview" : ""}`}>
            <div className="ck-phone" ref={canvasRef}>
                <AnimatePresence mode="wait">
                    {!opened ? (
                        <CanvaKhmerOpeningCover key="cover" content={content} onOpen={handleOpen} />
                    ) : (
                        <motion.main key="invitation" className="ck-invitation" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <CanvaKhmerGardenHero content={content} sectionRef={heroRef} onDetails={() => detailRef.current?.scrollIntoView({ behavior: "smooth" })} />
                            <CanvaKhmerInvitationDetails
                                content={content}
                                sectionRef={detailRef}
                                showCountdown={sectionEnabled("countdown")}
                                showDressCode={sectionEnabled("dressCode")}
                            />
                            {sectionEnabled("schedule") && <CanvaKhmerProgram content={content} />}
                            {(sectionEnabled("map") || sectionEnabled("story")) && (
                                <CanvaKhmerLocation content={content} showLocation={sectionEnabled("map")} showStory={sectionEnabled("story")} />
                            )}
                            {sectionEnabled("gallery") && <CanvaKhmerGallery content={content} />}
                            {sectionEnabled("gift") && <CanvaKhmerGift content={content} />}
                            {(sectionEnabled("wish") || sectionEnabled("rsvp") || sectionEnabled("faq")) && (
                                <CanvaKhmerWishRsvp
                                    content={content}
                                    useTemplateLink={useTemplateLink}
                                    showRsvp={sectionEnabled("rsvp")}
                                    showFaq={sectionEnabled("faq")}
                                >
                                    {children}
                                </CanvaKhmerWishRsvp>
                            )}
                            <CanvaKhmerFooter content={content} />
                            {!preview && showActions && useTemplateLink && <div className="ck-actions"><Link to={useTemplateLink}>{primaryCtaLabel}</Link><Link to={backLink}>{backLabel}</Link></div>}
                        </motion.main>
                    )}
                </AnimatePresence>
                <CanvaKhmerMusicButton src={content.music} audioRef={musicRef} />
                {opened && showStickyCta && <CanvaKhmerBottomNav enabledSections={navEnabledSections} availableSections={availableSections} onNavigate={navigateTo} />}
            </div>
        </div>
    );
}
