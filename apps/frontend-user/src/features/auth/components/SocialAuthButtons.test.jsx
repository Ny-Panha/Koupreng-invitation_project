import { render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const login = vi.fn();

vi.mock("@/features/auth/hooks/useAuth", () => ({
  useAuth: () => ({ login }),
}));

vi.mock("@/features/auth/api/authApi", () => ({
  default: {
    loginWithGoogle: vi.fn(),
    loginWithTelegram: vi.fn(),
  },
}));

describe("SocialAuthButtons", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_GOOGLE_CLIENT_ID", "test-client.apps.googleusercontent.com");
    vi.stubEnv("VITE_TELEGRAM_CLIENT_ID", "1234567890");
    vi.stubEnv("VITE_PUBLIC_APP_URL", "https://example.test");

    const initialize = vi.fn();
    const renderButton = vi.fn((host) => {
      const iframe = document.createElement("iframe");
      iframe.title = "Sign in with Google";
      host.appendChild(iframe);
    });

    window.google = { accounts: { id: { initialize, renderButton } } };
    window.Telegram = { Login: { auth: vi.fn() } };
  });

  afterEach(() => {
    document.getElementById("google-gsi-script")?.remove();
    document.getElementById("telegram-login-script")?.remove();
    delete window.google;
    delete window.Telegram;
    vi.unstubAllEnvs();
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("renders Google's real interactive button instead of hiding it behind a custom button", async () => {
    const { default: SocialAuthButtons } = await import("./SocialAuthButtons");
    const { container } = render(
      <MemoryRouter>
        <SocialAuthButtons />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(window.google.accounts.id.renderButton).toHaveBeenCalledOnce();
    });

    const googleHost = container.querySelector(".auth-gsi-host");
    expect(googleHost).not.toHaveAttribute("aria-hidden");
    expect(googleHost.querySelector('iframe[title="Sign in with Google"]')).toBeInTheDocument();
    expect(window.google.accounts.id.renderButton).toHaveBeenCalledWith(
      googleHost,
      expect.objectContaining({ text: "continue_with", logo_alignment: "left" }),
    );
  });
});
