import { describe, expect, it } from "vitest";

import { draftToTemplate } from "./draftToTemplate";
import { buildTemplateContent } from "@/features/templates";

import {
    draftToInvitationPayload,
    publicInvitationToDraft,
} from "./invitationDraftAdapter";

function draft() {
    return {
        id: "draft-1",
        templateId: "garden-royal-khmer-wedding",
        couple: { groom: "សុវណ្ណ", bride: "មាលា" },
        event: { date: "2026-12-12", ceremonyTime: "07:00", venueName: "ភ្នំពេញ" },
        opening: {
            heading: "ពិធីមង្គលការ",
            invitationText: "សូមគោរពអញ្ជើញ",
            genericGuestText: "លោកអ្នក និងក្រុមគ្រួសារ",
            openButtonText: "បើកសំបុត្រ",
        },
        design: {
            monogramText: "ស & ម",
            openingStyle: "khmer-royal",
            openingOverlayOpacity: 0.56,
            frameStyle: "double-gold",
            ornamentStyle: "khmer-corner-01",
        },
        openingVideo: { id: "video", name: "opening", url: "https://cdn.example/opening.mp4" },
        openingVideoEnabled: true,
        enabledSections: {
            countdown: false,
            story: false,
            gallery: false,
            schedule: false,
            map: false,
            party: false,
            gift: false,
            faq: false,
            rsvp: false,
        },
        rsvp: { enabled: false },
    };
}

describe("invitation draft adapters", () => {
    it("preserves every supported disabled section and opening configuration in backend JSON", () => {
        const payload = draftToInvitationPayload(draft(), 99);
        const content = JSON.parse(payload.contentJson);
        const design = JSON.parse(payload.designJson);
        const enabled = JSON.parse(payload.enabledSections);

        expect(content.opening.openButtonText).toBe("បើកសំបុត្រ");
        expect(content.openingVideo.url).toBe("https://cdn.example/opening.mp4");
        expect(design.openingOverlayOpacity).toBe(0.56);
        expect(enabled).toMatchObject({
            countdown: false,
            story: false,
            gallery: false,
            schedule: false,
            map: false,
            party: false,
            gift: false,
            faq: false,
            rsvp: false,
        });
    });

    it("never serializes temporary blob or data gallery previews into published JSON", () => {
        const payload = draftToInvitationPayload({
            ...draft(),
            gallery: [
                { preview: "blob:https://app.example/local-preview" },
                { preview: "data:image/png;base64,AAAA" },
                { preview: "https://cdn.example/gallery.webp" },
            ],
        }, 99);

        expect(JSON.parse(payload.contentJson).gallery).toEqual([
            expect.objectContaining({ preview: "https://cdn.example/gallery.webp" }),
        ]);
    });

    it("keeps opening video and copy through the local draft-to-template mapping", () => {
        const merged = draftToTemplate(draft(), []);
        expect(merged.tpl.openingVideo.url).toBe("https://cdn.example/opening.mp4");
        expect(merged.tpl.opening.openButtonText).toBe("បើកសំបុត្រ");
        expect(merged.tpl.hostContent.enabledSections.gallery).toBe(false);
    });

    it("reconstructs public media with video, cover, music, guest, and JSON settings in priority order", () => {
        const invitation = {
            id: 7,
            slug: "wedding",
            groomName: "សុវណ្ណ",
            brideName: "មាលា",
            eventDate: "2026-12-12",
            venueName: "ភ្នំពេញ",
            designJson: JSON.stringify({
                templateId: "garden-royal-khmer-wedding",
                openingStyle: "paper",
                openingVideoUrl: "https://configured.example/opening.mp4",
                openingOverlayOpacity: 0.62,
            }),
            contentJson: JSON.stringify({
                opening: { openButtonText: "ចូលរួមពិធី" },
                openingVideo: { url: "https://content.example/opening.mp4" },
            }),
            enabledSections: JSON.stringify({ rsvp: true, gallery: false }),
            layoutSettings: JSON.stringify({ openingVideoEnabled: true }),
            guest: { guestName: "លោក វិសាល", guestGroup: "Family", seatCount: 2 },
        };
        const media = {
            coverImage: { id: 1, fileUrl: "https://cdn.example/cover.webp", originalFilename: "cover.webp" },
            video: { id: 2, fileUrl: "https://cdn.example/video.mp4", originalFilename: "video.mp4" },
            backgroundMusic: { id: 3, fileUrl: "https://cdn.example/music.mp3", originalFilename: "music.mp3" },
            galleryImages: [],
        };

        const reconstructed = publicInvitationToDraft(invitation, media);
        expect(reconstructed.coverImage).toBe("https://cdn.example/cover.webp");
        expect(reconstructed.openingVideo.url).toBe("https://cdn.example/video.mp4");
        expect(reconstructed.music.url).toBe("https://cdn.example/music.mp3");
        expect(reconstructed.opening.openButtonText).toBe("ចូលរួមពិធី");
        expect(reconstructed.design.openingStyle).toBe("paper");
        expect(reconstructed.guest.guestName).toBe("លោក វិសាល");
        expect(reconstructed.enabledSections.gallery).toBe(false);

        const merged = draftToTemplate(reconstructed, reconstructed.gallery);
        const normalized = buildTemplateContent(merged.tpl, merged.variant);
        expect(normalized.openingVideo.url).toBe("https://cdn.example/video.mp4");
    });

    it("uses generic guest data when the public response has no secure guest match", () => {
        const reconstructed = publicInvitationToDraft({
            slug: "wedding",
            designJson: "{}",
            contentJson: "{}",
            enabledSections: "{}",
        }, {});
        expect(reconstructed.guest).toBeNull();
    });

    it("maps saved gallery fields when the media endpoint has no images", () => {
        const reconstructed = publicInvitationToDraft({
            galleryImages: [{ id: 1, fileUrl: "https://cdn.example/gallery-one.webp" }],
            gallery_urls: ["https://cdn.example/gallery-two.webp"],
            designJson: JSON.stringify({
                photos: [{ id: "p3", url: "https://cdn.example/gallery-three.webp" }],
            }),
            contentJson: "{}",
        }, { galleryImages: [] });

        expect(reconstructed.gallery).toEqual([
            expect.objectContaining({ preview: "https://cdn.example/gallery-one.webp" }),
        ]);
    });
});
