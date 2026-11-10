import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { publicInvitationToDraft } from "../wedding-builder/utils/invitationDraftAdapter";
import { draftToTemplate } from "../wedding-builder/utils/draftToTemplate";
import CoverBackground from "../templates/shared/Openings/CoverBackground";
import PublicInvitationFeature from "./PublicInvitationFeature";

afterEach(cleanup);

describe("Phase 08 Public Guest Experience & Photo Mapping", () => {
  it("maps couplePhoto and coverFocalPoint in publicInvitationToDraft", () => {
    const rawInvitation = {
      id: "inv-888",
      slug: "channa-sophea",
      title: "Channa & Sophea Wedding",
      coverUrl: "https://example.com/channa-sophea.jpg",
      contentJson: JSON.stringify({
        couplePhoto: "https://example.com/channa-sophea.jpg",
        coverFocalPoint: "top",
        groomName: "Channa",
        brideName: "Sophea",
      }),
      designJson: JSON.stringify({
        coverFocalPoint: "top",
      }),
      templateCode: "khmer-floral-gold",
    };

    const draft = publicInvitationToDraft(rawInvitation, null);
    expect(draft.couplePhoto).toBe("https://example.com/channa-sophea.jpg");
    expect(draft.coverFocalPoint).toBe("top");
  });

  it("forwards couplePhoto and coverFocalPoint through draftToTemplate", () => {
    const draft = {
      id: "inv-888",
      templateCode: "bliss-editorial-wedding",
      title: "Vogue Wedding",
      coverImage: "https://example.com/hero.jpg",
      couplePhoto: "https://example.com/hero.jpg",
      coverFocalPoint: "top",
      couple: { groom: "Dara", bride: "Bopha" },
      enabledSections: { rsvp: true },
    };

    const result = draftToTemplate(draft);
    expect(result).not.toBeNull();
    expect(result.tpl.couplePhoto).toBe("https://example.com/hero.jpg");
    expect(result.tpl.coverFocalPoint).toBe("top");
    expect(result.tpl.hostContent.couplePhoto).toBe("https://example.com/hero.jpg");
    expect(result.tpl.hostContent.coverFocalPoint).toBe("top");
  });

  it("applies focal point positioning (objectPosition) in CoverBackground", () => {
    const content = {
      templateCode: "bliss-editorial-wedding",
      couplePhoto: "https://example.com/bliss-cover.jpg",
      coverFocalPoint: "top",
    };

    const { container } = render(
      <CoverBackground
        content={content}
        templateDefault={{ src: "/default.jpg", type: "image" }}
      />
    );

    const img = container.querySelector("img.cover-bg-media");
    expect(img).toBeInTheDocument();
    expect(img.style.objectPosition).toBe("50% 15%");
  });

  it("preserves decorative artwork for silk-heritage in CoverBackground", () => {
    const content = {
      templateCode: "silk-heritage",
      couplePhoto: "https://example.com/owner-photo.jpg",
      coverFocalPoint: "center",
    };

    const { container } = render(
      <CoverBackground
        content={content}
        templateDefault={{ src: "/templates/silk-heritage/silk-tapestry.webp", type: "image" }}
      />
    );

    const img = container.querySelector("img.cover-bg-media");
    expect(img).toBeInTheDocument();
    // Default silk tapestry must be preserved, not overwritten by couplePhoto
    expect(img.src).toContain("/templates/silk-heritage/silk-tapestry.webp");
  });

  it("renders public state unavailable view when invitation is not found or unpublished", async () => {
    render(
      <MemoryRouter initialEntries={["/w/non-existent-slug"]}>
        <PublicInvitationFeature />
      </MemoryRouter>
    );

    // Initial loading or not found state
    expect(
      await screen.findByText(/រកសន្លឹកការមិនឃើញ|សន្លឹកការមិនទាន់បានផ្សព្វផ្សាយ|Loading/i)
    ).toBeInTheDocument();
  });
});
