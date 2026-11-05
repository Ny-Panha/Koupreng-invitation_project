import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";

import { AuthProvider } from "../providers/AdminAuthProvider";
import RequireAdmin from "./RequireAdmin";

function futureTestToken() {
  const payload = btoa(JSON.stringify({ exp: 4102444800 }))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  return ["test-header", payload, "test-signature"].join(".");
}

function LoginProbe() {
  const location = useLocation();
  return <p>login{location.search}</p>;
}

function renderProtected() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={["/users?status=active"]}>
        <Routes>
          <Route path="/login" element={<LoginProbe />} />
          <Route path="/users" element={<RequireAdmin><h1>Admin users</h1></RequireAdmin>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

describe("RequireAdmin", () => {
  beforeEach(() => {
    cleanup();
    window.sessionStorage.clear();
  });

  it("redirects an anonymous user and preserves the intended URL", () => {
    renderProtected();
    expect(screen.getByText("login?next=%2Fusers%3Fstatus%3Dactive")).toBeInTheDocument();
  });

  it("allows a valid ADMIN session", () => {
    window.sessionStorage.setItem("koupreng.admin.auth", JSON.stringify({
      accessToken: futureTestToken(),
      user: { role: "ADMIN" },
    }));
    renderProtected();
    expect(screen.getByRole("heading", { name: "Admin users" })).toBeInTheDocument();
  });

  it("allows role with lowercase admin", () => {
    window.sessionStorage.setItem("koupreng.admin.auth", JSON.stringify({
      accessToken: futureTestToken(),
      user: { role: "admin" },
    }));
    renderProtected();
    expect(screen.getByRole("heading", { name: "Admin users" })).toBeInTheDocument();
  });

  it("allows role with Spring Security ROLE_ADMIN prefix", () => {
    window.sessionStorage.setItem("koupreng.admin.auth", JSON.stringify({
      accessToken: futureTestToken(),
      user: { role: "ROLE_ADMIN" },
    }));
    renderProtected();
    expect(screen.getByRole("heading", { name: "Admin users" })).toBeInTheDocument();
  });

  it("denies STAFF access to administrative pages with accessible Access Denied state", () => {
    window.sessionStorage.setItem("koupreng.admin.auth", JSON.stringify({
      accessToken: futureTestToken(),
      user: { email: "staff@koupreng.com", role: "STAFF" },
    }));
    renderProtected();
    expect(screen.queryByRole("heading", { name: "Admin users" })).not.toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/Access Denied/i)).toBeInTheDocument();
    expect(screen.getByText(/STAFF/i)).toBeInTheDocument();
  });

  it("denies USER role access to administrative pages", () => {
    window.sessionStorage.setItem("koupreng.admin.auth", JSON.stringify({
      accessToken: futureTestToken(),
      user: { email: "user@koupreng.com", role: "USER" },
    }));
    renderProtected();
    expect(screen.queryByRole("heading", { name: "Admin users" })).not.toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/Access Denied/i)).toBeInTheDocument();
  });

  it("denies unsupported roles like SUPER_ADMIN or ADMIN_MANAGER", () => {
    window.sessionStorage.setItem("koupreng.admin.auth", JSON.stringify({
      accessToken: futureTestToken(),
      user: { role: "SUPER_ADMIN" },
    }));
    renderProtected();
    expect(screen.queryByRole("heading", { name: "Admin users" })).not.toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/SUPER_ADMIN/i)).toBeInTheDocument();
  });

  it("allows signing out from the Access Denied screen", () => {
    window.sessionStorage.setItem("koupreng.admin.auth", JSON.stringify({
      accessToken: futureTestToken(),
      user: { role: "STAFF" },
    }));
    renderProtected();
    const signOutBtn = screen.getByRole("button", { name: /Sign Out/i });
    expect(signOutBtn).toBeInTheDocument();
    fireEvent.click(signOutBtn);
    expect(window.sessionStorage.getItem("koupreng.admin.auth")).toBeNull();
  });
});
