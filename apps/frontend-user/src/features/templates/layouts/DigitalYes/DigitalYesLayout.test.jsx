import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import DigitalYesLayout from "./DigitalYesLayout";

const mockTemplate = {
  groom: "ជា វណ្ណដា",
  bride: "សុខ ស្រីពេជ្រ",
  groomEn: "Vanda Chea",
  brideEn: "Sreypich Sok",
  groomParents: "លោក ជា សុផល និង លោកស្រី កែវ ធីតា",
  brideParents: "លោក សុខ វិបុល និង លោកស្រី គឹម អាន",
  dateText: "ថ្ងៃព្រហស្បតិ៍ ទី១៨ ខែមករា ឆ្នាំ២០២៦",
  targetDate: "2026-11-28T17:00:00",
  venueName: "The Premier Center Sen Sok",
  venueHall: "អគារ A (Building A)",
  venueAddress: "ផ្លូវ 1003, សង្កាត់ភ្នំពេញថ្មី, ខណ្ឌសែនសុខ, រាជធានីភ្នំពេញ",
  googleMapsUrl: "https://maps.google.com",
  blessingMessage: "យើងខ្ញុំមានកិត្តិយសសូមគោរពអញ្ជើញ...",
  schedule: [
    { time: "07:00 ព្រឹក", title: "ពិធីសូត្រមន្តចម្រើនព្រះបរិត្ត" },
    { time: "08:30 ព្រឹក", title: "ពិធីហែរជំនូន និងកាត់សក់បង្កក់សិរី" },
  ],
  enabledSections: {
    countdown: true,
    schedule: true,
    map: true,
    rsvp: true,
    gift: true,
  },
};

describe("DigitalYesLayout", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders full wedding invitation view correctly with Khmer typography and couple names", () => {
    render(
      <MemoryRouter>
        <DigitalYesLayout tpl={mockTemplate} preview={true} />
      </MemoryRouter>
    );

    // Couple names
    expect(screen.getByText("ជា វណ្ណដា")).toBeInTheDocument();
    expect(screen.getByText("សុខ ស្រីពេជ្រ")).toBeInTheDocument();
    expect(screen.getByText("Vanda Chea")).toBeInTheDocument();
    expect(screen.getByText("Sreypich Sok")).toBeInTheDocument();

    // Khmer Title
    expect(screen.getByText("សិរីសួស្តីអាពាហ៍ពិពាហ៍")).toBeInTheDocument();

    // Venue & Date
    expect(screen.getByText("The Premier Center Sen Sok")).toBeInTheDocument();
    expect(screen.getByText("ថ្ងៃព្រហស្បតិ៍ ទី១៨ ខែមករា ឆ្នាំ២០២៦")).toBeInTheDocument();

    // Schedule items
    expect(screen.getByText("កាលវិភាគកម្មវិធីមង្គលការ")).toBeInTheDocument();
    expect(screen.getByText("07:00 ព្រឹក")).toBeInTheDocument();
    expect(screen.getByText("ពិធីសូត្រមន្តចម្រើនព្រះបរិត្ត")).toBeInTheDocument();
  });

  it("handles audio toggle interaction safely", () => {
    render(
      <MemoryRouter>
        <DigitalYesLayout tpl={mockTemplate} preview={true} />
      </MemoryRouter>
    );

    const musicButton = screen.getByTitle("ចាក់ភ្លេង");
    expect(musicButton).toBeInTheDocument();
    fireEvent.click(musicButton);
  });
});
