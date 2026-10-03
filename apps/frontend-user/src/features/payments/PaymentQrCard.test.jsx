import { useState } from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ claim: vi.fn(), getOrder: vi.fn(), toast: vi.fn() }));
vi.mock("./paymentService", () => ({
  paymentService: { claimPayment: mocks.claim, getTemplateOrder: mocks.getOrder },
}));
vi.mock("../../shared/ui/toast", () => ({ toast: mocks.toast }));
vi.mock("react-qr-code", () => ({ default: () => <div aria-label="Payment QR" /> }));

import PaymentQrCard from "./PaymentQrCard";

const pendingOrder = () => ({
  orderCode: "REVIEW-TEST-1",
  templateId: 2,
  templateName: "Test template",
  status: "PENDING",
  amount: "0.01",
  currency: "USD",
  createdAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 180000).toISOString(),
});

function PaymentHarness({ initialOrder }) {
  const [order, setOrder] = useState(initialOrder);
  return <PaymentQrCard order={order} onStatusChange={setOrder} onRetry={vi.fn()} />;
}

describe("PAY-001 payment claim authority", () => {
  afterEach(cleanup);
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.claim.mockResolvedValue({ status: "PENDING" });
  });

  it("keeps an unpaid claim pending and never announces an unlock", async () => {
    const order = pendingOrder();
    mocks.getOrder.mockResolvedValue(order);
    const { container } = render(<MemoryRouter><PaymentHarness initialOrder={order} /></MemoryRouter>);

    fireEvent.click(container.querySelector(".payment-claim-btn"));
    await waitFor(() => expect(mocks.toast).toHaveBeenCalled());

    expect(mocks.claim).toHaveBeenCalledWith(order.orderCode);
    expect(mocks.getOrder).toHaveBeenCalledWith(order.orderCode);
    expect(screen.queryByRole("link", { name: /Use Template/i })).not.toBeInTheDocument();
    expect(mocks.toast.mock.calls.flat().join(" ")).not.toMatch(/unlock/i);
    expect(screen.getByRole("status")).toHaveTextContent(/awaiting.*confirmation/i);
  });

  it("shows access only after the fresh server response is PAID", async () => {
    const order = pendingOrder();
    mocks.getOrder.mockResolvedValue({ ...order, status: "PAID" });
    const { container } = render(<MemoryRouter><PaymentHarness initialOrder={order} /></MemoryRouter>);

    fireEvent.click(container.querySelector(".payment-claim-btn"));
    expect(await screen.findByRole("link", { name: /Use Template/i })).toBeInTheDocument();
    expect(mocks.getOrder).toHaveBeenCalledWith(order.orderCode);
  });

  it.each(["FAILED", "EXPIRED", "CANCELLED", "REJECTED"])(
    "never offers a customer claim for terminal %s orders",
    (status) => {
      const order = { ...pendingOrder(), status };
      const { container } = render(<MemoryRouter><PaymentHarness initialOrder={order} /></MemoryRouter>);
      expect(container.querySelector(".payment-claim-btn")).not.toBeInTheDocument();
      expect(mocks.claim).not.toHaveBeenCalled();
    }
  );

  it("reports a rejected claim without granting access or claiming delivery", async () => {
    mocks.claim.mockRejectedValue(new Error("Payment review request rejected"));
    const { container } = render(<MemoryRouter><PaymentHarness initialOrder={pendingOrder()} /></MemoryRouter>);

    fireEvent.click(container.querySelector(".payment-claim-btn"));
    await waitFor(() => expect(mocks.toast).toHaveBeenCalledWith("Payment review request rejected"));
    expect(mocks.getOrder).not.toHaveBeenCalled();
    expect(screen.queryByRole("link", { name: /Use Template/i })).not.toBeInTheDocument();
  });
});
