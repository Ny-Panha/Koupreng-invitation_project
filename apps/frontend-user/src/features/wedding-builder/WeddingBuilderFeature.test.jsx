import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import WeddingBuilderFeature from "./WeddingBuilderFeature";

vi.mock("../templates/api/templateCatalogApi", () => ({
  templateCatalogService: {
    list: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock("@/features/invitations/api/invitationApi", () => ({
  invitationService: {
    create: vi.fn().mockResolvedValue({ id: "mock-inv-123" }),
  },
}));

describe("WeddingBuilderFeature - Template & Theme Selection", () => {
  it("renders the Template & Theme card on the Create Wedding page", () => {
    render(
      <BrowserRouter>
        <WeddingBuilderFeature />
      </BrowserRouter>
    );

    // Section title
    expect(screen.getByText(/គំរូធៀប & រចនាប័ទ្ម/i)).toBeInTheDocument();


    // Gate styles
    expect(screen.getByText(/វាំងននប្រណិត/i)).toBeInTheDocument();
    expect(screen.getByText(/ស្រោមសំបុត្រ 3D/i)).toBeInTheDocument();
    expect(screen.getByText(/រាជវាំងខ្មែរ/i)).toBeInTheDocument();
    expect(screen.getByText(/ទ្វារវេទមន្ត/i)).toBeInTheDocument();

    // Color labels
    expect(screen.getByText(/ពណ៌ចម្បង/i)).toBeInTheDocument();
    expect(screen.getByText(/ពណ៌រំលេច/i)).toBeInTheDocument();
  });
});
