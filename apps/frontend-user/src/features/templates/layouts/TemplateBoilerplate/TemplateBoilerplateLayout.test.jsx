import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import TemplateBoilerplateLayout from "./TemplateBoilerplateLayout";

const mockBoilerplateData = {
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
    { time: "07:00 ព្រឹក", title: "ពិធីសូត្រមន្តចម្រើនព្រះបរិត្ត", location: "គេហដ្ឋានខាងស្រី" },
    { time: "08:30 ព្រឹក", title: "ពិធីហែរជំនូន និងកាត់សក់បង្កក់សិរី", location: "សាលពិធី" },
    { time: "05:00 ល្ងាច", title: "ពិធីពិសាភោជនាហារ និងរាំកម្សាន្ត", location: "សណ្ឋាគារសុខា" },
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

describe("TemplateBoilerplateLayout (Phase 10.1 Dedicated Layout)", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders couple names, date, venue, and dynamic schedule properly when open", () => {
    render(
      <MemoryRouter>
        <TemplateBoilerplateLayout tpl={mockBoilerplateData} preview={false} />
      </MemoryRouter>
    );

    // Couple names
    expect(screen.getAllByText(/សុក ពិសិដ្ឋ/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/កែវ ស្រីនិច/).length).toBeGreaterThan(0);

    // Venue & Date
    expect(screen.getByText("Sokha Phnom Penh Hotel & Residence")).toBeInTheDocument();
    expect(screen.getByText("ថ្ងៃអាទិត្យ ទី២៥ ខែធ្នូ ឆ្នាំ២០២៦")).toBeInTheDocument();

    // Dynamic schedule items
    expect(screen.getByText("ពិធីសូត្រមន្តចម្រើនព្រះបរិត្ត")).toBeInTheDocument();
    expect(screen.getByText("ពិធីហែរជំនូន និងកាត់សក់បង្កក់សិរី")).toBeInTheDocument();
    expect(screen.getByText("ពិធីពិសាភោជនាហារ និងរាំកម្សាន្ត")).toBeInTheDocument();
  });

  it("handles Skip opening action directly in preview mode", () => {
    render(
      <MemoryRouter>
        <TemplateBoilerplateLayout tpl={mockBoilerplateData} preview={true} />
      </MemoryRouter>
    );

    const skipBtn = screen.getByTestId("tpl-skip-opening-btn");
    expect(skipBtn).toBeInTheDocument();
    fireEvent.click(skipBtn);

    // Invitation content should be shown
    expect(screen.getByText("កាលវិភាគកម្មវិធីមង្គលការ")).toBeInTheDocument();
    expect(screen.getByText("Sokha Phnom Penh Hotel & Residence")).toBeInTheDocument();
  });

  it("handles RSVP submission cleanly without window.alert", () => {
    window.alert = vi.fn();

    render(
      <MemoryRouter>
        <TemplateBoilerplateLayout tpl={mockBoilerplateData} preview={false} />
      </MemoryRouter>
    );

    // Fill RSVP
    const nameInput = screen.getByPlaceholderText("សូមបញ្ចូលឈ្មោះរបស់លោកអ្នក...");
    fireEvent.change(nameInput, { target: { value: "ចាន់ សុខុម" } });

    const submitBtn = screen.getByRole("button", { name: /ផ្ញើការបញ្ជាក់/i });
    fireEvent.click(submitBtn);

    // alert was never called
    expect(window.alert).not.toHaveBeenCalled();

    // Confirmation appears
    expect(screen.getByRole("status")).toHaveTextContent("Nothing has been sent to the host");
  });

  it("handles gallery lightbox open, Escape key close, and arrow navigation", () => {
    render(
      <MemoryRouter>
        <TemplateBoilerplateLayout tpl={mockBoilerplateData} preview={false} />
      </MemoryRouter>
    );

    // Click first gallery item
    const galleryBtns = screen.getAllByRole("button", { name: /មើលរូបថតធំទី/ });
    expect(galleryBtns.length).toBeGreaterThan(0);
    fireEvent.click(galleryBtns[0]);

    // Lightbox modal is open
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();

    // Close on Escape key
    fireEvent.keyDown(document.activeElement, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders back navigation button when showBack is true", () => {
    render(
      <MemoryRouter>
        <TemplateBoilerplateLayout
          tpl={mockBoilerplateData}
          preview={false}
          showBack={true}
          backTo="/templates"
          backLabel="ត្រឡប់ក្រោយ"
        />
      </MemoryRouter>
    );

    expect(screen.getByRole("link", { name: "← ត្រឡប់ក្រោយ" })).toBeInTheDocument();
  });
});
