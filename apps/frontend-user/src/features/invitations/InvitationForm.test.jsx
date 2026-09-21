import { act, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
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

import { templateCatalogService } from "../templates/api/templateCatalogApi";

beforeEach(() => {
  templateCatalogService.list.mockReset();
  // Empty by default: InvitationForm skips registration when the list is empty,
  // so tests that call registerDynamicTemplates() directly stay in control.
  templateCatalogService.list.mockResolvedValue([]);
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
