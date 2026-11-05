import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import TemplateQuickNav from "./TemplateQuickNav";
import { useLanguageStore } from "@/stores/useLanguageStore";

beforeEach(() => {
    useLanguageStore.setState({ lang: "km" });
});

afterEach(cleanup);

describe("TemplateQuickNav", () => {
    it("renders quick navigation items filtered by enabledSections in Khmer", () => {
        const enabled = {
            schedule: true,
            venue: true,
            gallery: false,
            gift: false,
            rsvp: true,
        };
        render(<TemplateQuickNav enabledSections={enabled} onNavigate={() => {}} />);
        
        expect(screen.getByRole("navigation", { name: "រុករកសន្លឹកការ" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "កម្មវិធី" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "ទីតាំង" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "ឆ្លើយតប" })).toBeInTheDocument();

        // Disabled sections should not appear
        expect(screen.queryByRole("button", { name: "រូបភាព" })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "ចំណងដៃ" })).not.toBeInTheDocument();
    });

    it("renders English labels when store language is English", () => {
        useLanguageStore.setState({ lang: "en" });
        const enabled = {
            schedule: true,
            venue: true,
            gallery: true,
            gift: true,
            rsvp: true,
        };
        render(<TemplateQuickNav enabledSections={enabled} onNavigate={() => {}} />);

        expect(screen.getByRole("navigation", { name: "Invitation navigation" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Program" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Venue" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Gallery" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Gift QR" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "RSVP" })).toBeInTheDocument();
    });

    it("calls onNavigate callback when clicking a section item", () => {
        const handleNavigate = vi.fn();
        const enabled = { schedule: true };
        render(<TemplateQuickNav enabledSections={enabled} onNavigate={handleNavigate} />);

        const scheduleBtn = screen.getByRole("button", { name: "កម្មវិធី" });
        fireEvent.click(scheduleBtn);
        expect(handleNavigate).toHaveBeenCalledWith("schedule");
    });
});
