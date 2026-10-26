import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

function DedicatedProbe({ content }) {
  return <p data-testid="couple-name">{content.languageMode === 'EN' ? content.groomEn || content.groom : content.groom}</p>;
}

vi.mock("../registry/templateRegistry", () => ({
  getDedicatedTemplateComponent: () => DedicatedProbe,
  resolveTemplateRenderer: () => ({ id: "security-probe", component: DedicatedProbe, available: true }),
}));

import TemplateExperience from "./TemplateExperience";

const sessionId = "test-preview-session-1234567890123456";
const initialContent = { groom: "Original host", bride: "Original bride", music: "" };

function sendPreview({ origin = window.location.origin, source = window, session = sessionId, data = { groomName: "Edited host" } } = {}) {
  act(() => window.dispatchEvent(new MessageEvent("message", {
    origin,
    source,
    data: { type: "LIVE_PREVIEW_SYNC", sessionId: session, data },
  })));
}

function showPreview(channel) {
  return render(<TemplateExperience tpl={{ id: "default" }} content={initialContent} preview previewChannel={channel} />);
}

describe("FE-010 preview message boundaries", () => {
  afterEach(() => { cleanup(); window.history.replaceState(null, "", "/"); });

  it("never lets a published invitation accept preview messages, even with preview chrome hidden", () => {
    window.history.replaceState(null, "", "/w/published?embed=true&previewSession=forged-session-1234567890&previewOrigin=https://attacker.invalid");
    showPreview();
    sendPreview({ origin: "https://attacker.invalid" });
    expect(screen.getByTestId("couple-name")).toHaveTextContent("Original host");
  });

  it("rejects same-origin messages without an active preview session", () => {
    showPreview();
    sendPreview();
    expect(screen.getByTestId("couple-name")).toHaveTextContent("Original host");
  });

  it("retains legitimate session-bound live editing", () => {
    showPreview({ origin: window.location.origin, source: window, sessionId });
    sendPreview();
    expect(screen.getByTestId("couple-name")).toHaveTextContent("Edited host");
  });

  it("replaces catalogue English aliases with the selected authored preview text", () => {
    render(<TemplateExperience tpl={{ id: 'default' }} content={{ ...initialContent, languageMode: 'EN', groomEn: 'Demo English host' }} preview previewChannel={{ origin: window.location.origin, source: window, sessionId }} />);
    expect(screen.getByTestId('couple-name')).toHaveTextContent('Demo English host');
    sendPreview({ data: { groomName: 'Authored English host', languageMode: 'EN' } });
    expect(screen.getByTestId('couple-name')).toHaveTextContent('Authored English host');
    expect(screen.queryByText('Demo English host')).toBeNull();
  });

  it.each([
    { origin: "https://attacker.invalid" },
    { source: null },
    { session: "a-different-session-1234567890123456" },
    { data: { groomName: ["Malformed host"] } },
  ])("rejects wrong origin, source, nonce or schema (%j)", (message) => {
    showPreview({ origin: window.location.origin, source: window, sessionId });
    sendPreview(message);
    expect(screen.getByTestId("couple-name")).toHaveTextContent("Original host");
  });
});
