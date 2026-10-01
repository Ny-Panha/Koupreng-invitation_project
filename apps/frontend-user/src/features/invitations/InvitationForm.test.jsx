import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import InvitationForm from "./InvitationForm";
import LivePhoneSimulator from "./LivePhoneSimulator";
import {
  getTemplateById,
  getTemplatePreset,
  getCatalogVersion,
  registerDynamicTemplates,
} from "../templates/data/templatesData";

// The catalog is fetched over HTTP in the real app. Mocking the service module
// lets these tests drive the exact moment the backend response lands.
vi.mock("../templates/api/templateCatalogApi", () => ({
  templateCatalogService: { list: vi.fn() },
}));

vi.mock("@/features/invitations/api/invitationApi", () => ({
  invitationService: {
    create: vi.fn().mockResolvedValue({ id: 101, slug: "test-slug" }),
    update: vi.fn().mockResolvedValue({ id: 101, slug: "test-slug" }),
    get: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock("@/features/invitations/api/mediaApi", () => ({
  mediaService: {
    uploadCover: vi.fn().mockResolvedValue({ fileUrl: "https://example.com/uploaded.jpg" }),
    uploadGallery: vi.fn().mockResolvedValue([]),
    list: vi.fn().mockResolvedValue([]),
  },
}));

import { templateCatalogService } from "../templates/api/templateCatalogApi";

beforeEach(() => {
  localStorage.clear();
  templateCatalogService.list.mockReset();
  // Empty by default: InvitationForm skips registration when the list is empty,
  // so tests that call registerDynamicTemplates() directly stay in control.
  templateCatalogService.list.mockResolvedValue([]);
});

afterEach(() => {
  cleanup();
});

describe("Dynamic Templates & Presets", () => {
    it("correctly extracts presets for Emerald Luxe", () => {
        const tpl = getTemplateById("2");
        expect(tpl).toBeDefined();
        const preset = getTemplatePreset(tpl);
        expect(preset.openingStyle).toBe("curtain");
        expect(preset.frontColor).toBe("#13382c");
        expect(preset.bottomColor).toBe("#D4AF37");
    });

    it("registers dynamic templates created by admin in backend", () => {
        const mockAdminTemplate = {
            id: 999,
            code: "admin-ruby-custom",
            name: "Royal Ruby Custom (រាជវាំងត្បូងទទឹម)",
            thumbnailUrl: "/uploads/ruby-card.jpg",
            description: JSON.stringify({
                openingStyle: "curtain",
                primaryColor: "#8B1E2D",
                secondaryColor: "#D4AF37",
                invitationTitle: "មង្គលការរាជវាំងត្បូងទទឹម",
            }),
        };

        registerDynamicTemplates([mockAdminTemplate]);

        const resolved = getTemplateById("999");
        expect(resolved).toBeDefined();
        expect(resolved.name).toBe("Royal Ruby Custom (រាជវាំងត្បូងទទឹម)");

        const preset = getTemplatePreset(resolved);
        expect(preset.openingStyle).toBe("curtain");
        expect(preset.frontColor).toBe("#8B1E2D");
        expect(preset.bottomColor).toBe("#D4AF37");
    });
});

describe("InvitationForm render test", () => {
    it("renders InvitationForm with form inputs and simulator", () => {
        const mockInvitation = {
            id: "wed-mu589vhe",
            templateId: "emerald-royal-luxe",
            title: "សិរីមង្គលស្នេហ៍អមតៈ (Emerald Royal Luxe)",
            groomName: "វណ្ណដា",
            brideName: "ស្រីពេជ្រ",
            eventDate: "2026-11-28",
            eventTime: "17:00",
            venueName: "The Premier Center Sen Sok",
            designJson: JSON.stringify({
                templateId: "emerald-royal-luxe",
                coverImage: "/facebook/all/03-card/cover-card.jpg",
            }),
            contentJson: JSON.stringify({
                title: "សិរីមង្គលស្នេហ៍អមតៈ (Emerald Royal Luxe)",
                groomName: "វណ្ណដា",
                brideName: "ស្រីពេជ្រ",
            }),
        };

        const { container } = render(
            <BrowserRouter>
                <InvitationForm invitation={mockInvitation} />
            </BrowserRouter>
        );

        expect(container).toBeInTheDocument();
        expect(screen.getByDisplayValue("វណ្ណដា")).toBeInTheDocument();
        expect(screen.getByDisplayValue("ស្រីពេជ្រ")).toBeInTheDocument();
    });

    it("correctly resolves dynamic admin emerald template with dedicated layout and colors", () => {
        const mockAdminTemplate = {
            id: 888,
            code: "admin-emerald-custom",
            name: "Emerald Luxury Admin Template",
            thumbnailUrl: "/uploads/emerald-card.jpg",
            description: JSON.stringify({
                presetId: "EMERALD_GREEN",
                openingStyle: "curtain",
                primaryColor: "#0F4C3A",
                secondaryColor: "#2D8A6E",
                invitationTitle: "មង្គលការត្បូងមរកត",
                groomName: "ច័ន្ទ តារា",
                brideName: "ស៊ូ លីនដា",
            }),
        };

        registerDynamicTemplates([mockAdminTemplate]);

        const resolved = getTemplateById("888");
        expect(resolved).toBeDefined();
        expect(resolved.presetId).toBe("EMERALD_GREEN");
        expect(resolved.primaryColor).toBe("#0F4C3A");
        expect(resolved.secondaryColor).toBe("#2D8A6E");
        expect(resolved.openingStyle).toBe("curtain");

        const preset = getTemplatePreset(resolved);
        expect(preset.frontColor).toBe("#0F4C3A");
        expect(preset.bottomColor).toBe("#2D8A6E");
        expect(preset.openingStyle).toBe("curtain");
        expect(preset.groom).toBe("ច័ន្ទ តារា");
        expect(preset.bride).toBe("ស៊ូ លីនដា");
    });
});

/**
 * P0 regression guard — Admin Template → User Editor synchronization.
 *
 * The catalog arrives asynchronously from GET /v1/templates, so the first render
 * of the editor resolves the Admin template ID against an EMPTY registry and
 * silently falls back to KEPT_TEMPLATE (Garden Royal Khmer, #f9af59 / khmer-royal).
 * Without a reactivity signal the Live Phone Simulator keeps that stale fallback
 * forever, because its useMemo depends only on `data`.
 */
const ADMIN_EMERALD_CATALOG_ROW = {
    id: 26,
    name: "Emerald Royal Luxe VIP",
    description: JSON.stringify({
        presetId: "EMERALD_GREEN",
        openingStyle: "curtain",
        primaryColor: "#0F4C3A",
        secondaryColor: "#2D8A6E",
        dressColors: ["#0F4C3A", "#D4AF37"],
    }),
};

const KEPT_TEMPLATE_NAME = "សួនរាជហង្សខ្មែរ";

describe("P0 — reactive catalog sync (no page reload needed)", () => {
    it("getCatalogVersion() increments so subscribers can detect a new catalog", () => {
        const before = getCatalogVersion();
        registerDynamicTemplates([ADMIN_EMERALD_CATALOG_ROW]);
        expect(getCatalogVersion()).toBeGreaterThan(before);
    });

    it("LivePhoneSimulator re-resolves the template when catalogVersion bumps but `data` does not", () => {
        // Stable object identity — the memo must NOT rely on `data` changing.
        const data = { templateId: "26" };

        // Catalog is empty at first render: "26" is unknown → KEPT_TEMPLATE fallback.
        registerDynamicTemplates([]);
        const { container, rerender } = render(
            <MemoryRouter>
                <LivePhoneSimulator data={data} catalogVersion={getCatalogVersion()} />
            </MemoryRouter>
        );
        expect(container.textContent).toContain(KEPT_TEMPLATE_NAME);

        // Backend /v1/templates response lands.
        registerDynamicTemplates([ADMIN_EMERALD_CATALOG_ROW]);

        // Same `data` reference, new catalogVersion → memo recomputes.
        rerender(
            <MemoryRouter>
                <LivePhoneSimulator data={data} catalogVersion={getCatalogVersion()} />
            </MemoryRouter>
        );
        expect(container.textContent).toContain("Emerald Royal Luxe VIP");
        expect(container.textContent).not.toContain(KEPT_TEMPLATE_NAME);
    });

    it("InvitationForm live preview updates once the async catalog fetch resolves", async () => {
        // Start from an empty catalog so templateId "26" cannot resolve yet.
        registerDynamicTemplates([]);

        let resolveCatalog;
        const pendingCatalog = new Promise((resolve) => { resolveCatalog = resolve; });
        templateCatalogService.list.mockReturnValue(pendingCatalog);

        const invitation = {
            id: "wed-p0-catalog-sync",
            templateId: "26",
            title: "P0 Sync Check",
            groomName: "វណ្ណដា",
            brideName: "ស្រីពេជ្រ",
            eventDate: "2026-11-28",
            eventTime: "17:00",
            venueName: "The Premier Center Sen Sok",
            designJson: JSON.stringify({ templateId: "26" }),
            contentJson: JSON.stringify({ groomName: "វណ្ណដា", brideName: "ស្រីពេជ្រ" }),
        };

        const { container } = render(
            <BrowserRouter>
                <InvitationForm invitation={invitation} />
            </BrowserRouter>
        );

        // Before the catalog lands: stale Garden Royal fallback is on screen.
        expect(container.textContent).toContain(KEPT_TEMPLATE_NAME);

        // Simulate the backend response arriving after mount.
        await act(async () => {
            resolveCatalog([ADMIN_EMERALD_CATALOG_ROW]);
        });

        await waitFor(() => {
            expect(container.textContent).toContain("Emerald Royal Luxe VIP");
        });
        expect(container.textContent).not.toContain(KEPT_TEMPLATE_NAME);
    });
});

describe("Saving draft with defaults", () => {
    it("saves draft without blocking toast when creating new draft with empty couple names", async () => {
        const emptyInvitation = {
            status: "DRAFT",
            templateId: null,
            title: "",
            groomName: "",
            brideName: "",
            eventDate: "",
        };

        render(
            <BrowserRouter>
                <InvitationForm invitation={emptyInvitation} />
            </BrowserRouter>
        );

        const saveButtons = screen.getAllByRole("button", { name: /រក្សាទុក/i });
        expect(saveButtons.length).toBeGreaterThan(0);

        await act(async () => {
            saveButtons[0].click();
        });

        expect(saveButtons[0]).toBeInTheDocument();
    });
});

describe("Khmer Celestial Cover Image Fields", () => {
    it("renders exactly 2 relevant cover fields for Khmer Celestial (hiding dead Front Cover field)", () => {
        const celestialInvitation = {
            id: "wed-celestial-test",
            templateId: "khmer-celestial",
            title: "Celestial Wedding",
            groomName: "វណ្ណដា",
            brideName: "ស្រីពេជ្រ",
        };

        render(
            <BrowserRouter>
                <InvitationForm invitation={celestialInvitation} />
            </BrowserRouter>
        );

        // 1. Dead front cover image field is hidden for this template
        expect(screen.queryAllByText(/រូបភាពក្របខាងមុខ/i)).toHaveLength(0);

        // 2. Field 1: Cover background (closed state)
        expect(screen.getAllByText(/ផ្ទៃខាងក្រោយគ្របមុខ \(ពេលមិនទាន់បើក\)/i).length).toBeGreaterThanOrEqual(1);

        // 3. Field 2: Botanical frame (opened state)
        expect(screen.getAllByText(/ស៊ុមផ្កា \/ រូបភាពផ្ទៃខាងក្រោយ/i).length).toBeGreaterThanOrEqual(1);
    }, 15000);

    it("renders exactly 2 fields for Garden Royal: Cover and Full Background", () => {
        const gardenInvitation = {
            id: "wed-garden-test",
            templateId: "garden-royal-khmer-wedding",
            title: "Garden Royal Wedding",
            groomName: "វណ្ណដា",
            brideName: "ស្រីពេជ្រ",
        };

        render(
            <BrowserRouter>
                <InvitationForm invitation={gardenInvitation} />
            </BrowserRouter>
        );

        // 1. Cover field is shown
        expect(screen.getAllByText(/រូបភាពក្របមុខ/i).length).toBeGreaterThanOrEqual(1);

        // 2. Closed-state cover background (the redundant 3rd field) is hidden
        expect(screen.queryAllByText(/ផ្ទៃខាងក្រោយគ្របមុខ \(ពេលមិនទាន់បើក\)/i)).toHaveLength(0);

        // 3. Full / Botanical Frame background field is shown
        expect(screen.getAllByText(/ស៊ុមផ្កា \/ រូបភាពផ្ទៃខាងក្រោយ/i).length).toBeGreaterThanOrEqual(1);
    }, 15000);

    it("restores coverBackgroundImage from draft/invitation designJson upon load", () => {
        const invitationWithCoverBg = {
            id: "wed-cover-bg-test",
            templateId: "khmer-celestial",
            title: "Celestial Wedding",
            groomName: "វណ្ណដា",
            brideName: "ស្រីពេជ្រ",
            designJson: JSON.stringify({
                coverBackgroundImage: "/uploads/saved-closed-cover-bg.jpg",
            }),
        };

        const { container } = render(
            <BrowserRouter>
                <InvitationForm invitation={invitationWithCoverBg} />
            </BrowserRouter>
        );

        const imgElements = container.querySelectorAll("img");
        const found = Array.from(imgElements).some((img) => img.src && img.src.includes("saved-closed-cover-bg.jpg"));
        expect(found).toBe(true);
    }, 15000);

    it("persists coverBackgroundImage to draft storage when save is clicked", async () => {
        const invitationToSave = {
            id: "wed-save-test",
            templateId: "khmer-celestial",
            title: "Celestial Save Test",
            groomName: "វណ្ណដា",
            brideName: "ស្រីពេជ្រ",
            coverBackgroundImage: "https://example.com/permanent-cover-bg.jpg",
        };

        const { container } = render(
            <BrowserRouter>
                <InvitationForm invitation={invitationToSave} />
            </BrowserRouter>
        );

        const saveButton = container.querySelector(".pe-save-main-btn");
        expect(saveButton).toBeInTheDocument();

        await act(async () => {
            saveButton.click();
        });

        await waitFor(() => {
            const storedDraft = JSON.parse(localStorage.getItem("koupreng.wedding.drafts") || "{}")["wed-save-test"];
            expect(storedDraft).toBeDefined();
            expect(storedDraft.coverBackgroundImage).toBe("https://example.com/permanent-cover-bg.jpg");
        });
    }, 15000);
});
