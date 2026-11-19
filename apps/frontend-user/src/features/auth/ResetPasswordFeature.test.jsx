import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import authService from "./api/authApi";
import ResetPassword from "./ResetPasswordFeature";
import { useLanguageStore } from "../../stores/useLanguageStore";

vi.mock("./api/authApi", () => ({
  default: { resetPassword: vi.fn() },
}));

function renderResetPassword(initialEntry = "/reset-password") {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("ResetPasswordFeature", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useLanguageStore.getState().setLang("en");
    authService.resetPassword.mockResolvedValue({
      message: "Password reset successfully.",
    });
  });

  afterEach(cleanup);

  it("renders heading, token input, new password, and confirm fields", () => {
    renderResetPassword();
    expect(screen.getByRole("heading", { name: /Set new password/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Reset token/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^New password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm new password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Update password/i })).toBeDisabled();
  });

  it("accepts a token link without exposing the token in the rendered form", () => {
    const { container } = renderResetPassword("/reset-password?token=sample-token-123");
    expect(screen.queryByLabelText(/Reset token/i)).not.toBeInTheDocument();
    expect(container.innerHTML).not.toContain('sample-token-123');
  });
  it('C08-003 lets a malformed overlong link token be replaced manually', () => {
    renderResetPassword('/reset-password?token='+'x'.repeat(256));
    fireEvent.click(screen.getByRole('button',{name:'Enter another reset token'}));
    expect(screen.getByLabelText('Reset token')).toHaveValue('');
    expect(screen.getByLabelText('Reset token')).toHaveAttribute('type','password');
  });

  it("toggles password visibility with accessible names", () => {
    renderResetPassword();
    const newPasswordInput = screen.getByLabelText(/^New password/i);
    expect(newPasswordInput).toHaveAttribute("type", "password");

    const toggleButtons = screen.getAllByRole("button", { name: /Show password/i });
    expect(toggleButtons.length).toBeGreaterThanOrEqual(1);

    fireEvent.click(toggleButtons[0]);
    expect(newPasswordInput).toHaveAttribute("type", "text");
    expect(toggleButtons[0]).toHaveAttribute("aria-pressed", "true");
    expect(toggleButtons[0]).toHaveAttribute("aria-label", "Hide password");
  });

  it("shows error when passwords do not match", () => {
    renderResetPassword("/reset-password?token=sample-token");
    fireEvent.change(screen.getByLabelText(/^New password/i), {
      target: { value: "NewPassword123" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm new password/i), {
      target: { value: "DifferentPassword123" },
    });

    expect(screen.getByRole("status")).toHaveTextContent(/Passwords do not match/i);
    expect(screen.getByRole("button", { name: /Update password/i })).toBeDisabled();
  });

  it("submits valid reset and shows success screen", async () => {
    renderResetPassword("/reset-password?token=sample-token");
    fireEvent.change(screen.getByLabelText(/^New password/i), {
      target: { value: "NewPassword123" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm new password/i), {
      target: { value: "NewPassword123" },
    });

    const submitBtn = screen.getByRole("button", { name: /Update password/i });
    expect(submitBtn).toBeEnabled();
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(authService.resetPassword).toHaveBeenCalledWith("sample-token", "NewPassword123");
    });

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /Password updated successfully/i })).toBeInTheDocument();
    });
    expect(screen.getByRole("link", { name: /Sign in now/i })).toBeInTheDocument();
  });

  it("handles reset failure response", async () => {
    authService.resetPassword.mockRejectedValueOnce(new Error("Token expired or invalid"));
    renderResetPassword("/reset-password?token=expired-token");
    fireEvent.change(screen.getByLabelText(/^New password/i), {
      target: { value: "NewPassword123" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm new password/i), {
      target: { value: "NewPassword123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Update password/i }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Token expired or invalid");
  });
});
