import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import authService from "./api/authApi";
import Login from "./LoginFeature";
import { useLanguageStore } from "../../stores/useLanguageStore";

const mockLogin = vi.fn();

vi.mock("@/features/auth/hooks/useAuth", () => ({
  useAuth: () => ({ login: mockLogin }),
}));

vi.mock("./api/authApi", () => ({
  default: { login: vi.fn() },
}));

vi.mock("./components/SocialAuthButtons", () => ({
  default: () => <div data-testid="social-buttons" />,
}));

function renderLogin(initialEntry = "/login") {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/app/events" element={<div>Dashboard Page</div>} />
        <Route path="/templates/browse" element={<div>Browse Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("LoginFeature", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useLanguageStore.getState().setLang("en");
    authService.login.mockResolvedValue({
      accessToken: "mock.token.jwt",
      user: { id: 1, role: "USER", fullName: "Test User" },
    });
  });

  afterEach(cleanup);

  it("renders heading, labels, and accessible inputs", () => {
    renderLogin();
    expect(screen.getByRole("heading", { name: /Welcome Back/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone or Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password/i)).toBeInTheDocument();
    const submitBtn = screen.getByRole("button", { name: /Sign In/i });
    expect(submitBtn).toBeInTheDocument();
    expect(submitBtn).toBeEnabled();
  });

  it("toggles password visibility with accessible label and aria-pressed", () => {
    renderLogin();
    const passwordInput = screen.getByLabelText(/^Password/i);
    expect(passwordInput).toHaveAttribute("type", "password");

    const toggleBtn = screen.getByRole("button", { name: /Show password/i });
    expect(toggleBtn).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(toggleBtn);
    expect(passwordInput).toHaveAttribute("type", "text");
    expect(toggleBtn).toHaveAttribute("aria-pressed", "true");
    expect(toggleBtn).toHaveAttribute("aria-label", "Hide password");

    fireEvent.click(toggleBtn);
    expect(passwordInput).toHaveAttribute("type", "password");
    expect(toggleBtn).toHaveAttribute("aria-pressed", "false");
  });

  it("shows error alert on empty submit", async () => {
    renderLogin();
    const submitBtn = screen.getByRole("button", { name: /Sign In/i });
    fireEvent.submit(submitBtn.closest("form"));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/Please fill in all required fields/i);
    expect(authService.login).not.toHaveBeenCalled();
  });

  it("successfully signs in and redirects to default destination", async () => {
    renderLogin();
    fireEvent.change(screen.getByLabelText(/Phone or Email/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^Password/i), {
      target: { value: "ValidPassword123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Sign In/i }));

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith("user@example.com", "ValidPassword123");
    });
    expect(mockLogin).toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByText("Dashboard Page")).toBeInTheDocument();
    });
  });

  it("respects safe continuation parameter on sign in", async () => {
    renderLogin("/login?next=%2Ftemplates%2Fbrowse");
    fireEvent.change(screen.getByLabelText(/Phone or Email/i), {
      target: { value: "012345678" },
    });
    fireEvent.change(screen.getByLabelText(/^Password/i), {
      target: { value: "SecretPass1" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Sign In/i }));

    await waitFor(() => {
      expect(screen.getByText("Browse Page")).toBeInTheDocument();
    });
  });

  it("renders server error alert on failed sign in", async () => {
    authService.login.mockRejectedValueOnce(new Error("Invalid credentials"));
    renderLogin();
    fireEvent.change(screen.getByLabelText(/Phone or Email/i), {
      target: { value: "wrong@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^Password/i), {
      target: { value: "WrongPass" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Sign In/i }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Invalid credentials");
  });

  it("supports Khmer locale rendering", () => {
    useLanguageStore.getState().setLang("km");
    renderLogin();
    expect(screen.getByRole("heading", { name: /សូមស្វាគមន៍មកវិញ/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ចូលគណនី/i })).toBeInTheDocument();
  });
});
