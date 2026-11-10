import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import EventCreatePage from "./EventCreatePage";
import { generateSecureUuid } from "@/shared/utils/uuid";

// Mock the services used by EventCreatePage so it renders cleanly
vi.mock("@/shared/api/httpClient", () => ({
  api: {
    get: vi.fn().mockResolvedValue({ data: [] }),
    post: vi.fn().mockResolvedValue({ data: {} }),
  },
}));

vi.mock("@/features/templates/api/templateCatalogApi", () => ({
  templateCatalogService: {
    list: vi.fn().mockResolvedValue([]),
    recommendations: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock("@/features/subscriptions/subscriptionService", () => ({
  default: {
    current: vi.fn().mockResolvedValue({ id: "FREE", code: "FREE", name: "Free Tier" }),
    getCurrentPlan: vi.fn().mockResolvedValue({ id: "FREE", code: "FREE", name: "Free Tier" }),
  },
}));

vi.mock("@/features/auth/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { id: "user-123", email: "host@example.test", role: "HOST" },
    token: "mock-jwt-token",
    isAuthenticated: true,
  }),
}));

vi.mock("@/shared/access/entitlementContext", () => ({
  useAccountEntitlements: () => ({
    entitlements: {},
    loading: false,
  }),
}));

describe("Workstream A — P0 Real iPhone Safari Blank-Screen Hotfix", () => {
  const originalCrypto = globalThis.crypto;
  const originalIsSecureContext = window.isSecureContext;

  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    Object.defineProperty(globalThis, "crypto", {
      value: originalCrypto,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(window, "isSecureContext", {
      value: originalIsSecureContext,
      writable: true,
      configurable: true,
    });
  });

  it("renders EventCreatePage without crashing when crypto.randomUUID is undefined on insecure LAN HTTP", async () => {
    // Simulate iOS Safari accessing http://192.168.18.98:5173/app/events/new
    // where window.isSecureContext is false and crypto.randomUUID is undefined
    const mockGetRandomValues = (arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = (i * 31 + 7) & 0xff;
      }
      return arr;
    };

    Object.defineProperty(window, "isSecureContext", {
      value: false,
      writable: true,
      configurable: true,
    });

    Object.defineProperty(globalThis, "crypto", {
      value: {
        getRandomValues: mockGetRandomValues,
        randomUUID: undefined, // Simulates insecure WebKit/Blink behavior
      },
      writable: true,
      configurable: true,
    });

    // Verify generateSecureUuid still works under these conditions
    const generatedId = generateSecureUuid();
    expect(generatedId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);

    // Render EventCreatePage
    render(
      <MemoryRouter initialEntries={["/app/events/new"]}>
        <EventCreatePage />
      </MemoryRouter>
    );

    // Verify page content mounts properly without crashing
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /បង្កើតកម្មវិធីរបស់អ្នក|Create Your Event/i })
      ).toBeInTheDocument();
      expect(screen.getAllByText(/Wedding|អាពាហ៍ពិពាហ៍/).length).toBeGreaterThan(0);
    });
  });
});
