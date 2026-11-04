import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { InvitationLocaleContext } from "../invitationLocaleContext";
import FloatingAudioPlayer from "./FloatingAudioPlayer";

const player = (props = {}, locale = "en") => (
  <InvitationLocaleContext value={locale}><FloatingAudioPlayer src="/first.mp3" {...props} /></InvitationLocaleContext>
);

beforeEach(() => {
  vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => {});
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(function () { this.dispatchEvent(new Event("pause")); });
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe("invitation music control", () => {
  it("does not render without music or download media before interaction", () => {
    const view = render(player({ src: "" }));
    expect(screen.queryByRole("button")).toBeNull();
    view.rerender(player());
    expect(view.container.querySelector("audio")).toHaveAttribute("preload", "none");
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
  });

  it("plays and pauses with accurate accessible names and pressed state", async () => {
    render(player());
    fireEvent.click(screen.getByRole("button", { name: "Play music" }));
    const pause = await screen.findByRole("button", { name: "Pause music" });
    expect(pause).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(pause);
    expect(screen.getByRole("button", { name: "Play music" })).toHaveAttribute("aria-pressed", "false");
  });

  it("announces playback failure and lets the guest retry", async () => {
    HTMLMediaElement.prototype.play.mockRejectedValueOnce(new DOMException("Gesture required", "NotAllowedError"));
    render(player());
    fireEvent.click(screen.getByRole("button", { name: "Play music" }));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Tap the button to try again"));
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(screen.getByRole("button"));
    await screen.findByRole("button", { name: "Pause music" });
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("ignores an old play promise after the editor replaces the track", async () => {
    let resolve;
    HTMLMediaElement.prototype.play.mockReturnValueOnce(new Promise(done => { resolve = done; }));
    const view = render(player());
    fireEvent.click(screen.getByRole("button", { name: "Play music" }));
    expect(screen.getByRole("status")).toHaveTextContent("Loading music");
    view.rerender(player({ src: "/second.mp3" }));
    await act(async () => { resolve(); });
    expect(screen.getByRole("button", { name: "Play music" })).toHaveAttribute("aria-pressed", "false");
    expect(view.container.querySelector("audio")).toHaveAttribute("src", "/second.mp3");
  });

  it("cancels pending playback without allowing its completion to restart the indicator", async () => {
    let resolve;
    HTMLMediaElement.prototype.play.mockReturnValueOnce(new Promise(done => { resolve = done; }));
    render(player());
    fireEvent.click(screen.getByRole("button", { name: "Play music" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel loading music" }));
    await act(async () => { resolve(); });
    expect(screen.getByRole("button", { name: "Play music" })).toHaveAttribute("aria-pressed", "false");
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);
  });

  it("reflects native pause, ended, playing and media error events", async () => {
    const view = render(player());
    const audio = view.container.querySelector("audio");
    fireEvent.playing(audio);
    expect(screen.getByRole("button", { name: "Pause music" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.pause(audio);
    expect(screen.getByRole("button", { name: "Play music" })).toHaveAttribute("aria-pressed", "false");
    fireEvent.playing(audio);
    fireEvent.ended(audio);
    expect(screen.getByRole("button", { name: "Play music" })).toHaveAttribute("aria-pressed", "false");
    fireEvent.error(audio);
    expect(screen.getByRole("status")).toHaveTextContent("Music could not play");
  });

  it("uses the invitation language independently of the host interface", () => {
    render(player({}, "kh"));
    expect(screen.getByRole("button", { name: "ចាក់ភ្លេង" })).toBeInTheDocument();
  });

  it("handles optional autoplay failure and retries the new source", async () => {
    HTMLMediaElement.prototype.play.mockRejectedValueOnce(new Error("Blocked"));
    const view = render(player({ autoPlay: true }));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Music could not play"));
    view.rerender(player({ autoPlay: true, src: "/second.mp3" }));
    await screen.findByRole("button", { name: "Pause music" });
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(2);
  });

  it("stops audio and invalidates pending work on unmount", async () => {
    let resolve;
    HTMLMediaElement.prototype.play.mockReturnValueOnce(new Promise(done => { resolve = done; }));
    const view = render(player());
    fireEvent.click(screen.getByRole("button", { name: "Play music" }));
    HTMLMediaElement.prototype.pause.mockClear();
    view.unmount();
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalledTimes(1);
    await act(async () => { resolve(); });
  });
});
