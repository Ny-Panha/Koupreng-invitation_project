import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import EventWorkspace from "./EventWorkspace";
import { useEventWorkspace } from "./EventContext";
import { EVENT_MODULES } from "./eventRoutes";
import { ALL_EVENT_LINKS, eventStatus } from "./eventNavigationModel";
import { invitationService } from "@/features/invitations/api/invitationApi";
import { useLanguageStore } from "@/stores/useLanguageStore";

vi.mock("@/features/auth/hooks/useAuth", () => ({ useAuth: () => ({ user: { id: 7 } }) }));
vi.mock("@/features/invitations/api/invitationApi", () => ({ invitationService: { get: vi.fn(), listMine: vi.fn(), access: vi.fn() } }));
const event = { id: 101, userId: 7, title: "Wedding A", eventType: "WEDDING", status: "DRAFT", templateCode: "event-essential" };
function Module() { const workspace = useEventWorkspace(); return <main>Selected event {workspace.eventId}</main>; }
function show(module = "guests") {
  return render(<MemoryRouter initialEntries={[`/app/events/101${module ? "/" + module : ""}`]}><Routes>
    <Route path="/app/events/:eventId" element={<EventWorkspace />}>
      <Route index element={<Module />} />
      {EVENT_MODULES.map(path => <Route key={path} path={path} element={<Module />} />)}
    </Route>
  </Routes></MemoryRouter>);
}
function media(desktop = true) {
  vi.stubGlobal("matchMedia", vi.fn(query => ({ matches: desktop, media: query, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
}
beforeEach(() => {
  vi.clearAllMocks(); media(); useLanguageStore.setState({ lang: "en" });
  invitationService.access.mockResolvedValue({ owner: true, permissions: [], ownerFeatures: [] });
  invitationService.get.mockResolvedValue(event);
  invitationService.listMine.mockResolvedValue([event]);
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("event navigation", () => {
  it("keeps status unavailable while the event is still loading", () => {
    expect(eventStatus(null, true)).toEqual({ label: "Status unavailable", tone: "unknown" });
    expect(eventStatus(undefined, false).tone).toBe("unknown");
  });
  it("maps every existing module once and keeps the current route explicit", async () => {
    const view = show(); await screen.findByText("Selected event 101");
    expect(ALL_EVENT_LINKS.map(item => item.path).sort()).toEqual(["", ...EVENT_MODULES].sort());
    const links = [...view.container.querySelectorAll(".event-workspace-nav a")];
    expect(links).toHaveLength(ALL_EVENT_LINKS.length); expect(new Set(links.map(link => link.pathname)).size).toBe(ALL_EVENT_LINKS.length);
    expect(screen.getByRole("link", { name: "Guests", exact: true })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("combobox", { name: "Switch event" })).toHaveValue("101");
  });
  it("remembers collapse preference across remount without changing the event", async () => {
    const first = show(); await screen.findByText("Selected event 101");
    fireEvent.click(screen.getByRole("button", { name: "Collapse navigation" }));
    expect(first.container.querySelector(".event-workspace")).toHaveClass("is-collapsed");
    first.unmount(); const second = show(); await screen.findByText("Selected event 101");
    expect(second.container.querySelector(".event-workspace")).toHaveClass("is-collapsed");
    expect(invitationService.get).toHaveBeenLastCalledWith("101");
  });
  it("reveals the active secondary group even when its saved preference is closed", async () => {
    localStorage.setItem("koupreng.eventNavigation.7", JSON.stringify({mode:"expanded",groups:{other:false}}));
    show("settings"); await screen.findByText("Selected event 101");
    expect(screen.getByRole("button", { name: "More" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "Settings" })).toHaveAttribute("aria-current", "page");
    fireEvent.click(screen.getByRole("button", { name: "More" }));
    expect(screen.getByRole("link", { name: "Settings" })).toBeVisible();
  });
  it("keeps a secondary group closed while switching primary modules", async () => {
    show(); await screen.findByText("Selected event 101");
    const group = screen.getByRole("button", { name: "Management" });
    fireEvent.click(group); expect(group).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(screen.getByRole("link", { name: "RSVP", exact: true }));
    expect(group).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("link", { name: "RSVP", exact: true })).toHaveAttribute("aria-current", "page");
  });
  it("provides a keyboard tooltip on the icon rail", async () => {
    show(); await screen.findByText("Selected event 101");
    fireEvent.click(screen.getByRole("button", { name: "Collapse navigation" }));
    const link = screen.getByRole("link", { name: "Guests", exact: true }); fireEvent.focus(link);
    expect(screen.getByRole("tooltip")).toHaveTextContent("Guests");
    fireEvent.keyDown(link, { key: "Escape" }); expect(screen.queryByRole("tooltip")).toBeNull();
  });
  it("opens a modal mobile menu, isolates the page and restores focus on Escape", async () => {
    media(false); show(); await screen.findByText("Selected event 101");
    expect(screen.queryByRole("navigation", { name: "Event navigation" })).toBeNull();
    const trigger = screen.getByRole("button", { name: "Toggle modules menu" }); trigger.focus(); fireEvent.click(trigger);
    const dialog = await screen.findByRole("dialog", { name: "Event navigation" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(document.body.style.overflow).toBe("hidden");
    fireEvent.keyDown(dialog, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(trigger).toHaveFocus(); expect(document.body.style.overflow).toBe("");
  });
  it("does not mount navigation or task content for a mismatched server event", async () => {
    invitationService.get.mockResolvedValue({ ...event, id: 999 }); show();
    await screen.findByRole("alert");
    expect(screen.queryByText("Selected event 101")).toBeNull();
    expect(screen.queryByRole("navigation")).toBeNull();
  });
  it("shows an unknown server status truthfully", async () => {
    invitationService.get.mockResolvedValue({ ...event, status: "REVIEW_REQUIRED" }); show();
    await screen.findByText("Selected event 101");
    expect(screen.getAllByText("REVIEW_REQUIRED").length).toBeGreaterThan(0);
    expect(screen.queryByText("Draft")).toBeNull();
  });
});
