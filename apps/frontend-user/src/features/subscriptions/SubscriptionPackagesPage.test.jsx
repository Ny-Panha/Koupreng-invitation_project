import { MemoryRouter } from "react-router-dom";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SubscriptionPackagesPage from "./SubscriptionPackagesPage";
import subscriptionService from "./subscriptionService";
import { useLanguageStore } from "../../stores/useLanguageStore";

vi.mock("./subscriptionService", () => ({
  default: {
    packages: vi.fn(),
    entitlements: vi.fn(),
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
    vi.clearAllMocks();
    useLanguageStore.setState({ lang: "en" });
    subscriptionService.packages.mockResolvedValue([basicPlan]);
    subscriptionService.entitlements.mockResolvedValue(null);
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

  it("presents a nonrevenue demo grant without payment actions or pending status", async () => {
    subscriptionService.history.mockResolvedValue([{ id: 7, packagePlan: basicPlan, orderCode: "DEMO-PRIVATE", source: "DEMO_ADMIN_GRANT", status: "ACTIVE", active: true, paymentStatus: "NOT_REQUIRED", amount: 0, currency: "USD" }]);
    render(<MemoryRouter initialEntries={[window.location.pathname + window.location.search]}><SubscriptionPackagesPage /></MemoryRouter>);
    await screen.findByRole("heading", { name: "Subscription history" });
    expect(screen.getAllByText("Active demo grant · no payment")).toHaveLength(2);
    expect(screen.queryByText("Awaiting payment")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "View order" })).not.toBeInTheDocument();
    expect(subscriptionService.order).not.toHaveBeenCalled();
  });

  it("compares actual configured record limits and benefits without inventing higher tier values", async () => {
    subscriptionService.packages.mockResolvedValue([{ ...basicPlan, maxGuests: 73, maxGuestsPerInvitation: 17, teamMembersEnabled: true, maxTeamMembers: 3 }]);
    render(<MemoryRouter initialEntries={[window.location.pathname + window.location.search]}><SubscriptionPackagesPage /></MemoryRouter>);
    const table = await screen.findByRole("table", { name: "Currently configured plan benefits" });
    expect(table).toHaveTextContent("Guest records across account73");
    expect(table).toHaveTextContent("Guest records per event17");
    expect(table).toHaveTextContent("Team members (including owner)3");
    expect(table).not.toHaveTextContent("Premium plan");
  });

  it("opens payer details before creating a paid checkout", async () => {
    render(<MemoryRouter initialEntries={[window.location.pathname + window.location.search]}><SubscriptionPackagesPage /></MemoryRouter>);

    fireEvent.click(await screen.findByRole("button", { name: /ជ្រើសកញ្ចប់នេះ|Choose this plan/i }));

    expect(screen.getByRole("dialog", { name: /subscribe to basic/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/aba account holder name/i)).toBeInTheDocument();
    expect(subscriptionService.purchase).not.toHaveBeenCalled();
  });

  it("validates last3 and sends only package and payer inputs", async () => {
    render(<MemoryRouter initialEntries={[window.location.pathname + window.location.search]}><SubscriptionPackagesPage /></MemoryRouter>);
    fireEvent.click(await screen.findByRole("button", { name: /ជ្រើសកញ្ចប់នេះ|Choose this plan/i }));
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
    render(<MemoryRouter initialEntries={[window.location.pathname + window.location.search]}><SubscriptionPackagesPage /></MemoryRouter>);
    fireEvent.click(await screen.findByRole("button", { name: /ជ្រើសកញ្ចប់នេះ|Choose this plan/i }));
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
    const view = render(<MemoryRouter initialEntries={[window.location.pathname + window.location.search]}><SubscriptionPackagesPage /></MemoryRouter>);
    await act(async () => Promise.resolve());
    fireEvent.click(screen.getByRole("button", { name: /ជ្រើសកញ្ចប់នេះ|Choose this plan/i }));
    fireEvent.change(screen.getByLabelText(/aba account holder name/i), { target: { value: "KOEURNG VIREAK" } });
    fireEvent.change(screen.getByLabelText(/last 3 digits/i), { target: { value: "247" } });
    fireEvent.click(screen.getByRole("button", { name: /continue to aba payway/i }));
    await act(async () => Promise.resolve());
    const callsBeforeUnmount = subscriptionService.order.mock.calls.length;

    view.unmount();
    await act(async () => vi.advanceTimersByTimeAsync(8000));

    expect(subscriptionService.order).toHaveBeenCalledTimes(callsBeforeUnmount);
  });

  it("continues polling through review and displays success only after activation", async () => {
    subscriptionService.order.mockResolvedValueOnce({ status: "REVIEW_REQUIRED", paymentStatus: "PENDING", active: false })
      .mockResolvedValue({ status: "ACTIVE", paymentStatus: "PAID", active: true });
    render(<MemoryRouter initialEntries={[window.location.pathname + window.location.search]}><SubscriptionPackagesPage /></MemoryRouter>);
    fireEvent.click(await screen.findByRole("button", { name: /ជ្រើសកញ្ចប់នេះ|Choose this plan/i }));
    fireEvent.change(screen.getByLabelText(/aba account holder name/i), { target: { value: "KOEURNG VIREAK" } });
    fireEvent.change(screen.getByLabelText(/last 3 digits/i), { target: { value: "247" } });
    fireEvent.click(screen.getByRole("button", { name: /continue to aba payway/i }));
    expect(await screen.findByText("Subscription activated successfully.")).toBeInTheDocument();
    expect(subscriptionService.order).toHaveBeenCalledTimes(2);
  });

  it("shows payment review and pending records without marking them active", async () => {
    subscriptionService.history.mockResolvedValue([
      { id: 10, orderCode: "SUB-REVIEW", packagePlan: basicPlan, amount: 0.01, currency: "USD", status: "REVIEW_REQUIRED", paymentStatus: "PAID", active: false },
      { id: 11, orderCode: "SUB-PENDING", packagePlan: basicPlan, amount: 0.01, currency: "USD", status: "PENDING_PAYMENT", paymentStatus: "PENDING", active: false },
    ]);
    render(<MemoryRouter initialEntries={[window.location.pathname + window.location.search]}><SubscriptionPackagesPage /></MemoryRouter>);
    expect((await screen.findAllByText(/Under review|កំពុងរង់ចាំការផ្ទៀងផ្ទាត់/)).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Awaiting payment|រង់ចាំការទូទាត់/).length).toBeGreaterThan(0);
    expect(screen.getAllByText("SUB-REVIEW")[0]).toBeInTheDocument();
    expect(screen.getAllByText("SUB-PENDING")[0]).toBeInTheDocument();
    expect(screen.queryByText("Subscription activated successfully.")).not.toBeInTheDocument();
  });

  it("does not announce activation for a paid order without active entitlement", async () => {
    subscriptionService.order.mockResolvedValue({ status: "REVIEW_REQUIRED", paymentStatus: "PAID", active: false });
    render(<MemoryRouter initialEntries={[window.location.pathname + window.location.search]}><SubscriptionPackagesPage /></MemoryRouter>);
    fireEvent.click(await screen.findByRole("button", { name: /ជ្រើសកញ្ចប់នេះ|Choose this plan/i }));
    fireEvent.change(screen.getByLabelText(/aba account holder name/i), { target: { value: "KOEURNG VIREAK" } });
    fireEvent.change(screen.getByLabelText(/last 3 digits/i), { target: { value: "247" } });
    fireEvent.click(screen.getByRole("button", { name: /continue to aba payway/i }));
    await screen.findByText("Payment status needs administrator review.");
    expect(screen.queryByText("Subscription activated successfully.")).not.toBeInTheDocument();
  });

  it("uses actual backend prices and quotas without inventing unlimited or team access", async () => {
    subscriptionService.packages.mockResolvedValue([{ ...basicPlan, price: 12345, currency: "KHR", maxInvitations: 999, maxGuestsPerInvitation: 5000, durationDays: 90, billingInterval: "CUSTOM", maxTeamMembers: 25 }]);
    render(<MemoryRouter initialEntries={[window.location.pathname + window.location.search]}><SubscriptionPackagesPage /></MemoryRouter>);
    await screen.findByText("999 events");
    expect(screen.getByText("5,000 guest records per event")).toBeInTheDocument();
    expect(screen.getByText(/90 days/)).toBeInTheDocument();
    expect(screen.queryByText(/unlimited|lifetime|25 members/i)).not.toBeInTheDocument();
    expect(screen.getByText("Plan could not be verified")).toBeInTheDocument();
    expect(screen.getAllByText(/12,345/).length).toBeGreaterThan(0);
  });

  it("shows a verified current plan and its real expiry", async () => {
    subscriptionService.entitlements.mockResolvedValue({ packagePlan: basicPlan, active: true, status: "ACTIVE", paymentStatus: "PAID", expiresAt: "2027-01-15T00:00:00Z" });
    render(<MemoryRouter initialEntries={[window.location.pathname + window.location.search]}><SubscriptionPackagesPage /></MemoryRouter>);
    expect(await screen.findByRole("button", { name: "Current plan" })).toBeDisabled();
    expect(screen.getByText(/Expires.*Jan 15, 2027/)).toBeInTheDocument();
  });

  it("resumes a pending order instead of requesting another payment", async () => {
    subscriptionService.history.mockResolvedValue([{ id: 41, packagePlan: basicPlan, orderCode: "SUB-PENDING", amount: .01, currency: "USD", active: false, status: "PENDING_PAYMENT", paymentStatus: "PENDING", createdAt: "2026-10-20T00:00:00Z" }]);
    subscriptionService.order.mockResolvedValue({ orderCode: "SUB-PENDING", active: false, status: "PENDING_PAYMENT", paymentStatus: "PENDING" });
    render(<MemoryRouter initialEntries={[window.location.pathname + window.location.search]}><SubscriptionPackagesPage /></MemoryRouter>);
    fireEvent.click(await screen.findByRole("button", { name: "View pending order" }));
    await screen.findByRole("dialog", { name: "Payment details" });
    expect(subscriptionService.order).toHaveBeenCalledWith("SUB-PENDING");
    expect(subscriptionService.purchase).not.toHaveBeenCalled();
  });

  it("rechecks history before purchase to catch an order created in another tab", async () => {
    subscriptionService.history.mockResolvedValueOnce([]).mockResolvedValue([{ packagePlan: basicPlan, orderCode: "SUB-OTHER-TAB", active: false, status: "PENDING_PAYMENT", paymentStatus: "PENDING" }]);
    render(<MemoryRouter initialEntries={[window.location.pathname + window.location.search]}><SubscriptionPackagesPage /></MemoryRouter>);
    fireEvent.click(await screen.findByRole("button", { name: /Choose this plan/i }));
    fireEvent.change(screen.getByLabelText(/aba account holder name/i), { target: { value: "Dara" } });
    fireEvent.change(screen.getByLabelText(/last 3 digits/i), { target: { value: "247" } });
    fireEvent.click(screen.getByRole("button", { name: /continue to aba payway/i }));
    await screen.findByRole("dialog", { name: "Payment details" });
    expect(subscriptionService.purchase).not.toHaveBeenCalled();
  });

  it("does not trust active=true without the backend paid and active states", async () => {
    subscriptionService.purchase.mockResolvedValue({ orderCode: "SUB-UNVERIFIED", active: true, status: "PENDING_PAYMENT", paymentStatus: "PENDING" });
    render(<MemoryRouter initialEntries={[window.location.pathname + window.location.search]}><SubscriptionPackagesPage /></MemoryRouter>);
    fireEvent.click(await screen.findByRole("button", { name: /Choose this plan/i }));
    fireEvent.change(screen.getByLabelText(/aba account holder name/i), { target: { value: "Dara" } });
    fireEvent.change(screen.getByLabelText(/last 3 digits/i), { target: { value: "247" } });
    fireEvent.click(screen.getByRole("button", { name: /continue to aba payway/i }));
    await screen.findByRole("dialog", { name: "Payment details" });
    expect(screen.queryByText("Subscription activated successfully.")).not.toBeInTheDocument();
  });

  it("keeps package discovery usable and blocks duplicate-risk checkout when history fails", async () => {
    subscriptionService.history.mockRejectedValue(new Error("Offline"));
    render(<MemoryRouter initialEntries={[window.location.pathname + window.location.search]}><SubscriptionPackagesPage /></MemoryRouter>);
    expect(await screen.findByRole("alert")).toHaveTextContent("Could not verify your plan or payment history");
    expect(screen.getByRole("button", { name: /Choose this plan/i })).toBeDisabled();
  });

  it("focuses the invalid field and prevents closing or resubmitting while creating an order", async () => {
    let finish;
    subscriptionService.purchase.mockImplementation(() => new Promise(resolve => { finish = resolve; }));
    render(<MemoryRouter><SubscriptionPackagesPage /></MemoryRouter>);
    fireEvent.click(await screen.findByRole('button', { name: 'Choose this plan' }));
    const submit = screen.getByRole('button', { name: 'Continue to ABA PayWay' });
    fireEvent.click(submit);
    await waitFor(() => expect(screen.getByLabelText('ABA Account Holder Name')).toHaveFocus());
    expect(screen.getByLabelText('ABA Account Holder Name')).toHaveAttribute('aria-invalid', 'true');
    fireEvent.change(screen.getByLabelText('ABA Account Holder Name'), { target: { value: 'Example payer' } });
    fireEvent.change(screen.getByLabelText('Last 3 digits of ABA account'), { target: { value: '24' } });
    fireEvent.click(submit);
    await waitFor(() => expect(screen.getByLabelText('Last 3 digits of ABA account')).toHaveFocus());
    fireEvent.change(screen.getByLabelText('Last 3 digits of ABA account'), { target: { value: '247' } });
    fireEvent.click(submit);
    await waitFor(() => expect(subscriptionService.purchase).toHaveBeenCalledTimes(1));
    expect(screen.getByRole('button', { name: 'Close modal' })).toBeDisabled();
    expect(submit).toBeDisabled();
    expect(screen.getByLabelText('ABA Account Holder Name')).toBeDisabled();
    await act(async () => finish({ orderCode: 'SUB-ONE', amount: .02, currency: 'USD', status: 'PENDING_PAYMENT', paymentStatus: 'PENDING', active: false }));
    expect(screen.getByRole('complementary', { name: 'Order summary' })).toHaveTextContent('$0.02');
    expect(screen.queryByText('Subscription activated successfully.')).not.toBeInTheDocument();
  });

  it("keeps activation incomplete during paid review and refreshes benefits only after verified activation", async () => {
    subscriptionService.history.mockResolvedValue([{ packagePlan: basicPlan, orderCode: 'SUB-REVIEW', status: 'REVIEW_REQUIRED', paymentStatus: 'PAID', active: false }]);
    subscriptionService.order.mockResolvedValue({ orderCode: 'SUB-REVIEW', status: 'REVIEW_REQUIRED', paymentStatus: 'PAID', active: false });
    render(<MemoryRouter><SubscriptionPackagesPage /></MemoryRouter>);
    fireEvent.click(await screen.findByRole('button', { name: 'View pending order' }));
    await screen.findByText('Payment status needs administrator review.');
    const progress = screen.getByRole('list', { name: 'Package purchase progress' });
    expect(progress.lastElementChild).not.toHaveAttribute('data-complete');
    const loads = subscriptionService.entitlements.mock.calls.length;
    subscriptionService.order.mockResolvedValue({ orderCode: 'SUB-REVIEW', status: 'ACTIVE', paymentStatus: 'PAID', active: true });
    fireEvent.click(screen.getByRole('button', { name: 'Check payment status' }));
    await screen.findByText('Subscription activated successfully.');
    await waitFor(() => expect(subscriptionService.entitlements.mock.calls.length).toBeGreaterThan(loads));
    expect(progress.lastElementChild).toHaveAttribute('data-complete', 'true');
    expect(subscriptionService.purchase).not.toHaveBeenCalled();
  });

  it("keeps a created order and its payment link available when the browser rejects a popup", async () => {
    window.open.mockImplementation(() => { throw new Error('Popup blocked'); });
    render(<MemoryRouter><SubscriptionPackagesPage /></MemoryRouter>);
    fireEvent.click(await screen.findByRole('button', { name: 'Choose this plan' }));
    fireEvent.change(screen.getByLabelText('ABA Account Holder Name'), { target: { value: 'Example payer' } });
    fireEvent.change(screen.getByLabelText('Last 3 digits of ABA account'), { target: { value: '247' } });
    fireEvent.click(screen.getByRole('button', { name: 'Continue to ABA PayWay' }));
    const bank = await screen.findByRole('link', { name: 'Open ABA PayWay' });
    expect(bank).toHaveAttribute('href', 'https://pay.example.test/basic');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveTextContent('SUB2609151234');
    expect(subscriptionService.purchase).toHaveBeenCalledTimes(1);
  });
});
