import { render, screen, waitFor, cleanup } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import EventsFeature from "./EventsFeature";
import { eventsApi } from "./api/eventsApi";

describe("Events Feature", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    afterEach(() => {
        cleanup();
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
                id: "evt-to-delete",
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
            expect(removeSpy).toHaveBeenCalledWith("evt-to-delete");
            expect(screen.queryByText("To Be Deleted Event")).not.toBeInTheDocument();
        });
    });
});
