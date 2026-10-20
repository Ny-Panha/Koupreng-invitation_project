import { act, render, renderHook, screen, waitFor, cleanup } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import EventsFeature from "./EventsFeature";
import { useEvents } from "./hooks/useEvents";
import { eventsApi } from "./api/eventsApi";
import { getDraft, saveDraft } from "../../shared/storage/weddingStorage";
import { persistWeddingDraft } from "../wedding-builder/utils/draftPublishApi";
import { toast } from "../../shared/ui/toast";

vi.mock("../../shared/i18n/useBackendMessages", () => ({
    useBackendMessages: () => ({ text: () => "" }),
}));
vi.mock("../wedding-builder/utils/draftPublishApi", () => ({ persistWeddingDraft: vi.fn() }));
vi.mock("../auth/hooks/useAuth", () => ({ useAuth: () => ({ user: null }) }));

describe("Events Feature", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        persistWeddingDraft.mockResolvedValue({ response: { id: 123 }, patch: { backendInvitationId: 123 } });
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it("renders events list with wedding invitations", async () => {
        vi.spyOn(eventsApi, "listMine").mockResolvedValue([
            {
                id: "evt-1",
                title: "Dara & Sophea Wedding",
                status: "PUBLISHED",
                eventDate: "2026-11-20",
                coverImage: "/test-cover.jpg",
                groomName: "Dara",
                brideName: "Sophea",
            },
        ]);

        render(
            <BrowserRouter>
                <EventsFeature />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Dara & Sophea Wedding")).toBeInTheDocument();
            expect(screen.getByText("Dara & Sophea")).toBeInTheDocument();
        });
    });

    it("automatically syncs browser-only drafts without adding sync controls to the card", async () => {
        vi.spyOn(eventsApi, "listMine").mockResolvedValue([]);
        const warning = vi.spyOn(toast, "warning");
        persistWeddingDraft.mockRejectedValueOnce(new Error("template unavailable"));
        saveDraft({ id: "wed-local-only", title: "Khmer Celestial", status: "DRAFT", syncStatus: "LOCAL_ONLY" });

        render(
            <BrowserRouter>
                <EventsFeature />
            </BrowserRouter>
        );

        expect(await screen.findByText("Khmer Celestial")).toBeInTheDocument();
    await waitFor(() => expect(persistWeddingDraft).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(getDraft("wed-local-only")?.syncError).toBe("template unavailable"));
    expect(getDraft("wed-local-only")).toMatchObject({
        title: "Khmer Celestial",
        syncStatus: "LOCAL_ONLY",
    });
    expect(warning).not.toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: /Sync now|សាកម្ដងទៀត/ })).not.toBeInTheDocument();
    expect(screen.queryByText(/Not in Admin yet|Changes not synced/)).not.toBeInTheDocument();
    });

    it("warns when an explicitly requested draft sync fails and retains the draft", async () => {
        vi.spyOn(eventsApi, "listMine").mockResolvedValue([]);
        const warning = vi.spyOn(toast, "warning");
        persistWeddingDraft.mockRejectedValueOnce(new Error("Template not found"));
        const draft = { id: "wed-manual-sync", title: "Wedding draft", templateId: "removed-template" };
        const { result } = renderHook(() => useEvents());

        await act(async () => { await result.current.syncDraft(draft); });

        expect(warning).toHaveBeenCalledWith("មិនអាច sync បានទេ: Template not found");
        expect(getDraft(draft.id)).toMatchObject({
            ...draft,
            syncStatus: "LOCAL_ONLY",
            syncError: "Template not found",
        });
    });

    it("marks a local draft as synced when it appears in the backend list", async () => {
        vi.spyOn(eventsApi, "listMine").mockResolvedValue([{ id: 101, title: "Khmer Celestial", status: "DRAFT" }]);
        saveDraft({
            id: "wed-local-only",
            backendInvitationId: 101,
            title: "Khmer Celestial",
            status: "DRAFT",
            syncStatus: "LOCAL_ONLY",
        });

        const { result } = renderHook(() => useEvents());

        await waitFor(() => expect(result.current.drafts[0]?.syncStatus).toBe("SYNCED"));
        expect(result.current.drafts[0].syncStatus).toBe("SYNCED");
        expect(result.current.drafts[0].id).toBe(101);
    });

    it("automatically syncs a browser-only draft after the backend list loads", async () => {
        vi.spyOn(eventsApi, "listMine").mockResolvedValue([]);
        saveDraft({ id: "wed-khmer-celestial", title: "Khmer Celestial", status: "DRAFT", syncStatus: "LOCAL_ONLY" });

        render(
            <BrowserRouter>
                <EventsFeature />
            </BrowserRouter>
        );

        await waitFor(() => expect(persistWeddingDraft).toHaveBeenCalledWith(expect.objectContaining({ id: "wed-khmer-celestial" })));
        expect(screen.getByText("Khmer Celestial")).toBeInTheDocument();
    });

    it("reuses a backend ID returned by a partial sync on the next automatic attempt", async () => {
        vi.spyOn(eventsApi, "listMine").mockResolvedValue([]);
        const partialFailure = Object.assign(new Error("Media upload failed"), {
            partialPatch: { backendInvitationId: 123 },
        });
        persistWeddingDraft.mockRejectedValueOnce(partialFailure);
        saveDraft({ id: "wed-partial-sync", title: "Khmer Celestial", status: "DRAFT", syncStatus: "LOCAL_ONLY" });

        const { unmount } = renderHook(() => useEvents());
        await waitFor(() => expect(persistWeddingDraft).toHaveBeenCalledTimes(1));
        expect(getDraft("wed-partial-sync").backendInvitationId).toBe(123);

        unmount();
        persistWeddingDraft.mockResolvedValueOnce({ response: { id: 123 }, patch: { backendInvitationId: 123 } });
        renderHook(() => useEvents());
        await waitFor(() => expect(persistWeddingDraft).toHaveBeenCalledTimes(2));
        expect(persistWeddingDraft.mock.calls[1][0].backendInvitationId).toBe(123);
    });

    it("preserves local edits when updating an existing backend invitation fails", async () => {
        vi.spyOn(eventsApi, "listMine").mockResolvedValue([
            { id: 101, title: "Old server title", status: "DRAFT" },
        ]);
        persistWeddingDraft.mockRejectedValueOnce(new Error("offline"));
        saveDraft({
            id: "wed-local-only",
            backendInvitationId: 101,
            title: "Updated local title",
            status: "DRAFT",
            syncStatus: "SYNC_FAILED",
        });

        const { result } = renderHook(() => useEvents());

        await waitFor(() => expect(result.current.drafts[0]?.syncStatus).toBe("SYNC_FAILED"));
        expect(result.current.drafts[0].title).toBe("Updated local title");
    });

    it("opens delete confirmation modal when delete button is clicked", async () => {
        vi.spyOn(eventsApi, "listMine").mockResolvedValue([
            {
                id: "evt-1",
                title: "Dara & Sophea Wedding",
                status: "PUBLISHED",
                eventDate: "2026-11-20",
                coverImage: "/test-cover.jpg",
                groomName: "Dara",
                brideName: "Sophea",
            },
        ]);

        render(
            <BrowserRouter>
                <EventsFeature />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Dara & Sophea Wedding")).toBeInTheDocument();
        });

        const moreBtn = screen.getByRole("button", { name: /ជម្រើស|More/i });
        moreBtn.click();

        const deleteBtn = await screen.findByRole("button", { name: /Delete|លុប/i });
        deleteBtn.click();

        await waitFor(() => {
            expect(screen.getByRole("dialog")).toBeInTheDocument();
        });
    });

    it("successfully deletes event from API and UI when confirmed", async () => {
        vi.spyOn(eventsApi, "listMine").mockResolvedValue([
            {
                id: "123",
                title: "To Be Deleted Event",
                status: "DRAFT",
            },
        ]);
        const removeSpy = vi.spyOn(eventsApi, "remove").mockResolvedValue({});

        render(
            <BrowserRouter>
                <EventsFeature />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("To Be Deleted Event")).toBeInTheDocument();
        });

        const moreBtn = screen.getByRole("button", { name: /ជម្រើស|More/i });
        moreBtn.click();

        const deleteBtn = await screen.findByRole("button", { name: /Delete|លុប/i });
        deleteBtn.click();

        await waitFor(() => {
            expect(screen.getByRole("dialog")).toBeInTheDocument();
        });

        // Click the confirm button in the dialog
        const confirmBtn = screen.getByRole("button", { name: /យល់ព្រម|លុបកម្មវិធី|Confirm/i });
        confirmBtn.click();

        await waitFor(() => {
            expect(removeSpy).toHaveBeenCalledWith("123");
            expect(screen.queryByText("To Be Deleted Event")).not.toBeInTheDocument();
        });
    });

    it("does not navigate when clicking on the event card, but navigates to edit page from the menu", async () => {
        vi.spyOn(eventsApi, "listMine").mockResolvedValue([
            {
                id: "evt-card-click",
                title: "Card Click Wedding",
                status: "DRAFT",
            },
        ]);

        render(
            <BrowserRouter>
                <EventsFeature />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Card Click Wedding")).toBeInTheDocument();
        });

        const initialPath = window.location.pathname;
        const card = screen.getByText("Card Click Wedding").closest(".event-card");
        expect(card).toBeInTheDocument();
        card.click();

        // Clicking the card does NOT navigate
        expect(window.location.pathname).toBe(initialPath);

        // Menu edit option navigates
        const moreBtn = screen.getByRole("button", { name: /ជម្រើស|More/i });
        moreBtn.click();

        const editBtn = await screen.findByRole("button", { name: /Edit|កែសម្រួល/i });
        editBtn.click();

        expect(window.location.pathname).toBe("/dashboard/invitations/evt-card-click/edit");
    });
});

