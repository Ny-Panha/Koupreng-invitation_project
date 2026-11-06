import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import InvitationBranding from "./InvitationBranding";
import { buildTemplateContent } from "../experience/config/templateExperienceContent";

afterEach(cleanup);

describe("invitation closing branding preferences", () => {
  it("shows the official transparent logo by default", () => {
    render(<InvitationBranding />);
    expect(screen.getByRole("img", { name: "គូព្រេង · Koupreng" })).toHaveAttribute("loading", "lazy");
  });

  it("keeps hidden branding hidden after host-content normalization", () => {
    const content = buildTemplateContent({ hostContent: { showBrandMark: false, brandMarkUrl: "/uploads/owner.png" } });
    const { container } = render(<InvitationBranding content={content} />);
    expect(container).toBeEmptyDOMElement();
  });

  it.each(["brandMark", "brandMarkUrl"])("preserves the owner's %s without platform attribution", field => {
    const { container } = render(<InvitationBranding content={{ [field]: "/uploads/owner.png" }} language="en" />);
    expect(screen.getByRole("img")).toHaveAttribute("src", "/uploads/owner.png");
    expect(container.querySelector('[data-branding="koupreng"]')).toBeNull();
    expect(container).not.toHaveTextContent("Crafted with love");
  });

  it("keeps a custom brand's text-only closing free of images and platform attribution", () => {
    const { container } = render(<InvitationBranding content={{ brandMark: "/uploads/owner.png" }} textOnly />);
    expect(container).toBeEmptyDOMElement();
  });

  it("updates visibility and custom marks when preview data changes", () => {
    const { rerender, container } = render(<InvitationBranding />);
    rerender(<InvitationBranding content={{ showBrandMark: false }} />);
    expect(container).toBeEmptyDOMElement();
    rerender(<InvitationBranding content={{ showBrandMark: true, brandMark: "/uploads/new.png" }} />);
    expect(screen.getByRole("img")).toHaveAttribute("src", "/uploads/new.png");
  });

  it.each([["EN", "Crafted with love by គូព្រេង"], ["KH", "បង្កើតដោយក្តីស្រឡាញ់ ដោយគូព្រេង"]])("preserves localized text-only branding in %s", (language, caption) => {
    render(<InvitationBranding textOnly language={language} />);
    expect(screen.getByText(caption)).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
