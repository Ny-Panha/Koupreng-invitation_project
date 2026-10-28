import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SilkHeritageLayout from "./SilkHeritageLayout";
import TemplateExperience from "../../experience/TemplateExperience";
import { getDedicatedTemplateComponent, templateRegistry } from "../../registry/templateRegistry";
import { getTemplateById, registerDynamicTemplates, resolveNumericTemplateId, SILK_HERITAGE_TEMPLATE, KHMER_CELESTIAL_TEMPLATE } from "../../data/templatesData";
import { draftToTemplate } from "../../../wedding-builder/utils/draftToTemplate";
import { publicInvitationToDraft } from "../../../wedding-builder/utils/invitationDraftAdapter";
import { buildTemplateContent } from "../../experience/config/templateExperienceContent";

beforeEach(() => {
  registerDynamicTemplates([]);
  window.matchMedia = vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
});
afterEach(() => { cleanup(); registerDynamicTemplates([]); });
const show = (props = {}) => render(<MemoryRouter><SilkHeritageLayout {...props} content={{ groom: "សុវណ្ណ", bride: "សុភា", guestName: "លោក សំណាង", languageMode: "en", gallery: [], schedule: [], enabledSections: { countdown: false, dressCode: false }, ...props.content }} /></MemoryRouter>);

describe("Silk Heritage integration", () => {
  it("copies the complete ceremonial information with independent Silk data and media", () => {
    for (const key of ["title", "guestName", "familyHeading", "messageTitle", "message", "dateText", "dateTextEn", "machineEventDate", "targetDate", "eventTime", "ceremonyTime", "receptionTime", "venueName", "venueAddress", "mapQuery", "scheduleTitle", "scheduleDate", "scheduleEnding", "thankYouTitle", "thankYouText", "apologyTitle", "apologyText", "storyText"]) {
      expect(SILK_HERITAGE_TEMPLATE[key], key).toBeTruthy();
    }
    expect(SILK_HERITAGE_TEMPLATE.family).not.toBe(KHMER_CELESTIAL_TEMPLATE.family);
    expect(SILK_HERITAGE_TEMPLATE.family.groomParents).not.toBe(KHMER_CELESTIAL_TEMPLATE.family.groomParents);
    expect(SILK_HERITAGE_TEMPLATE.schedule).toHaveLength(9);
    expect(SILK_HERITAGE_TEMPLATE.schedule.map(({ id, time, title }) => ({ id, time, title })))
      .toEqual(KHMER_CELESTIAL_TEMPLATE.schedule);
    expect(SILK_HERITAGE_TEMPLATE.design).toMatchObject({ presetId: "SILK_HERITAGE", openingStyle: "paper", primaryColor: "#672C39" });
    expect(SILK_HERITAGE_TEMPLATE.storyImages.every((image) => image.src.includes("/silk-heritage/"))).toBe(true);
    expect(SILK_HERITAGE_TEMPLATE.isPremium).toBe(false);
  });

  it("renders the full families, program, gratitude and apology instead of dropping copied fields", () => {
    const content = buildTemplateContent(SILK_HERITAGE_TEMPLATE, "silk-heritage");
    const { container } = show({ preview: true, content: { ...content, languageMode: "kh" } });
    expect(screen.getByText(SILK_HERITAGE_TEMPLATE.familyHeading)).toBeInTheDocument();
    for (const side of ["groom", "bride"]) expect(screen.getByText(SILK_HERITAGE_TEMPLATE.family[`${side}Title`])).toBeInTheDocument();
    expect(container.querySelectorAll(".sh-program li")).toHaveLength(9);
    expect(screen.getByText(SILK_HERITAGE_TEMPLATE.apologyText)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: SILK_HERITAGE_TEMPLATE.thankYouTitle })).toBeInTheDocument();
    expect(screen.getByText(SILK_HERITAGE_TEMPLATE.thankYouText)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /បើកផែនទី/ })).toHaveAttribute("href", expect.stringContaining("Himawari"));
    expect(container.querySelector("audio")).toBeNull();
    expect(container.querySelector(".tx-gift__qr")).toBeNull();
  });

  it("translates ceremonial copy and does not leak demo translations into a hosted invitation", () => {
    const content = buildTemplateContent(SILK_HERITAGE_TEMPLATE, "silk-heritage");
    show({ preview: true, content: { ...content, languageMode: "en" } });
    expect(screen.getByText(SILK_HERITAGE_TEMPLATE.messageEn)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "A heartfelt invitation" })).toBeInTheDocument();
    expect(screen.getAllByText("Himawari Hotel, Phnom Penh")).toHaveLength(2);
    const hosted = draftToTemplate({ id: 901, templateId: "silk-heritage", couple: { groom: "Saved groom", bride: "Saved bride" }, event: { date: "2026-12-20", venueName: "Saved venue" }, messageText: "Our saved copy" }, []);
    const published = buildTemplateContent(hosted.tpl, hosted.variant);
    expect(published.messageEn).toBe("");
    expect(published.venueNameEn).toBe("");
  });
  it("uses the catalog's actual ID despite legacy numeric collisions", () => {
    registerDynamicTemplates([{ id: 2, code: "silk-heritage", status: "ACTIVE", description: JSON.stringify({ presetId: "SILK_HERITAGE", coverImage: "/saved-portrait.jpg" }), thumbnailUrl: "/thumbnail.svg", premium: true, price: 12 }]);
    const template = getTemplateById("silk-heritage");
    expect(resolveNumericTemplateId("silk-heritage")).toBe(2);
    expect(getDedicatedTemplateComponent(template)).toBe(templateRegistry["silk-heritage"]);
    expect(template.mainImage).toBe("/saved-portrait.jpg");
    expect(template.isPremium).toBe(true);
    expect(getDedicatedTemplateComponent({ slug: "__proto__" })).toBeNull();
    expect(getDedicatedTemplateComponent({ id: "constructor" })).toBeNull();
    expect(getDedicatedTemplateComponent(null)).toBeNull();
  });

  it("opens without motion and moves focus to event details", () => {
    show();
    expect(screen.queryByRole("heading", { name: /សុវណ្ណ.*សុភា/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Open invitation" }));
    expect(screen.getByRole("heading", { name: /សុវណ្ណ.*សុភា/ })).toHaveFocus();
    expect(screen.queryByRole("button", { name: "Open invitation" })).not.toBeInTheDocument();
  });

  it("delegates hosted RSVP and respects section switches without a fake confirmation", () => {
    const props = { preview: true, content: { languageMode: "en", hasHostContent: true, groom: "Host", bride: "Partner", enabledSections: { rsvp: true, schedule: false }, schedule: [{ time: "17:00", title: "Hidden program" }] }, children: <button>Real authorized RSVP</button> };
    const view = show(props);
    expect(screen.getByRole("button", { name: "Real authorized RSVP" })).toBeInTheDocument();
    expect(screen.queryByText("Hidden program")).not.toBeInTheDocument();
    expect(screen.queryByText(/RSVP received/)).not.toBeInTheDocument();
    view.rerender(<MemoryRouter><SilkHeritageLayout {...props} content={{ ...props.content, enabledSections: { rsvp: false, schedule: false } }} /></MemoryRouter>);
    expect(screen.queryByRole("button", { name: "Real authorized RSVP" })).not.toBeInTheDocument();
  });

  it("does not load unverified demo music and shows a truthful RSVP note", () => {
    const { container } = show({ preview: true, content: { languageMode: "en", music: "/unverified-demo.mp3" } });
    expect(container.querySelector("audio")).toBeNull();
    expect(screen.getByText(/This is a preview/)).toBeInTheDocument();
  });

  it("preserves saved values through editor and public adapters", () => {
    const saved = { couple: { groom: "Saved groom", bride: "Saved bride", groomParents: ["Saved father"] }, event: { date: "2026-11-28", venueName: "Saved venue" }, coverImage: "/saved.jpg", coverBackgroundImage: "/folio.jpg", messageText: "Our saved invitation", schedule: [{ id: "one", time: "17:00", title: "Saved program" }], sectionOrder: ["map", "schedule"], fontKhmer: "Battambang" };
    const editor = draftToTemplate({ ...saved, id: "draft-test", templateId: "silk-heritage", languageMode: "en" }, []);
    const publicDraft = publicInvitationToDraft({ id: 44, slug: "saved-wedding", templateCode: "silk-heritage", languageMode: "EN", contentJson: JSON.stringify(saved), designJson: JSON.stringify({ coverBackgroundImage: "/folio.jpg" }) });
    const published = draftToTemplate(publicDraft, []);
    const editorContent = buildTemplateContent(editor.tpl, editor.variant);
    const publicContent = buildTemplateContent(published.tpl, published.variant);
    for (const field of ["groom", "bride", "coverImage", "coverBackgroundImage", "message", "sectionOrder", "fontKhmer"]) expect(publicContent[field], field).toEqual(editorContent[field]);
    expect(publicContent.family.groomParents).toEqual(["Saved father"]);
    expect(publicContent.schedule[0].title).toBe("Saved program");
    expect(publicContent.gallery).toEqual([]);
    const photo = { preview: "/album.webp", alt: "Saved couple portrait", caption: "Saved caption", type: "image" };
    const album = draftToTemplate({ ...saved, templateId: "silk-heritage" }, [photo]);
    expect(buildTemplateContent(album.tpl, album.variant).gallery[0]).toMatchObject({ src: "/album.webp", alt: photo.alt, caption: photo.caption });
  });

  it("renders the lazy flagship and accepts only trusted preview updates", async () => {
    const sessionId = "silk-preview-session-1234567890";
    const channel = { sessionId, origin: window.location.origin, source: window };
    render(<MemoryRouter><TemplateExperience tpl={SILK_HERITAGE_TEMPLATE} preview previewChannel={channel} /></MemoryRouter>);
    await screen.findByRole("heading", { level: 1, name: new RegExp(`${SILK_HERITAGE_TEMPLATE.groom}.*${SILK_HERITAGE_TEMPLATE.bride}`) });
    const send = (origin, data, type = "LIVE_PREVIEW_SYNC") => act(() => window.dispatchEvent(new MessageEvent("message", { origin, source: window, data: { type, sessionId, data, open: false } })));
    send("https://attacker.invalid", { groomName: "Unsafe name" });
    expect(screen.queryByText("Unsafe name")).not.toBeInTheDocument();
    send(window.location.origin, { groomName: "Edited groom", photos: [], schedule: [] });
    await waitFor(() => expect(screen.getByRole("heading", { level: 1, name: /Edited groom/ })).toBeInTheDocument());
    expect(screen.queryByRole("heading", { name: /wedding program/i })).not.toBeInTheDocument();
    send(window.location.origin, undefined, "TOGGLE_GATE");
    expect(screen.getByRole("button", { name: /Open invitation/ })).toBeInTheDocument();
  });

  it("degrades a failed portrait to an ornamental surface", () => {
    show({ preview: true, content: { coverImage: "/missing.jpg", languageMode: "en" } });
    fireEvent.error(screen.getByRole("img", { name: "The couple's portrait" }));
    expect(screen.getByRole("img", { name: "The couple's portrait" }).tagName).toBe("DIV");
  });

  it("keeps per-element font controls connected to the rendered names and date", () => {
    show({ preview: true, content: { languageMode: "kh", dateText: "ថ្ងៃមង្គល", elementFonts: { couple: "Bayon", date: "Battambang" } } });
    expect(screen.getByRole("heading", { name: /សុវណ្ណ.*សុភា/ }).style.fontFamily).toContain("Bayon");
    expect(document.querySelector(".sh-hero-date").style.fontFamily).toContain("Battambang");
  });

  it("keeps Khmer-name fallback readable in an English invitation", () => {
    show({ preview: true, content: { languageMode: "en", groom: "សុវណ្ណ", bride: "សុភា", groomEn: "", brideEn: "" } });
    const name = screen.getByRole("heading", { name: /សុវណ្ណ.*សុភា/ }).querySelector('[lang="km"]');
    expect(name.style.fontFamily).toBe("var(--sh-display)");
    expect(name.style.lineHeight).toBe("1.9");
  });
});
