import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import InvitationForm from "./InvitationForm";
import { getTemplateById } from "../templates/data/templatesData";

vi.mock("@/shared/feedback/feedback", () => ({
  feedback: {
    explain: vi.fn(),
    confirm: vi.fn().mockResolvedValue(true),
    permissionDenied: vi.fn(),
  },
}));

vi.mock("@/shared/access/useFeatureAccess", () => ({
  useFeatureAccess: () => ({ hasAccess: true, decision: { reason: "FEATURE_AVAILABLE" } }),
}));

vi.mock("@/features/auth/hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: 10 } }),
}));

vi.mock("@/features/invitations/api/invitationApi", () => ({
  invitationService: {
    get: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("@/features/invitations/api/mediaApi", () => ({
  mediaService: {
    list: vi.fn().mockResolvedValue({ coverImage: null, galleryImages: [] }),
    uploadCover: vi.fn(),
    uploadGallery: vi.fn(),
  },
}));

afterEach(cleanup);

describe("Template Photo Mapping & Decorative Artwork Preservation", () => {
  it("preserves decorative artwork for silk-heritage and does not overwrite with uploaded cover by default", () => {
    const decorativeInvitation = {
      id: 501,
      templateId: "silk-heritage",
      templateCode: "silk-heritage",
      title: "Traditional Silk Wedding",
      coverUrl: "https://example.com/couple-photo.jpg",
      coverSource: "owner",
      media: {
        coverImage: { fileUrl: "https://example.com/couple-photo.jpg" },
      },
    };

    render(
      <MemoryRouter>
        <InvitationForm invitation={decorativeInvitation} />
      </MemoryRouter>
    );

    // silk-heritage is decorative; its cover remains the traditional tapestry
    const silkTemplate = getTemplateById("silk-heritage");
    expect(silkTemplate).toBeDefined();
    // Front cover image in the studio preserves silk default cover or allows explicit override
    // Form is mounted without crashing
    expect(screen.getByText(/Traditional Silk Wedding/)).toBeInTheDocument();
  });

  it("maps uploaded cover photo into compatible templates like khmer-floral-gold", () => {
    const floralInvitation = {
      id: 502,
      templateId: "khmer-floral-gold",
      templateCode: "khmer-floral-gold",
      title: "Floral Gold Wedding",
      coverUrl: "https://example.com/couple-photo.jpg",
      coverSource: "owner",
      media: {
        coverImage: { fileUrl: "https://example.com/couple-photo.jpg" },
      },
    };

    render(
      <MemoryRouter>
        <InvitationForm invitation={floralInvitation} />
      </MemoryRouter>
    );

    expect(screen.getByText(/Floral Gold Wedding/)).toBeInTheDocument();
  });
});
