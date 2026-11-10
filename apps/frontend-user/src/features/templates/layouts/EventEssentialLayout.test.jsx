import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import EventEssentialLayout from "./EventEssentialLayout";
import { draftToTemplate } from "@/features/wedding-builder/utils/draftToTemplate";
import { publicInvitationToDraft } from "@/features/wedding-builder/utils/invitationDraftAdapter";
afterEach(cleanup);
describe("neutral event invitation", () => {
  it("preserves birthday identity, language and details through the real public adapter", () => {
    const draft = publicInvitationToDraft({ id: 42, templateCode: "event-essential", eventType: "BIRTHDAY", title: "Sokha's birthday", hostName: "Sokha", languageMode: "EN", eventDate: "2026-12-25", venueName: "Home", contentJson: JSON.stringify({ contact: { email: "sokha@example.test" }, schedule: [{ time: "18:00", title: "Dinner" }] }) });
    const { tpl } = draftToTemplate(draft);
    render(<MemoryRouter><EventEssentialLayout tpl={tpl} preview /></MemoryRouter>);
    expect(screen.getByText("Birthday")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Sokha's birthday" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Sokha" })).toBeInTheDocument();
    expect(screen.getByText("2026-12-25")).toBeInTheDocument();
    expect(screen.queryByText(/Groom|Bride|WEDDING/)).not.toBeInTheDocument();
    expect(screen.getByText("18:00 · Dinner")).toBeInTheDocument();
    expect(screen.getByText("sokha@example.test")).toBeInTheDocument();
  });

  it("U-14: suppresses duplicate secondary heading when names match title and formats time cleanly", () => {
    const draft = publicInvitationToDraft({
      id: 101,
      templateCode: "event-essential",
      eventType: "WEDDING",
      title: "Dara & Sophea",
      groomName: "Dara",
      brideName: "Sophea",
      languageMode: "EN",
      eventDate: "2027-12-20",
      eventTime: "17:30:00",
      venueName: "Phnom Penh",
    });
    const { tpl } = draftToTemplate(draft);
    render(<MemoryRouter><EventEssentialLayout tpl={tpl} preview /></MemoryRouter>);

    // Title heading is rendered
    expect(screen.getByRole("heading", { level: 1, name: "Dara & Sophea" })).toBeInTheDocument();
    // Duplicate level 2 heading for the exact same names is suppressed
    expect(screen.queryByRole("heading", { level: 2, name: "Dara & Sophea" })).not.toBeInTheDocument();
    // Time without raw seconds
    expect(screen.getByText(/5:30 PM/)).toBeInTheDocument();
  });
});
