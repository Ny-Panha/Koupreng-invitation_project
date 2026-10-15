import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import PricingFeature from "./PricingFeature";
import subscriptionService from "../subscriptions/subscriptionService";
import { useLanguageStore } from "../../stores/useLanguageStore";
import { packagePrice } from "./model/packagePresentation";

let authenticated = false;
vi.mock("../auth/hooks/useAuth", () => ({ useAuth: () => ({ isAuthenticated: authenticated, isLoading: false }) }));
vi.mock("../subscriptions/subscriptionService", () => ({ default: { packages: vi.fn() } }));
const mount = () => render(<MemoryRouter><PricingFeature /></MemoryRouter>);
const offer = { id: 2, packageName: "Fixture package", price: "29", currency: "USD", durationDays: 90, maxInvitations: 3, maxGuestsPerInvitation: 300, premiumTemplatesEnabled: true, seatingEnabled: false, qrCheckInEnabled: false, active: true };
beforeEach(() => { authenticated = false; vi.resetAllMocks(); useLanguageStore.setState({ lang: "en" }); });
afterEach(cleanup);

it("explains anonymous plan discovery without requesting the private catalog", () => {
  mount();
  expect(subscriptionService.packages).not.toHaveBeenCalled();
  expect(screen.getByRole("link", { name: "Sign in to view packages" })).toHaveAttribute("href", "/login?next=%2Fdashboard%2Fpackages");
  expect(screen.getByRole("heading", { name: "Your guest list" })).toBeVisible();
  expect(screen.queryByText(/\$0/)).not.toBeInTheDocument();
});
it("loads authoritative offers, compares flags and hides them immediately on logout", async () => {
  authenticated = true; subscriptionService.packages.mockResolvedValue([offer]);
  const view = mount();
  await screen.findByText("$29.00");
  expect(subscriptionService.packages).toHaveBeenCalledWith({ suppressAuthRedirect: true });
  expect(screen.getByRole("table")).toHaveAccessibleName("Package feature comparison");
  expect(screen.getAllByText("Not included").length).toBeGreaterThan(0);
  expect(screen.queryByText(/recommended|most popular/i)).not.toBeInTheDocument();
  authenticated = false;
  view.rerender(<MemoryRouter><PricingFeature /></MemoryRouter>);
  expect(screen.queryByText("$29.00")).not.toBeInTheDocument();
});
it("keeps loading, retry and empty states distinct", async () => {
  authenticated = true;
  let reject;
  subscriptionService.packages.mockReturnValueOnce(new Promise((_, fail) => { reject = fail; })).mockResolvedValueOnce([]);
  mount();
  expect(screen.getByRole("status")).toHaveTextContent("Loading current packages");
  await act(async () => reject({ status: 503 }));
  expect(screen.getByRole("alert")).toHaveTextContent("Packages could not be loaded");
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  await screen.findByText("No packages are currently available");
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});
it("offers recovery for a restricted catalog and excludes inactive offers", async () => {
  authenticated = true; subscriptionService.packages.mockRejectedValueOnce({ status: 403 }).mockResolvedValueOnce([{ ...offer, active: false }]);
  const view = mount();
  await screen.findByText("Sign in to check your access");
  expect(screen.queryByText("$29.00")).not.toBeInTheDocument();
  view.unmount(); mount();
  await screen.findByText("No packages are currently available");
});
it("labels a missing price and currency without fabricating an offer", async () => {
  authenticated = true; subscriptionService.packages.mockResolvedValue([{ ...offer, price: null }, { ...offer, id: 3, packageName: "Missing currency", currency: undefined }]);
  mount();
  await waitFor(() => expect(screen.getAllByText("Price unavailable")).toHaveLength(2));
  expect(screen.queryByText("$0.00")).not.toBeInTheDocument();
  expect(screen.getAllByRole("link", { name: "Ask about this package" }).every(link => link.getAttribute("href") === "/contact")).toBe(true);
});
it.each([null, undefined, "", " ", "not a number", "0x1", -1, Infinity])("does not turn invalid price %s into zero", price => {
  expect(packagePrice({ price, currency: "USD" }, "en")).toBeNull();
});
it.each(["USD", "KHR"])("formats a server %s amount with Intl and retains a real zero", currency => {
  for (const language of ["en", "km"]) for (const price of [0, "160000"]) {
    expect(packagePrice({ price, currency }, language)).toBe(new Intl.NumberFormat(language === "en" ? "en-US" : "km-KH", { style: "currency", currency }).format(Number(price)));
  }
  expect(packagePrice({ price: "29", currency: "" }, "en")).toBeNull();
});
