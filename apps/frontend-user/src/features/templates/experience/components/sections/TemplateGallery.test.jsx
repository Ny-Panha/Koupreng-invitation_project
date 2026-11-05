import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import TemplateGallery from "./TemplateGallery";

afterEach(cleanup);

describe("TemplateGallery", () => {
    const sampleImages = [
        { src: "/images/wedding1.jpg", span: "large" },
        { src: "/images/wedding2.jpg", span: "small" },
        { src: "/images/wedding3.jpg", span: "small" },
    ];

    it("renders gallery items with appropriate accessible labels", () => {
        render(<TemplateGallery content={{ gallery: sampleImages }} />);
        const buttons = screen.getAllByRole("button", { name: /មើលរូបភាពទី/i });
        expect(buttons).toHaveLength(3);
    });

    it("opens lightbox on item click and displays navigation and counter", () => {
        render(<TemplateGallery content={{ gallery: sampleImages }} />);
        const firstItem = screen.getByRole("button", { name: "មើលរូបភាពទី 1" });
        fireEvent.click(firstItem);

        // Lightbox dialog should be open
        const dialog = screen.getByRole("dialog", { name: "រូបភាព" });
        expect(dialog).toBeInTheDocument();

        // Counter should show 1 / 3
        expect(screen.getByText("1 / 3")).toBeInTheDocument();

        // Prev and Next buttons
        const nextBtn = screen.getByRole("button", { name: "រូបភាពបន្ទាប់" });
        const prevBtn = screen.getByRole("button", { name: "រូបភាពមុន" });
        expect(nextBtn).toBeInTheDocument();
        expect(prevBtn).toBeInTheDocument();

        // Clicking next updates counter to 2 / 3
        fireEvent.click(nextBtn);
        expect(screen.getByText("2 / 3")).toBeInTheDocument();

        // Clicking prev goes back to 1 / 3
        fireEvent.click(prevBtn);
        expect(screen.getByText("1 / 3")).toBeInTheDocument();
    });

    it("navigates images with keyboard ArrowRight and ArrowLeft", () => {
        render(<TemplateGallery content={{ gallery: sampleImages }} />);
        fireEvent.click(screen.getByRole("button", { name: "មើលរូបភាពទី 1" }));
        expect(screen.getByText("1 / 3")).toBeInTheDocument();

        fireEvent.keyDown(window, { key: "ArrowRight" });
        expect(screen.getByText("2 / 3")).toBeInTheDocument();

        fireEvent.keyDown(window, { key: "ArrowLeft" });
        expect(screen.getByText("1 / 3")).toBeInTheDocument();
    });

    it("closes lightbox with close button or Escape key and restores body overflow", () => {
        render(<TemplateGallery content={{ gallery: sampleImages }} />);
        fireEvent.click(screen.getByRole("button", { name: "មើលរូបភាពទី 1" }));
        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(document.body.style.overflow).toBe("hidden");

        const closeBtn = screen.getByRole("button", { name: "បិទ" });
        fireEvent.click(closeBtn);
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        expect(document.body.style.overflow).toBe("");

        // Test Escape key
        fireEvent.click(screen.getByRole("button", { name: "មើលរូបភាពទី 1" }));
        expect(screen.getByRole("dialog")).toBeInTheDocument();
        fireEvent.keyDown(window, { key: "Escape" });
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        expect(document.body.style.overflow).toBe("");
    });
});
