import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SubscriptionPackagesPage from "./SubscriptionPackagesPage";
import subscriptionService from "./subscriptionService";

vi.mock("./subscriptionService", () => ({
  default: {
    packages: vi.fn(),
    current: vi.fn(),
    history: vi.fn(),
    purchase: vi.fn(),
    order: vi.fn(),
  },
}));

const basicPlan = {
  id: 1,
  code: "BASIC",
  packageName: "Basic",
  description: "Basic invitation plan",
  price: 0.01,
  currency: "USD",
  durationDays: 365,
  maxInvitations: 1,
  maxGuestsPerInvitation: 40,
  maxTeamMembers: 1,
};

describe("SubscriptionPackagesPage", () => {
  beforeEach(() => {
    subscriptionService.packages.mockResolvedValue([basicPlan]);
    subscriptionService.current.mockResolvedValue(null);
    subscriptionService.history.mockResolvedValue([]);
    subscriptionService.purchase.mockResolvedValue({
      orderCode: "SUB2609151234",
      amount: 0.01,
      currency: "USD",
      paymentUrl: "https://pay.example.test/basic",
      status: "PENDING_PAYMENT",
      paymentStatus: "PENDING",
      expiresAt: "2030-01-01T00:00:00Z",
      active: false,
    });
    subscriptionService.order.mockResolvedValue({
      orderCode: "SUB2609151234",
      status: "PENDING_PAYMENT",
      paymentStatus: "PENDING",
      active: false,
    });
    vi.spyOn(window, "open").mockImplementation(() => null);
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("opens payer details before creating a paid checkout", async () => {
    render(<SubscriptionPackagesPage />);

    fireEvent.click(await screen.findByRole("button", { name: /subscribe \/ upgrade/i }));

    expect(screen.getByRole("dialog", { name: /subscribe to basic/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/aba account holder name/i)).toBeInTheDocument();
    expect(subscriptionService.purchase).not.toHaveBeenCalled();
  });

  it("validates last3 and sends only package and payer inputs", async () => {
    render(<SubscriptionPackagesPage />);
    fireEvent.click(await screen.findByRole("button", { name: /subscribe \/ upgrade/i }));
    fireEvent.change(screen.getByLabelText(/aba account holder name/i), { target: { value: "KOEURNG VIREAK" } });
    fireEvent.change(screen.getByLabelText(/last 3 digits/i), { target: { value: "12" } });
    fireEvent.click(screen.getByRole("button", { name: /continue to aba payway/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("exactly 3 numbers");
    expect(subscriptionService.purchase).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText(/last 3 digits/i), { target: { value: "247" } });
    fireEvent.click(screen.getByRole("button", { name: /continue to aba payway/i }));

    await waitFor(() => expect(subscriptionService.purchase).toHaveBeenCalledWith(
      1,
      "KOEURNG VIREAK",
      "247",
    ));
    expect(window.open).toHaveBeenCalledWith(
      "https://pay.example.test/basic",
      "_blank",
      "noopener,noreferrer",
    );
  });

  it("stops polling when the backend reports active", async () => {
    subscriptionService.order.mockResolvedValue({
      orderCode: "SUB2609151234",
      status: "ACTIVE",
      paymentStatus: "PAID",
      active: true,
    });
    render(<SubscriptionPackagesPage />);
    fireEvent.click(await screen.findByRole("button", { name: /subscribe \/ upgrade/i }));
    fireEvent.change(screen.getByLabelText(/aba account holder name/i), { target: { value: "KOEURNG VIREAK" } });
    fireEvent.change(screen.getByLabelText(/last 3 digits/i), { target: { value: "247" } });
    fireEvent.click(screen.getByRole("button", { name: /continue to aba payway/i }));

    expect(await screen.findByText("Subscription activated successfully.")).toBeInTheDocument();
    const callsAfterActivation = subscriptionService.order.mock.calls.length;
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20));
    });
    expect(subscriptionService.order).toHaveBeenCalledTimes(callsAfterActivation);
  });

  it("cleans up polling when unmounted", async () => {
    vi.useFakeTimers();
    const view = render(<SubscriptionPackagesPage />);
    await act(async () => Promise.resolve());
    fireEvent.click(screen.getByRole("button", { name: /subscribe \/ upgrade/i }));
    fireEvent.change(screen.getByLabelText(/aba account holder name/i), { target: { value: "KOEURNG VIREAK" } });
    fireEvent.change(screen.getByLabelText(/last 3 digits/i), { target: { value: "247" } });
    fireEvent.click(screen.getByRole("button", { name: /continue to aba payway/i }));
    await act(async () => Promise.resolve());
    const callsBeforeUnmount = subscriptionService.order.mock.calls.length;

    view.unmount();
    await act(async () => vi.advanceTimersByTimeAsync(8000));

    expect(subscriptionService.order).toHaveBeenCalledTimes(callsBeforeUnmount);
  });
});
