import { beforeEach, describe, expect, it, vi } from "vitest";

const { calls, invitationService, mediaService, templateService } = vi.hoisted(() => {
    const order = [];
    return {
        calls: order,
        invitationService: {
            create: vi.fn(async () => { order.push("save"); return { id: 42, status: "DRAFT" }; }),
            update: vi.fn(async () => { order.push("customization"); return { id: 42, status: "DRAFT" }; }),
            saveDraft: vi.fn(async () => ({ id: 42, status: "DRAFT", slug: "wedding" })),
            publish: vi.fn(async () => { order.push("publish"); return { id: 42, status: "PUBLISHED", slug: "wedding", publishedAt: "2026-07-22T00:00:00Z" }; }),
        },
        mediaService: {
            uploadCover: vi.fn(),
            uploadGallery: vi.fn(),
            uploadVideo: vi.fn(),
            uploadMusic: vi.fn(),
            remove: vi.fn(),
            list: vi.fn(async () => { order.push("media"); return { galleryImages: [] }; }),
        },
        templateService: {
            getPublic: vi.fn(async () => ({ id: 4 })),
            getPublicBySlug: vi.fn(async () => ({ id: 9 })),
        },
    };
});

vi.mock("../../invitations/api/invitationApi", () => ({ invitationService, default: invitationService }));
vi.mock("../../invitations/api/mediaApi", () => ({ mediaService, default: mediaService }));
vi.mock("../../templates/api/templateService", () => ({
    default: templateService,
    templateService,
}));


vi.mock("../../../shared/storage/galleryStorage", () => ({
    loadGallery: vi.fn(async () => []),
    saveGallery: vi.fn(async () => undefined),
}));
vi.mock("../../../shared/storage/draftMediaStorage", () => ({
    deleteDraftMediaFile: vi.fn(async () => undefined),
    loadDraftMediaFiles: vi.fn(async () => ({})),
}));

import { persistWeddingDraft, validateDraftForPublish } from "./draftPublishApi";

function validDraft() {
    return {
        id: "draft-1",
        templateId: "garden-royal-khmer-wedding",
        couple: { groom: "សុវណ្ណ", bride: "មាលា" },
        event: { date: "2026-12-12", ceremonyTime: "07:00", venueName: "ភ្នំពេញ" },
        enabledSections: { rsvp: true },
        rsvp: { enabled: true },
    };
}

describe("real backend publishing", () => {
    beforeEach(() => {
        calls.length = 0;
        vi.clearAllMocks();
    });

    it("validates required fields before any backend mutation", async () => {
        expect(() => validateDraftForPublish({ templateId: "garden-royal-khmer-wedding", couple: {}, event: {} }))
            .toThrow("សូមបំពេញព័ត៌មានចាំបាច់");
        await expect(persistWeddingDraft({ templateId: "garden-royal-khmer-wedding", couple: {}, event: {} }, { publish: true }))
            .rejects.toThrow("សូមបំពេញព័ត៌មានចាំបាច់");
        expect(invitationService.create).not.toHaveBeenCalled();
    });

    it.each([4, "4", " 4 "])("syncs a saved draft with numeric template reference %j", async (templateId) => {
        await persistWeddingDraft({ ...validDraft(), templateId });

        expect(templateService.getPublic).toHaveBeenCalledWith("4");
        expect(templateService.getPublicBySlug).not.toHaveBeenCalled();
        expect(invitationService.create).toHaveBeenCalledWith(expect.objectContaining({ templateId: 4 }));
        expect(invitationService.update).toHaveBeenCalledWith(42, expect.objectContaining({ templateId: 4 }));
    });

    it("resolves a template slug even when the draft has an older backend template ID", async () => {
        await persistWeddingDraft({ ...validDraft(), templateId: "khmer-celestial", backendTemplateId: 2 });

        expect(templateService.getPublicBySlug).toHaveBeenCalledWith("khmer-celestial");
        expect(templateService.getPublic).not.toHaveBeenCalled();
        expect(invitationService.create).toHaveBeenCalledWith(expect.objectContaining({ templateId: 9 }));
    });

    it("preserves a missing-template failure without saving with another template", async () => {
        templateService.getPublicBySlug.mockRejectedValueOnce(new Error("Template not found"));

        await expect(persistWeddingDraft({ ...validDraft(), templateId: "deleted-template" }))
            .rejects.toThrow("Template not found");
        expect(invitationService.create).not.toHaveBeenCalled();
        expect(invitationService.update).not.toHaveBeenCalled();
    });

    it("saves, reconnects media/customization, then publishes and returns a backend-confirmed link patch", async () => {
        const result = await persistWeddingDraft(validDraft(), { publish: true });
        expect(calls).toEqual(["save", "media", "customization", "publish"]);
        expect(result.patch).toMatchObject({
            backendInvitationId: 42,
            backendStatus: "PUBLISHED",
            slug: "wedding",
            pendingMedia: {},
        });
    });

    it("propagates backend publication failure without manufacturing a local published state", async () => {
        invitationService.publish.mockRejectedValueOnce(new Error("backend failed"));
        const failure = await persistWeddingDraft(validDraft(), { publish: true }).catch((error) => error);
        expect(failure.message).toBe("backend failed");
        expect(failure.partialPatch).toMatchObject({
            backendInvitationId: 42,
            backendStatus: "DRAFT",
            publishedAt: null,
        });
    });

    it("keeps the created backend invitation id after a partial media failure so retry updates instead of duplicating", async () => {
        mediaService.list.mockRejectedValueOnce(new Error("storage unavailable"));
        const failure = await persistWeddingDraft(validDraft(), { publish: true }).catch((error) => error);

        expect(failure.partialPatch.backendInvitationId).toBe(42);
        expect(invitationService.create).toHaveBeenCalledTimes(1);

        await persistWeddingDraft({ ...validDraft(), ...failure.partialPatch }, { publish: true });
        expect(invitationService.create).toHaveBeenCalledTimes(1);
        expect(invitationService.update).toHaveBeenCalledWith(42, expect.any(Object));
    });

    it("removes host-deleted remote media before persisting the final customization", async () => {
        mediaService.list
            .mockResolvedValueOnce({
                coverImage: { id: 7 },
                galleryImages: [{ id: 8, fileUrl: "https://cdn.example/gallery.jpg" }],
            })
            .mockResolvedValueOnce({ galleryImages: [] });

        const result = await persistWeddingDraft({
            ...validDraft(),
            removedMedia: { cover: true },
            removedGalleryMediaIds: [8],
        }, { publish: true });

        expect(mediaService.remove).toHaveBeenNthCalledWith(1, 42, 7);
        expect(mediaService.remove).toHaveBeenNthCalledWith(2, 42, 8);
        expect(result.patch.removedGalleryMediaIds).toEqual([]);
    });

    it("uploads inline gallery photos from the draft when the gallery cache is empty", async () => {
        mediaService.uploadGallery.mockResolvedValueOnce([
            { id: 11, fileUrl: "https://cdn.example/gallery.png", originalFilename: "gallery-1.png" },
        ]);
        await persistWeddingDraft({
            ...validDraft(),
            gallery: [{ id: "photo-1", preview: "data:image/png;base64,aGVsbG8=", type: "image" }],
        }, { publish: false });

        expect(mediaService.uploadGallery).toHaveBeenCalledTimes(1);
        const [invitationId, files] = mediaService.uploadGallery.mock.calls[0];
        expect(invitationId).toBe(42);
        expect(files[0].type).toBe("image/png");
    });
});
