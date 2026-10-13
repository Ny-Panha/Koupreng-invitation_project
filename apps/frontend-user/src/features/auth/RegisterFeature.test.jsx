import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({ register: vi.fn() }));
vi.mock("@/features/auth/api/authApi", () => ({ default: api }));
vi.mock("@/features/auth/hooks/useAuth", () => ({ useAuth: () => ({ login: vi.fn() }) }));
vi.mock("../../shared/i18n/useT", () => ({ useT: () => ({ auth: (key) => key }) }));
vi.mock("./components/SocialAuthButtons", () => ({ default: () => null }));
import RegisterFeature from "./RegisterFeature";

afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe("registration password requirements", () => {
  it.each(["lowercase123", "Short1"])("rejects %s before a registration request", (password) => {
    const view = render(<MemoryRouter><RegisterFeature /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText("fullName"), { target: { value: "Fixture User" } });
    fireEvent.change(screen.getByLabelText("phone"), { target: { value: "012345678" } });
    fireEvent.change(screen.getByLabelText("password"), { target: { value: password } });
    fireEvent.change(screen.getByLabelText("confirmPassword"), { target: { value: password } });
    fireEvent.submit(view.container.querySelector("form"));
    expect(screen.getByText(/Password needs 8 characters and an uppercase letter/)).toBeInTheDocument();
    expect(api.register).not.toHaveBeenCalled();
  });
});
