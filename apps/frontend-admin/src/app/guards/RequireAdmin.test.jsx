import { render, screen, cleanup } from "@testing-library/react";
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

  it("allows role with lowercase admin or SUPER_ADMIN", () => {
    window.sessionStorage.setItem("koupreng.admin.auth", JSON.stringify({
      accessToken: futureTestToken(),
      user: { role: "admin" },
    }));
    renderProtected();
    expect(screen.getByRole("heading", { name: "Admin users" })).toBeInTheDocument();
  });

  it("allows role with Spring Security ROLE_ADMIN or ADMIN_MANAGER in roles array", () => {
    window.sessionStorage.setItem("koupreng.admin.auth", JSON.stringify({
      accessToken: futureTestToken(),
      user: { role: "ROLE_ADMIN", roles: ["ROLE_ADMIN_MANAGER"] },
    }));
    renderProtected();
    expect(screen.getByRole("heading", { name: "Admin users" })).toBeInTheDocument();
  });
});
