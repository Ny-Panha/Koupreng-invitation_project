import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import HostNav from "./HostNav";
import { useLanguageStore } from "@/stores/useLanguageStore";

const mockLogout = vi.fn();
const mockUser = {
  id: 1,
  fullName: "Sokha Chan",
  email: "sokha@example.com",
};

vi.mock("@/features/auth/hooks/useAuth", () => ({
  useAuth: () => ({
    logout: mockLogout,
    user: mockUser,
  }),
}));

vi.mock("../../shared/i18n/useBackendMessages", () => ({
  useBackendMessages: () => ({
    text: (key) => {
      const msgs = {
        backToDashboard: "ត្រឡប់ទៅផ្ទាំងគ្រប់គ្រង",
        editProfile: "កែប្រែគណនី",
        logout: "ចាកចេញ",
      };
      return msgs[key] || "";
    },
  }),
}));

vi.mock("@/shared/preferences/DisplayPreferences", () => ({
  default: () => <div data-testid="display-preferences" />,
}));

describe("HostNav component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useLanguageStore.setState({ lang: "en" });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders desktop navigation links with correct accessible labels", () => {
    render(
      <MemoryRouter initialEntries={["/app/events"]}>
        <HostNav />
      </MemoryRouter>
    );

    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    expect(nav).toBeInTheDocument();

    const eventsLink = within(nav).getByRole("link", { name: "My Events" });
    expect(eventsLink).toBeInTheDocument();
    expect(eventsLink).toHaveAttribute("aria-current", "page");

    const createLink = within(nav).getByRole("link", { name: "Create Event" });
    expect(createLink).toBeInTheDocument();
    expect(createLink).not.toHaveAttribute("aria-current");

    expect(within(nav).getByRole("link", { name: "Packages" })).toBeInTheDocument();
    expect(within(nav).getByRole("link", { name: "Browse Templates" })).toBeInTheDocument();
  });

  it("renders Khmer navigation labels when language is set to km", () => {
    useLanguageStore.setState({ lang: "km" });

    render(
      <MemoryRouter initialEntries={["/app/events"]}>
        <HostNav />
      </MemoryRouter>
    );

    const nav = screen.getByRole("navigation", { name: "ម៉ឺនុយចម្បង" });
    expect(nav).toBeInTheDocument();
    expect(within(nav).getByRole("link", { name: "កម្មវិធីរបស់ខ្ញុំ" })).toBeInTheDocument();
    expect(within(nav).getByRole("link", { name: "បង្កើតកម្មវិធី" })).toBeInTheDocument();
    expect(within(nav).getByRole("link", { name: "កញ្ចប់សេវាកម្ម" })).toBeInTheDocument();
  });

  it("opens profile dropdown and executes logout", () => {
    render(
      <MemoryRouter initialEntries={["/app/events"]}>
        <HostNav />
      </MemoryRouter>
    );

    const profileTrigger = screen.getByRole("button", { name: /Sokha Chan/i });
    expect(profileTrigger).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(profileTrigger);
    expect(profileTrigger).toHaveAttribute("aria-expanded", "true");

    const menu = screen.getByRole("menu");
    expect(menu).toBeInTheDocument();

    const logoutBtn = within(menu).getByRole("menuitem", { name: /logout|sign out|ចាកចេញ/i });
    fireEvent.click(logoutBtn);

    expect(mockLogout).toHaveBeenCalled();
  });

  it("closes profile menu when Escape key is pressed", () => {
    render(
      <MemoryRouter initialEntries={["/app/events"]}>
        <HostNav />
      </MemoryRouter>
    );

    const profileTrigger = screen.getByRole("button", { name: /Sokha Chan/i });
    fireEvent.click(profileTrigger);
    expect(screen.getByRole("menu")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("toggles mobile drawer navigation on hamburger click", () => {
    render(
      <MemoryRouter initialEntries={["/app/events"]}>
        <HostNav />
      </MemoryRouter>
    );

    const hamburger = screen.getByRole("button", { name: "Main menu" });
    expect(hamburger).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(hamburger);
    expect(hamburger).toHaveAttribute("aria-expanded", "true");

    const mobileDrawer = document.getElementById("host-mobile-navigation");
    expect(mobileDrawer).toHaveClass("open");

    // Click close button inside drawer
    const closeBtn = screen.getByRole("button", { name: "Close menu" });
    fireEvent.click(closeBtn);

    expect(hamburger).toHaveAttribute("aria-expanded", "false");
    expect(mobileDrawer).not.toHaveClass("open");
  });
});
