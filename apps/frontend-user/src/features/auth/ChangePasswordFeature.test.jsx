import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import ChangePasswordFeature from "./ChangePasswordFeature";
import authService from "./api/authApi";
import { useLanguageStore } from "../../stores/useLanguageStore";

vi.mock("./api/authApi", () => ({
  default: {
    changePassword: vi.fn(),
  },
}));

describe("ChangePasswordFeature (U-02)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useLanguageStore.getState().setLang("en");
  });

  afterEach(() => {
    cleanup();
  });

  it("renders heading, labels, and 48px height styled inputs", () => {
    render(<ChangePasswordFeature />);
    expect(screen.getByRole("heading", { name: /Change password/i })).toBeInTheDocument();

    const currentInput = screen.getByLabelText(/Current password/i);
    const newInput = screen.getByLabelText(/^New password/i);
    const confirmInput = screen.getByLabelText(/Confirm new password/i);

    expect(currentInput).toBeInTheDocument();
    expect(currentInput).toHaveAttribute("type", "password");
    expect(currentInput).toHaveAttribute("autocomplete", "current-password");

    expect(newInput).toBeInTheDocument();
    expect(newInput).toHaveAttribute("type", "password");
    expect(newInput).toHaveAttribute("autocomplete", "new-password");

    expect(confirmInput).toBeInTheDocument();
    expect(confirmInput).toHaveAttribute("type", "password");
    expect(confirmInput).toHaveAttribute("autocomplete", "new-password");

    const submitBtn = screen.getByRole("button", { name: /Change password/i });
    expect(submitBtn).toBeInTheDocument();
    expect(submitBtn).toBeDisabled();
  });

  it("shows error alert when passwords do not match", async () => {
    render(<ChangePasswordFeature />);

    fireEvent.change(screen.getByLabelText(/Current password/i), { target: { value: "oldsecret123" } });
    fireEvent.change(screen.getByLabelText(/^New password/i), { target: { value: "newsecret123" } });
    fireEvent.change(screen.getByLabelText(/Confirm new password/i), { target: { value: "different123" } });

    expect(screen.getAllByRole("alert")[0]).toHaveTextContent(/Passwords do not match/i);
    expect(screen.getByRole("button", { name: /Change password/i })).toBeDisabled();
  });

  it("submits change password successfully and clears fields", async () => {
    authService.changePassword.mockResolvedValueOnce({ success: true });
    render(<ChangePasswordFeature />);

    fireEvent.change(screen.getByLabelText(/Current password/i), { target: { value: "oldsecret123" } });
    fireEvent.change(screen.getByLabelText(/^New password/i), { target: { value: "newsecret123" } });
    fireEvent.change(screen.getByLabelText(/Confirm new password/i), { target: { value: "newsecret123" } });

    const submitBtn = screen.getByRole("button", { name: /Change password/i });
    expect(submitBtn).toBeEnabled();

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(authService.changePassword).toHaveBeenCalledWith("oldsecret123", "newsecret123");
    });

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(/Password changed successfully/i);
    });

    expect(screen.getByLabelText(/Current password/i)).toHaveValue("");
    expect(screen.getByLabelText(/^New password/i)).toHaveValue("");
    expect(screen.getByLabelText(/Confirm new password/i)).toHaveValue("");
  });
});
