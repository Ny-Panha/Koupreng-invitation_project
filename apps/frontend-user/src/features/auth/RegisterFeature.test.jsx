import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import authService from "./api/authApi";
import Register from "./RegisterFeature";
import { i18nService } from "../../shared/api/i18nService";
import { LOCAL_MESSAGES } from "../../shared/i18n/messagesDictionary";
import { useLanguageStore } from "../../stores/useLanguageStore";

const login = vi.fn();

vi.mock("@/features/auth/hooks/useAuth", () => ({
  useAuth: () => ({ login }),
}));

vi.mock("./api/authApi", () => ({
  default: { register: vi.fn() },
}));

vi.mock("../../shared/api/i18nService", () => ({
  i18nService: { messages: vi.fn() },
}));

vi.mock("./components/SocialAuthButtons", () => ({
  default: () => null,
}));

function renderRegistration() {
  return render(
    <MemoryRouter initialEntries={["/register"]}>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/app/events" element={<p>Registration complete</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

function enterPassword(password, confirmation = password) {
  fireEvent.change(screen.getByLabelText("Password", { exact: true }), { target: { value: password } });
  fireEvent.change(screen.getByLabelText("Confirm Password", { exact: true }), { target: { value: confirmation } });
}

function completeRegistrationFields(password) {
  fireEvent.change(screen.getByLabelText("Full Name"), { target: { value: "Test Host" } });
  fireEvent.change(screen.getByLabelText("Phone Number"), { target: { value: "012345678" } });
  enterPassword(password);
}

function requirement(label) {
  return screen.getByText(label, { exact: true }).closest("li");
}

describe("registration password guidance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useLanguageStore.getState().setLang("en");
    i18nService.messages.mockResolvedValue({ messages: {} });
    authService.register.mockResolvedValue({ user: { id: 1 } });
  });

  afterEach(cleanup);

  it.each(["en", "km"])("shows every requirement below the input only after typing in %s", (language) => {
    useLanguageStore.getState().setLang(language);
    renderRegistration();
    const messages = LOCAL_MESSAGES.authUI[language];
    const passwordInput = screen.getByLabelText(messages.password, { exact: true });
    expect(screen.queryByText(messages.passwordRequirements)).not.toBeInTheDocument();
    expect(passwordInput).not.toHaveAttribute("aria-describedby");
    fireEvent.focus(passwordInput);
    expect(screen.queryByText(messages.passwordRequirements)).not.toBeInTheDocument();

    fireEvent.change(passwordInput, { target: { value: "Abcdefg1" } });
    const guidance = document.getElementById(passwordInput.getAttribute("aria-describedby"));

    expect(guidance).toHaveTextContent(messages.passwordRequirements);
    for (const key of ["passwordMinLength", "passwordMaxLength", "passwordLetter", "passwordUppercase", "passwordNumber"]) {
      expect(requirement(messages[key])).toHaveClass("is-met");
      expect(requirement(messages[key])).toHaveTextContent(messages.passwordRuleMet);
    }
    expect(passwordInput.compareDocumentPosition(guidance) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(passwordInput).toHaveAttribute("aria-invalid", "false");
  });

  it("updates passed and failed rules while typing and hides them after clearing", () => {
    renderRegistration();
    enterPassword("abc");
    expect(requirement("At least 8 characters")).toHaveClass("is-unmet");
    expect(requirement("At least one letter")).toHaveClass("is-met");
    expect(requirement("At least one capital letter (e.g. A)")).toHaveClass("is-unmet");
    expect(requirement("At least one number")).toHaveClass("is-unmet");
    expect(screen.getByLabelText("Password", { exact: true })).toHaveAttribute("aria-invalid", "true");

    enterPassword("12345678");
    expect(requirement("At least 8 characters")).toHaveClass("is-met");
    expect(requirement("At least one letter")).toHaveClass("is-unmet");
    expect(requirement("At least one number")).toHaveClass("is-met");

    enterPassword("abcdefg1");
    expect(requirement("At least one capital letter (e.g. A)")).toHaveClass("is-unmet");
    expect(screen.getByRole("button", { name: "Create Account" })).toBeDisabled();

    enterPassword("Abcdefg1");
    expect(screen.getAllByRole("listitem")).toHaveLength(5);
    screen.getAllByRole("listitem").forEach((rule) => {
      expect(rule).toHaveClass("is-met");
      expect(rule).toHaveTextContent("Requirement met");
    });
    expect(screen.getByLabelText("Password", { exact: true })).toHaveAttribute("aria-invalid", "false");

    enterPassword("");
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
    expect(screen.queryByText("Password requirements")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Password", { exact: true })).not.toHaveAttribute("aria-describedby");
    expect(screen.getByRole("button", { name: "Create Account" })).toBeDisabled();
  });

  it.each([
    ["too short", "Abcdef1"],
    ["too long", `${"a".repeat(100)}1`],
    ["letters only", "abcdefgh"],
    ["numbers only", "12345678"],
    ["no capital letter", "abcdefg1"],
    ["blank", "        "],
    ["supplementary letters unsupported by the backend", "𝔄𝔄𝔄𝔄1"],
  ])("does not send a %s password to registration", (_, password) => {
    renderRegistration();
    completeRegistrationFields(password);
    const submit = screen.getByRole("button", { name: "Create Account" });
    expect(submit).toBeDisabled();

    fireEvent.submit(submit.closest("form"));
    expect(screen.getByRole("alert")).toHaveTextContent("Please meet all password requirements");
    expect(authService.register).not.toHaveBeenCalled();
  });

  it.each([
    ["minimum length", "Abcdefg1"],
    ["maximum length", `A${"a".repeat(98)}1`],
    ["Khmer letters and digits with a capital letter", "Aកខគឃងច១"],
    ["capital letters and a number", "ABCDEFG1"],
  ])("accepts a valid password with %s without changing it", async (_, password) => {
    renderRegistration();
    completeRegistrationFields(password);
    const submit = screen.getByRole("button", { name: "Create Account" });
    expect(submit).toBeEnabled();
    fireEvent.click(submit);

    await waitFor(() => expect(screen.getByText("Registration complete")).toBeInTheDocument());
    expect(authService.register).toHaveBeenCalledWith({ fullName: "Test Host", phone: "012345678", password });
    expect(login).toHaveBeenCalledWith({ user: { id: 1 } });
  });

  it("shows confirmation success and mismatch, including when the original password changes", () => {
    renderRegistration();
    enterPassword("Abcdefg1", "Different1");
    const confirmation = screen.getByLabelText("Confirm Password", { exact: true });
    expect(screen.getByRole("status")).toHaveTextContent("Passwords do not match");
    expect(confirmation).toHaveAttribute("aria-invalid", "true");
    expect(confirmation).toHaveAccessibleDescription("Passwords do not match");
    expect(screen.getByRole("button", { name: "Create Account" })).toBeDisabled();

    enterPassword("Abcdefg1");
    expect(screen.getByRole("status")).toHaveTextContent("Passwords match");
    expect(confirmation).toHaveAttribute("aria-invalid", "false");
    expect(screen.getByRole("button", { name: "Create Account" })).toBeEnabled();

    fireEvent.change(screen.getByLabelText("Password", { exact: true }), { target: { value: "Abcdefg2" } });
    expect(screen.getByRole("status")).toHaveTextContent("Passwords do not match");
    expect(screen.getByRole("button", { name: "Create Account" })).toBeDisabled();
  });

  it("requires password confirmation before sending registration", () => {
    renderRegistration();
    completeRegistrationFields("Abcdefg1");
    fireEvent.change(screen.getByLabelText("Confirm Password", { exact: true }), { target: { value: "" } });
    const submit = screen.getByRole("button", { name: "Create Account" });
    expect(submit).toBeDisabled();
    fireEvent.submit(submit.closest("form"));
    expect(screen.getByRole("alert")).toHaveTextContent("Please fill in all required fields");
    expect(authService.register).not.toHaveBeenCalled();
  });
});
