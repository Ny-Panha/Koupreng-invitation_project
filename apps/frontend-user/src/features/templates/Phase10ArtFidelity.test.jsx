import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getDedicatedTemplateComponent, templateRegistry } from "./registry/templateRegistry";
import DigitalYesLayout from "./layouts/DigitalYes/DigitalYesLayout";
import EmeraldLuxeLayout from "./layouts/EmeraldLuxe/EmeraldLuxeLayout";
import CanvaKhmerWeddingTemplate from "./experience/components/canva-khmer/CanvaKhmerWeddingTemplate";
import TemplateBoilerplateLayout from "./layouts/TemplateBoilerplate/TemplateBoilerplateLayout";
import WithJoyPortalLayout from "./layouts/WithJoyPortalLayout";

const sampleWeddingData = {
  groom: "សុក ពិសិដ្ឋ",
  bride: "កែវ ស្រីនិច",
  groomEn: "Piseth Sok",
  brideEn: "Sreynich Keo",
  groomParents: "លោក សុក គង់ និង លោកស្រី ម៉ៅ សុខា",
  brideParents: "លោក កែវ ឡុង និង លោកស្រី ជា ផល្លា",
  dateText: "ថ្ងៃអាទិត្យ ទី២៥ ខែធ្នូ ឆ្នាំ២០២៦",
  targetDate: "2026-12-25T17:00:00",
  venueName: "Sokha Phnom Penh Hotel & Residence",
  venueHall: "បន្ទប់រៀបអាពាហ៍ពិពាហ៍ ជាន់ទី 2",
  venueAddress: "ផ្លូវកែវចិន្តា, សង្កាត់ជ្រោយចង្វារ, រាជធានីភ្នំពេញ",
  googleMapsUrl: "https://maps.google.com/?q=Sokha+Phnom+Penh",
  blessingMessage: "យើងខ្ញុំមានកិត្តិយសសូមគោរពអញ្ជើញ ឯកឧត្តម លោកជំទាវ លោក លោកស្រី...",
  schedule: [
    { time: "07:00 ព្រឹក", title: "ពិធីសូត្រមន្តចម្រើនព្រះបរិត្ត" },
    { time: "08:30 ព្រឹក", title: "ពិធីហែរជំនូន និងកាត់សក់បង្កក់សិរី" },
  ],
  gallery: [
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&auto=format&fit=crop",
  ],
  enabledSections: {
    countdown: true,
    schedule: true,
    map: true,
    gallery: true,
    rsvp: true,
    gift: true,
  },
};

describe("Phase 10.1 Art Fidelity & Opening Accessibility Gates", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  describe("1. Registry Identity & Dedicated UI Resolution", () => {
    const families = [
      "khmer-floral-gold",
      "royal-garden-cinematic",
      "silk-heritage",
      "template-boilerplate",
      "khmer-celestial",
      "the-digital-yes-wedding",
      "emerald-canva-luxe-wedding",
      "withjoy-modern-portal",
      "bliss-editorial-wedding",
      "cover-khmer-golden-wedding",
    ];

    families.forEach((id) => {
      it(`resolves ${id} to a dedicated React lazy layout component in registry`, () => {
        const Resolved = getDedicatedTemplateComponent({ slug: id }, null, false);
        expect(Resolved).toBeDefined();
        expect(typeof Resolved === "function" || typeof Resolved === "object").toBe(true);
        expect(templateRegistry[id]).toBeDefined();
      });
    });

    it("resolves unknown or unmapped codes to DefaultTemplateLayout fallback when requested", () => {
      const ResolvedFallback = getDedicatedTemplateComponent({ slug: "unknown-legacy-preset-999" }, null, true);
      expect(ResolvedFallback).toBeDefined();
    });
  });

  describe("2. Universal Opening Gate & Accessible Skip Contracts", () => {
    it("DigitalYes: renders accessible Skip button and opens invitation on click", () => {
      render(
        <MemoryRouter>
          <DigitalYesLayout tpl={sampleWeddingData} preview={true} previewStartClosed={true} />
        </MemoryRouter>
      );

      const skipBtn = screen.getByRole("button", { name: /រំលង/ });
      expect(skipBtn).toBeInTheDocument();
      fireEvent.click(skipBtn);

      // Full content becomes visible
      expect(screen.getByText("សិរីសួស្តីអាពាហ៍ពិពាហ៍")).toBeInTheDocument();
    });

    it("EmeraldLuxe: renders accessible Skip button and opens curtain immediately", () => {
      render(
        <MemoryRouter>
          <EmeraldLuxeLayout tpl={sampleWeddingData} preview={true} previewStartClosed={true} />
        </MemoryRouter>
      );

      const skipBtn = screen.getByRole("button", { name: /រំលង/ });
      expect(skipBtn).toBeInTheDocument();
      fireEvent.click(skipBtn);

      // The invitation details should be rendered
      expect(screen.getByText("Sokha Phnom Penh Hotel & Residence")).toBeInTheDocument();
    });

    it("CanvaKhmerWeddingTemplate: renders accessible Skip button and skips cover instantly", () => {
      render(
        <MemoryRouter>
          <CanvaKhmerWeddingTemplate content={sampleWeddingData} preview={true} previewStartClosed={true} />
        </MemoryRouter>
      );

      const skipBtn = screen.getByRole("button", { name: /រំលង/ });
      expect(skipBtn).toBeInTheDocument();
      fireEvent.click(skipBtn);

      // Main content is exposed
      expect(screen.getByRole("heading", { name: /ពិធីសូត្រមន្តចម្រើនព្រះបរិត្ត/ })).toBeInTheDocument();
    });

    it("TemplateBoilerplateLayout: renders accessible Skip button with min 44px target", () => {
      render(
        <MemoryRouter>
          <TemplateBoilerplateLayout tpl={sampleWeddingData} preview={true} />
        </MemoryRouter>
      );

      const skipBtn = screen.getByTestId("tpl-skip-opening-btn");
      expect(skipBtn).toBeInTheDocument();
      expect(skipBtn.className).toContain("min-h-[44px]");
      fireEvent.click(skipBtn);

      expect(screen.getByText("កាលវិភាគកម្មវិធីមង្គលការ")).toBeInTheDocument();
    });
  });

  describe("3. Lightbox Modals & Focus Trap Accessibility", () => {
    it("WithJoyPortalLayout: gallery item opens modal dialog with Escape listener", () => {
      render(
        <MemoryRouter>
          <WithJoyPortalLayout tpl={sampleWeddingData} preview={false} />
        </MemoryRouter>
      );

      const galleryItems = screen.getAllByRole("button", { name: /ពង្រីករូបភាពទី/ });
      expect(galleryItems.length).toBeGreaterThan(0);
      fireEvent.click(galleryItems[0]);

      // Dialog is open
      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute("aria-modal", "true");

      // Press Escape
      fireEvent.keyDown(document.activeElement, { key: "Escape" });
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});
