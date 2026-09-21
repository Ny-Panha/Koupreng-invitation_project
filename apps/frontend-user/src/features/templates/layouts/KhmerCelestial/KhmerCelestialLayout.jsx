import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowLeft,
  CalendarDays,
  Clock3,
  ExternalLink,
  MapPin,
  Music2,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";

import { usePrefersReducedMotion } from "@/shared/hooks/usePrefersReducedMotion";
import TemplateGift from "../../experience/components/sections/TemplateGift";
import TemplateRsvp from "../../experience/components/sections/TemplateRsvp";
import CelestialGallery from "./components/CelestialGallery";
import CelestialOpening from "./components/CelestialOpening";
import {
  CelestialHeading,
  CelestialImage,
  CelestialReveal,
} from "./components/CelestialSection";
import { KHMER_CELESTIAL_ASSETS } from "./khmerCelestialAssets";
import "./khmer-celestial.css";

function useCountdown(targetDate) {
  const [now, setNow] = useState(() => Date.now());
  const target = useMemo(() => {
    const parsed = new Date(targetDate || "").getTime();
    return Number.isNaN(parsed) ? null : parsed;
  }, [targetDate]);

  useEffect(() => {
    if (!target) return undefined;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [target]);

  if (!target) return { valid: false, expired: false, values: ["00", "00", "00", "00"] };
  const remaining = Math.max(0, target - now);
  const values = [
    Math.floor(remaining / 86_400_000),
    Math.floor((remaining % 86_400_000) / 3_600_000),
    Math.floor((remaining % 3_600_000) / 60_000),
    Math.floor((remaining % 60_000) / 1000),
  ].map((value) => String(value).padStart(2, "0"));
  return { valid: true, expired: remaining === 0, values };
}

function buildCalendarUrl(content) {
  const start = new Date(content.targetDate || "");
  if (Number.isNaN(start.getTime())) return "";
  const end = new Date(start.getTime() + 4 * 60 * 60 * 1000);
  const calendarDate = (date) => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: content.eventTitle || `${content.groom} & ${content.bride} Wedding`,
    dates: `${calendarDate(start)}/${calendarDate(end)}`,
    details: content.message || "Wedding invitation",
    location: [content.venue?.name, content.venue?.address].filter(Boolean).join(", "),
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function formatMusicSource(value) {
  if (typeof value === "string") return value;
  return value?.url || "";
}

function firstImage(item) {
  return typeof item === "string" ? item : item?.src || item?.image || item?.url || "";
}

const COUNTDOWN_LABELS = [
  ["ថ្ងៃ", "DAYS"],
  ["ម៉ោង", "HOURS"],
  ["នាទី", "MINUTES"],
  ["វិនាទី", "SECONDS"],
];

export default function KhmerCelestialLayout({
  content,
  showBack = true,
  backTo = "/templates",
  backLabel = "ត្រឡប់ទៅគំរូទាំងអស់",
  preview = false,
  useTemplateLink,
  primaryCtaLabel = "ប្រើគំរូនេះ",
  showActions = true,
  isHostedInvitation = false,
  children,
}) {
  const reducedMotion = usePrefersReducedMotion();
  const [opened, setOpened] = useState(preview);
  const [musicState, setMusicState] = useState("idle");
  const mainRef = useRef(null);
  const heroRef = useRef(null);
  const audioRef = useRef(null);
  const musicUrl = formatMusicSource(content.music)
    || (isHostedInvitation ? "" : KHMER_CELESTIAL_ASSETS.defaultMusic);
  const languageMode = content.languageMode || "both";
  const countdown = useCountdown(content.targetDate);
  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroParallaxY = useTransform(heroScrollProgress, [0, 1], ["0%", "12%"]);
  const calendarUrl = useMemo(() => buildCalendarUrl(content), [content]);
  const sectionEnabled = useCallback(
    (key) => content.enabledSections?.[key] !== false,
    [content.enabledSections]
  );
  const musicEnabled = Boolean(musicUrl) && sectionEnabled("music");
  const hasCoupleNames = Boolean(content.groom || content.bride);
  const heroAlt = hasCoupleNames
    ? `រូបភាពអាពាហ៍ពិពាហ៍ ${[content.groom, content.bride].filter(Boolean).join(" និង ")}`
    : (content.title || "រូបភាពអាពាហ៍ពិពាហ៍");

  useEffect(() => {
    if (preview || opened) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [opened, preview]);

  useEffect(() => {
    const onMessage = (event) => {
      if (event.data?.type === "TOGGLE_GATE") {
        setOpened(Boolean(event.data.open ?? event.data.isOpen));
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    if (!opened) return;
    window.requestAnimationFrame(() => mainRef.current?.focus({ preventScroll: true }));
  }, [opened]);

  const startMusic = useCallback(async () => {
    if (!musicEnabled || !audioRef.current) return;
    try {
      await audioRef.current.play();
      setMusicState("playing");
    } catch {
      setMusicState("error");
    }
  }, [musicEnabled]);

  const handleOpen = useCallback(() => {
    setOpened(true);
    void startMusic();
  }, [startMusic]);

  const toggleMusic = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.paused) {
      audio.pause();
      setMusicState("paused");
      return;
    }
    await startMusic();
  }, [startMusic]);

  const replay = useCallback(() => {
    setOpened(false);
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  }, [reducedMotion]);

  const scrollToInvitation = useCallback(() => {
    document.querySelector("[data-kc-section='invitation']")?.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "start",
    });
  }, [reducedMotion]);

  const story = Array.isArray(content.story) ? content.story : [];
  const schedule = Array.isArray(content.schedule) ? content.schedule : [];
  const party = Array.isArray(content.party) ? content.party : [];
  const dressColors = Array.isArray(content.dressCode?.colors) ? content.dressCode.colors : [];
  const faq = Array.isArray(content.faq) ? content.faq : [];
  const gift = Array.isArray(content.gift) ? content.gift : [];
  const galleryImages = Array.isArray(content.gallery) ? content.gallery : [];
  const invitationImage = firstImage(galleryImages[1]) || firstImage(galleryImages[0]) || content.coverImage;
  const closingImage = firstImage(galleryImages.at(-1)) || content.coverImage;

  return (
    <div className={`kc-root${preview ? " kc-root--preview" : ""}`} data-variant="khmer-celestial">
      {musicEnabled ? (
        <audio
          ref={audioRef}
          src={musicUrl}
          preload="none"
          loop
          onPlay={() => setMusicState("playing")}
          onPause={() => setMusicState((state) => state === "error" ? state : "paused")}
          onError={() => setMusicState("error")}
        />
      ) : null}

      <AnimatePresence>
        {!opened ? <CelestialOpening key="opening" content={content} onOpen={handleOpen} /> : null}
      </AnimatePresence>

      <nav
        className="kc-toolbar"
        aria-label="Invitation controls"
        aria-hidden={!opened}
        inert={!opened}
      >
        {showBack ? (
          <Link className="kc-toolbar__button" to={backTo}>
            <ArrowLeft aria-hidden="true" />
            <span>{backLabel}</span>
          </Link>
        ) : <span />}
        <div className="kc-toolbar__actions">
          {opened && !preview ? (
            <button type="button" className="kc-toolbar__button" onClick={replay} aria-label="បើកគម្របម្តងទៀត">
              <RotateCcw aria-hidden="true" />
              <span>Replay</span>
            </button>
          ) : null}
          {musicEnabled ? (
            <button
              type="button"
              className="kc-toolbar__button kc-toolbar__button--music"
              onClick={toggleMusic}
              aria-label={musicState === "playing" ? "ផ្អាកតន្ត្រី" : "បើកតន្ត្រី"}
              aria-pressed={musicState === "playing"}
              data-music-status={musicState}
              disabled={musicState === "error"}
            >
              {musicState === "playing" ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
              <span>{musicState === "error" ? "Audio unavailable" : "Music"}</span>
            </button>
          ) : null}
        </div>
      </nav>

      <main
        ref={mainRef}
        className="kc-main"
        tabIndex={-1}
        aria-hidden={!opened}
        inert={!opened}
      >
        <section ref={heroRef} className="kc-hero" data-tx-section="hero" aria-labelledby="kc-hero-title">
          <motion.div
            className="kc-hero__media"
            style={{ y: reducedMotion ? 0 : heroParallaxY }}
            initial={false}
            animate={opened && !reducedMotion ? { scale: [1.06, 1.015] } : { scale: 1 }}
            transition={{ duration: 12, ease: "linear" }}
          >
            <CelestialImage src={content.coverImage} alt={heroAlt} eager />
          </motion.div>
          <div className="kc-hero__shade" />
          <motion.div
            className="kc-hero__content"
            initial={reducedMotion ? false : { opacity: 0, y: 24 }}
            animate={opened ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 1, delay: reducedMotion ? 0 : 0.25 }}
          >
            <p className="kc-hero__eyebrow">សិរីមង្គលអាពាហ៍ពិពាហ៍</p>
            <p className="kc-hero__english">KHMER CELESTIAL · WEDDING INVITATION</p>
            {hasCoupleNames ? (
              <h1 id="kc-hero-title">
                <span>{content.groom}</span>
                <em>&amp;</em>
                <span>{content.bride}</span>
              </h1>
            ) : <h1 id="kc-hero-title">{content.title}</h1>}
            {(content.groomEn || content.brideEn) ? (
              <p className="kc-hero__latin">{content.groomEn} <i>&amp;</i> {content.brideEn}</p>
            ) : null}
            <span className="kc-hero__divider" aria-hidden="true"><i />◆<i /></span>
            {content.dateText ? <p className="kc-hero__date">{content.dateText}</p> : null}
            {content.venue?.name ? <p className="kc-hero__venue">{content.venue.name}</p> : null}
          </motion.div>
          <button type="button" className="kc-hero__scroll" onClick={scrollToInvitation} aria-label="រំកិលទៅពាក្យអញ្ជើញ">
            <span>DISCOVER</span>
            <ArrowDown aria-hidden="true" />
          </button>
        </section>

        <section className="kc-section kc-invitation" data-kc-section="invitation" aria-labelledby="kc-invitation-title">
          <div className="kc-shell">
            <div className="kc-invitation__layout">
              <CelestialReveal className="kc-invitation__portrait">
                <CelestialImage src={invitationImage} alt={heroAlt} />
              </CelestialReveal>
              <div className="kc-invitation__copy">
            <CelestialHeading
              id="kc-invitation-title"
              khmer={content.messageTitle || "សូមគោរពអញ្ជើញ"}
              english="Together with our families"
              eyebrow="THE INVITATION"
              align="left"
              tone="ceremonial"
              languageMode={languageMode}
            />
            <CelestialReveal className="kc-invitation__guest">
              <span>ជូនចំពោះ</span>
              <strong>{content.guestName}</strong>
            </CelestialReveal>
            <CelestialReveal as="p" className="kc-invitation__message" delay={0.08}>
              {content.message}
            </CelestialReveal>
            {hasCoupleNames ? (
              <CelestialReveal className="kc-couple" delay={0.12}>
                <article>
                  <p>{content.couple?.groomIntro || "កូនកំលោះ"}</p>
                  <h3>{content.groom}</h3>
                  {content.couple?.groomParents ? <span>{content.couple.groomParents}</span> : null}
                </article>
                <b aria-hidden="true">◆</b>
                <article>
                  <p>{content.couple?.brideIntro || "កូនក្រមុំ"}</p>
                  <h3>{content.bride}</h3>
                  {content.couple?.brideParents ? <span>{content.couple.brideParents}</span> : null}
                </article>
              </CelestialReveal>
            ) : null}
              </div>
            </div>
          </div>
        </section>

        {sectionEnabled("countdown") && countdown.valid ? (
          <section className="kc-section kc-countdown" data-tx-section="countdown" aria-labelledby="kc-countdown-title">
            <div className="kc-countdown__glow" aria-hidden="true" />
            <div className="kc-shell">
              <CelestialHeading
                id="kc-countdown-title"
                khmer={countdown.expired ? "ថ្ងៃមង្គលបានមកដល់" : "រាប់ថយក្រោយដល់ថ្ងៃមង្គល"}
                english={countdown.expired ? "The celebration has begun" : "Until we say forever"}
                eyebrow="SAVE THE DATE"
                languageMode={languageMode}
              />
              <CelestialReveal className="kc-countdown__grid">
                {countdown.values.map((value, index) => (
                  <div key={COUNTDOWN_LABELS[index][1]}>
                    <strong>{value}</strong>
                    <span>{COUNTDOWN_LABELS[index][0]}</span>
                    <small>{COUNTDOWN_LABELS[index][1]}</small>
                  </div>
                ))}
              </CelestialReveal>
              <CelestialReveal className="kc-countdown__details" delay={0.08}>
                <p><CalendarDays aria-hidden="true" /> {content.dateText}</p>
                {content.eventTime ? <p><Clock3 aria-hidden="true" /> {content.eventTime}</p> : null}
                {calendarUrl ? (
                  <a className="kc-button kc-button--outline" href={calendarUrl} target="_blank" rel="noreferrer">
                    <CalendarDays aria-hidden="true" /> Add to calendar
                  </a>
                ) : null}
              </CelestialReveal>
            </div>
          </section>
        ) : null}

        {sectionEnabled("story") && story.length ? (
          <section className="kc-section kc-story" data-tx-section="story" aria-labelledby="kc-story-title">
            <div className="kc-shell">
              <CelestialHeading id="kc-story-title" khmer="ដំណើរនៃក្ដីស្រឡាញ់" english="Written in the stars" eyebrow="OUR STORY" align="left" languageMode={languageMode} />
              <div className="kc-story__list">
                {story.map((chapter, index) => (
                  <CelestialReveal as="article" className="kc-story__chapter" key={chapter.id || `${chapter.title}-${index}`}>
                    <div className="kc-story__media">
                      <CelestialImage
                        src={firstImage(chapter.image)
                          || firstImage(galleryImages[index + 2])
                          || firstImage(galleryImages[index + 1])
                          || content.coverImage}
                        alt={chapter.title || `រឿងរ៉ាវស្នេហា ទី ${index + 1}`}
                      />
                      <span>{String(index + 1).padStart(2, "0")}</span>
                    </div>
                    <div className="kc-story__copy">
                      {chapter.kicker ? <p className="kc-story__kicker">{chapter.kicker}</p> : null}
                      <h3>{chapter.title || "ដំណើររបស់យើង"}</h3>
                      {chapter.date ? <time>{chapter.date}</time> : null}
                      <div>{chapter.text}</div>
                    </div>
                  </CelestialReveal>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {sectionEnabled("schedule") && schedule.length ? (
          <section className="kc-section kc-schedule" data-tx-section="schedule" aria-labelledby="kc-schedule-title">
            <div className="kc-shell kc-shell--narrow">
              <CelestialHeading id="kc-schedule-title" khmer="កម្មវិធីមង្គលការ" english="Ceremony & celebration" eyebrow="THE PROGRAMME" align="left" languageMode={languageMode} />
              <div className="kc-schedule__list">
                {schedule.map((item, index) => (
                  <CelestialReveal as="article" className="kc-schedule__item" key={item.id || `${item.time}-${index}`} delay={(index % 3) * 0.04}>
                    <time>{item.time}</time>
                    <span aria-hidden="true"><i /></span>
                    <div>
                      <h3>{item.title}</h3>
                      {item.titleEn ? <p className="kc-schedule__english">{item.titleEn}</p> : null}
                      {item.description ? <p>{item.description}</p> : null}
                      {item.location ? <small>{item.location}</small> : null}
                    </div>
                  </CelestialReveal>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {sectionEnabled("map") && (content.venue?.name || content.venue?.mapLink) ? (
          <section className="kc-section kc-venue" data-tx-section="map" aria-labelledby="kc-venue-title">
            <div className="kc-shell">
              <div className="kc-venue__layout">
                <CelestialReveal className="kc-venue__media">
                  <CelestialImage src={content.venue.image || content.coverImage} alt={content.venue.name || "ទីតាំងប្រារព្ធពិធី"} />
                  <span className="kc-venue__pin" aria-hidden="true"><MapPin /></span>
                </CelestialReveal>
                <div className="kc-venue__copy">
                  <CelestialHeading id="kc-venue-title" khmer="ទីតាំងប្រារព្ធពិធី" english="Meet us beneath the same sky" eyebrow="THE VENUE" align="left" languageMode={languageMode} />
                  <CelestialReveal>
                    {content.venue.name ? <h3>{content.venue.name}</h3> : null}
                    {content.venue.address ? <p>{content.venue.address}</p> : null}
                    {content.venue.mapLink ? (
                      <a className="kc-button kc-button--gold" href={content.venue.mapLink} target="_blank" rel="noreferrer">
                        <MapPin aria-hidden="true" /> បើកផែនទី <ExternalLink aria-hidden="true" />
                      </a>
                    ) : null}
                  </CelestialReveal>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {sectionEnabled("gallery") ? <CelestialGallery images={content.gallery} languageMode={languageMode} /> : null}

        {sectionEnabled("party") && party.length ? (
          <section className="kc-section kc-party" data-tx-section="party" aria-labelledby="kc-party-title">
            <div className="kc-shell">
              <CelestialHeading id="kc-party-title" khmer="មនុស្សជាទីស្រឡាញ់" english="With those closest to us" eyebrow="WEDDING PARTY" languageMode={languageMode} />
              <div className="kc-party__grid">
                {party.map((member, index) => (
                  <CelestialReveal as="article" key={member.id || `${member.name}-${index}`} delay={(index % 4) * 0.05}>
                    <CelestialImage src={firstImage(member.image)} alt={member.name || `Wedding party ${index + 1}`} />
                    <p>{member.role}</p>
                    <h3>{member.name}</h3>
                  </CelestialReveal>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {sectionEnabled("dressCode") && dressColors.length ? (
          <section className="kc-section kc-dress" data-tx-section="dressCode" aria-labelledby="kc-dress-title">
            <div className="kc-shell kc-shell--narrow">
              <CelestialHeading id="kc-dress-title" khmer="សម្លៀកបំពាក់" english="A ceremonial palette" eyebrow="DRESS CODE" languageMode={languageMode} />
              <CelestialReveal className="kc-dress__card">
                <h3>{content.dressCode.name}</h3>
                {content.dressCode.style ? <p>{content.dressCode.style}</p> : null}
                <div className="kc-dress__colors">
                  {dressColors.map((color, index) => (
                    <div key={`${color.hex}-${index}`}>
                      <span style={{ backgroundColor: color.hex }} aria-hidden="true" />
                      <small>{color.name}</small>
                    </div>
                  ))}
                </div>
                {content.dressCode.description ? <p>{content.dressCode.description}</p> : null}
              </CelestialReveal>
            </div>
          </section>
        ) : null}

        {sectionEnabled("gift") && gift.length ? (
          <div className="kc-gift" data-kc-section="gift">
            <TemplateGift content={content} />
          </div>
        ) : null}

        {sectionEnabled("faq") && faq.length ? (
          <section className="kc-section kc-faq" data-tx-section="faq" aria-labelledby="kc-faq-title">
            <div className="kc-shell kc-shell--narrow">
              <CelestialHeading id="kc-faq-title" khmer="សំណួរញឹកញាប់" english="A few helpful notes" eyebrow="GUEST NOTES" languageMode={languageMode} />
              <div className="kc-faq__list">
                {faq.map((item, index) => (
                  <CelestialReveal as="details" key={item.id || `${item.q}-${index}`}>
                    <summary>{item.q}</summary>
                    <p>{item.a}</p>
                  </CelestialReveal>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {sectionEnabled("rsvp") ? (
          <section className="kc-section kc-rsvp" data-tx-section="rsvp" aria-labelledby="kc-rsvp-title">
            <div className="kc-shell kc-rsvp__layout">
              <CelestialHeading id="kc-rsvp-title" khmer="សូមបញ្ជាក់ការចូលរួម" english="We hope you can join us" eyebrow="RÉPONDEZ S'IL VOUS PLAÎT" align="left" languageMode={languageMode} />
              <CelestialReveal className="kc-rsvp__card">
                {children || <TemplateRsvp useTemplateLink={useTemplateLink} />}
              </CelestialReveal>
            </div>
          </section>
        ) : null}

        <footer className="kc-footer">
          <CelestialImage className="kc-footer__media" src={closingImage} alt={heroAlt} />
          <div className="kc-footer__shade" aria-hidden="true" />
          <CelestialReveal>
            <img className="kc-footer__brand" src={KHMER_CELESTIAL_ASSETS.brandMark} alt="Koupreng" loading="lazy" decoding="async" width="768" height="512" />
            <p className="kc-footer__khmer">{content.thankYouTitle || "សូមអរគុណដោយក្តីគោរព"}</p>
            {hasCoupleNames ? <h2>{content.groom} <em>&amp;</em> {content.bride}</h2> : <h2>{content.title}</h2>}
            <p>{content.thankYouText || content.wish?.message || "វត្តមាន និងពរជ័យរបស់លោកអ្នក គឺជាអំណោយដ៏មានតម្លៃសម្រាប់យើងខ្ញុំ។"}</p>
            <small>Koupreng · Khmer Celestial</small>
          </CelestialReveal>
        </footer>

        {showActions && useTemplateLink ? (
          <div className="kc-template-actions">
            <Link className="kc-button kc-button--gold" to={useTemplateLink}>{primaryCtaLabel}</Link>
            <Link className="kc-button kc-button--outline" to={backTo}>{backLabel}</Link>
          </div>
        ) : null}
      </main>

      {musicEnabled && opened && musicState !== "error" ? (
        <button
          type="button"
          className={`kc-music-fab${musicState === "playing" ? " is-playing" : ""}`}
          onClick={toggleMusic}
          aria-label={musicState === "playing" ? "ផ្អាកតន្ត្រី" : "បើកតន្ត្រី"}
          aria-pressed={musicState === "playing"}
        >
          <Music2 aria-hidden="true" />
          <span className="kc-sr-only">Wedding music</span>
        </button>
      ) : null}
    </div>
  );
}
