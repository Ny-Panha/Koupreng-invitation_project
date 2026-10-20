import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, expect, it, vi } from "vitest";
import paymentService from "./paymentService";
import PaymentReceiptPage from "./PaymentReceiptPage";
vi.mock("./paymentService", () => ({ default: { paymentReceipt: vi.fn() } }));
afterEach(cleanup);
function show() { render(<MemoryRouter initialEntries={["/app/payments/AUDIT"]}><Routes><Route path="/app/payments/:orderCode" element={<PaymentReceiptPage />} /></Routes></MemoryRouter>); }
it.each([null, { orderCode: "AUDIT", status: "PENDING" }, { orderCode: "OTHER", status: "PAID" }])("does not show a verified receipt for an absent, pending or mismatched payment", async value => {
  paymentService.paymentReceipt.mockResolvedValue(value); show();
  expect(await screen.findByRole("alert")).toHaveTextContent("after payment has been verified");
  expect(screen.queryByText("$0.00")).not.toBeInTheDocument();
});
it("preserves a server-reported zero paid amount without substituting another amount", async () => {
  paymentService.paymentReceipt.mockResolvedValue({ orderCode: "AUDIT", status: "PAID", paidAmount: 0, amount: 25, currency: "USD" }); show();
  expect(await screen.findByText("$0.00")).toBeInTheDocument();
  expect(screen.queryByText("$25.00")).not.toBeInTheDocument();
});
