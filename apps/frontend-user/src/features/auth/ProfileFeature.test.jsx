import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ProfilePage from "./ProfileFeature";
import { userService } from "./api/userApi";
import { useLanguageStore } from "../../stores/useLanguageStore";

const mockUpdateUser = vi.fn();
const mockLogout = vi.fn();

vi.mock("@/features/auth/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { id: 1, fullName: "Koupreng Host", email: "host@example.com", phone: "012345678" },
    logout: mockLogout,
    updateUser: mockUpdateUser,
    isAuthenticated: true,
  }),
}));

vi.mock("./api/userApi", () => ({
  userService: {
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
    uploadProfileImage: vi.fn(),
    changePassword: vi.fn(),
  },
}));

vi.mock("./components/SocialAuthButtons", () => ({
  default: () => <div data-testid="social-auth-buttons" />,
}));

describe("ProfileFeature", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useLanguageStore.getState().setLang("en");
    userService.getProfile.mockResolvedValue({
      fullName: "Koupreng Host",
      phone: "012345678",
      profileImage: "/uploads/avatar.jpg",
    });
    userService.updateProfile.mockResolvedValue({
      fullName: "Updated Name",
      phone: "098765432",
      profileImage: "/uploads/avatar.jpg",
    });
    userService.changePassword.mockResolvedValue({ success: true });
  });

  afterEach(cleanup);

  it("loads and renders user profile data", async () => {
    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /Your profile/i })).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/Full name/i)).toHaveValue("Koupreng Host");
    expect(screen.getByLabelText(/Phone number/i)).toHaveValue("012345678");
    expect(screen.getByLabelText(/Email/i)).toHaveValue("host@example.com");
    expect(screen.getByLabelText(/Email/i)).toBeDisabled();
  });

  it("updates full name and phone number on submit", async () => {
    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Full name/i)).toHaveValue("Koupreng Host");
    });

    fireEvent.change(screen.getByLabelText(/Full name/i), { target: { value: "Updated Name" } });
    fireEvent.change(screen.getByLabelText(/Phone number/i), { target: { value: "098765432" } });

    const saveBtn = screen.getByRole("button", { name: /Save changes/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(userService.updateProfile).toHaveBeenCalledWith({
        fullName: "Updated Name",
        phone: "098765432",
        profileImage: "/uploads/avatar.jpg",
      });
    });

    expect(mockUpdateUser).toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(/Profile saved/i);
    });
  });

  it("shows error alert when profile save fails", async () => {
    userService.updateProfile.mockRejectedValueOnce(new Error("Network timeout"));
    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Full name/i)).toHaveValue("Koupreng Host");
    });

    fireEvent.change(screen.getByLabelText(/Full name/i), { target: { value: "Fail Name" } });
    fireEvent.click(screen.getByRole("button", { name: /Save changes/i }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Network timeout");
  });

  it("toggles change password accordion and updates password with validation", async () => {
    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /Your profile/i })).toBeInTheDocument();
    });

    const accordionBtn = screen.getByRole("button", { name: /Change password/i });
    expect(accordionBtn).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(accordionBtn);
    expect(accordionBtn).toHaveAttribute("aria-expanded", "true");

    const currentPw = screen.getByLabelText(/Current password/i);
    const newPw = screen.getByLabelText(/^New password/i);
    const confirmPw = screen.getByLabelText(/Confirm new password/i);

    fireEvent.change(currentPw, { target: { value: "OldPassword123" } });
    fireEvent.change(newPw, { target: { value: "NewSecret123" } });
    fireEvent.change(confirmPw, { target: { value: "DifferentSecret123" } });

    const submitPwBtn = screen.getByRole("button", { name: /Update password/i });
    fireEvent.click(submitPwBtn);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/The new passwords do not match/i);
    expect(userService.changePassword).not.toHaveBeenCalled();

    fireEvent.change(confirmPw, { target: { value: "NewSecret123" } });
    fireEvent.click(submitPwBtn);

    await waitFor(() => {
      expect(userService.changePassword).toHaveBeenCalledWith("OldPassword123", "NewSecret123");
    });
  });

  it("renders in Khmer locale", async () => {
    useLanguageStore.getState().setLang("km");
    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /ប្រវត្តិរូបរបស់អ្នក/i })).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: /រក្សាទុកការកែប្រែ/i })).toBeInTheDocument();
  });
});
