import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PublicRsvpForm from "./PublicRsvpForm";

afterEach(() => {
    cleanup();
    localStorage.clear();
});

vi.mock("@/features/rsvp/api/rsvpApi", () => ({
    rsvpService: {
        publicWishes: vi.fn().mockResolvedValue([]),
        submitPublic: vi.fn().mockResolvedValue({
            id: 10,
            guestName: "Samnang",
            inviteToken: "token-12345",
            responseStatus: "ATTENDING",
            attendeeCount: 2,
            message: "Congratulations!",
        }),
        submitPublicWithToken: vi.fn().mockResolvedValue({
            id: 10,
            guestName: "Samnang",
            inviteToken: "token-existing",
            responseStatus: "ATTENDING",
            attendeeCount: 1,
        }),
    },
}));

vi.mock("@/features/invitations/api/invitationApi", () => ({
    invitationService: {
        publicGuestView: vi.fn().mockImplementation((slug, { token }) => {
            if (token === "token-already-responded") {
                return Promise.resolve({
                    guestName: "Sokha",
                    rsvpStatus: "ATTENDING",
                    seatCount: 2,
                    tableName: "VIP Table 1",
                    seatNumber: "A1",
                });
            }
            if (token === "token-pending") {
                return Promise.resolve({
                    guestName: "Bopha",
                    rsvpStatus: "PENDING",
                    seatCount: 1,
                });
            }
            return Promise.reject(new Error("Token not found"));
        }),
    },
}));

describe("PublicRsvpForm Feature", () => {
    it("renders RSVP form when guest has not yet responded", async () => {
        render(<PublicRsvpForm slug="my-wedding" khmerLabels={true} />);

        await waitFor(() => {
            expect(screen.getByText("តើលោកអ្នកនឹងចូលរួមដែរឬទេ?")).toBeInTheDocument();
            expect(screen.getByText("ផ្ញើ RSVP")).toBeInTheDocument();
        });
    });

    it("immediately shows QR pass without requiring fill again when guest already responded (1 guest 1 QR)", async () => {
        render(<PublicRsvpForm slug="my-wedding" inviteToken="token-already-responded" khmerLabels={true} />);

        await waitFor(() => {
            expect(screen.getByText("🎫 ប័ណ្ណស្កេនចូលរួម (QR Pass)")).toBeInTheDocument();
            expect(screen.getByText("Sokha")).toBeInTheDocument();
            expect(screen.getByText(/VIP Table 1/)).toBeInTheDocument();
            // Should not show the submit button
            expect(screen.queryByText("ផ្ញើ RSVP")).not.toBeInTheDocument();
        });
    });

    it("restores QR pass from localStorage when public guest returns to page", async () => {
        localStorage.setItem(
            "koupreng_guest_rsvp_my-wedding",
            JSON.stringify({
                guestName: "Dara Cached",
                inviteToken: "dara-token-999",
                responseStatus: "ATTENDING",
                attendeeCount: 1,
            })
        );

        render(<PublicRsvpForm slug="my-wedding" khmerLabels={true} />);

        await waitFor(() => {
            expect(screen.getByText("🎫 ប័ណ្ណស្កេនចូលរួម (QR Pass)")).toBeInTheDocument();
            expect(screen.getByText("Dara Cached")).toBeInTheDocument();
            expect(screen.queryByText("ផ្ញើ RSVP")).not.toBeInTheDocument();
        });
    });

    it("submits RSVP form and immediately displays the generated QR pass with token", async () => {
        render(<PublicRsvpForm slug="my-wedding" khmerLabels={true} />);

        const nameInput = screen.getByLabelText(/ឈ្មោះភ្ញៀវ/i);
        fireEvent.change(nameInput, { target: { value: "Samnang" } });

        const submitBtn = screen.getByRole("button", { name: /ផ្ញើ RSVP/i });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(screen.getByText("🎫 ប័ណ្ណស្កេនចូលរួម (QR Pass)")).toBeInTheDocument();
            expect(screen.getAllByText(/Samnang/).length).toBeGreaterThanOrEqual(1);
            expect(screen.getByRole("button", { name: /កែប្រែការឆ្លើយតប/i })).toBeInTheDocument();
        });
    });
});
