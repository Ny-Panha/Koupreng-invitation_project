import { useLanguageStore } from "@/stores/useLanguageStore";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

beforeEach(() => useLanguageStore.getState().setLang("en"));

const login = vi.fn();
const updateUser = vi.fn();
let authenticated = true;

vi.mock("@/features/auth/hooks/useAuth", () => ({
  useAuth: () => ({ login, updateUser, isAuthenticated: authenticated }),
}));

vi.mock("@/features/auth/api/authApi", () => ({
  default: {
    loginWithGoogle: vi.fn(),
    loginWithTelegram: vi.fn(),
    linkGoogle: vi.fn(),
    linkTelegram: vi.fn(),
  },
}));

describe("SocialAuthButtons", () => {
  beforeEach(() => {
    authenticated = true;
    vi.stubEnv("VITE_GOOGLE_CLIENT_ID", "test-client.apps.googleusercontent.com");
    vi.stubEnv("VITE_TELEGRAM_CLIENT_ID", "1234567890");
    vi.stubEnv("VITE_PUBLIC_APP_URL", "https://example.test");

    const initialize = vi.fn();
    const renderButton = vi.fn((host) => {
      const iframe = document.createElement("iframe");
      iframe.srcdoc = "<!doctype html><title>Google sign-in</title>";
      iframe.title = "Sign in with Google";
      host.appendChild(iframe);
    });

    window.google = { accounts: { id: { initialize, renderButton } } };
    window.Telegram = { Login: { auth: vi.fn() } };
  });

  afterEach(() => {
    cleanup();
    document.getElementById("google-gsi-script")?.remove();
    document.getElementById("telegram-login-script")?.remove();
    delete window.google;
    delete window.Telegram;
    delete window.TelegramWebviewProxy;
    vi.restoreAllMocks();
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

  it("explains an unlinked existing account without automatically retrying or merging", async () => {
    const { default: service } = await import("@/features/auth/api/authApi");
    service.loginWithGoogle.mockRejectedValue({ status: 409, data: { code: "ACCOUNT_LINK_REQUIRED" } });
    const { default: SocialAuthButtons } = await import("./SocialAuthButtons");
    render(<MemoryRouter><SocialAuthButtons /></MemoryRouter>);
    await waitFor(() => expect(window.google.accounts.id.initialize).toHaveBeenCalled());
    await act(() => window.google.accounts.id.initialize.mock.calls[0][0].callback({ credential: "verified-token" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Google is not linked to your existing account");
    expect(screen.getByRole("link", { name: "Recover your existing account" })).toHaveAttribute("href", "/forgot-password");
    expect(screen.getByRole("alert")).toHaveTextContent("then sign in and link Google from your profile");
    expect(screen.getByRole("alert")).not.toHaveTextContent("If you only used Telegram");
    expect(login).not.toHaveBeenCalled();
    expect(service.linkGoogle).not.toHaveBeenCalled();
  });

  it("explains Telegram account-link conflicts without directing users to link Google", async () => {
    vi.spyOn(window.location, "origin", "get").mockReturnValue("https://example.test");
    window.TelegramWebviewProxy = {};
    window.Telegram.Login.auth.mockImplementation((_options, callback) => {
      callback({ result: { id_token: "verified-telegram-token" } });
    });
    const { default: service } = await import("@/features/auth/api/authApi");
    service.loginWithTelegram.mockRejectedValue({ status: 409, data: { code: "ACCOUNT_LINK_REQUIRED" } });
    const { default: SocialAuthButtons } = await import("./SocialAuthButtons");
    render(<MemoryRouter><SocialAuthButtons /></MemoryRouter>);
    const button = screen.getByRole("button", { name: /Telegram/ });
    await waitFor(() => expect(button).toBeEnabled());
    await act(async () => { fireEvent.click(button); });

    expect(service.loginWithTelegram).toHaveBeenCalledWith({ idToken: "verified-telegram-token" });
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Telegram is not linked to your existing account");
    expect(alert).toHaveTextContent("then sign in and link Telegram from your profile");
    expect(alert).toHaveTextContent("If you only used Telegram and have no recovery email, contact support");
    expect(alert).not.toHaveTextContent("link Google");
    expect(screen.getByRole("link", { name: "Recover your existing account" })).toHaveAttribute("href", "/forgot-password");
    expect(login).not.toHaveBeenCalled();
    expect(service.linkTelegram).not.toHaveBeenCalled();
    expect(service.loginWithGoogle).not.toHaveBeenCalled();
  });

  it("explicitly links a verified identity and updates the user without replacing the session", async () => {
    const { default: service } = await import("@/features/auth/api/authApi");
    const user = { id: 10, role: "USER", fullName: "Current owner" };
    service.linkGoogle.mockResolvedValue(user);
    const { default: SocialAuthButtons } = await import("./SocialAuthButtons");
    render(<MemoryRouter><SocialAuthButtons mode="link" /></MemoryRouter>);
    await waitFor(() => expect(window.google.accounts.id.initialize).toHaveBeenCalled());
    await act(() => window.google.accounts.id.initialize.mock.calls[0][0].callback({ credential: "verified-token" }));
    expect(service.linkGoogle).toHaveBeenCalledWith("verified-token");
    expect(service.loginWithGoogle).not.toHaveBeenCalled();
    expect(updateUser).toHaveBeenCalledWith(user);
    expect(login).not.toHaveBeenCalled();
    expect(await screen.findByRole("status")).toHaveTextContent("Identity linked");
  });

  it("does not send an identity-link request without a validated signed-in session", async () => {
    authenticated = false;
    const { default: service } = await import("@/features/auth/api/authApi");
    const { default: SocialAuthButtons } = await import("./SocialAuthButtons");
    render(<MemoryRouter><SocialAuthButtons mode="link" /></MemoryRouter>);
    await waitFor(() => expect(window.google.accounts.id.initialize).toHaveBeenCalled());
    await act(() => window.google.accounts.id.initialize.mock.calls[0][0].callback({ credential: "verified-token" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Sign in before linking");
    expect(service.linkGoogle).not.toHaveBeenCalled();
  });
});
