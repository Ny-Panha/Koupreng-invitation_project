import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import authService from "./api/authApi";
import ForgotPassword from "./ForgotPasswordFeature";
import { useLanguageStore } from "../../stores/useLanguageStore";

vi.mock("./api/authApi", () => ({
  default: { forgotPassword: vi.fn() },
}));

function renderForgotPassword(initialEntry = "/forgot-password") {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<div>Reset Password Page</div>} />
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("ForgotPasswordFeature", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useLanguageStore.getState().setLang("en");
    authService.forgotPassword.mockResolvedValue({
      message: "If this email is registered, password reset instructions have been sent.",
    });
  });

  afterEach(cleanup);

  it("renders heading, email field, submit button, and phone account recovery hint", () => {
    renderForgotPassword();
    expect(screen.getByRole("heading", { name: /Forgot your password\?/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Send reset instructions/i })).toBeInTheDocument();
    expect(screen.getByText(/Signed up with phone\?/i)).toBeInTheDocument();
  });

  it("shows error alert on empty submit", async () => {
    renderForgotPassword();
    const submitBtn = screen.getByRole("button", { name: /Send reset instructions/i });
    fireEvent.submit(submitBtn.closest("form"));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/Please enter your email address/i);
    expect(authService.forgotPassword).not.toHaveBeenCalled();
  });

  it("submits recovery request and confirms receipt without certifying delivery", async () => {
    renderForgotPassword();
    fireEvent.change(screen.getByLabelText(/Email address/i), {
      target: { value: "user@example.com" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Send reset instructions/i }));

    await waitFor(() => {
      expect(authService.forgotPassword).toHaveBeenCalledWith("user@example.com");
    });

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /Request received/i })).toBeInTheDocument();
    });

    expect(screen.getByRole("link", { name: /Enter reset token to set new password/i })).toBeInTheDocument();
  });

  it("displays server error alert when recovery request fails", async () => {
    authService.forgotPassword.mockRejectedValueOnce(new Error("Rate limit exceeded"));
    renderForgotPassword();
    fireEvent.change(screen.getByLabelText(/Email address/i), {
      target: { value: "blocked@example.com" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Send reset instructions/i }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent('Could not request password reset. Please try again.');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it("renders in Khmer locale", () => {
    useLanguageStore.getState().setLang("km");
    renderForgotPassword();
    expect(screen.getByRole("heading", { name: /ភ្លេចលេខសម្ងាត់\?/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ផ្ញើសំណើកំណត់លេខសម្ងាត់/i })).toBeInTheDocument();
  });
});
