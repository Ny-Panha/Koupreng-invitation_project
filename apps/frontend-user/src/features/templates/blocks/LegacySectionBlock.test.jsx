import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LegacySectionBlock from "./LegacySectionBlock";

// Sample content for testing
const testContent = {
  groom: "សុវណ្ណ",
  bride: "មាលា",
  groomName: "សុវណ្ណ",
  brideName: "មាលា",
  invitationTitle: "សិរីសួស្តី អាពាហ៍ពិពាហ៍",
  message: "សូមគោរពអញ្ជើញភ្ញៀវកិត្តិយស",
  couple: {
    groomIntro: "កូនកំលោះ",
    brideIntro: "កូនក្រមុំ",
    groomParents: "ឪពុកម្តាយកូនកំលោះ",
    brideParents: "ឪពុកម្តាយកូនក្រមុំ",
  },
  family: {
    groomParents: ["ឪពុក", "ម្តាយ"],
    brideParents: ["ឪពុក", "ម្តាយ"],
  },
  story: [
    { id: "story-1", title: "First Met", text: "At university", year: "2020" },
  ],
  schedule: [
    { id: "sched-1", time: "07:00", title: "ពិធីហែជំនូន" },
  ],
  gallery: ["/photo1.jpg"],
  dressCode: {
    description: "Dress code info",
    colors: [{ hex: "#D4AF37", name: "មាស" }],
  },
  faq: [{ q: "តើពិធីចាប់ផ្ដើមម៉ោងណា?", a: "ម៉ោង ៧:០០ ព្រឹក" }],
  venue: { name: "មជ្ឈមណ្ឌលកោះពេជ្រ", address: "ភ្នំពេញ" },
  targetDate: "2026-12-31T17:00:00+07:00",
  enabledSections: {
    family: true,
    invitation: true,
    countdown: true,
    schedule: true,
    map: true,
    gallery: true,
    story: true,
    gift: true,
    dressCode: true,
    faq: true,
    rsvp: true,
  },
};

describe("LegacySectionBlock", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when enabled is false", () => {
    const { container } = render(
      <MemoryRouter>
        <LegacySectionBlock
          sectionKey="invitation"
          enabled={false}
          content={testContent}
        />
      </MemoryRouter>
    );
    expect(container.firstChild).toBeNull();
  });

  it("returns null when content.enabledSections has sectionKey as false", () => {
    const disabledContent = {
      ...testContent,
      enabledSections: { ...testContent.enabledSections, gallery: false },
    };
    const { container } = render(
      <MemoryRouter>
        <LegacySectionBlock
          sectionKey="gallery"
          enabled={true}
          content={disabledContent}
        />
      </MemoryRouter>
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders TemplateCouple for key 'family'", () => {
    render(
      <MemoryRouter>
        <LegacySectionBlock sectionKey="family" content={testContent} />
      </MemoryRouter>
    );
    expect(screen.getByText("សុវណ្ណ")).toBeInTheDocument();
  });

  it("renders TemplateMessage for key 'invitation'", () => {
    render(
      <MemoryRouter>
        <LegacySectionBlock sectionKey="invitation" content={testContent} />
      </MemoryRouter>
    );
    expect(screen.getByText("សូមគោរពអញ្ជើញភ្ញៀវកិត្តិយស")).toBeInTheDocument();
  });

  it("renders TemplateCountdown for key 'countdown'", () => {
    const { container } = render(
      <MemoryRouter>
        <LegacySectionBlock sectionKey="countdown" content={testContent} />
      </MemoryRouter>
    );
    expect(container.querySelector("[data-tx-section='countdown']")).toBeInTheDocument();
  });

  it("renders TemplateSchedule for key 'schedule'", () => {
    render(
      <MemoryRouter>
        <LegacySectionBlock sectionKey="schedule" content={testContent} />
      </MemoryRouter>
    );
    expect(screen.getByText("ពិធីហែជំនូន")).toBeInTheDocument();
  });

  it("renders TemplateVenue for key 'map'", () => {
    render(
      <MemoryRouter>
        <LegacySectionBlock sectionKey="map" content={testContent} />
      </MemoryRouter>
    );
    expect(screen.getByText("មជ្ឈមណ្ឌលកោះពេជ្រ")).toBeInTheDocument();
  });

  it("renders TemplateGallery for key 'gallery'", () => {
    const { container } = render(
      <MemoryRouter>
        <LegacySectionBlock sectionKey="gallery" content={testContent} />
      </MemoryRouter>
    );
    expect(container.querySelector("[data-tx-section='gallery']")).toBeInTheDocument();
  });

  it("renders TemplateStory for key 'story' when story has items", () => {
    render(
      <MemoryRouter>
        <LegacySectionBlock sectionKey="story" content={testContent} />
      </MemoryRouter>
    );
    expect(screen.getByText("First Met")).toBeInTheDocument();
  });

  it("returns null for key 'story' when content.story is empty", () => {
    const noStoryContent = { ...testContent, story: [] };
    const { container } = render(
      <MemoryRouter>
        <LegacySectionBlock sectionKey="story" content={noStoryContent} />
      </MemoryRouter>
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders TemplateDressCode for key 'dressCode'", () => {
    render(
      <MemoryRouter>
        <LegacySectionBlock sectionKey="dressCode" content={testContent} />
      </MemoryRouter>
    );
    expect(screen.getByText("Dress code info")).toBeInTheDocument();
  });

  it("renders TemplateFaq for key 'faq'", () => {
    render(
      <MemoryRouter>
        <LegacySectionBlock sectionKey="faq" content={testContent} />
      </MemoryRouter>
    );
    expect(screen.getByText("តើពិធីចាប់ផ្ដើមម៉ោងណា?")).toBeInTheDocument();
  });

  it("renders TemplateRsvp for key 'rsvp' when rsvpChildren is absent", () => {
    const { container } = render(
      <MemoryRouter>
        <LegacySectionBlock sectionKey="rsvp" content={testContent} />
      </MemoryRouter>
    );
    expect(container.querySelector("[data-tx-section='rsvp']")).toBeInTheDocument();
  });

  it("renders wrapped rsvpChildren for key 'rsvp' when rsvpChildren is provided", () => {
    render(
      <MemoryRouter>
        <LegacySectionBlock
          sectionKey="rsvp"
          content={testContent}
          rsvpChildren={<div data-testid="custom-rsvp-child">Custom RSVP Form Content</div>}
        />
      </MemoryRouter>
    );
    expect(screen.getByTestId("custom-rsvp-child")).toBeInTheDocument();
    expect(screen.getByText("Custom RSVP Form Content")).toBeInTheDocument();
  });

  it("returns null and logs warning for key 'party'", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = render(
      <MemoryRouter>
        <LegacySectionBlock sectionKey="party" content={testContent} />
      </MemoryRouter>
    );
    expect(container.firstChild).toBeNull();
    expect(warnSpy).toHaveBeenCalled();
  });
});
