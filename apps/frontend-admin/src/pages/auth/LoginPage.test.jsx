import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthProvider } from "../../app/providers/AdminAuthProvider";
import { AdminLanguageProvider } from "../../app/providers/AdminLanguageProvider";
import LoginPage from "./LoginPage";
import { authService } from "../../shared/api";

vi.mock("../../shared/api", () => ({
  authService: {
    login: vi.fn(),
    logout: vi.fn(),
  },
}));

function renderLoginPage(initialEntry = "/login") {
  return render(
    <AdminLanguageProvider>
      <AuthProvider>
        <MemoryRouter initialEntries={[initialEntry]}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<h1>Dashboard Page</h1>} />
            <Route path="/users" element={<h1>Users Page</h1>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </AdminLanguageProvider>
  );
}

describe("LoginPage", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    window.sessionStorage.clear();
    window.localStorage.clear();
    window.localStorage.setItem("koupreng.admin.lang", "km");
    window.localStorage.setItem("koupreng.lang", "km");
  });

  it("renders login form with Khmer defaults and allows toggling to English", () => {
    renderLoginPage();
    expect(screen.getByRole("button", { name: "ចូលគណនី" })).toBeInTheDocument();
    expect(screen.getByLabelText("អ៊ីមែល ឬ លេខទូរស័ព្ទ")).toBeInTheDocument();
    expect(screen.getByLabelText("លេខសម្ងាត់")).toBeInTheDocument();

    // Toggle to EN
    const enButton = screen.getByRole("button", { name: "EN" });
    fireEvent.click(enButton);

    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
    expect(screen.getByLabelText("Email or Phone")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  it("toggles password visibility with accessible label", () => {
    renderLoginPage();
    const passwordInput = screen.getByLabelText("លេខសម្ងាត់");
    expect(passwordInput).toHaveAttribute("type", "password");

    const toggleBtn = screen.getByRole("button", { name: /បង្ហាញលេខសម្ងាត់/i });
    fireEvent.click(toggleBtn);
    expect(passwordInput).toHaveAttribute("type", "text");

    const hideBtn = screen.getByRole("button", { name: /លាក់លេខសម្ងាត់/i });
    fireEvent.click(hideBtn);
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("shows session expired alert when expired=true query parameter is present", () => {
    renderLoginPage("/login?expired=true");
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText(/សម័យការរបស់អ្នកបានផុតកំណត់/i)).toBeInTheDocument();
  });

  it("displays error message on invalid credentials", async () => {
    authService.login.mockRejectedValueOnce(new Error("Invalid email or password"));
    renderLoginPage();

    fireEvent.change(screen.getByLabelText("អ៊ីមែល ឬ លេខទូរស័ព្ទ"), {
      target: { value: "wrong@koupreng.com" },
    });
    fireEvent.change(screen.getByLabelText("លេខសម្ងាត់"), {
      target: { value: "badpassword" },
    });
    fireEvent.click(screen.getByRole("button", { name: "ចូលគណនី" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText("Invalid email or password")).toBeInTheDocument();
    });
  });

  it("rejects non-admin role login and shows role rejection error", async () => {
    authService.login.mockResolvedValueOnce({
      accessToken: "dummy-token",
      user: { id: 10, email: "staff@koupreng.com", role: "STAFF" },
    });
    renderLoginPage();

    fireEvent.change(screen.getByLabelText("អ៊ីមែល ឬ លេខទូរស័ព្ទ"), {
      target: { value: "staff@koupreng.com" },
    });
    fireEvent.change(screen.getByLabelText("លេខសម្ងាត់"), {
      target: { value: "validpassword" },
    });
    fireEvent.click(screen.getByRole("button", { name: "ចូលគណនី" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText(/មិនមែនជា Admin ទេ/i)).toBeInTheDocument();
    });
  });

  it("successfully authenticates ADMIN and redirects to intended safe next URL", async () => {
    authService.login.mockResolvedValueOnce({
      accessToken: "valid-admin-jwt",
      user: { id: 1, email: "admin@koupreng.com", role: "ADMIN" },
    });
    renderLoginPage("/login?next=%2Fusers");

    fireEvent.change(screen.getByLabelText("អ៊ីមែល ឬ លេខទូរស័ព្ទ"), {
      target: { value: "admin@koupreng.com" },
    });
    fireEvent.change(screen.getByLabelText("លេខសម្ងាត់"), {
      target: { value: "correctpassword" },
    });
    fireEvent.click(screen.getByRole("button", { name: "ចូលគណនី" }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Users Page" })).toBeInTheDocument();
    });
  });

  it("prevents open redirect attacks by falling back to /dashboard", async () => {
    authService.login.mockResolvedValueOnce({
      accessToken: "valid-admin-jwt",
      user: { id: 1, email: "admin@koupreng.com", role: "ADMIN" },
    });
    renderLoginPage("/login?next=https%3A%2F%2Fmalicious-site.com");

    fireEvent.change(screen.getByLabelText("អ៊ីមែល ឬ លេខទូរស័ព្ទ"), {
      target: { value: "admin@koupreng.com" },
    });
    fireEvent.change(screen.getByLabelText("លេខសម្ងាត់"), {
      target: { value: "correctpassword" },
    });
    fireEvent.click(screen.getByRole("button", { name: "ចូលគណនី" }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Dashboard Page" })).toBeInTheDocument();
    });
  });
});
