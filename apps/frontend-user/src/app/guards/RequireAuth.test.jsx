import { useLanguageStore } from "@/stores/useLanguageStore";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

beforeEach(() => useLanguageStore.setState({ lang: "en" }));

import RequireAuth from "./RequireAuth";

let isAuthenticated = false;
let isLoading = false;
let authStatus = 'anonymous';
const retrySession = vi.fn();
vi.mock("@/features/auth/hooks/useAuth", () => ({
  useAuth: () => ({ isAuthenticated, isLoading, authStatus, sessionError:'Unlocalized upstream diagnostic', retrySession }),
}));

function LoginProbe() {
  const location = useLocation();
  return <p>login{location.search}</p>;
}

function renderProtected(path = "/dashboard?tab=events#today") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/login" element={<LoginProbe />} />
        <Route path="/dashboard" element={<RequireAuth><h1>Private dashboard</h1></RequireAuth>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("RequireAuth", () => {
  beforeEach(() => { isAuthenticated = false; isLoading = false; authStatus = 'anonymous'; });
  afterEach(cleanup);

  it("redirects a guest and preserves the complete intended URL", () => {
    renderProtected();
    expect(screen.getByText("login?next=%2Fdashboard%3Ftab%3Devents%23today")).toBeInTheDocument();
  });

  it("renders the protected page for an authenticated user", () => {
    isAuthenticated = true;
    renderProtected("/dashboard");
    expect(screen.getByRole("heading", { name: "Private dashboard" })).toBeInTheDocument();
  });

  it("waits for cookie verification before redirecting or rendering private content", () => {
    isLoading = true;
    renderProtected();
    expect(screen.getByRole("status")).toHaveTextContent("Checking your session");
    expect(screen.queryByText(/^login/)).not.toBeInTheDocument();
    expect(screen.queryByText("Private dashboard")).not.toBeInTheDocument();
  });
  it.each(['en','km'])('C08-010 localizes retry errors without echoing upstream diagnostics in %s', lang => {
    useLanguageStore.setState({lang}); authStatus = 'error'; renderProtected();
    expect(screen.getByRole('alert')).not.toHaveTextContent('Unlocalized upstream diagnostic');
    expect(screen.getByRole('alert')).toHaveTextContent(lang==='en'?'Could not verify your session':'មិនអាចផ្ទៀងផ្ទាត់គណនីរបស់អ្នកបានទេ');
    expect(screen.getByRole('link')).toHaveAttribute('href','/login?next=%2Fdashboard%3Ftab%3Devents%23today');
  });
});
