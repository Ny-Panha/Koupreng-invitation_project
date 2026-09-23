import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import TemplateExperience from "./TemplateExperience";
import TemplateOpeningGate from "./components/sections/TemplateOpeningGate";

function setReducedMotion(matches) {
    window.matchMedia = vi.fn().mockImplementation(() => ({
        matches,
        media: "(prefers-reduced-motion: reduce)",
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
    }));
}

function content(overrides = {}) {
    return {
        variant: "garden-royal-khmer-wedding",
        amp: "&",
        badge: "",
        enabledSections: {
            countdown: false,
            story: false,
            gallery: false,
            schedule: false,
            map: false,
            party: false,
            dressCode: false,
            gift: false,
            wish: false,
            faq: false,
            rsvp: true,
        },
        monogramText: "ស & ម",
        guestName: "លោកអ្នក និងក្រុមគ្រួសារ",
        groom: "សុវណ្ណ",
        bride: "មាលា",
        dateText: "ថ្ងៃទី ២២ ខែកក្កដា ឆ្នាំ ២០២៦",
        coverImage: "/cover.jpg",
        portraitImage: "/cover.jpg",
        message: "សូមចូលរួមពិធីមង្គលការរបស់យើងខ្ញុំ។",
        families: "រួមជាមួយក្រុមគ្រួសារទាំងសងខាង",
        couple: { groomIntro: "កូនកំលោះ", brideIntro: "កូនក្រមុំ", groomParents: "", brideParents: "" },
        venue: { name: "ភ្នំពេញ", address: "", mapLink: null, mapEmbedUrl: null, image: "/cover.jpg" },
        gallery: [],
        story: [],
        schedule: [],
        party: [],
        gift: [],
        faq: [],
        contact: {},
        design: {
            openingStyle: "khmer-royal",
            openingOverlayOpacity: 0.48,
            frameStyle: "double-gold",
            ornamentStyle: "khmer-corner-01",
        },
        opening: {
            heading: "សិរីមង្គលអាពាហ៍ពិពាហ៍",
            invitationText: "យើងខ្ញុំមានកិត្តិយសសូមគោរពអញ្ជើញ",
            genericGuestText: "លោកអ្នក និងក្រុមគ្រួសារ",
            openButtonText: "បើកសំបុត្រអញ្ជើញ",
        },
        music: "/wedding.mp3",
        openingVideo: null,
        ...overrides,
    };
}

const tpl = { id: "garden-royal-khmer-wedding", name: "Garden Royal" };

function renderExperience(props = {}) {
    return render(
        <MemoryRouter>
            <TemplateExperience tpl={tpl} content={content()} {...props} />
        </MemoryRouter>
    );
}

async function openInvitation() {
    fireEvent.click(screen.getByRole("button", { name: "បើកសំបុត្រអញ្ជើញ" }));
    await waitFor(() => {
        expect(document.querySelector(".tx-experience, .kc-main")).toBeInTheDocument();
    });
}

describe("TemplateExperience opening gate", () => {
    beforeEach(() => {
        setReducedMotion(true);
        vi.stubGlobal("IntersectionObserver", class {
            constructor(callback) {
                this.callback = callback;
            }

            observe(element) {
                this.callback([{ isIntersecting: true, target: element }]);
            }

            unobserve() {}

            disconnect() {}
        });
        vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
            callback();
            return 1;
        });
        vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => undefined);
        vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => undefined);
        vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => undefined);
        vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    });

    afterEach(() => {
        cleanup();
        document.body.style.overflow = "";
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it("starts closed, locks scrolling, and restores the original overflow on cleanup", () => {
        document.body.style.overflow = "clip";
        const view = renderExperience();
        expect(screen.getByRole("button", { name: "បើកសំបុត្រអញ្ជើញ" })).toBeVisible();
        expect(document.body.style.overflow).toBe("hidden");
        view.unmount();
        expect(document.body.style.overflow).toBe("clip");
    });

    it("opens once, starts music from that interaction, and renders RSVP exactly once", async () => {
        const play = vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
        render(
            <MemoryRouter>
                <TemplateExperience tpl={tpl} content={content()}>
                <form data-testid="public-rsvp">RSVP</form>
                </TemplateExperience>
            </MemoryRouter>
        );
        expect(play).not.toHaveBeenCalled();
        await openInvitation();
        expect(play).toHaveBeenCalledTimes(1);
        expect(screen.getAllByTestId("public-rsvp")).toHaveLength(1);
        expect(document.activeElement).toHaveClass("tx-experience");
        await waitFor(() => {
            expect(document.body.style.overflow).toBe("");
        });
    });

    it("handles rejected audio playback without blocking the reveal", async () => {
        vi.spyOn(HTMLMediaElement.prototype, "play").mockRejectedValue(new Error("blocked"));
        renderExperience();
        await openInvitation();
        expect(screen.getByRole("button", { name: "បើកតន្ត្រី" })).toHaveAttribute("data-music-status", "error");
        expect(screen.getByText("សូមគោរពអញ្ជើញ")).toBeVisible();
    });

    it("uses immediate reduced-motion state changes", async () => {
        setReducedMotion(true);
        renderExperience();
        fireEvent.click(screen.getByRole("button", { name: "បើកសំបុត្រអញ្ជើញ" }));
        await waitFor(() => expect(document.querySelector(".tx-experience")).toBeInTheDocument());
        expect(screen.getByText("សូមគោរពអញ្ជើញ")).toBeVisible();
    });

    it("keeps disabled optional sections hidden", async () => {
        renderExperience({ content: content({ faq: [{ id: "q", q: "Question", a: "Answer" }] }) });
        await openInvitation();
        expect(screen.queryByText("Question")).not.toBeInTheDocument();
        expect(document.querySelector(".tx-gallery")).not.toBeInTheDocument();
    });

    it("renders wedding schedule and timeline milestones when enabled", async () => {
        renderExperience({
            content: content({
                enabledSections: { schedule: true, rsvp: false },
                schedule: [
                    { id: "s1", time: "07:00 ព្រឹក", title: "ពិធីហែជំនូន", description: "ពិធីហែជំនូនតាមប្រពៃណីខ្មែរ", status: "COMPLETED" },
                    { id: "s2", time: "09:00 ព្រឹក", title: "ពិធីកាត់សក់បង្កក់សិរី", description: "កាត់សក់ជូនកូនកំលោះកូនក្រមុំ", status: "IN_PROGRESS" },
                    { id: "s3", time: "05:00 ល្ងាច", title: "ពិធីពិសាភោជនាហារ", description: "ពិសារអាហារពេលល្ងាចជុំគ្នា", status: "UPCOMING" },
                ],
            }),
        });
        await openInvitation();
        expect(screen.getByText("កម្មវិធីពិធីមង្គលការ")).toBeInTheDocument();
        expect(screen.getByText("07:00 ព្រឹក")).toBeInTheDocument();
        expect(screen.getByText("ពិធីហែជំនូន")).toBeInTheDocument();
        expect(screen.getByText("បានបញ្ចប់ • COMPLETED")).toBeInTheDocument();
        expect(screen.getByText("09:00 ព្រឹក")).toBeInTheDocument();
        expect(screen.getByText("ពិធីកាត់សក់បង្កក់សិរី")).toBeInTheDocument();
        expect(screen.getByText("កំពុងប្រព្រឹត្តទៅ • IN PROGRESS")).toBeInTheDocument();
        expect(screen.getByText("05:00 ល្ងាច")).toBeInTheDocument();
        expect(screen.getByText("ពិធីពិសាភោជនាហារ")).toBeInTheDocument();
        expect(screen.getByText("បន្ទាប់ • UPCOMING")).toBeInTheDocument();
    });

    it("renders dress code and theme palette swatches when enabled", async () => {
        renderExperience({
            content: content({
                enabledSections: { dressCode: true, rsvp: false },
                dressCode: {
                    name: "Traditional & Formal",
                    style: "ខ្មែរបុរាណ / សម័យ",
                    description: "សូមស្លៀកសម្លៀកបំពាក់ពណ៌តាមប្រធានបទ ឬពណ៌សមរម្យ",
                    colors: [
                        { hex: "#D4AF37", name: "ពណ៌មាស (Gold)" },
                        { hex: "#800020", name: "ពណ៌ក្រហមឈាមជ្រូក (Burgundy)" },
                    ],
                },
            }),
        });
        await openInvitation();
        expect(screen.getByText("Traditional & Formal")).toBeInTheDocument();
        expect(screen.getByText("ពណ៌មាស (Gold)")).toBeInTheDocument();
        expect(screen.getByText("ពណ៌ក្រហមឈាមជ្រូក (Burgundy)")).toBeInTheDocument();
        expect(screen.getByText("រចនាបថ៖ ខ្មែរបុរាណ / សម័យ")).toBeInTheDocument();
        expect(screen.getByText("សូមស្លៀកសម្លៀកបំពាក់ពណ៌តាមប្រធានបទ ឬពណ៌សមរម្យ")).toBeInTheDocument();
    });

    it("renders digital photo gallery grid and opens lightbox when enabled", async () => {
        renderExperience({
            content: content({
                enabledSections: { gallery: true, rsvp: false },
                gallery: [
                    { src: "/photo1.jpg", span: "large" },
                    { src: "/photo2.jpg", span: "small" },
                ],
            }),
        });
        await openInvitation();
        expect(screen.getByText("អនុស្សាវរីយ៍ស្នេហា")).toBeInTheDocument();
        const photoBtn = screen.getByRole("button", { name: "មើលរូបភាពទី 1" });
        expect(photoBtn).toBeInTheDocument();

        fireEvent.click(photoBtn);
        expect(screen.getByRole("dialog", { name: "រូបភាព" })).toBeInTheDocument();

        const closeBtn = screen.getByRole("button", { name: "បិទ" });
        fireEvent.click(closeBtn);
        expect(screen.queryByRole("dialog", { name: "រូបភាព" })).not.toBeInTheDocument();
    });

    it("renders love story milestones timeline when enabled", async () => {
        renderExperience({
            content: content({
                enabledSections: { story: true, rsvp: false },
                story: [
                    { id: "st1", kicker: "ជួបគ្នាដំបូង", title: "ថ្ងៃជួបគ្នាលើកដំបូង", date: "2020", text: "យើងបានជួបគ្នានៅសកលវិទ្យាល័យ" },
                    { id: "st2", kicker: "សុំរៀបការ", title: "ការសុំរៀបការដ៏ផ្អែមល្ហែម", date: "2025", text: "ការសុំរៀបការនៅមាត់សមុទ្រ" },
                ],
            }),
        });
        await openInvitation();
        expect(screen.getByText("ដំណើរនៃក្ដីស្រឡាញ់")).toBeInTheDocument();
        expect(screen.getByText("ថ្ងៃជួបគ្នាលើកដំបូង")).toBeInTheDocument();
        expect(screen.getByText("យើងបានជួបគ្នានៅសកលវិទ្យាល័យ")).toBeInTheDocument();
        expect(screen.getByText("ការសុំរៀបការដ៏ផ្អែមល្ហែម")).toBeInTheDocument();
    });

    it("renders interactive venue location, address, and directions link when map is enabled", async () => {
        renderExperience({
            content: content({
                enabledSections: { map: true, rsvp: false },
                venue: {
                    name: "សណ្ឋាគារ ហ៊ីម៉ាវ៉ារី ភ្នំពេញ",
                    address: "វិថីព្រះស៊ីសុវត្ថិ រាជធានីភ្នំពេញ",
                    mapLink: "https://maps.google.com/?q=Himawari+Hotel",
                    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18",
                },
            }),
        });
        await openInvitation();
        expect(screen.getByText("ទីតាំងប្រារព្ធពិធី")).toBeInTheDocument();
        expect(screen.getByRole("heading", { level: 3, name: "សណ្ឋាគារ ហ៊ីម៉ាវ៉ារី ភ្នំពេញ" })).toBeInTheDocument();
        expect(screen.getByText("វិថីព្រះស៊ីសុវត្ថិ រាជធានីភ្នំពេញ")).toBeInTheDocument();
        const mapLink = screen.getByRole("link", { name: /បើកផែនទី/i });
        expect(mapLink).toHaveAttribute("href", "https://maps.google.com/?q=Himawari+Hotel");
    });

    it("renders digital envelope and cash gift QR accounts with copy account action", async () => {
        const writeText = vi.fn().mockResolvedValue(undefined);
        Object.defineProperty(navigator, "clipboard", {
            value: { writeText },
            configurable: true,
        });

        renderExperience({
            content: content({
                enabledSections: { gift: true, rsvp: false },
                gift: [
                    { id: "g1", bank: "ABA Bank", account: "SOVAN & MALEA", number: "000 123 456", note: "KHQR" },
                    { id: "g2", bank: "ACLEDA Bank", account: "SOVAN & MALEA", number: "012 345 678", note: "ToanChet" },
                ],
            }),
        });
        await openInvitation();
        expect(screen.getByText("ចំណងដៃ")).toBeInTheDocument();
        expect(screen.getByText("ABA Bank")).toBeInTheDocument();
        expect(screen.getByText("000 123 456")).toBeInTheDocument();
        expect(screen.getByText("ACLEDA Bank")).toBeInTheDocument();

        const copyBtns = screen.getAllByRole("button", { name: /ចម្លងលេខគណនី/i });
        expect(copyBtns.length).toBe(2);
        fireEvent.click(copyBtns[0]);
        expect(writeText).toHaveBeenCalledWith("000 123 456");
    });

    it("renders interactive FAQ and wedding Q&A accordion when faq is enabled", async () => {
        renderExperience({
            content: content({
                enabledSections: { faq: true, rsvp: false },
                faq: [
                    { id: "f1", q: "តើមានចំណតរថយន្តដែរឬទេ?", a: "បាទ/ចាស មានចំណតរថយន្តធំទូលាយដោយឥតគិតថ្លៃ" },
                    { id: "f2", q: "តើអាចនាំកុមារតូចៗមកបានទេ?", a: "យើងស្វាគមន៍កុមារតូចៗទាំងអស់" },
                ],
            }),
        });
        await openInvitation();
        expect(screen.getByText("សំណួរញឹកញាប់")).toBeInTheDocument();
        expect(screen.getByText("តើមានចំណតរថយន្តដែរឬទេ?")).toBeInTheDocument();
        expect(screen.getByText("បាទ/ចាស មានចំណតរថយន្តធំទូលាយដោយឥតគិតថ្លៃ")).toBeInTheDocument();
        expect(screen.getByText("តើអាចនាំកុមារតូចៗមកបានទេ?")).toBeInTheDocument();
    });

    it("keeps preview gates inside the phone flow without locking the parent document", async () => {
        const play = vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
        renderExperience({
            preview: false,
            variant: "khmer-celestial",
            tpl: { id: "khmer-celestial", name: "Khmer Celestial" },
        });
        await openInvitation();
        expect(play).toHaveBeenCalledTimes(1);
        expect(screen.getByRole("button", { name: "បើកគម្របម្តងទៀត" })).toBeVisible();
    });
});

describe("TemplateOpeningGate media and greeting fallbacks", () => {
    beforeEach(() => {
        setReducedMotion(true);
        vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => undefined);
        vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => undefined);
        vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it("renders opening video player when valid video source is provided", () => {
        const gateContent = content({ openingVideo: { url: "/ceremony_trailer.mp4" } });
        const view = render(<TemplateOpeningGate content={gateContent} lockDocumentScroll={false} onOpen={() => {}} />);
        const video = view.container.querySelector("video");
        expect(video).toBeInTheDocument();
        expect(video).toHaveAttribute("src", "/ceremony_trailer.mp4");
    });

    it("falls back to the cover image when the opening video fails", () => {
        const gateContent = content({ openingVideo: { url: "/broken.mp4" } });
        const view = render(<TemplateOpeningGate content={gateContent} lockDocumentScroll={false} onOpen={() => {}} />);
        fireEvent.error(view.container.querySelector("video"));
        expect(view.container.querySelector("video")).not.toBeInTheDocument();
        expect(view.container.querySelector('img[src="/cover.jpg"]')).toBeInTheDocument();
    });

    it("shows a safe visual placeholder when both opening media sources are missing", () => {
        const gateContent = content({ coverImage: "", openingVideo: null });
        const view = render(<TemplateOpeningGate content={gateContent} lockDocumentScroll={false} onOpen={() => {}} />);
        expect(view.container.querySelector("video")).not.toBeInTheDocument();
        expect(view.container.querySelector(".tx-image-fallback.tx-gate__media")).toBeInTheDocument();
    });

    it("shows secure personalized data when supplied and generic copy otherwise", () => {
        const personalized = render(
            <TemplateOpeningGate
                content={content({ guestName: "លោក សុវណ្ណ និងក្រុមគ្រួសារ" })}
                lockDocumentScroll={false}
                onOpen={() => {}}
            />
        );
        expect(screen.getByText("សូមគោរពអញ្ជើញ លោក សុវណ្ណ និងក្រុមគ្រួសារ")).toBeVisible();
        personalized.unmount();
        render(<TemplateOpeningGate content={content({ guestName: "" })} lockDocumentScroll={false} onOpen={() => {}} />);
        expect(screen.getByText("សូមគោរពអញ្ជើញ លោកអ្នក និងក្រុមគ្រួសារ")).toBeVisible();
    });

    it("renders Theatrical Velvet Curtain style when openingStyle is curtain", () => {
        const curtainContent = content({
            design: { openingStyle: "curtain", primaryColor: "#6f1d2b" },
        });
        const view = render(
            <TemplateOpeningGate content={curtainContent} lockDocumentScroll={false} onOpen={() => {}} />
        );
        expect(view.container.querySelector(".tx-gate-curtain")).toBeInTheDocument();
        expect(view.container.querySelector(".tx-curtain-panel--left")).toBeInTheDocument();
        expect(view.container.querySelector(".tx-curtain-panel--right")).toBeInTheDocument();
        expect(view.container.querySelector(".tx-curtain-valance")).toBeInTheDocument();
    });

    it("renders 3D Luxury Wax Seal Envelope style when openingStyle is envelope-3d", () => {
        const envContent = content({
            design: { openingStyle: "envelope-3d", primaryColor: "#5c0f1c" },
        });
        const view = render(
            <TemplateOpeningGate content={envContent} lockDocumentScroll={false} onOpen={() => {}} />
        );
        expect(view.container.querySelector(".tx-gate-env3d")).toBeInTheDocument();
        expect(view.container.querySelector(".tx-env3d-wax-seal")).toBeInTheDocument();
        expect(view.container.querySelector(".tx-env3d-top-flap")).toBeInTheDocument();
        expect(view.container.querySelector(".tx-env3d-card")).toBeInTheDocument();
    });

    it("renders Magical Portal Gate style when openingStyle is magical-gate", () => {
        const magicContent = content({
            design: { openingStyle: "magical-gate", primaryColor: "#4a0d24" },
        });
        const view = render(
            <TemplateOpeningGate content={magicContent} lockDocumentScroll={false} onOpen={() => {}} />
        );
        expect(view.container.querySelector(".tx-gate-magical")).toBeInTheDocument();
        expect(view.container.querySelector(".tx-magical-door--left")).toBeInTheDocument();
        expect(view.container.querySelector(".tx-magical-door--right")).toBeInTheDocument();
        expect(view.container.querySelector(".tx-magical-petals")).toBeInTheDocument();
    });
});
