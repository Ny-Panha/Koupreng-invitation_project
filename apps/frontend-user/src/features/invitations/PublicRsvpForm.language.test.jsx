import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import PublicRsvpForm from "./PublicRsvpForm";
vi.mock("@/features/rsvp/api/rsvpApi", () => ({ rsvpService: { publicWishes: vi.fn().mockResolvedValue([]) } }));
afterEach(cleanup);
describe("UX-002 invitation language aliases", () => {
  it.each(["KH", "kh", "km", "KHMER", "khmer"])("renders Khmer RSVP for %s", (languageMode) => {
    render(<PublicRsvpForm languageMode={languageMode} />);
    expect(screen.getByText("តើលោកអ្នកនឹងចូលរួមដែរឬទេ?")).toBeInTheDocument();
    expect(screen.queryByText("Will you attend?")).not.toBeInTheDocument();
  });
  it("respects EN even when the legacy Khmer default flag is set", () => {
    render(<PublicRsvpForm languageMode="EN" khmerLabels />);
    expect(screen.getByText("Will you attend?")).toBeInTheDocument();
  });
  it("keeps BOTH bilingual", () => {
    render(<PublicRsvpForm languageMode="BOTH" />);
    expect(screen.getByText("តើលោកអ្នកនឹងចូលរួមដែរឬទេ? / Will you attend?")).toBeInTheDocument();
  });
});
