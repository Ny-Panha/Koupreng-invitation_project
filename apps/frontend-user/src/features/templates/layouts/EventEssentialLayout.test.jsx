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
});
