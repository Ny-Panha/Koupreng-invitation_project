import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, expect, it, vi } from "vitest";
import { paymentService } from "./paymentService";
import PaymentStatusPage from "./PaymentStatusPage";
vi.mock("./paymentService", () => ({ paymentService: { getTemplateOrder: vi.fn(), createStaticPaymentOrder: vi.fn() } }));
afterEach(cleanup);
it.each([null, [], {}, { orderCode: "OTHER", status: "PAID" }])("does not invent a purchasable order from an invalid or mismatched response: %j", async value => {
  paymentService.getTemplateOrder.mockResolvedValue(value);
  render(<MemoryRouter initialEntries={["/payments/AUDIT/status"]}><Routes><Route path="/payments/:orderCode/status" element={<PaymentStatusPage />} /></Routes></MemoryRouter>);
  expect(await screen.findByRole("alert")).toHaveTextContent("Payment details are unavailable");
  expect(screen.queryByText("Garden Royal Khmer Wedding")).not.toBeInTheDocument();
  expect(screen.queryByText(/0\.01/)).not.toBeInTheDocument();
  expect(screen.getByRole("link", { name: /Payment history/ })).toHaveAttribute("href", "/app/payments");
});
