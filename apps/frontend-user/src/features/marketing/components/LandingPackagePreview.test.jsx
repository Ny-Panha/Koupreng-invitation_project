import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import LandingPackagePreview from "./LandingPackagePreview";
import subscriptionService from "../../subscriptions/subscriptionService";
import { useLanguageStore } from "../../../stores/useLanguageStore";

vi.mock("../../subscriptions/subscriptionService", () => ({ default: { publicPackages: vi.fn() } }));
afterEach(cleanup);
beforeEach(() => { useLanguageStore.setState({ lang: "en" }); subscriptionService.publicPackages.mockReset(); });
const show = () => render(<MemoryRouter><LandingPackagePreview copy={(_km, en) => en} /></MemoryRouter>);
it("uses the server's current price, currency, limits and enabled features", async () => {
  subscriptionService.publicPackages.mockResolvedValue([{ id: 8, packageName: "Current offer", price: 37, currency: "USD", maxInvitations: 2, maxGuestsPerInvitation: 160, durationDays: 45, qrCheckInEnabled: true, seatingEnabled: false }]);
  show();
  await screen.findByText("Current offer");
  expect(screen.getByText(/37\.00/)).toBeInTheDocument();
  expect(screen.getByText("Guests per invitation: 160")).toBeInTheDocument();
  expect(screen.getByText("QR check-in included")).toBeInTheDocument();
  expect(screen.queryByText(/Seating management included|Most Popular|Unlimited|KHR/)).toBeNull();
});
it("offers recovery without inventing plans on service failure", async () => {
  subscriptionService.publicPackages.mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce([]);
  show();
  await screen.findByRole("alert");
  expect(screen.queryByRole("article")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  await screen.findByText(/No packages are currently available/);
  expect(subscriptionService.publicPackages).toHaveBeenCalledTimes(2);
});
it("keeps restricted prices private and routes to eligible account packages", async () => {
  subscriptionService.publicPackages.mockRejectedValue({ status: 401 });
  show();
  expect(await screen.findByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/login?next=%2Fapp%2Fpackages");
});
